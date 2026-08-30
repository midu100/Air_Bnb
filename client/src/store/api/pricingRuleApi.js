import { apiSlice } from "../apiSlice";

export const pricingRuleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPropertyRules: builder.query({
      query: (propertyId) => `/pricing-rule/property/${propertyId}`,
      providesTags: ["PricingRule"],
    }),
    createRule: builder.mutation({
      query: (ruleData) => ({
        url: "/pricing-rule/create",
        method: "POST",
        body: ruleData,
      }),
      invalidatesTags: ["PricingRule"],
    }),
    updateRule: builder.mutation({
      query: ({ id, ruleData }) => ({
        url: `/pricing-rule/update/${id}`,
        method: "PUT",
        body: ruleData,
      }),
      invalidatesTags: ["PricingRule"],
    }),
    deleteRule: builder.mutation({
      query: (id) => ({
        url: `/pricing-rule/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PricingRule"],
    }),
  }),
});

export const {
  useGetPropertyRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} = pricingRuleApi;
