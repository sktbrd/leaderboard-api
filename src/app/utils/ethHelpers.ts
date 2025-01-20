import { Address } from "viem"
import { tokenAbi } from "./tokenAbi"
import { useReadContract } from "wagmi"
import { logWithColor } from "./hiveHelpers"

// Ensure this function is used in a Client Component
export const useReadGnarsBalance = (address: Address) => {
    console.log('useReadGnarsBalance')
    const { data: balance } = useReadContract({
        abi: tokenAbi,
        functionName: 'balanceOf',
        address: "0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17",
        args: [address],
    })
    logWithColor(`Balance of ${address}: ${balance}`, 'green')
    return balance
}

export const useReadGnarsVotes = (address: Address) => {
    console.log('useReadGnarsVotes')
    const { data: votes } = useReadContract({
        abi: tokenAbi,
        functionName: 'getVotes',
        address: "0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17",
        args: [address],
    })
    logWithColor(`Votes of ${address}: ${votes}`, 'green')
    return votes
}

export const useReadSkatehiveNFTBalance = (address: Address) => {
    console.log('useReadSkatehiveNFTBalance')
    const { data: balance } = useReadContract({
        abi: tokenAbi,
        functionName: 'balanceOf',
        address: "0xfe10d3ce1b0f090935670368ec6de00d8d965523",
        args: [address],
    })
    logWithColor(`Balance of ${address}: ${balance}`, 'green')
    return balance
}

