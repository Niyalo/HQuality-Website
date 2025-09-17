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
    const { clientId, first_name, last_name, email, address, contact, agentId, imageAssetId, contracts } = await request.json();

    if (!clientId) {
      return NextResponse.json({ message: 'Client ID is required' }, { status: 400 });
    }

    const patch = sanityClient.patch(clientId);
    patch.set({ first_name, last_name, email, address });
    if (contact) patch.set({ contact: Number(contact) }); else patch.unset(['contact']);
    if (agentId) patch.set({ agent: { _type: 'reference', _ref: agentId } }); else patch.unset(['agent']);
    if (imageAssetId) patch.set({ user_img: { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId }}});
    if (contracts) {
      type ContractInput = {
        _key?: string;
        title: string;
        file: { asset: { _ref: string } };
      };

      const contractReferences = contracts.map((contract: ContractInput) => ({
        _key: contract._key || uuidv4(),
        _type: 'contract',
        title: contract.title,
        file: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: contract.file.asset._ref,
          },
        },
      }));
      patch.set({ contracts: contractReferences });
    } else {
      patch.unset(['contracts']);
    }
    
    const updatedClient = await patch.commit();
    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ message: 'Error updating client', error }, { status: 500 });
  }
}