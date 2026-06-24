const reviewSchema = require("../models/reviewSchema")
const bookingSchema = require("../models/bookingSchema")
const propertySchema = require("../models/propertySchema")

// Helper function to update property average rating and total reviews count
const updatePropertyRating = async (propertyId) => {
    const reviews = await reviewSchema.find({ property: propertyId })
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
        const { bookingId, rating, comment } = req.body

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
        const existReview = await reviewSchema.findOne({ booking: bookingId })
        if (existReview) {
            return res.status(400).send({ message: "You have already reviewed this booking." })
        }

        // 4. Create review
        const review = new reviewSchema({
            property: booking.property,
            user: req.user._id,
            booking: bookingId,
            rating,
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

const getPropertyReviews = async (req, res) => {
    try {
        const { propertyId } = req.params

        const reviews = await reviewSchema.find({ property: propertyId })
            .populate("user", "fullName profileImg")
            .sort({ createdAt: -1 })

        res.status(200).send({ message: "success", reviews })
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

module.exports = { createReview, getPropertyReviews, updateReview, deleteReview }
