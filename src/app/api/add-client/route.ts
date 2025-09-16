import { createClient, type ClientConfig } from 'next-sanity';
import { NextResponse } from 'next/server';

// This client uses the secure WRITE token from your .env.local file
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
    const { first_name, last_name, email, contact, address, imageAssetId, imageBase64, imageName, imageType } = await request.json();

    if (!first_name || !last_name || !email || !address) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

  const newClientDocument: Record<string, unknown> = {
      _type: 'client', // The schema type in Sanity
      first_name,
      last_name,
      email,
      address,
    };

    if (contact) {
      newClientDocument.contact = Number(contact);
    }
    
    // If an image asset ID was provided (already uploaded), attach it
    let uploadedAssetId: string | undefined = imageAssetId;

    // If the client sent a base64 image, upload it server-side using the write token
    if (!uploadedAssetId && imageBase64) {
      try {
        // imageBase64 is expected to be a data URL like: data:<mime>;base64,<data>
        // Strip the prefix if present and convert to a Blob-like buffer
        const commaIndex = imageBase64.indexOf(',');
        const base64Data = commaIndex >= 0 ? imageBase64.slice(commaIndex + 1) : imageBase64;
        const buffer = Buffer.from(base64Data, 'base64');

        // Use the next-sanity client to upload the binary
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
        // If upload fails due to permission, return a 403 with clear message
        if (uploadErr && uploadErr.statusCode === 403) {
          return NextResponse.json({ message: 'Image upload failed: Insufficient permissions (403)' }, { status: 403 });
        }
        return NextResponse.json({ message: 'Image upload failed', error: String(uploadErr) }, { status: 500 });
      }
    }

    // If an image was uploaded (or provided as id), create the image reference
    if (uploadedAssetId) {
      newClientDocument.user_img = {
        _type: 'image',
        asset: { _type: 'reference', _ref: uploadedAssetId },
      };
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