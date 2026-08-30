const reviewSchema = require("../models/reviewSchema")
const bookingSchema = require("../models/bookingSchema")
const propertySchema = require("../models/propertySchema")

// Helper function to update property average rating and total reviews count
const updatePropertyRating = async (propertyId) => {
    const reviews = await reviewSchema.find({ property: propertyId, reviewType: 'guest_to_host' })
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0

    await propertySchema.findByIdAndUpdate(propertyId, {
        averageRating,
        totalReviews
    })
}

const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment, categories } = req.body

        if (!bookingId) return res.status(400).send({ message: "Booking ID is required." })
        if (!rating) return res.status(400).send({ message: "Rating is required." })
        if (rating < 1 || rating > 5) return res.status(400).send({ message: "Rating must be between 1 and 5." })

        // 1. User booked property & Booking exists?
        const booking = await bookingSchema.findById(bookingId)
        if (!booking) return res.status(404).send({ message: "Booking not found." })

        // Check if the current user is indeed the guest of this booking
        if (booking.guest.toString() !== req.user._id) {
            return res.status(401).send({ message: "Unauthorized. You did not make this booking." })
        }

        // 2. Booking completed?
        if (booking.bookingStatus !== "completed") {
            return res.status(400).send({ message: "You can only review after the booking is completed." })
        }

        // 3. Already reviewed?
        const existReview = await reviewSchema.findOne({ booking: bookingId, reviewType: 'guest_to_host' })
        if (existReview) {
            return res.status(400).send({ message: "You have already reviewed this booking." })
        }

        // 4. Create review
        const review = new reviewSchema({
            property: booking.property,
            user: req.user._id,
            subject: booking.host,
            booking: bookingId,
            reviewType: 'guest_to_host',
            rating,
            categories: categories || undefined,
            comment
        })
        await review.save()

        // 5. Update property average rating
        await updatePropertyRating(booking.property)

        res.status(201).send({ message: "Review created successfully.", review })
    } 
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal server error." })
    }
}

// ====== Host rates the guest after they leave
const createGuestReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body

        if (!bookingId) return res.status(400).send({ message: "Booking ID is required." })
        if (!rating) return res.status(400).send({ message: "Rating is required." })
        if (rating < 1 || rating > 5) return res.status(400).send({ message: "Rating must be between 1 and 5." })

        const booking = await bookingSchema.findById(bookingId)
        if (!booking) return res.status(404).send({ message: "Booking not found." })

        if (booking.host.toString() !== req.user._id) {
            return res.status(403).send({ message: "Only the host of this booking can review the guest." })
        }

        if (booking.bookingStatus !== "completed") {
            return res.status(400).send({ message: "You can only review after the booking is completed." })
        }

        const existReview = await reviewSchema.findOne({ booking: bookingId, reviewType: 'host_to_guest' })
        if (existReview) {
            return res.status(400).send({ message: "You have already reviewed this guest." })
        }

        const review = new reviewSchema({
            property: booking.property,
            user: req.user._id,
            subject: booking.guest,
            booking: bookingId,
            reviewType: 'host_to_guest',
            rating,
            comment
        })
        await review.save()

        res.status(201).send({ message: "Guest review created successfully.", review })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal server error." })
    }
}

// ====== Everything written about one person, and their average
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params

        const reviews = await reviewSchema.find({ subject: userId })
            .populate("user", "fullName profileImg")
            .sort({ createdAt: -1 })

        const averageRating = reviews.length
            ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
            : 0

        res.status(200).send({ message: "success", reviews, averageRating, totalReviews: reviews.length })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal server error." })
    }
}

const getPropertyReviews = async (req, res) => {
    try {
        const { propertyId } = req.params

        const reviews = await reviewSchema.find({ property: propertyId, reviewType: 'guest_to_host' })
            .populate("user", "fullName profileImg")
            .sort({ createdAt: -1 })

        // ====== Averages per category, the breakdown guests actually read
        const keys = ['cleanliness', 'accuracy', 'checkIn', 'communication', 'location', 'value']
        const categoryAverages = {}
        for (const key of keys) {
            const scored = reviews.filter(item => item.categories?.[key])
            categoryAverages[key] = scored.length
                ? Number((scored.reduce((sum, item) => sum + item.categories[key], 0) / scored.length).toFixed(1))
                : 0
        }

        res.status(200).send({ message: "success", reviews, categoryAverages })
    } 
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal server error." })
    }
}

const updateReview = async (req, res) => {
    try {
        const { id } = req.params
        const { rating, comment } = req.body

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).send({ message: "Rating must be between 1 and 5." })
        }

        const review = await reviewSchema.findById(id)
        if (!review) return res.status(404).send({ message: "Review not found." })

        // Check if user is the author of the review
        if (review.user.toString() !== req.user._id) {
            return res.status(401).send({ message: "Unauthorized to edit this review." })
        }

        const updatedReview = await reviewSchema.findByIdAndUpdate(
            id, 
            { rating, comment }, 
            { new: true }
        )

        // Update average rating if rating was changed
        if (rating) {
            await updatePropertyRating(review.property)
        }

        res.status(200).send({ message: "Review updated successfully.", review: updatedReview })
    } 
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal server error." })
    }
}

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params

        const review = await reviewSchema.findById(id)
        if (!review) return res.status(404).send({ message: "Review not found." })

        // Check if user is the author of the review
        if (review.user.toString() !== req.user._id) {
            return res.status(401).send({ message: "Unauthorized to delete this review." })
        }

        const propertyId = review.property
        await reviewSchema.findByIdAndDelete(id)

        // Update average rating
        await updatePropertyRating(propertyId)

        res.status(200).send({ message: "Review deleted successfully." })
    } 
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal server error." })
    }
}

module.exports = { createReview, createGuestReview, getUserReviews, getPropertyReviews, updateReview, deleteReview }
