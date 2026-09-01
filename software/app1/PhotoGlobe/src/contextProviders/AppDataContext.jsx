import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // <-- IMPORT

// Created OUTSIDE the provider component to prevent caching resets on re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const AppDataProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* Visual tool only loads in development environment */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
