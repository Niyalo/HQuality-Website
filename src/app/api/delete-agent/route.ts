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

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }
    await sanityClient.delete(userId);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user', error }, { status: 500 });
  }
}