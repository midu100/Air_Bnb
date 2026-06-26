const bookingSchema = require("../models/bookingSchema");

const startBookingExpiryCleanup = () => {
    // Run every minute
    setInterval(async () => {
        try {
            const now = new Date();
            const result = await bookingSchema.updateMany(
                {
                    bookingStatus: 'pending',
                    expiresAt: { $lt: now }
                },
                {
                    $set: {
                        bookingStatus: 'cancelled',
                        paymentStatus: 'failed'
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[Expiry Cleanup] Cancelled ${result.modifiedCount} expired pending booking(s).`);
            }
        } catch (error) {
            console.error('[Expiry Cleanup Error]', error);
        }
    }, 60000);
};

module.exports = startBookingExpiryCleanup;
