import { NextRequest, NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';

const db = new HAFSQL_Database();

export async function GET(
  request: NextRequest,
) {
  console.log("Fetching BALANCE data...");
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Get user's balance information
    const {rows, headers} = await db.executeQuery(`
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