import { NextResponse } from 'next/server';
import { PrivateKey } from '@hiveio/dhive';
import { HiveClient } from '@/lib/hive-client';

export async function POST(request: Request) {
  const client = HiveClient;

  try {
    // Parse the JSON body from the request
    const body = await request.json();
    
    // Log the received data to server terminal
    console.log('Received vote data:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.author || !body.permlink || !body.voter || !body.posting_key || !body.weight) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        }, 
        { status: 400 }
      );
    }

    // Create vote operation
    const voteOp = {
      voter: body.voter,
      author: body.author,
      permlink: body.permlink,
      weight: Math.min(Math.max(body.weight, -10000), 10000) // Ensure weight is between -10000 and 10000
    };

    // Deserialize the posting key
    const key = PrivateKey.from(body.posting_key);

    // Broadcast the vote
    const result = await client.broadcast.vote(voteOp, key);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Vote successful',
        data: {
          voter: voteOp.voter,
          author: voteOp.author,
          permlink: voteOp.permlink,
          weight: voteOp.weight,
          transaction: result
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Vote processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process vote' 
      }, 
      { status: 500 }
    );
  }
}