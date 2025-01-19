import { supabase } from './utils/supabaseClient';

export default async function HomePage() {
  function formatEthAddress(ethAddress: string) {
    return `${ethAddress.slice(0, 6)}...${ethAddress.slice(-4)}`;
  }

  const { data: leaderboard, error } = await supabase.from('leaderboard').select('*');

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // Sort the leaderboard by HP Balance in descending order
  const sortedLeaderboard = leaderboard.sort((a, b) => (b.hp_balance ?? 0) - (a.hp_balance ?? 0));

  return (
    <main style={{ padding: '20px' }}>
      <center>
        <h1>Skatehive Leaderboard</h1>
      </center>
      <p>Total number of rows: {sortedLeaderboard.length}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hive Author</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Max VP</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hive Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>HP Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>HBD Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Savings Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ETH Ad</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Gnars Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>HasVotedWit</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ETH Bal</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeaderboard.map((row: {
            hive_author: string;
            max_voting_power_usd: number | null;
            hive_balance: number | null;
            hp_balance: number | null;
            hbd_balance: number | null;
            hbd_savings_balance: number | null;
            eth_address: string | null;
            gnars_balance: number | null;
            has_voted_in_witness: boolean;
            eth_total_balance: number | null;
            last_updated: string | null;
          }, index: number) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.hive_author}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.max_voting_power_usd ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.hive_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.hp_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.hbd_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.hbd_savings_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.eth_address ? formatEthAddress(row.eth_address) : 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.gnars_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.has_voted_in_witness ? 'Yes' : 'No'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.eth_total_balance ?? 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.last_updated ? new Date(row.last_updated).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
