"use client"
import React, { useEffect, useState } from "react";
import { client } from "../../../sanity/sanity-utils";
import Image from "next/image";

import AddClientModal from "../addForms/AddClientModal";
import { PlusIcon } from '@heroicons/react/24/solid';

interface SanityAsset {
  url?: string;
}

// How an image field is typically structured in Sanity when fetched with asset->{url}
interface ClientImage {
  _type: 'image'; // Sanity adds this
  asset?: SanityAsset;
}

// The main interface for your Client document
export interface Client {
  _id: string;        // Sanity's unique document ID
  _createdAt: string; // Sanity's creation timestamp
  _updatedAt: string; // Sanity's update timestamp
  _rev: string;       // Sanity's revision ID
  _type: 'client';    // The document type defined in your schema

  first_name: string;
  last_name: string;
  contact: number;
  email: string;

  // IMPORTANT: Assuming you've changed 'address' type to 'string' in your Sanity schema.
  // If you kept it as 'slug', it would be: address: { current: string; _type: 'slug' };
  address: string;

  user_img?: ClientImage; // Optional image field
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const query = `*[_type == "client"]{
          _id,
          first_name,
          last_name,
          contact,
          email,
          address,
          user_img{
            asset->{
              url
            }
          }
        } | order(first_name asc)`; // Order by first name for example
        
        const data = await client.fetch<Client[]>(query);
        setClients(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err);
          console.error("Failed to fetch clients:", err.message);
        } else {
          setError(new Error("Unknown error occurred while fetching clients"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddSuccess = (newClient: Client) => {
    // Add the new client to the top of the list for instant UI feedback
    setClients(prevClients => [newClient, ...prevClients]);
  };

  if (loading) {
    return <p className="text-center text-lg mt-8">Loading clients...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">Error: {error.message}</p>;
  }

  if (clients.length === 0) {
    return <p className="text-center text-gray-600 mt-8">No clients found.</p>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Our Clients</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clients.map((clientItem) => (
            <div
              key={clientItem._id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col items-center p-6"
            >
              <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-blue-200">
                <Image
                  src={clientItem.user_img?.asset?.url || '/images/default-avatar.png'}
                  alt={`${clientItem.first_name} ${clientItem.last_name}`}
                  fill // Use fill instead of layout="fill"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800 text-center">
                {clientItem.first_name} {clientItem.last_name}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Email:</strong> {clientItem.email}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Contact:</strong> {clientItem.contact}
              </p>
              <p className="text-gray-700 text-center">
                <strong>Address:</strong> {clientItem.address}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADD THE FLOATING BUTTON --- */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-110"
        aria-label="Add new client"
      >
        <PlusIcon className="h-8 w-8" />
      </button>

      {/* --- RENDER THE MODAL (it will only be visible when isOpen is true) --- */}
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}