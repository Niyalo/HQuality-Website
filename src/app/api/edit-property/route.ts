import { createClient, type ClientConfig } from 'next-sanity';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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
    const { propertyId, address, price, square_footage, built_in, agentId, clientIds } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ message: 'Property ID is required' }, { status: 400 });
    }

    const patch = sanityClient.patch(propertyId);

    patch.set({
      address,
      price: Number(price),
      square_footage: Number(square_footage),
      built_in,
    });

    if (agentId) {
      patch.set({ agent: { _type: 'reference', _ref: agentId } });
    } else {
      patch.unset(['agent']);
    }

    if (clientIds && clientIds.length > 0) {
      const clientReferences = clientIds.map((id: string) => ({
        _key: uuidv4(),
        _type: 'reference',
        _ref: id,
      }));
      patch.set({ clients: clientReferences });
    } else {
      patch.unset(['clients']);
    }

    const updatedProperty = await patch.commit();
    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ message: 'Error updating property', error }, { status: 500 });
  }
}