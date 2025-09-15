"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../../../sanity/sanity-utils';
import Image from 'next/image';

// Define proper TypeScript interfaces
interface UserImage {
  url?: string;
  file?: {
    asset?: {
      url?: string;
    };
  };
}

interface User {
  _id: string;
  role: 'admin' | 'agent';
  firstname: string;
  lastname: string;
  contact?: number;
  email: string;
  user_img?: UserImage[];
  created_at: string;
}

function UserList() {
  // Explicitly type the state variables
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // GROQ query to fetch all documents of type 'user'
        // and select specific fields.
        // For 'user_img', we fetch the entire image object for urlFor helper.
        const query = `*[_type == "user"]{
          _id,
          role,
          firstname,
          lastname,
          contact,
          email,
          user_img, // Fetch the entire image object
          created_at
        } | order(created_at desc)`; // Order by most recently created

        const data: User[] = await client.fetch(query); // Cast the fetched data
        setUsers(data);
      } catch (err) {
        // Ensure err is treated as an Error object
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this effect runs once on component mount

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
              backgroundColor: user.role === 'admin' ? '#f0f8ff' : '#fff', // Differentiate roles visually
            }}
          >
            {user.user_img && user.user_img.length > 0 && (
              <Image
                src={user.user_img[0].url || user.user_img[0].file?.asset?.url || ''}
                alt={`${user.firstname} ${user.lastname}`}
                width={120}
                height={120}
                className="rounded-full object-cover mb-4 border-4"
                style={{
                  borderColor: user.role === 'admin' ? '#ff9800' : '#4caf50'
                }}
              />
            )}
            <h2 style={{ fontSize: '1.4em', margin: '0 0 5px 0', color: '#333' }}>
              {user.firstname} {user.lastname}
            </h2>
            <p style={{ margin: '5px 0', color: '#007bff', fontWeight: 'bold' }}>
              Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)} {/* Capitalize role */}
            </p>
            <p style={{ margin: '3px 0', color: '#555' }}>
              Email: {user.email}
            </p>
            {user.contact && ( // Only display contact if it exists
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