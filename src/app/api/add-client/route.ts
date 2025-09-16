import { createClient, type ClientConfig } from 'next-sanity';
import { NextResponse } from 'next/server';
// uuid not required in this route

const config: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-03-09',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
};

const sanityClient = createClient(config);

export async function POST(request: Request) {
  try {
  const { first_name, last_name, email, contact, address, agentId, imageAssetId, imageBase64, imageName, imageType } = await request.json();

    if (!first_name || !last_name || !email || !address) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Build base client document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newClientDocument: any = { _type: 'client', first_name, last_name, email, address };
    if (contact) newClientDocument.contact = Number(contact);
    if (agentId) newClientDocument.agent = { _type: 'reference', _ref: agentId };

    // Handle image: prefer provided imageAssetId, otherwise upload imageBase64 server-side
    let uploadedAssetId: string | undefined = imageAssetId;
    if (!uploadedAssetId && imageBase64) {
      try {
        const commaIndex = imageBase64.indexOf(',');
        const base64Data = commaIndex >= 0 ? imageBase64.slice(commaIndex + 1) : imageBase64;
        const buffer = Buffer.from(base64Data, 'base64');
        const uploadResult = await sanityClient.assets.upload('image', buffer, {
          filename: imageName || 'upload.png',
          contentType: imageType || 'image/png',
        } as { filename?: string; contentType?: string });
        uploadedAssetId = uploadResult._id;
      } catch (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        uploadErr: any
      ) {
        console.error('Image upload failed:', uploadErr);
        if (uploadErr && uploadErr.statusCode === 403) {
          return NextResponse.json({ message: 'Image upload failed: Insufficient permissions (403)' }, { status: 403 });
        }
        return NextResponse.json({ message: 'Image upload failed', error: String(uploadErr) }, { status: 500 });
      }
    }

    if (uploadedAssetId) {
      newClientDocument.user_img = { _type: 'image', asset: { _type: 'reference', _ref: uploadedAssetId } };
    }

    // Create the client document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdClient = await sanityClient.create(newClientDocument as any);
    return NextResponse.json(createdClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ message: 'Error creating client', error }, { status: 500 });
  }
}