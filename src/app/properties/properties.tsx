"use client"
import React, { useEffect, useState } from "react";
import { client } from "../../../sanity/sanity-utils";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Interfaces
interface SanityAsset {
  url?: string;
}
interface PropertyImage {
  asset?: SanityAsset;
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
          property_img[]{ asset->{ url } }
        } | order(built_in desc)`;
        const data = await client.fetch<Property[]>(query);
        setProperties(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err);
        else setError(new Error("Unknown error occurred while fetching properties"));
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <p className="text-center text-lg mt-8">Loading properties...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">Error: {error.message}</p>;
  if (properties.length === 0) return <p className="text-center text-gray-600 mt-8">No properties found.</p>;

     return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Available Properties</h1>
      {/* --- MODIFIED: Reverted to grid, adjusted columns and gap --- */}
      {/* For small screens: 1 column, Medium screens: 2 columns, Large screens: 3 columns, Extra-large screens: 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> 
        {properties.map((property) => (
          <div
            key={property._id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col"
            // Removed max-w-md because grid controls width
          >
            {/* Slider for images */}
            {property.property_img && property.property_img.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="w-full h-64" // --- MODIFIED: Increased image height back to h-64 (or h-72 for even taller) ---
              >
                {property.property_img.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-full">
                      <Image
                        src={img.asset?.url || "/images/default-property.png"}
                        alt={`Property at ${property.address} - Image ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400"> {/* --- MODIFIED: Fallback height also h-64 --- */}
                <p>No Image Available</p>
              </div>
            )}

            <div className="p-5 flex-grow"> {/* --- MODIFIED: Padding back to p-5 --- */}
              <h2 className="text-2xl font-semibold mb-2 text-gray-800"> {/* --- MODIFIED: Font size back to text-2xl and mb-2 --- */}
                {property.address}
              </h2>
              <p className="text-gray-700 mb-1"> {/* --- MODIFIED: Font size back to default/larger, mb-1 --- */}
                <strong>Price:</strong> ${property.price.toLocaleString()}
              </p>
              <p className="text-gray-700 mb-1"> {/* --- MODIFIED: Font size back to default/larger, mb-1 --- */}
                <strong>Size:</strong> {property.square_footage.toLocaleString()} sq ft
              </p>
              <p className="text-gray-700 mb-1"> {/* --- MODIFIED: Font size back to default/larger, mb-1 --- */}
                <strong>Built In:</strong>{" "}
                {new Date(property.built_in).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-500 mt-3"> {/* --- MODIFIED: Font size back to text-sm, mt-3 --- */}
                Property ID: {property.property_id}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
