import { apiSlice } from "../apiSlice";

export const currencyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExchangeRates: builder.query({
      query: () => "/currency/rates",
    }),
  }),
});

export const { useGetExchangeRatesQuery } = currencyApi;
