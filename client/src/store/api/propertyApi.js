import { apiSlice } from "../apiSlice";

export const propertyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: (params) => ({
        url: "/property/all",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.properties.map(({ _id }) => ({ type: "Property", id: _id })),
              { type: "Property", id: "LIST" },
            ]
          : [{ type: "Property", id: "LIST" }],
    }),
    getFeaturedProperties: builder.query({
      query: () => "/property/featured",
      providesTags: ["Property"],
    }),
    searchProperties: builder.query({
      query: (params) => ({
        url: "/property/search",
        params,
      }),
      providesTags: ["Property"],
    }),
    getHostProperties: builder.query({
      query: () => "/property/host",
      providesTags: ["Property"],
    }),
    getPropertyById: builder.query({
      query: (id) => `/property/${id}`,
      providesTags: (result, error, id) => [{ type: "Property", id }],
    }),
    createProperty: builder.mutation({
      query: (formData) => ({
        url: "/property/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Property", id: "LIST" }],
    }),
    updateProperty: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/property/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Property", id },
        { type: "Property", id: "LIST" },
      ],
    }),
    deleteProperty: builder.mutation({
      query: (id) => ({
        url: `/property/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Property", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetFeaturedPropertiesQuery,
  useSearchPropertiesQuery,
  useGetHostPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertyApi;
