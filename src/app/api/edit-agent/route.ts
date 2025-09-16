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

export async function PUT(request: Request) {
  try {
    const { userId, first_name, last_name, email, agent_id, contact, role, imageAssetId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const patch = sanityClient.patch(userId);

    patch.set({ first_name, last_name, email, role });

    if (role === 'agent') {
        patch.set({ agent_id: Number(agent_id) });
    } else {
        patch.unset(['agent_id']); // Remove agent_id if role is not agent
    }

    if (contact) patch.set({ contact: Number(contact) }); else patch.unset(['contact']);
    if (imageAssetId) patch.set({ user_img: { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId }}});
    
    const updatedUser = await patch.commit();
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user', error }, { status: 500 });
  }
}