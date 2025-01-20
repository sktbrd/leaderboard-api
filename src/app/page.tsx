'use client'
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
interface LeaderboardRow {
  hive_author: string;
  max_voting_power_usd: number | null;
  hive_balance: number | null;
  hp_balance: number | null;
  hbd_balance: number | null;
  hbd_savings_balance: number | null;
  eth_address: string | null;
  gnars_balance: number | null;
  gnars_votes: number | null;
  skatehive_nft_balance: number | null;
  has_voted_in_witness: boolean;
  eth_total_balance: number | null;
  last_updated: string | null;
  last_post: string | null;
  post_count: number | null;
}

export default function HomePage() {
  const [sortField, setSortField] = useState<keyof LeaderboardRow>('hp_balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('leaderboard').select('*');
      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaderboard(data as LeaderboardRow[]);
      }
    };
    fetchData();
  }, []);

  function formatEthAddress(ethAddress: string) {
    return `${ethAddress.slice(0, 6)}...${ethAddress.slice(-4)}`;
  }

  // Sort the leaderboard based on selected field and order
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    const aValue = a[sortField] ?? 0;
    const bValue = b[sortField] ?? 0;
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  const handleSortChange = (field: keyof LeaderboardRow) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <main style={{ padding: '20px' }}>
      <center>
        <h1>Skatehive Leaderboard</h1>
      </center>
      <p>Total number of rows: {sortedLeaderboard.length}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('hive_author')}>Hive Author</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('max_voting_power_usd')}>Max VP</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('hive_balance')}>Hive Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('hp_balance')}>HP Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('hbd_balance')}>HBD Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('hbd_savings_balance')}>Savings Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('eth_address')}>ETH Ad</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('gnars_balance')}>Gnars Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('gnars_votes')}>Gnars Votes</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('skatehive_nft_balance')}>Skatehive NFT Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('has_voted_in_witness')}>HasVotedWit</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('eth_total_balance')}>ETH Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('last_updated')}>Last Updated</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('last_post')}>Last Post</th>
            <th style={{ border: '1px solid #ddd', padding: '6px', cursor: 'pointer' }} onClick={() => handleSortChange('post_count')}>Post Count</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeaderboard.map((row, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.hive_author}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px', color: row.max_voting_power_usd !== null ? (row.max_voting_power_usd < 0.05 ? 'red' : row.max_voting_power_usd > 0.5 ? 'green' : 'yellow') : 'black' }}>
                {row.max_voting_power_usd ?? 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.hive_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.hp_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.hbd_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.hbd_savings_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px', color: row.eth_address && row.eth_address !== '0x0000000000000000000000000000000000000000' ? 'green' : 'red' }}>
                {row.eth_address ? formatEthAddress(row.eth_address) : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.gnars_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.gnars_votes ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.skatehive_nft_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px', color: row.has_voted_in_witness ? 'green' : 'red' }}>
                {row.has_voted_in_witness ? 'Yes' : 'No'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.eth_total_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px' }}>{row.last_updated ? new Date(row.last_updated).toLocaleString() : 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '6px', color: row.last_post && new Date(row.last_post) < new Date(new Date().setFullYear(new Date().getFullYear() - 1)) ? 'red' : 'green' }}>
                {row.last_post ? new Date(row.last_post).toLocaleString() : 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '6px', color: (row.post_count ?? 0) === 0 ? 'red' : (row.post_count ?? 0) > 100 ? 'green' : 'yellow' }}>
                {row.post_count ?? 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
