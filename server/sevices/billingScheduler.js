const bookingSchema = require("../models/bookingSchema");
const payoutSchema = require("../models/payoutSchema");
const rentInvoiceSchema = require("../models/rentInvoiceSchema");
const installmentSchema = require("../models/installmentSchema");
const userSchema = require("../models/authSchema");
const getStripe = require("./stripeConfig");

const HOUR_MS = 60 * 60 * 1000;

// ====== Release held payouts once their date has passed
const releaseDuePayouts = async () => {
    const stripe = getStripe();
    const due = await payoutSchema.find({
        status: 'scheduled',
        releaseDate: { $lte: new Date() },
    }).limit(50);

    for (const payout of due) {
        try {
            // A booking cancelled after its payout was scheduled must not still pay out.
            // reversePayoutsFor already handles the normal path; this is the net
            // underneath it, so a missed reversal cannot quietly send money.
            if (payout.booking) {
                const booking = await bookingSchema.findById(payout.booking);
                if (!booking || booking.bookingStatus === 'cancelled' || ['refunded', 'failed'].includes(booking.paymentStatus)) {
                    payout.status = 'reversed';
                    payout.failureReason = 'Booking is cancelled or refunded';
                    await payout.save();
                    continue;
                }
            }

            const host = await userSchema.findById(payout.host);

            // Without a verified Connect account there is nowhere to send it
            if (!host?.stripeAccountId || !host.payoutsEnabled) {
                payout.status = 'released';
                payout.failureReason = 'Host has not completed payout onboarding';
                await payout.save();
                continue;
            }

            if (!stripe) {
                payout.status = 'released';
                await payout.save();
                continue;
            }

            const transfer = await stripe.transfers.create({
                amount: Math.round(payout.netAmount * 100),
                currency: (payout.currency || 'USD').toLowerCase(),
                destination: host.stripeAccountId,
                metadata: { payoutId: String(payout._id), bookingId: String(payout.booking || '') },
            });

            payout.transferId = transfer.id;
            payout.status = 'paid';
            await payout.save();
        } catch (error) {
            console.log(error);
            payout.status = 'failed';
            payout.failureReason = error?.message || 'Transfer failed';
            await payout.save();
        }
    }

    return due.length;
};

// ====== Mark rent invoices due and overdue as their dates pass
const rollRentInvoices = async () => {
    const now = new Date();

    const becameDue = await rentInvoiceSchema.updateMany(
        { status: 'upcoming', dueDate: { $lte: now } },
        { $set: { status: 'due' } }
    );

    // Anything still unpaid past its grace period is overdue
    const graceCutoff = new Date(now);
    graceCutoff.setDate(graceCutoff.getDate() - 5);

    const becameOverdue = await rentInvoiceSchema.updateMany(
        { status: 'due', dueDate: { $lt: graceCutoff } },
        { $set: { status: 'overdue' } }
    );

    return becameDue.modifiedCount + becameOverdue.modifiedCount;
};

// ====== Charge mid-term installments that have come due
// The card was saved at checkout, so these run off-session without the guest.
const MAX_ATTEMPTS = 3;

const chargeDueInstallments = async () => {
    const stripe = getStripe();
    const now = new Date();

    await installmentSchema.updateMany(
        { status: 'upcoming', dueDate: { $lte: now } },
        { $set: { status: 'due' } }
    );

    const due = await installmentSchema.find({
        status: { $in: ['due', 'failed'] },
        dueDate: { $lte: now },
        attempts: { $lt: MAX_ATTEMPTS },
    }).limit(25);

    let charged = 0;

    for (const installment of due) {
        try {
            const booking = await bookingSchema.findById(installment.booking);

            // A stay that ended or was called off owes nothing further
            if (!booking || ['cancelled', 'completed'].includes(booking.bookingStatus)) {
                installment.status = 'cancelled';
                await installment.save();
                continue;
            }

            installment.attempts += 1;
            installment.lastAttemptAt = now;

            if (!stripe || !booking.stripeCustomerId || !booking.stripePaymentMethodId) {
                installment.status = 'failed';
                installment.failureReason = 'No saved payment method on this booking';
                await installment.save();
                continue;
            }

            const intent = await stripe.paymentIntents.create({
                amount: Math.round(installment.amount * 100),
                currency: 'usd',
                customer: booking.stripeCustomerId,
                payment_method: booking.stripePaymentMethodId,
                off_session: true,
                confirm: true,
                metadata: {
                    bookingId: String(booking._id),
                    installmentId: String(installment._id),
                    sequence: String(installment.sequence),
                },
            });

            installment.transactionId = intent.id;
            installment.status = 'paid';
            installment.paidAt = now;
            installment.failureReason = undefined;
            await installment.save();

            // Point the booking at whatever is next in the plan
            const next = await installmentSchema
                .findOne({ booking: booking._id, status: { $in: ['upcoming', 'due'] } })
                .sort({ dueDate: 1 });
            booking.nextChargeDate = next?.dueDate || null;
            await booking.save();

            charged++;
        } catch (error) {
            console.log(error);
            installment.status = 'failed';
            installment.failureReason = error?.message || 'Charge failed';
            await installment.save();
        }
    }

    return charged;
};

const startBillingScheduler = () => {
    // Hourly is enough - none of this is time critical to the minute
    setInterval(async () => {
        try {
            const released = await releaseDuePayouts();
            const rolled = await rollRentInvoices();
            const charged = await chargeDueInstallments();

            if (released || rolled || charged) {
                console.log(`[Billing] payouts:${released} invoices:${rolled} installments:${charged}`);
            }
        } catch (error) {
            console.log(error);
        }
    }, HOUR_MS);
};

module.exports = startBillingScheduler;
