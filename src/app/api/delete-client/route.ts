import { createClient, type ClientConfig } from 'next-sanity';
import { NextResponse } from 'next/server';

const config: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-03-09',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
};

const sanityClient = createClient(config);

export async function POST(request: Request) { // Using POST for simplicity
  try {
    const { clientId } = await request.json();
    if (!clientId) {
      return NextResponse.json({ message: 'Client ID is required' }, { status: 400 });
    }
    await sanityClient.delete(clientId);
    return NextResponse.json({ message: 'Client deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ message: 'Error deleting client', error }, { status: 500 });
  }
}