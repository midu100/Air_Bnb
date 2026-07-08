import { apiSlice } from "../apiSlice";

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyWishlist: builder.query({
      query: () => "/wishlist/my",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation({
      query: (wishlistData) => ({
        url: "/wishlist/add",
        method: "POST",
        body: wishlistData, // e.g. { propertyId } or similar
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: (propertyId) => ({
        url: `/wishlist/remove/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
    clearWishlist: builder.mutation({
      query: () => ({
        url: "/wishlist/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetMyWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
} = wishlistApi;
