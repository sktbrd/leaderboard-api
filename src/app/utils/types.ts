export interface DataBaseAuthor {
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
    delegated_hive_power?: number; // Hive Power delegated by the user
    last_post?: string; // URL or identifier of the user's last post
}


export interface FetchSubscribersResponse {
    result: [string, unknown][];
}

