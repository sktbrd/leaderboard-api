// file: src/app/utils/wagmiProvider.tsx
"use client"

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { State } from 'wagmi'
import { getClientConfig } from './wagmiConfig.client'

export function Provider({
    children,
    initialState,
}: {
    children: ReactNode;
    initialState?: State;
}) {
    const [config] = useState(() => getClientConfig())
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
