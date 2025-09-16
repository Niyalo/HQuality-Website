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
    const { first_name, last_name, email, contact, address, imageAssetId } = await request.json();

    if (!first_name || !last_name || !email || !address) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newClientDocument: any = {
      _type: 'client', // The schema type in Sanity
      first_name,
      last_name,
      email,
      address,
    };

    if (contact) {
      newClientDocument.contact = Number(contact);
    }
    
    // If an image was uploaded, create the image reference
    if (imageAssetId) {
      newClientDocument.user_img = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetId,
        },
      };
    }

    const createdClient = await sanityClient.create(newClientDocument);

    return NextResponse.json(createdClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ message: 'Error creating client', error }, { status: 500 });
  }
}