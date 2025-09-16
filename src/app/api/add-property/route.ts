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

export async function POST(request: Request) {
  try {
    const { address, price, square_footage, built_in, imageAssetIds, imageDataUrls, agentId, clientIds } = await request.json();

    if (!address || !price || !square_footage || !built_in) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newPropertyDocument: any = {
      _type: 'property',
      property_id: Date.now(),
      address,
      price: Number(price),
      square_footage: Number(square_footage),
      built_in,
      property_img: (imageAssetIds || []).map((assetId: string) => ({
        _key: uuidv4(),
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
      })),
    };

    if (agentId) {
      newPropertyDocument.agent = { _type: 'reference', _ref: agentId };
    }
    if (clientIds && clientIds.length > 0) {
      newPropertyDocument.clients = clientIds.map((id: string) => ({
        _key: uuidv4(),
        _type: 'reference',
        _ref: id,
      }));
    }

    // If the client sent data URLs for images, upload them server-side using the write token
    if ((!imageAssetIds || imageAssetIds.length === 0) && imageDataUrls && imageDataUrls.length > 0) {
      const uploadedIds: string[] = [];
      for (const dataUrl of imageDataUrls) {
        try {
          const commaIndex = dataUrl.indexOf(',');
          const base64Data = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
          const buffer = Buffer.from(base64Data, 'base64');
          const uploadResult = await sanityClient.assets.upload('image', buffer, {
            filename: `property-${Date.now()}.png`,
            contentType: 'image/png',
          } as { filename?: string; contentType?: string });
          uploadedIds.push(uploadResult._id);
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          uploadErr: any
        ) {
          console.error('Property image upload failed:', uploadErr);
          if (uploadErr && uploadErr.statusCode === 403) {
            return NextResponse.json({ message: 'Image upload failed: Insufficient permissions (403)' }, { status: 403 });
          }
          return NextResponse.json({ message: 'Image upload failed', error: String(uploadErr) }, { status: 500 });
        }
      }

      // append uploaded image refs to property_img
      newPropertyDocument.property_img = [
        ...(newPropertyDocument.property_img || []),
        ...uploadedIds.map(id => ({ _key: uuidv4(), _type: 'image', asset: { _type: 'reference', _ref: id } })),
      ];
    }

    const createdProperty = await sanityClient.create(newPropertyDocument);
    return NextResponse.json(createdProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ message: 'Error creating property', error }, { status: 500 });
  }
}