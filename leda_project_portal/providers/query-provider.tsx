/**
 * Application-level React Query provider.
 * Creates a single `QueryClient` instance per session and wraps the component
 * tree so all child components can share the same query cache.
 * ReactQueryDevtools are included for development inspection.
 */
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * Wraps `children` with the React Query context.
 * The `QueryClient` is created once via `useState` to prevent a new instance
 * from being created on every render.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
const [queryClient] = useState(
    () =>
        new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 30 * 1000, // 30 seconds
                    retry: 1, // Retry failed requests once before surfacing an error
                    refetchOnWindowFocus: false, // Prevent refetch when the user alt-tabs back
                },
            },
        })
);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
