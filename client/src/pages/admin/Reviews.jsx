import React, { useState } from 'react';
import { HiOutlineStar, HiOutlineTrash } from 'react-icons/hi';
import { MOCK_ADMIN_REVIEWS } from '../../data/adminMockData';
import { useDeleteReviewMutation } from '../../store/api/reviewApi';
import { toast } from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState(MOCK_ADMIN_REVIEWS);
  const [deleteReview] = useDeleteReviewMutation();

  const handleDelete = async (id) => {
    if (confirm('Moderate review: Delete this review permanently?')) {
      try {
        // Try deleting via API if it's a real review, otherwise remove from local state
        if (id && !id.toString().startsWith('rev_')) {
          await deleteReview(id).unwrap();
        }
        setReviews(prev => prev.filter(r => r._id !== id));
        toast.success('Review deleted successfully');
      } catch (error) {
        console.error(error);
        toast.error(error?.data?.message || 'Failed to delete review.');
      }
    }
  };

  return (
    <div className="space-y-6 text-xs text-black">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight uppercase">Guest Reviews</h2>
        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Moderate and remove guest reviews from properties</p>
      </div>

      {/* Review list */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h4 className="text-sm font-bold text-black flex items-center gap-1.5">
            <HiOutlineStar className="w-4 h-4 text-neutral-400" />
            <span>Submitted reviews ({reviews.length})</span>
          </h4>
        </div>

        <div className="divide-y divide-neutral-200">
          {reviews.map(review => (
            <div key={review._id} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-neutral-50 transition-colors">
              <div className="space-y-2 flex-1">
                {/* User & Rating */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs uppercase">
                    {review.user?.fullName.slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-bold text-black">{review.user?.fullName}</h5>
                    <div className="flex items-center gap-1 text-neutral-400 font-bold text-[10px] uppercase">
                      <span>{review.property}</span>
                      <span>•</span>
                      <span>{review.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Rating stars */}
                <div className="flex items-center text-amber-500 font-bold text-xs gap-0.5">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                  <span className="text-neutral-500 font-medium ml-1.5">{review.rating} / 5</span>
                </div>

                {/* Comment text */}
                <p className="text-neutral-600 leading-relaxed font-semibold pr-4">
                  "{review.comment}"
                </p>
              </div>

              {/* Moderate Actions */}
              <div className="self-end sm:self-auto pt-2 sm:pt-0">
                <button
                  onClick={() => handleDelete(review._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded font-bold transition-all cursor-pointer shadow-xs"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  <span>Delete Review</span>
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="py-16 text-center text-neutral-400 font-semibold border-b border-neutral-200">
              No reviews listed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
