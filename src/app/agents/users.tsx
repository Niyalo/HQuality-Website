"use client";
import React, { useEffect, useState, useMemo } from "react";
import { client } from "../../../sanity/sanity-utils";
import Image from "next/image";
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import AddAgentModal from "../addForms/AddAgentModal"; 
import type { User } from "../../../types";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const query = `*[_type == "user"]{
          _id, first_name, last_name, contact, email, agent_id, role,
          user_img{ asset->{url} },
        } | order(role asc)`;
        
        const data = await client.fetch<User[]>(query);
        setUsers(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err); else setError(new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return users.filter(u =>
      (u.first_name?.toLowerCase() ?? '').includes(lowercasedTerm) ||
      (u.last_name?.toLowerCase() ?? '').includes(lowercasedTerm) ||
      (u.email?.toLowerCase() ?? '').includes(lowercasedTerm)
    );
  }, [users, searchTerm]);

  const handleOpenAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleOpenEditModal = (user: User) => { setEditingUser(user); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };

  const handleSuccess = (updatedUser: User) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    } else {
      setUsers(prev => [updatedUser, ...prev]);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch('/api/delete-agent', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        setUsers(prev => prev.filter(u => u._id !== userId));
      } catch (error) { alert('Could not delete user.'); }
    }
  };

  if (loading) return <p className="text-center text-lg mt-8">Loading users...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">Error: {error.message}</p>;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Users & Agents</h1>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto max-w-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="border rounded-xl shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col p-5">
              {/* Top Section: Avatar, Name, and Email */}
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: user.role === 'admin' ? '#F97316' : '#22C55E' }}>
                  <Image src={user.user_img?.asset?.url || '/images/default-avatar.png'} alt={user.first_name || 'User'} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className="">
                  <h2 className="font-semibold text-lg text-gray-800 truncate" title={`${user.first_name} ${user.last_name}`}>
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</p>
                </div>
              </div>
              
              {/* Separator */}
              <div className="border-t my-4"></div>
              
              {/* Details Section */}
              <div className="text-base space-y-2 text-gray-700 flex-grow">
                 <p><strong className="font-bold text-gray-800 w-24 inline-block">Role:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span></p>
                {user.role === 'agent' && <p><strong className="font-bold text-gray-800 w-24 inline-block">Agent ID:</strong> {user.agent_id || 'N/A'}</p>}
                <p><strong className="font-bold text-gray-800 w-24 inline-block">Contact:</strong> {user.contact || 'N/A'}</p>
              </div>

              {/* Actions Section */}
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => handleOpenEditModal(user)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" aria-label="Edit User">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => handleDelete(user._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" aria-label="Delete User">
                    <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredUsers.length === 0 && <p className="text-center text-gray-500 mt-8">No users found.</p>}
      </div>
      <button onClick={handleOpenAddModal} className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700" aria-label="Add new user">
        <PlusIcon className="h-8 w-8" />
      </button>
      <AddAgentModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleSuccess} userToEdit={editingUser} />
    </>
  );
}