import { Comment, Discussion, ExtendedAccount } from '@hiveio/dhive';

export interface Author {
    hive_author: string;
    max_voting_power_usd?: number;
    hive_balance?: number;
    hp_balance?: number;
    hbd_balance?: number;
    hbd_savings_balance?: number;
    eth_address?: string;
    gnars_balance?: number;
    has_voted_in_witness?: boolean;
    eth_total_balance?: number;
    last_updated?: string;
    account_info?: ExtendedAccount;
}

export interface FetchSubscribersResponse {
    result: [string, any][];
}

export interface FetchBlogAuthorsResponse {
    result: Discussion[];
}

