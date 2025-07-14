/*
  Main Feed 
*/
import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';
import { HiveSQL_Database } from '@/lib/hivesql_database';

// Normalize votes from HAFSQL (Postgres)
function normalizeHafVotes(votes: any[]) {
  if (!Array.isArray(votes)) return [];
  return votes.map(v => ({
    voter: v.voter,
    weight: Number(v.weight),
    timestamp: v.timestamp,
    pending_payout: Number(v.pending_payout),
  })).sort((a, b) => a.voter.localeCompare(b.voter));
}

// Normalize votes from HIVESQL (MSSQL)
function normalizeHiveVotes(votesString: string): any[] {
  try {
    const parsed = JSON.parse(votesString);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(v => ({
        voter: v.voter,
        weight: Number(v.weight),
        timestamp: v.timestamp,
        pending_payout: Number(v.pending_payout || 0),
      }))
      .sort((a, b) => a.voter.localeCompare(b.voter));
  } catch (e) {
    console.warn('Failed to parse HiveSQL votes:', e);
    return [];
  }
}

// Normalize a post for comparison (common fields only)
function normalizePost(post: any, source: 'haf' | 'hive') {
  return {
    author: post.author,
    permlink: post.permlink,
    parent_permlink: post.parent_permlink,
    created: new Date(post.created).toISOString(),
    body: (post.body || '').trim(),
    pending_payout_value: Number(post.pending_payout_value || 0),
    votes: source === 'haf' ? normalizeHafVotes(post.votes) : normalizeHiveVotes(post.votes),
  };
}

// Compare two normalized posts
function comparePosts(postA: any, postB: any) {
  if (
    postA.author !== postB.author ||
    postA.permlink !== postB.permlink ||
    postA.parent_permlink !== postB.parent_permlink ||
    postA.created !== postB.created ||
    postA.body !== postB.body ||
    postA.pending_payout_value !== postB.pending_payout_value
  ) {
    return false;
  }
  // Compare votes length first
  if (postA.votes.length !== postB.votes.length) return false;

  // Compare votes content
  for (let i = 0; i < postA.votes.length; i++) {
    const va = postA.votes[i];
    const vb = postB.votes[i];
    if (va.voter !== vb.voter || va.weight !== vb.weight) {
      return false;
    }
  }
  return true;
}

function comparePostsVerbose(postA: any, postB: any) {
  const differences: string[] = [];

  if (postA.author !== postB.author)
    differences.push(`author: ${postA.author} !== ${postB.author}`);
  if (postA.permlink !== postB.permlink)
    differences.push(`permlink: ${postA.permlink} !== ${postB.permlink}`);
  if (postA.parent_permlink !== postB.parent_permlink)
    differences.push(`parent_permlink: ${postA.parent_permlink} !== ${postB.parent_permlink}`);
  // if (postA.created !== postB.created)
  //   differences.push(`created: ${postA.created} !== ${postB.created}`);
  // if (postA.body !== postB.body)
  //   differences.push(`body:\n<<<${postA.body}>>>\nvs\n<<<${postB.body}>>>`);
  if (postA.pending_payout_value !== postB.pending_payout_value)
    differences.push(`pending_payout_value: ${postA.pending_payout_value} !== ${postB.pending_payout_value}`);

  // Check votes length
  if (postA.votes.length !== postB.votes.length) {
    differences.push(`votes.length: ${postA.votes.length} !== ${postB.votes.length}`);
  } else {
    for (let i = 0; i < postA.votes.length; i++) {
      const va = postA.votes[i];
      const vb = postB.votes[i];
      if (va.voter !== vb.voter) {
        differences.push(`votes[${i}].voter: ${va.voter} !== ${vb.voter}`);
      }
      // No weight comparison
    }
  }

  if (differences.length > 0) {
    console.log(`❌ Post mismatch: ${postA.author}/${postA.permlink}`);
    differences.forEach(diff => console.log(` - ${diff}`));
    return false;
  }

  return true;
}


