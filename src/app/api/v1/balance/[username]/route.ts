import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/database';

const db = new HAFSQL_Database();

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Wait for params to be available
    const { username } = await params;

    // Get user's balance information
    const [rows, headers] = await db.executeQuery(`
      SELECT 
        account_name,
        hive,
        hbd,
        vests,
        hp_equivalent,
        hive_savings,
        hbd_savings
      FROM balances
      WHERE account_name = '${username}'
    `);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: rows[0],
        headers: headers
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch wallet data'
      },
      { status: 500 }
    );
  }
}