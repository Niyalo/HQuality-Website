"use client";
import React, { useEffect, useState, useMemo } from "react";
import { client } from "../../../sanity/sanity-utils";
import Image from "next/image";
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import AddClientModal from "../addForms/AddClientModal";

import type { Client } from "../../../types"; 


export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const query = `*[_type == "client"]{
          _id, first_name, last_name, contact, email, address,
          user_img{ asset->{url} },
          agent->{ firstname, lastname },
          contracts[]{ _key, title, file{ asset->{_ref, url} } }
        } | order(first_name asc)`;
        
        const data = await client.fetch<Client[]>(query);
        setClients(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err);
        else setError(new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);
  
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const lowercasedTerm = searchTerm.toLowerCase();
    return clients.filter(c =>
      c.first_name.toLowerCase().includes(lowercasedTerm) ||
      c.last_name.toLowerCase().includes(lowercasedTerm) ||
      c.email.toLowerCase().includes(lowercasedTerm)
    );
  }, [clients, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSuccess = (updatedClient: Client) => {
    if (editingClient) {
      setClients(prev => prev.map(c => c._id === updatedClient._id ? updatedClient : c));
    } else {
      setClients(prev => [updatedClient, ...prev]);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await fetch('/api/delete-client', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        });
        setClients(prev => prev.filter(c => c._id !== clientId));
      } catch (error) { alert('Could not delete client.'); }
    }
  };

  if (loading) return <p className="text-center">Loading clients...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Our Clients</h1>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((clientItem) => (
            <div key={clientItem._id} className="border rounded-lg shadow hover:shadow-xl transition-shadow bg-white flex flex-col p-4">
              <div className="flex items-center mb-3">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 flex-shrink-0">
                  <Image src={clientItem.user_img?.asset?.url || '/images/default-avatar.png'} alt={`${clientItem.first_name}`} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className="ml-4 truncate">
                  <h2 className="font-semibold text-lg text-gray-800 truncate">{clientItem.first_name} {clientItem.last_name}</h2>
                  <p className="text-sm text-gray-600 truncate">{clientItem.email}</p>
                </div>
              </div>
              <div className="text-sm space-y-1 text-gray-700 border-t pt-3 mt-auto">
                <p><strong>Contact:</strong> {clientItem.contact || 'N/A'}</p>
                <p className="truncate"><strong>Address:</strong> {clientItem.address}</p>
                <p><strong>Agent:</strong> {clientItem.agent ? `${clientItem.agent.firstname} ${clientItem.agent.lastname}` : 'Unassigned'}</p>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button onClick={() => handleOpenEditModal(clientItem)} className="p-2 hover:bg-gray-100 rounded-full"><PencilIcon className="w-5 h-5 text-gray-600"/></button>
                <button onClick={() => handleDelete(clientItem._id)} className="p-2 hover:bg-gray-100 rounded-full"><TrashIcon className="w-5 h-5 text-red-500"/></button>
              </div>
            </div>
          ))}
        </div>
        {filteredClients.length === 0 && <p className="text-center text-gray-500 mt-8">No clients found.</p>}
      </div>
      <button onClick={handleOpenAddModal} className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700" aria-label="Add new client">
        <PlusIcon className="h-8 w-8" />
      </button>
      <AddClientModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleSuccess} clientToEdit={editingClient} />
    </>
  );
}