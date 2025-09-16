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
    const { first_name, last_name, email, contact, imageAssetId } = await request.json();

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

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
    
    if (imageAssetId) {
      newAgentDocument.user_img = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetId,
        },
      };
    }

    const createdAgent = await sanityClient.create(newAgentDocument);

    return NextResponse.json(createdAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ message: 'Error creating agent', error }, { status: 500 });
  }
}