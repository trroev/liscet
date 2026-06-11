"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type React from "react"
import { useState } from "react"

export type QueryProviderProps = {
  children: React.ReactNode
}

export const QueryProvider = ({
  children,
}: QueryProviderProps): React.JSX.Element => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