export async function GET(request: Request) {
  console.log("Fetching MAIN FEED data...");

  const { searchParams } = new URL(request.url);
  const COMMUNITY = searchParams.get('community_code') || process.env.MY_COMMUNITY_CATEGORY || 'hive-173115';
  const TAG_FILTER = `"tags": ["${COMMUNITY}"]`;
  const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE) || 1;
  const DEFAULT_FEED_LIMIT = Number(process.env.DEFAULT_FEED_LIMIT) || 25;
  const PARENT_PERMLINK = process.env.PARENT_PERMLINK || '';

  // Pagination params
  const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE);
  const limit = Math.max(1, Number(searchParams.get('limit')) || DEFAULT_FEED_LIMIT);
  const offset = (page - 1) * limit;

  // results
  let resultsRows: Record<string, any>[];
  let total: number;

  try {
    const hafDb = new HAFSQL_Database();
    await hafDb.testConnection();

    // uncomment to test hivesql results
    // throw "debug error"

    const [hafTotalResult] = await hafDb.executeQuery(`
  SELECT COUNT(*) AS total
  FROM comments c
  WHERE 
    (
      (c.parent_permlink SIMILAR TO 'snap-container-%' AND c.json_metadata @> '{${TAG_FILTER}}')
      OR c.parent_permlink LIKE '${PARENT_PERMLINK}'
    )
    AND c.deleted = false;
`);
    total = parseInt(hafTotalResult[0].total, 10);

    // Query HAFSQL
    const [hafRows] = await hafDb.executeQuery(`
      SELECT 
        c.body, c.author, c.permlink, c.parent_author, c.parent_permlink, 
        c.created, c.last_edited, c.cashout_time, c.remaining_till_cashout, c.last_payout, 
        c.tags, c.category, c.json_metadata AS post_json_metadata, c.root_author, c.root_permlink, 
        c.pending_payout_value, c.author_rewards, c.author_rewards_in_hive, c.total_payout_value, 
        c.curator_payout_value, c.beneficiary_payout_value, c.total_rshares, c.net_rshares, c.total_vote_weight, 
        c.beneficiaries, c.max_accepted_payout, c.percent_hbd, c.allow_votes, c.allow_curation_rewards, c.deleted,
        a.json_metadata AS user_json_metadata, a.reputation, a.followers, a.followings,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'timestamp', v.timestamp,
              'voter', v.voter,
              'weight', v.weight,
              'rshares', v.rshares,
              'total_vote_weight', v.total_vote_weight,
              'pending_payout', v.pending_payout,
              'pending_payout_symbol', v.pending_payout_symbol
            )
          ) FILTER (WHERE v.id IS NOT NULL), 
          '[]'
        ) as votes
      FROM comments c
      LEFT JOIN accounts a ON c.author = a.name
      LEFT JOIN operation_effective_comment_vote_view v 
        ON c.author = v.author 
        AND c.permlink = v.permlink
      WHERE 
          (
            (c.parent_permlink SIMILAR TO 'snap-container-%' AND c.json_metadata @> '{${TAG_FILTER}}')
            OR c.parent_permlink LIKE '${PARENT_PERMLINK}'
          )
          AND c.deleted = false
      GROUP BY 
        c.body, c.author, c.permlink, c.parent_author, c.parent_permlink, c.created, c.last_edited, c.cashout_time, 
        c.remaining_till_cashout, c.last_payout, c.tags, c.category, c.json_metadata, c.root_author, c.root_permlink, 
        c.pending_payout_value, c.author_rewards, c.author_rewards_in_hive, c.total_payout_value, c.curator_payout_value, 
        c.beneficiary_payout_value, c.total_rshares, c.net_rshares, c.total_vote_weight, c.beneficiaries, c.max_accepted_payout, 
        c.percent_hbd, c.allow_votes, c.allow_curation_rewards, c.deleted, a.json_metadata, a.reputation, a.followers, a.followings
      ORDER BY c.created DESC
      LIMIT ${limit}
      OFFSET ${offset};
    `);

    resultsRows = hafRows;
    console.log("✅ Using HAFSQL data");
  } catch (error) {

    try {
      // Try MSSQL fallback
      const hivesqlDb = new HiveSQL_Database();
      // await hivesqlDb.testConnection();

      //
      // ISSUE: its taking long time to COUNT using this query. lets skip that for now...
      //

//       const { recordset: totalResult } = await hivesqlDb.executeQuery(`
//   SELECT COUNT(*) AS total
// FROM DBHive.dbo.Comments c
// WHERE 
//     (
//         (
//             c.parent_permlink LIKE 'snap-container-%'
//             AND ISJSON(c.json_metadata) = 1
//             AND EXISTS (
//                 SELECT 1
//                 FROM OPENJSON(c.json_metadata, '$.tags') WITH (tag NVARCHAR(MAX) '$')
//                 WHERE tag = '${COMMUNITY}'
//             )
//         )
//         OR c.parent_permlink = '${PARENT_PERMLINK}'
//     )
// `);
//       total = parseInt(totalResult[0].total, 10);


      const { recordset: hiveRows } = await hivesqlDb.executeQuery(`
        SELECT
            c.ID AS id,
            c.author,
            c.permlink,
            c.parent_author,
            c.parent_permlink,
            c.title,
            c.body,
            c.json_metadata AS post_json_metadata,
            c.created,
            NULL AS last_edited, -- Add if column exists
            NULL AS cashout_time, -- Add if column exists
            NULL AS remaining_till_cashout, -- Add if computable
            c.last_payout,
            NULL AS tags, -- Extract from json_metadata if needed
            c.category,
            NULL AS root_author, -- Add if column exists
            NULL AS root_permlink, -- Add if column exists
            CAST(c.pending_payout_value AS NVARCHAR) AS pending_payout_value,
            CAST(c.author_rewards AS NVARCHAR) AS author_rewards,
            NULL AS author_rewards_in_hive, -- Add if column exists
            CAST(c.total_payout_value AS NVARCHAR) AS total_payout_value,
            CAST(c.curator_payout_value AS NVARCHAR) AS curator_payout_value,
            NULL AS beneficiary_payout_value, -- Add if column exists
            NULL AS total_rshares, -- Add if column exists
            NULL AS net_rshares, -- Add if column exists
            NULL AS total_vote_weight, -- Add if column exists
            CAST(c.max_accepted_payout AS NVARCHAR) + '.0' AS max_accepted_payout,
            c.percent_hbd,
            c.allow_votes,
            c.allow_curation_rewards,
            0 AS deleted, -- Add if column exists
            c.beneficiaries,
            c.url,
            a.json_metadata AS user_json_metadata,
            NULL AS reputation, -- Add if column exists
            NULL AS followers, -- Add if column exists
            NULL AS followings, -- Add if column exists
            ISNULL(
                (
                    SELECT JSON_QUERY(
                        (
                            SELECT 
                                v.id AS id,
                                FORMAT(v.[timestamp], 'yyyy-MM-ddTHH:mm:ss') AS [timestamp],
                                v.voter AS voter,
                                v.weight AS weight --,
                                -- v.rshares AS rshares,
                                -- v.total_vote_weight AS total_vote_weight,
                                -- v.pending_payout AS pending_payout,
                                -- v.pending_payout_symbol AS pending_payout_symbol
                            FROM DBHive.dbo.TxVotes v
                            WHERE v.author = c.author AND v.permlink = c.permlink
                            FOR JSON PATH
                        )
                    )
                ), '[]'
            ) AS votes
        FROM DBHive.dbo.Comments c
        LEFT JOIN DBHive.dbo.Accounts a ON c.author = a.name
        WHERE 
            (
                (
                    c.parent_permlink LIKE 'snap-container-%'
                    AND ISJSON(c.json_metadata) = 1
                    AND EXISTS (
                        SELECT 1
                        FROM OPENJSON(c.json_metadata, '$.tags') WITH (tag NVARCHAR(MAX) '$')
                        WHERE tag = '${COMMUNITY}'
                    )
                )
                OR c.parent_permlink = '${PARENT_PERMLINK}'
            )
            -- AND c.deleted = 0
        ORDER BY c.created DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

      total = hiveRows[0].length * 5; // mock total for pagination.... BUG on sight!!!!

      resultsRows = hiveRows;
      console.log("⚠️ Fallback: Using HiveSQL data");


      // //
      // // Compare results for debug
      // //

      // for (let i = 0; i < hafRows.length; i++) {
      //   const hafPost = normalizePost(hafRows[i], 'haf');
      //   const hivePost = hiveRows[i] ? normalizePost(hiveRows[i], 'hive') : null;

      //   if (!hivePost) {
      //     console.warn(`No matching HIVESQL post for HAFSQL post index ${i}, author: ${hafPost.author}, permlink: ${hafPost.permlink}`);
      //     continue;
      //   }

      //   // const match = comparePosts(hafPost, hivePost);


      //   // if (!comparePostsVerbose(hafPost, hivePost)) {
      //   //   console.log(`↪ Mismatch at index ${i}`);
      //   // }


      //   // if (!match) {
      //   //   console.warn(`Post mismatch at index ${i}:`);
      //   //   // console.log('HAFSQL post:', JSON.stringify(hafPost, null, 2));
      //   //   // console.log('HIVESQL post:', JSON.stringify(hivePost, null, 2));
      //   // }
      // }

    } catch (error) {
      console.error('Failed to fetch data from both DBs:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
  }
  // Return HAFSQL OR HIVESQL data to frontend
  return NextResponse.json({
    success: true,
    data: resultsRows,
    pagination: {
      currentPage: page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      nextPage: page * limit < total ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  }, {
    status: 200,
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=150',
    },
  });


}
