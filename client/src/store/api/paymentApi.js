import { apiSlice } from "../apiSlice";

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (bookingId) => ({
        url: "/payment/create-session",
        method: "POST",
        body: { bookingId },
      }),
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
  useCreateCheckoutSessionMutation,
  useGetPaymentByBookingQuery,
  useGetMyPaymentsQuery,
  useRefundPaymentMutation,
} = paymentApi;
