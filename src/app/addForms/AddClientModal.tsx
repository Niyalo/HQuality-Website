import React, { useState, useEffect } from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';

// Import your shared, centralized Client type
import type { Client } from '../../../types';

// This local interface is fine as it's only for fetching dropdown data
interface Agent { _id: string; firstname: string; lastname: string; }

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
  clientToEdit?: Client | null;
}

export default function AddClientModal({ isOpen, onClose, onSuccess, clientToEdit }: AddClientModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState<number | undefined>();
  const [image, setImage] = useState<File | null>(null);

  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const [existingContracts, setExistingContracts] = useState<Client['contracts']>([]);
  const [newContracts, setNewContracts] = useState<{ file: File; title: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!clientToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && clientToEdit) {
        setFirstName(clientToEdit.first_name);
        setLastName(clientToEdit.last_name);
        setEmail(clientToEdit.email);
        setAddress(clientToEdit.address);
        setContact(clientToEdit.contact);
        setSelectedAgentId(clientToEdit.agent?._id || '');
        setExistingContracts(clientToEdit.contracts || []);
      } else {
        setFirstName(''); setLastName(''); setEmail(''); setAddress('');
        setContact(undefined); setSelectedAgentId(''); setExistingContracts([]);
      }
      setImage(null); setNewContracts([]);

      const fetchAgents = async () => {
        try {
          const res = await fetch(`/api/fetch-agents`);
          if (!res.ok) return;
          const data = await res.json();
          setAvailableAgents(data || []);
        } catch (err) {
          // ignore
          console.error('Failed to fetch agents for client modal', err);
        }
      };
      fetchAgents();
    }
  }, [isOpen, isEditMode, clientToEdit]);

  if (!isOpen) return null;

  const handleAddNewContract = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const title = prompt('Enter a title or description for this file:', file.name);
      if (title) {
        setNewContracts(prev => [...prev, { file, title }]);
      }
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!firstName || !lastName || !email || !address) {
      setError('First Name, Last Name, Email, and Address are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert image to base64 (client-side) so server can upload with write token
      let imageBase64: string | undefined;
      let imageName: string | undefined;
      let imageType: string | undefined;
      if (image) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => { reader.abort(); reject(new Error('Failed to read image file')); };
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(image);
        });
        imageName = image.name;
        imageType = image.type;
      }

      // Convert newContracts files to base64
      const contractsPayload: { title: string; fileBase64: string; fileName: string; fileType: string }[] = [];
      if (newContracts.length > 0) {
        for (const c of newContracts) {
          const fileBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => { reader.abort(); reject(new Error('Failed to read contract file')); };
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(c.file);
          });
          contractsPayload.push({ title: c.title, fileBase64, fileName: c.file.name, fileType: c.file.type });
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clientData: any = {
        first_name: firstName,
        last_name: lastName,
        email,
        contact,
        address,
        agentId: selectedAgentId || null,
        imageBase64,
        imageName,
        imageType,
        newContracts: contractsPayload,
      };

      const response = await fetch(isEditMode ? '/api/edit-client' : '/api/add-client', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientData, clientId: isEditMode ? clientToEdit?._id : undefined }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to create client.');
      }

      const result = await response.json();
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // A reusable class for all input fields for a consistent look
  const inputBaseClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200";

  // --- STYLING (CHANGED) ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      {/* The main modal panel with a white background */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex-shrink-0">{isEditMode ? 'Edit Client' : 'Add New Client'}</h2>
        
        <form id="clientForm" onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-4 -mr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputBaseClass} />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className={inputBaseClass} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputBaseClass} />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} required className={inputBaseClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact (Optional)</label>
                <input id="contact" type="text" inputMode="numeric" value={contact || ''} onChange={e => setContact(Number(e.target.value.replace(/\D/g, '')))} className={inputBaseClass} />
              </div>
              <div>
                <label htmlFor="agent" className="block text-sm font-medium text-gray-700 mb-1">Assign an Agent</label>
                <select id="agent" value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)} className={inputBaseClass}>
                    <option value="">-- Unassigned --</option>
                    {availableAgents.map(a => <option key={a._id} value={a._id}>{a.firstname} {a.lastname}</option>)}
                </select>
              </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <input type="file" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Contracts</label>
                <div className="mt-1 border rounded-md p-3 space-y-2 bg-gray-50">
                  {(existingContracts || []).length === 0 && newContracts.length === 0 && (
                     <p className="text-sm text-gray-500 text-center py-2">No contracts uploaded.</p>
                  )}
                  {(existingContracts || []).map((c) => (
                    <div key={c._key} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                      <a href={c.file.asset.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate pr-2">{c.title}</a>
                      <button type="button" onClick={() => setExistingContracts(prev => prev?.filter(p => p._key !== c._key))}>
                        <XCircleIcon className="w-5 h-5 text-red-500 hover:text-red-700"/>
                      </button>
                    </div>
                  ))}
                  {newContracts.map((c, i) => (
                     <div key={i} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                        <span className="truncate pr-2">{c.title}</span>
                        <button type="button" onClick={() => setNewContracts(prev => prev.filter((p, idx) => idx !== i))}>
                           <XCircleIcon className="w-5 h-5 text-red-500 hover:text-red-700"/>
                        </button>
                     </div>
                  ))}
                  <label htmlFor="add-contract" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 w-full text-center block border-2 border-dashed border-gray-300 rounded-md p-3 mt-2 hover:bg-gray-100 transition-colors">
                    + Add New Contract
                  </label>
                  <input id="add-contract" type="file" onChange={handleAddNewContract} className="hidden"/>
                </div>
              </div>
            )}
        </form>

        <div className="flex-shrink-0 mt-8 flex justify-end items-center space-x-4 border-t pt-5">
            {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors">Cancel</button>
            <button type="submit" form="clientForm" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
        </div>
      </div>
    </div>
  );
}