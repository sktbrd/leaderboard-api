import { NextResponse } from 'next/server';
import { PrivateKey } from '@hiveio/dhive';
import { HiveClient } from '@/lib/hive-client';
import { HAFSQL_Database } from '@/lib/database';

const db = new HAFSQL_Database();

function new_permlink(context: string) {
  return new Date()
            .toISOString()
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase();
}

// if (images.length > 0) {
//   const uploadedImages = await Promise.all(images.map(async (image, index) => {
//       const signature = await getFileSignature(image);
//       try {
//           const uploadUrl = await uploadImage(image, signature, index, setUploadProgress);
//           return uploadUrl;
//       } catch (error) {
//           console.error('Error uploading image:', error);
//           return null;
//       }
//   }));

//   const validUrls = uploadedImages.filter(Boolean);

//   if (validUrls.length > 0) {
//       const imageMarkup = validUrls.map((url: string | null) => `![image](${url?.toString() || ''})`).join('\n');
//       commentBody += `\n\n${imageMarkup}`;
//   }
// }

// if (selectedGif) {
//   commentBody += `\n\n![gif](${selectedGif.images.downsized_medium.url})`;
// }

// if (commentBody) {
//   try {
//       const commentResponse = await aioha.comment(pa, pp, permlink, '', commentBody, { app: 'mycommunity' });
//       if (commentResponse.success) {
//           postBodyRef.current!.value = '';
//           setImages([]);
//           setSelectedGif(null);

//           const newComment: Partial<Comment> = {
//               author: user, // Assuming `pa` is the current user's author name
//               permlink: permlink,
//               body: commentBody,
//           };

//           onNewComment(newComment); // Pass the actual Comment data
//       }
//   } finally {
//       setIsLoading(false);
//       setUploadProgress([]);
//   }
// }
// }

// import { getFileSignature, uploadImage } from '@/lib/hive/client-functions';


export async function POST(request: Request) {
  const client = HiveClient;

  try {
    // Parse the JSON body from the request
    const body = await request.json();

    // Log the received data to server terminal
    console.log('Received new post data:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.author || !body.permlink || !body.body || !body.posting_key) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    const [snapContainerRow] = await db.executeQuery(`
      SELECT parent_permlink as total
      FROM comments
      WHERE parent_permlink SIMILAR TO 'snap-container-%'
      ORDER created DESC
      LIMIT 0,1
    `);
    console.log(snapContainerRow)

    // Create vote operation
    const commentOp = {
      parent_author: snapContainerRow[0].author || "",
      parent_permlink: snapContainerRow[0].permlink || "",
      author: body.author,
      permlink: new_permlink(body.body) || "",
      title: "",
      body: body.body,
      json_metadata: JSON.stringify({
        app: "",
        community: "",

      }, null, 2)
    };

    // Log the vote operation to server terminal
    console.log('Vote operation:', JSON.stringify(commentOp, null, 2));

    // Deserialize the posting key
    const key = PrivateKey.from(body.posting_key);

    // Broadcast the comment/post
    // console.dir(commentOp);
    // const result = await client.broadcast.comment(commentOp, key);
    const result = "Test";

    return NextResponse.json(
      {
        success: true,
        message: 'New Post successful',
        data: {
          body: commentOp.body,
          author: commentOp.author,
          permlink: commentOp.permlink,
          transaction: result
        }
      },
      {
        status: 200
      }
    );

  } catch (error) {
    console.error('New Post processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process new post'
      },
      { status: 500 }
    );
  }
}

