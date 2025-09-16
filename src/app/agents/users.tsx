"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../../sanity/sanity-utils';
import Image from 'next/image';
import AddAgentModal from '../addForms/AddAgentModal';
import { PlusIcon } from '@heroicons/react/24/solid'; 
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


export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAddSuccess = (newUser: User) => {
    // Add the new user to the top of the list for instant UI feedback
    setUsers(prevUsers => [newUser, ...prevUsers]);
  };

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
    <>
      <div style={{ padding: '20px' }} className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Our Users</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((user) => (
            <div
              key={user._id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col items-center p-6 text-center"
              style={{ backgroundColor: user.role === 'admin' ? '#f0f8ff' : '#fff' }}
            >
              {user.user_img?.asset?.url ? (
                <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4" style={{ borderColor: user.role === 'admin' ? '#ff9800' : '#4caf50' }}>
                  <Image
                    src={user.user_img.asset.url}
                    alt={`${user.firstname} ${user.lastname}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 mb-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                {user.firstname} {user.lastname}
              </h2>
              <p className="font-bold mb-1" style={{ color: '#007bff' }}>
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <p className="text-gray-600 mb-1">
                {user.email}
              </p>
              {user.contact && (
                <p className="text-gray-600 mb-1">
                  Contact: {user.contact}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADD THE FLOATING BUTTON --- */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-110"
        aria-label="Add new agent"
      >
        <PlusIcon className="h-8 w-8" />
      </button>

      {/* --- RENDER THE MODAL --- */}
      <AddAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}