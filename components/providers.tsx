
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
// import { Toaster } from "@/components/ui/sonner"
// Just in case, I will uncomment Toaster once I add it. For now let's just do QueryClient.

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* <Toaster /> */}
        </QueryClientProvider>
    )
}
