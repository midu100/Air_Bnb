import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Tokens live in httpOnly cookies now, so they ride along with credentials: 'include'
// and can no longer be read from JS to build an Authorization header.
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  credentials: "include",
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: "/auth/refreshtoken",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // retry original request
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Property", "Category", "Amenity", "Booking", "Review", "Wishlist", "Payment", "Conversation", "Message", "User", "Availability", "PricingRule", "Payout", "Lease", "Application", "Coupon"],
  endpoints: () => ({}),
});
