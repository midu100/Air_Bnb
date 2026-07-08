import { apiSlice } from "../apiSlice";

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createReview: builder.mutation({
      query: (reviewData) => ({
        url: "/review/create",
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: ["Review", "Property"],
    }),
    getPropertyReviews: builder.query({
      query: (propertyId) => `/review/property/${propertyId}`,
      providesTags: ["Review"],
    }),
    updateReview: builder.mutation({
      query: ({ id, reviewData }) => ({
        url: `/review/update/${id}`,
        method: "PUT",
        body: reviewData,
      }),
      invalidatesTags: ["Review", "Property"],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/review/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review", "Property"],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetPropertyReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
