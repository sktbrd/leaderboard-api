import { ethers } from 'ethers';
import { tokenAbi } from './tokenAbi';
import { logWithColor } from '../hive/hiveUtils';

const provider = new ethers.JsonRpcProvider(`https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

export const readGnarsBalance = async (address: string) => {
    if(!process.env.ALCHEMY_API_KEY) return;

    try {
        const contract = new ethers.Contract('0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17', tokenAbi, provider);
        const balance = await contract.balanceOf(address);
        logWithColor(`Balance of ${address}: ${balance}`, 'green');
        return balance.toString();
    } catch (error) {
        throw error;
    }
};

export const readGnarsVotes = async (address: string) => {
    if(!process.env.ALCHEMY_API_KEY) return;
    try {
        const contract = new ethers.Contract('0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17', tokenAbi, provider);
        const votes = await contract.getVotes(address);
        logWithColor(`Votes of ${address}: ${votes}`, 'green');
        return votes.toString();
    } catch (error) {
        throw error;
    }
};

export const readSkatehiveNFTBalance = async (address: string) => {
    if(!process.env.ALCHEMY_API_KEY) return;
    try {
        const contract = new ethers.Contract('0xfe10d3ce1b0f090935670368ec6de00d8d965523', tokenAbi, provider);
        const balance = await contract.balanceOf(address);
        logWithColor(`Balance of ${address}: ${balance}`, 'green');
        return balance.toString();
    } catch (error) {
        throw error;
    }
};
