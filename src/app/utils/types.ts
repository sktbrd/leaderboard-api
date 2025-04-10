export interface DataBaseAuthor {
    id: number;
    hive_author: string;
    hive_balance?: number; // Hive liquid balance
    hp_balance?: number; // Hive Power balance
    hbd_balance?: number; // HBD balance
    hbd_savings_balance?: number; // HBD savings balance
    has_voted_in_witness?: boolean; // Whether the author has voted for witnesses
    eth_address?: string; // Ethereum address associated with the author
    gnars_balance?: number; // Gnars token balance
    gnars_votes?: number; // Number of Gnars votes
    skatehive_nft_balance?: number; // Skatehive NFT balance
    max_voting_power_usd?: number;
    last_updated?: Date;
    last_post?: Date;
    post_count?: number;
    points?: number;
    giveth_donations_usd?: number;
    giveth_donations_amount?: number;
}

export interface FetchSubscribersResponse {
    result: [string, unknown][];
}

