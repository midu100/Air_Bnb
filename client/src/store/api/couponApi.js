import { apiSlice } from "../apiSlice";

export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyCoupons: builder.query({
      query: () => "/coupon/my",
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (couponData) => ({
        url: "/coupon/create",
        method: "POST",
        body: couponData,
      }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, couponData }) => ({
        url: `/coupon/update/${id}`,
        method: "PUT",
        body: couponData,
      }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupon/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
    validateCoupon: builder.mutation({
      query: (payload) => ({
        url: "/coupon/validate",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetMyCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
} = couponApi;
