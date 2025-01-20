// file: src/app/utils/wagmiConfig.server.ts
import { mainnet, base } from 'viem/chains'
import { http } from 'viem'
import { coinbaseWallet, injected, } from 'wagmi/connectors'
import { createConfig, createStorage, cookieStorage } from 'wagmi'

export const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID as string;

// Export a server-safe config
export function getServerConfig() {
    // If you have to do chain configuration:
    // const { chains, publicClient } = configureChains([mainnet, base], [publicProvider()]) 
    // (Or your own custom providers if needed)

    return createConfig({
        // Provide any chain info or custom providers:
        // chains,
        // publicClient,

        // If you prefer just basic setups with viem's http transport:
        chains: [base, mainnet],
        connectors: [
            injected(),
            coinbaseWallet(),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        // SSR support is okay, but ensure no browser-only code is used here
        ssr: true,
        // If you are setting a custom transport for each chain:
        transports: {
            [base.id]: http(),
            [mainnet.id]: http(),
        },
    })
}
