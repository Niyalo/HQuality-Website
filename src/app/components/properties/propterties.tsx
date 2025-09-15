"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../../../sanity/sanity-utils';
import Image from 'next/image';

// Define proper TypeScript interfaces
interface PropertyImage {
  url?: string;
  file?: {
    asset?: {
      url?: string;
    };
  };
}

interface Property {
  _id: string;
  property_id: number;
  address: string;
  price: number;
  square_footage: number;
  built_in: string;
  property_img?: PropertyImage[];
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const query = `*[_type == "property"]{
          _id,
          property_id,
          address,
          price,
          square_footage,
          built_in,
          property_img[]{
            url, // The manually entered URL
            file{
              asset->{ // If 'file' is a Sanity 'file' type, this gets its URL
                url
              }
            }
          }
        } | order(built_in desc)`; 
        const data = await client.fetch(query);
        setProperties(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err);
          console.error("Failed to fetch properties:", err.message);
        } else {
          setError(new Error("Unknown error"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);
  if (loading) {
    return <p>Loading properties...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (properties.length === 0) {
    return <p>No properties found.</p>;
  }


  return (
    <div style={{ padding: '20px' }}>
      <h1>Available Properties</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {properties.map((property) => (
          <div
            key={property._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Display first image, prioritizing 'url' then 'file.asset.url' */}
            {property.property_img && property.property_img.length > 0 && (
              <Image
                src={property.property_img[0].url || property.property_img[0].file?.asset?.url || ''}
                alt={`Property at ${property.address}`}
                width={300}
                height={200}
                className="w-full h-48 object-cover border-b border-gray-200"
              />
            )}
            <div style={{ padding: '15px' }}>
              <h2 style={{ fontSize: '1.5em', margin: '0 0 10px 0', color: '#333' }}>
                {property.address}
              </h2>
              <p style={{ margin: '5px 0' }}>
                <strong>Price:</strong> ${property.price.toLocaleString()}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Size:</strong> {property.square_footage.toLocaleString()} sq ft
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Built In:</strong>{' '}
                {new Date(property.built_in).toLocaleDateString()}
              </p>
              <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                ID: {property.property_id}
              </p>
              {/* You can add more image display logic if needed for a gallery/carousel */}
              {property.property_img && property.property_img.length > 1 && (
                <p style={{ fontSize: '0.8em', color: '#888' }}>
                  {property.property_img.length - 1} more image(s) available
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
