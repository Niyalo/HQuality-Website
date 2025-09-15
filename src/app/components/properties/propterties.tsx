"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../../../sanity/sanity-utils';
import Image from 'next/image';

// Define proper TypeScript interfaces
// Sanity asset interface
interface SanityAsset {
  url?: string; // The URL of the asset (e.g., from cdn.sanity.io)
}

// Sanity file type interface (contains the asset reference)
interface PropertyFile {
  asset?: SanityAsset;
}

// Interface for a single image in the property_img array
interface PropertyImage {
  // Although your schema is just `type: 'image'`, Sanity's image type
  // by default includes fields like `_key`, `_type`, and a `hotspot` object,
  // but most importantly, it has an `asset` reference which we expand to `url`.
  // We're expecting `file` here because your GROQ query does `file{asset->{url}}`
  // If your GROQ was just `property_img[]{asset->{url}}`, then the property_img
  // items would directly contain `asset: { url: '...' }`.
  // Given your schema `of: [{ type: 'image' }]` and your query,
  // `property_img` will be an array of objects, where each object has a `file` property,
  // and `file` has an `asset` property, which has a `url`.
  file?: PropertyFile;
}

// Main Property interface
interface Property {
  _id: string;
  property_id: number;
  address: string;
  price: number;
  square_footage: number;
  built_in: string;
  property_img?: PropertyImage[]; // Array of image objects
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Your GROQ query is already correctly set up to fetch all fields
        // and expand the image asset URL.
        const query = `*[_type == "property"]{
          _id,
          property_id,
          address,
          price,
          square_footage,
          built_in,
          property_img[]{
            file{
              asset->{ 
                url
              }
            }
          }
        } | order(built_in desc)`; 
        const data = await client.fetch<Property[]>(query); // Type assertion for data
        setProperties(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err);
          console.error("Failed to fetch properties:", err.message);
        } else {
          setError(new Error("Unknown error occurred while fetching properties"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <p className="text-center text-lg mt-8">Loading properties...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">Error: {error.message}</p>;
  }

  if (properties.length === 0) {
    return <p className="text-center text-gray-600 mt-8">No properties found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Available Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <div
            key={property._id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col"
          >
            {/* Display first image */}
            {property.property_img && property.property_img.length > 0 && (
              // Safely access the first image object and its asset URL
              (() => {
                const firstImage = property.property_img[0];
                const imageUrl = firstImage.file?.asset?.url || '/images/default-property.png'; // Fallback to a default placeholder

                return (
                  <div className="relative w-full h-48"> {/* Added a container for the image */}
                    <Image
                      src={imageUrl}
                      alt={`Property at ${property.address}`}
                      layout="fill" // Use layout="fill" for responsive images
                      objectFit="cover" // Cover the area without distortion
                      className="border-b border-gray-200" // Apply class to the Image component
                    />
                  </div>
                );
              })()
            )}
            {/* Fallback if no image is available */}
            {(!property.property_img || property.property_img.length === 0) && (
              <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                 <p>No Image Available</p>
              </div>
            )}

            <div className="p-5 flex-grow">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                {property.address}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Price:</strong> ${property.price.toLocaleString()}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Size:</strong> {property.square_footage.toLocaleString()} sq ft
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Built In:</strong>{' '}
                {new Date(property.built_in).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Property ID: {property.property_id}
              </p>
              {/* Optional: Indicate more images */}
              {property.property_img && property.property_img.length > 1 && (
                <p className="text-sm text-gray-500 mt-2">
                  ({property.property_img.length - 1} more image(s))
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}