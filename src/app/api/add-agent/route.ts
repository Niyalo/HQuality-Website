import { createClient, type ClientConfig } from 'next-sanity';
import { NextResponse } from 'next/server';

const config: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-03-09',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
};

const sanityClient = createClient(config);

export async function POST(request: Request) {
  try {
    const { first_name, last_name, email, contact, imageAssetId, imageBase64, imageName, imageType } = await request.json();

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newAgentDocument: any = {
      _type: 'user',
      first_name,
      last_name,
      email,
      role: 'agent', // Hard-code the role to 'agent'
      created_at: new Date().toISOString(),
    };

    if (contact) {
      newAgentDocument.contact = Number(contact);
    }
    
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
        console.error('Agent image upload failed:', uploadErr);
        if (uploadErr && uploadErr.statusCode === 403) {
          return NextResponse.json({ message: 'Image upload failed: Insufficient permissions (403)' }, { status: 403 });
        }
        return NextResponse.json({ message: 'Image upload failed', error: String(uploadErr) }, { status: 500 });
      }
    }

    if (uploadedAssetId) {
      newAgentDocument.user_img = { _type: 'image', asset: { _type: 'reference', _ref: uploadedAssetId } };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdAgent = await sanityClient.create(newAgentDocument as any);

    return NextResponse.json(createdAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ message: 'Error creating agent', error }, { status: 500 });
  }
}