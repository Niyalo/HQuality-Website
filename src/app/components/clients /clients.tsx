"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../../../sanity/sanity-utils';
import Image from 'next/image';

// Define proper TypeScript interfaces
interface Client {
  _id: string;
  first_name: string;
  last_name: string;
  contact: number;
  email: string;
  address: string;
  user_img?: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const query = `*[_type == "client"]{
          _id,
          first_name,
          last_name,
          contact,
          email,
          "address": address.current, // Get the string value from the slug
          "user_img": user_img.asset->url // Get the image URL directly
        } | order(first_name asc)`; // Order by first name ascending
        
        const data = await client.fetch(query);
        setClients(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err);
          console.error("Failed to fetch clients:", err.message);
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
    return <p>Loading clients...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (clients.length === 0) {
    return <p>No clients found.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Our Clients</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {clients.map((clientItem) => ( // Renamed 'client' to 'clientItem' to avoid conflict with 'client' from sanity.js
          <div
            key={clientItem._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px',
            }}
          >
            {clientItem.user_img && (
              <Image
                src={clientItem.user_img}
                alt={`${clientItem.first_name} ${clientItem.last_name}`}
                width={150}
                height={150}
                className="rounded-full object-cover mb-4 border-4 border-primary"
              />
            )}
            <h2 style={{ fontSize: '1.5em', margin: '0 0 5px 0', color: '#333' }}>
              {clientItem.first_name} {clientItem.last_name}
            </h2>
            <p style={{ margin: '5px 0', color: '#555' }}>
              <strong>Email:</strong> {clientItem.email}
            </p>
            <p style={{ margin: '5px 0', color: '#555' }}>
              <strong>Contact:</strong> {clientItem.contact}
            </p>
            <p style={{ margin: '5px 0', color: '#555' }}>
              <strong>Address:</strong> {clientItem.address}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


