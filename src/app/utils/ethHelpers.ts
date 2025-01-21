import { ethers } from "ethers";
import { tokenAbi } from "./tokenAbi";
// import { logWithColor } from "./hiveHelpers";
const provider = new ethers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/_OAOiBtV04wP6x1-gAqpwQoBj_ykKgv7');

export const readGnarsBalance = async (address: string) => {
    try {
        const contract = new ethers.Contract("0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17", tokenAbi, provider);
        const balance = await contract.balanceOf(address);
        // logWithColor(`Balance of ${address}: ${balance}`, 'green');
        return balance;
    } catch (error) {
        throw error;
    }
}

export const readGnarsVotes = async (address: string) => {
    try {
        const contract = new ethers.Contract("0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17", tokenAbi, provider);
        const votes = await contract.getVotes(address);
        // logWithColor(`Votes of ${address}: ${votes}`, 'green');
        return votes;
    } catch (error) {
        throw error;
    }
}

export const readSkatehiveNFTBalance = async (address: string) => {
    try {
        const contract = new ethers.Contract("0xfe10d3ce1b0f090935670368ec6de00d8d965523", tokenAbi, provider);
        const balance = await contract.balanceOf(address);
        // logWithColor(`Balance of ${address}: ${balance}`, 'green');
        return balance;
    } catch (error) {
        throw error;
    }
}

