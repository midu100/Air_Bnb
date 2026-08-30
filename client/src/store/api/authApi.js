import { apiSlice } from "../apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (credentials) => ({
        url: "/auth/signin",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    signUp: builder.mutation({
      query: (formData) => ({
        url: "/auth/signUp",
        method: "POST",
        body: formData,
        // Since profileImg can be uploaded as multipart/form-data:
        // RTK Query automatically sets Content-Type if body is FormData
      }),
    }),
    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: "/auth/verifyotp",
        method: "POST",
        body: otpData,
      }),
    }),
    getProfile: builder.query({
      query: () => "/auth/getprofile",
      providesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgotpassword",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/resetpassword",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useVerifyOtpMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
