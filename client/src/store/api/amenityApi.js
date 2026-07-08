import { apiSlice } from "../apiSlice";

export const amenityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAmenities: builder.query({
      query: () => "/amenity/all",
      providesTags: ["Amenity"],
    }),
    createAmenity: builder.mutation({
      query: (amenityData) => ({
        url: "/amenity/create",
        method: "POST",
        body: amenityData,
      }),
      invalidatesTags: ["Amenity"],
    }),
    updateAmenity: builder.mutation({
      query: ({ id, amenityData }) => ({
        url: `/amenity/update/${id}`,
        method: "PUT",
        body: amenityData,
      }),
      invalidatesTags: ["Amenity"],
    }),
    deleteAmenity: builder.mutation({
      query: (id) => ({
        url: `/amenity/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Amenity"],
    }),
  }),
});

export const {
  useGetAmenitiesQuery,
  useCreateAmenityMutation,
  useUpdateAmenityMutation,
  useDeleteAmenityMutation,
} = amenityApi;
