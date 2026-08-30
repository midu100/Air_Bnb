import { apiSlice } from "../apiSlice";

export const applicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyApplications: builder.query({
      query: () => "/application/my",
      providesTags: ["Application"],
    }),
    getLandlordApplications: builder.query({
      query: () => "/application/landlord",
      providesTags: ["Application"],
    }),
    createApplication: builder.mutation({
      query: (applicationData) => ({
        url: "/application/create",
        method: "POST",
        body: applicationData,
      }),
      invalidatesTags: ["Application"],
    }),
    decideApplication: builder.mutation({
      query: ({ id, decision, declineReason }) => ({
        url: `/application/decide/${id}`,
        method: "PUT",
        body: { decision, declineReason },
      }),
      invalidatesTags: ["Application"],
    }),
    withdrawApplication: builder.mutation({
      query: (id) => ({
        url: `/application/withdraw/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Application"],
    }),
  }),
});

export const {
  useGetMyApplicationsQuery,
  useGetLandlordApplicationsQuery,
  useCreateApplicationMutation,
  useDecideApplicationMutation,
  useWithdrawApplicationMutation,
} = applicationApi;
