import { apiSlice } from "../apiSlice";

export const availabilityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPropertyCalendar: builder.query({
      query: (propertyId) => `/availability/calendar/${propertyId}`,
      providesTags: ["Availability"],
    }),
    blockDates: builder.mutation({
      query: (blockData) => ({
        url: "/availability/block",
        method: "POST",
        body: blockData,
      }),
      invalidatesTags: ["Availability", "Booking"],
    }),
    unblockDates: builder.mutation({
      query: (id) => ({
        url: `/availability/block/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Availability", "Booking"],
    }),
    addIcalFeed: builder.mutation({
      query: (feedData) => ({
        url: "/availability/ical/feed",
        method: "POST",
        body: feedData,
      }),
      invalidatesTags: ["Property"],
    }),
    syncIcalFeeds: builder.mutation({
      query: (propertyId) => ({
        url: `/availability/ical/sync/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: ["Availability"],
    }),
  }),
});

export const {
  useGetPropertyCalendarQuery,
  useBlockDatesMutation,
  useUnblockDatesMutation,
  useAddIcalFeedMutation,
  useSyncIcalFeedsMutation,
} = availabilityApi;
