import { apiSlice } from "../apiSlice";

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: "/booking/create",
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Booking"],
    }),
    getAvailability: builder.query({
      query: (propertyId) => `/booking/availability/${propertyId}`,
      providesTags: ["Booking"],
    }),
    getMyBookings: builder.query({
      query: () => "/booking/mybookings",
      providesTags: ["Booking"],
    }),
    getHostBookings: builder.query({
      query: () => "/booking/hostbookings",
      providesTags: ["Booking"],
    }),
    getBookingById: builder.query({
      query: (id) => `/booking/${id}`,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/booking/cancel/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
    confirmBooking: builder.mutation({
      query: (id) => ({
        url: `/booking/confirm/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
    completeBooking: builder.mutation({
      query: (id) => ({
        url: `/booking/complete/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Booking", id }, "Booking"],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetAvailabilityQuery,
  useGetMyBookingsQuery,
  useGetHostBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useCompleteBookingMutation,
} = bookingApi;
