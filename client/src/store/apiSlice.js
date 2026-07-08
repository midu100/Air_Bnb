import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../components/common/Services";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getCookie("X_AS-TOKEN");
    if (token) {
      headers.set("Authorization", `${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: "/auth/refreshtoken", // In case backend adds it or supports it later
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
  tagTypes: ["Property", "Category", "Amenity", "Booking", "Review", "Wishlist", "Payment", "Conversation", "Message", "User"],
  endpoints: () => ({}),
});
