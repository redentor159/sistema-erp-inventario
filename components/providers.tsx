"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime: 0 is correct globally for ERP (always fresh data)
            // Master data queries (clientes, productos) SHOULD override this
            // in their specific useQuery hooks (e.g., staleTime: 1000 * 60 * 5)
            staleTime: 0,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
