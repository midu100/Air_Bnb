import { apiSlice } from "../apiSlice";

export const agentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAgentStatus: builder.query({
      query: () => "/agent/status",
      providesTags: ["Agent"],
    }),
    getAgentHistory: builder.query({
      query: () => "/agent/history",
      providesTags: ["Agent"],
    }),
    askAgent: builder.mutation({
      query: (payload) => ({
        url: "/agent/ask",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Agent"],
    }),
    confirmProposal: builder.mutation({
      query: (payload) => ({
        url: "/agent/confirm",
        method: "POST",
        body: payload,
      }),
      // A confirmed change can touch any of these
      invalidatesTags: ["Agent", "Property", "Coupon", "PricingRule", "Availability", "Booking"],
    }),
    declineProposal: builder.mutation({
      query: (payload) => ({
        url: "/agent/decline",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Agent"],
    }),
  }),
});

export const {
  useGetAgentStatusQuery,
  useGetAgentHistoryQuery,
  useAskAgentMutation,
  useConfirmProposalMutation,
  useDeclineProposalMutation,
} = agentApi;
