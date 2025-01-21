import { ExtendedAccount } from '@hiveio/dhive';
import HiveClient from './dataManager';
import { Address } from 'viem';

const colors: { [key: string]: string } = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    orange: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
};

export const logWithColor = (message: string, color: string) => {
    console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
};

// Helper function to fetch account information
export const fetchAccountInfo = async (username: string): Promise<ExtendedAccount | null> => {
    try {
        const accounts = await HiveClient.database.call('get_accounts', [[username]]);
        if (accounts && accounts.length > 0) {
            return accounts[0];
        } else {
            // logWithColor(`No account information found for ${username}`, 'red');
            return null;
        }
    } catch (error) {
        // logWithColor(`Error fetching account information for ${username}: ${error}`, 'red');
        throw error; // Re-throw the error to ensure it is logged
    }
};

// Helper function to sanitize json_metadata
export const sanitizeJsonMetadata = (json_metadata: string): string => {
    return json_metadata.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

// Helper function to extract eth_address from json_metadata
export const extractEthAddress = (json_metadata: string): string => {
    if (!json_metadata) {
        return '0x0000000000000000000000000000000000000000' as Address;
    }

    try {
        const sanitizedMetadata = sanitizeJsonMetadata(json_metadata);
        const metadata = JSON.parse(sanitizedMetadata);
        return metadata.extensions?.eth_address || '0x0000000000000000000000000000000000000000' as Address;
    } catch (error) {
        // logWithColor(`Error parsing json_metadata: ${error}`, 'red');
        return '0x0000000000000000000000000000000000000000' as Address;
    }
};
