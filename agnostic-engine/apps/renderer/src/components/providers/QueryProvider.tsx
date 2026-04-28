'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

type QueryProviderProps = { children: ReactNode };

/**
 * Wraps the app in a TanStack Query context.
 *
 * A new QueryClient is created per component instance (not module-level) to
 * prevent state leaking between server-side requests in Next.js.
 *
 * Default staleTime of 60 s avoids redundant refetches on tab focus for data
 * that changes infrequently. Override per-query when needed.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
