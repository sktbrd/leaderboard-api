import { supabase } from './supabaseClient'; // Use the existing Supabase client

export const getLeaderboard = async () => {
    try {
        const { data } = await supabase.from('leaderboard').select('*');
        if (data) {
            return data;
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch {
        throw new Error('Failed to fetch data from the database');
    }
};
