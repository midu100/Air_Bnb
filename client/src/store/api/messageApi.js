import { apiSlice } from "../apiSlice";

export const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (conversationId) => `/api/messages/${conversationId}`,
      providesTags: ["Message"],
    }),
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "/api/messages",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["Message", "Conversation"],
    }),
    markAsSeen: builder.mutation({
      query: (id) => ({
        url: `/api/messages/${id}/seen`,
        method: "PATCH",
      }),
      invalidatesTags: ["Message"],
    }),
    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/api/messages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Message"],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsSeenMutation,
  useDeleteMessageMutation,
} = messageApi;
