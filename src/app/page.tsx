import { supabase } from './utils/supabaseClient';

export default async function HomePage() {
  const { data: leaderboard, error } = await supabase.from('leaderboard').select('*');

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <main>
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Hive Author</th>
            <th>Max Voting Power (USD)</th>
            <th>Hive Balance</th>
            <th>HP Balance</th>
            <th>HBD Balance</th>
            <th>HBD Savings Balance</th>
            <th>ETH Address</th>
            <th>Gnars Balance</th>
            <th>Has Voted in Witness</th>
            <th>ETH Total Balance</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row: {
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
            <tr key={index}>
              <td>{row.hive_author}</td>
              <td>{row.max_voting_power_usd ?? 'N/A'}</td>
              <td>{row.hive_balance ?? 'N/A'}</td>
              <td>{row.hp_balance ?? 'N/A'}</td>
              <td>{row.hbd_balance ?? 'N/A'}</td>
              <td>{row.hbd_savings_balance ?? 'N/A'}</td>
              <td>{row.eth_address ?? 'N/A'}</td>
              <td>{row.gnars_balance ?? 'N/A'}</td>
              <td>{row.has_voted_in_witness ? 'Yes' : 'No'}</td>
              <td>{row.eth_total_balance ?? 'N/A'}</td>
              <td>{row.last_updated ? new Date(row.last_updated).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
