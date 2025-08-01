import { supabase } from './supabaseClient'; // Use the existing Supabase client

export const getLeaderboard = async () => {
    try {
        const { data } = await supabase.from(process.env.NEXT_PUBLIC_SUPABASE_DB || 'leaderboard').select('*');
        if (data) {
            return data;
        } else {
            return [];
        }
    } catch {
        throw new Error('Failed to fetch data from the database');
    }
};
