"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../../sanity/sanity-utils';
import Image from 'next/image';

// --- UPDATED INTERFACES ---
interface SanityAsset {
  _ref: string;
  _type: 'reference';
  url?: string; // This is what we'll get from asset->{url}
}

interface UserImage {
  _type: 'image';
  asset: SanityAsset; // The reference to the actual image file with url
}

interface User {
  _id: string;
  role: 'admin' | 'agent';
  firstname: string;
  lastname: string;
  contact?: number;
  email: string;
  user_img?: UserImage; // Changed to a single UserImage object
  created_at: string;
}
// --- END UPDATED INTERFACES ---


function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const query = `*[_type == "user"]{
          _id,
          role,
          firstname,
          lastname,
          contact,
          email,
          user_img { // Access the user_img field
            asset->{ // Follow the 'asset' reference
              url // Select the 'url' property from the asset
            }
          },
          created_at
        } | order(created_at desc)`; 

        const data: User[] = await client.fetch(query);
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Our Users</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {users.map((user) => (
          <div
            key={user._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px',
              textAlign: 'center',
              backgroundColor: user.role === 'admin' ? '#f0f8ff' : '#fff',
            }}
          >
            {user.user_img?.asset?.url ? ( // Check for the URL
              <Image
                src={user.user_img.asset.url}
                alt={`${user.firstname} ${user.lastname}`}
                width={120}
                height={120}
                className="rounded-full w-24 h-24 object-cover mb-4 border-4 overflow-hidden"
                style={{
                  borderColor: user.role === 'admin' ? '#ff9800' : '#4caf50'
                }}
              />
            ) : (
              <div className="w-32 h-32 mb-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No Image
              </div>
            )}
            <h2 style={{ fontSize: '1.4em', margin: '0 0 5px 0', color: '#333' }}>
              {user.firstname} {user.lastname}
            </h2>
            <p style={{ margin: '5px 0', color: '#007bff', fontWeight: 'bold' }}>
              Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
            <p style={{ margin: '3px 0', color: '#555' }}>
              Email: {user.email}
            </p>
            {user.contact && (
              <p style={{ margin: '3px 0', color: '#555' }}>
                Contact: {user.contact}
              </p>
            )}
            <p style={{ margin: '3px 0', fontSize: '0.85em', color: '#777' }}>
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;