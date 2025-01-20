// file: src/app/utils/wagmiConfig.client.ts
"use client"

import { mainnet, base } from 'viem/chains'
import { http } from 'viem'
import { coinbaseWallet, injected } from 'wagmi/connectors'
import { createConfig, createStorage, cookieStorage } from 'wagmi'

export const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID as string;

export function getClientConfig() {
    // Possibly the same or slightly different config
    return createConfig({
        chains: [base, mainnet],
        connectors: [
            injected(),
            coinbaseWallet(),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            [base.id]: http(),
            [mainnet.id]: http(),
        },
    })
}
