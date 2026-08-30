import { apiSlice } from "../apiSlice";

export const leaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaseQuote: builder.query({
      query: (params) => ({
        url: "/lease/quote",
        params,
      }),
    }),
    getMyLeases: builder.query({
      query: () => "/lease/my",
      providesTags: ["Lease"],
    }),
    getLeaseLedger: builder.query({
      query: (id) => `/lease/${id}/ledger`,
      providesTags: ["Lease"],
    }),
    createLease: builder.mutation({
      query: (leaseData) => ({
        url: "/lease/create",
        method: "POST",
        body: leaseData,
      }),
      invalidatesTags: ["Lease", "Application"],
    }),
    signLease: builder.mutation({
      query: (id) => ({
        url: `/lease/sign/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Lease"],
    }),
    giveNotice: builder.mutation({
      query: (id) => ({
        url: `/lease/notice/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Lease"],
    }),
  }),
});

export const {
  useGetLeaseQuoteQuery,
  useGetMyLeasesQuery,
  useGetLeaseLedgerQuery,
  useCreateLeaseMutation,
  useSignLeaseMutation,
  useGiveNoticeMutation,
} = leaseApi;
