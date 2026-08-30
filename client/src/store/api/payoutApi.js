import { apiSlice } from "../apiSlice";

export const payoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayoutStatus: builder.query({
      query: () => "/payout/status",
      providesTags: ["Payout"],
    }),
    getMyPayouts: builder.query({
      query: () => "/payout/my",
      providesTags: ["Payout"],
    }),
    createOnboardingLink: builder.mutation({
      query: () => ({
        url: "/payout/onboard",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetPayoutStatusQuery,
  useGetMyPayoutsQuery,
  useCreateOnboardingLinkMutation,
} = payoutApi;
