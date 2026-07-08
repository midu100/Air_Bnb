import { apiSlice } from "../apiSlice";

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/payment/create",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Payment", "Booking"],
    }),
    getPaymentByBooking: builder.query({
      query: (bookingId) => `/payment/booking/${bookingId}`,
      providesTags: ["Payment"],
    }),
    getMyPayments: builder.query({
      query: () => "/payment/mypayments",
      providesTags: ["Payment"],
    }),
    refundPayment: builder.mutation({
      query: (id) => ({
        url: `/payment/refund/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Payment", "Booking"],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentByBookingQuery,
  useGetMyPaymentsQuery,
  useRefundPaymentMutation,
} = paymentApi;
