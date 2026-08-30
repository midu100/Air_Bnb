const bookingSchema = require("../models/bookingSchema");

const startBookingExpiryCleanup = () => {
    // Run every minute
    setInterval(async () => {
        try {
            const now = new Date();
            const result = await bookingSchema.updateMany(
                {
                    bookingStatus: 'pending',
                    // A paid booking must never be swept away by the expiry job
                    paymentStatus: 'pending',
                    expiresAt: { $lt: now, $ne: null }
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
            console.log(error);
        }
    }, 60000);
};

module.exports = startBookingExpiryCleanup;
