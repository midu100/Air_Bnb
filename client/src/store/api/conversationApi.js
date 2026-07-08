import { apiSlice } from "../apiSlice";

export const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyConversations: builder.query({
      query: () => "/conversations",
      providesTags: ["Conversation"],
    }),
    getConversation: builder.query({
      query: (id) => `/conversations/${id}`,
      providesTags: ["Conversation"],
    }),
    createConversation: builder.mutation({
      query: (conversationData) => ({
        url: "/conversations",
        method: "POST",
        body: conversationData,
      }),
      invalidatesTags: ["Conversation"],
    }),
  }),
});

export const {
  useGetMyConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
} = conversationApi;
