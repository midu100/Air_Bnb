import { apiSlice } from "../apiSlice";

export const destinationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // What the home page shows - live destinations, in the editor's order
    getDestinations: builder.query({
      query: () => "/destination/all",
      providesTags: ["Destination"],
    }),
    // What the dashboard shows - the hidden ones too
    getAdminDestinations: builder.query({
      query: () => "/destination/admin",
      providesTags: ["Destination"],
    }),
    createDestination: builder.mutation({
      query: (formData) => ({
        url: "/destination/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Destination"],
    }),
    updateDestination: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/destination/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Destination"],
    }),
    deleteDestination: builder.mutation({
      query: (id) => ({
        url: `/destination/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Destination"],
    }),
  }),
});

export const {
  useGetDestinationsQuery,
  useGetAdminDestinationsQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
} = destinationApi;
