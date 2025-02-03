import { gql, request } from 'graphql-request';
import { supabase } from '../supabase/supabaseClient';
import { logWithColor } from '../hive/hiveUtils';

const GIVETH_API_URL = 'https://mainnet.serve.giveth.io/graphql';

const GET_ALL_DONATIONS_BY_PROJECT = gql`
  query GetAllDonationsByProject {
    donationsByProjectId(
      projectId: 1919
      take: 1000
      skip: 0
      orderBy: { field: CreationDate, direction: DESC }
    ) {
      donations {
        amount
        valueUsd
        user {
          walletAddress
        }
      }
    }
  }
`;


export type GivethResponse = {
  donationsByProjectId: {
    donations: {
      amount: number;
      valueUsd: number;
      user: { walletAddress: string };
    }[];
  };
};

/** ✅ Fetches all donation records from Giveth API */
export const fetchGivethDonations = async (): Promise<GivethResponse> => {
  try {
    const data = await request<GivethResponse>(GIVETH_API_URL, GET_ALL_DONATIONS_BY_PROJECT);
    return data;
  } catch (error) {
    logWithColor(`Failed to fetch data from Giveth API: ${error}`, 'red');
    throw new Error('Failed to fetch data from Giveth API');
  }
};
