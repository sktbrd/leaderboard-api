
export interface DataBaseAuthor {
    hive_author: string;
    hive_balance?: number;
    hp_balance?: number;
    hbd_balance?: number;
    hbd_savings_balance?: number;
    has_voted_in_witness?: boolean;
    eth_address?: string;
    gnars_votes?: number;
    delegated_hive_power?: number;
}

export interface FetchSubscribersResponse {
    result: [string, unknown][];
}

