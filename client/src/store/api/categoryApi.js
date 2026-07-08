import { apiSlice } from "../apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "/category/allcategory",
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation({
      query: (formData) => ({
        url: "/category/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} = categoryApi;
