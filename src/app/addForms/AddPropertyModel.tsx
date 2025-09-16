import React, { useState, useEffect } from 'react';
import { client } from '../../../sanity/sanity-utils';
import Image from 'next/image';
import { XCircleIcon } from '@heroicons/react/24/solid';

// Import the centralized, shared Property type
import type { Property } from '../../../types'; // Adjust this path to your `types/index.ts` file

// These interfaces are for the data fetched for the dropdowns, which is fine to keep local.
interface Agent { _id: string; firstname: string; lastname: string; }
interface Client { _id: string; first_name: string; last_name: string; }

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrUpdatedProperty: unknown) => void;
  // Use the imported, consistent Property type for the prop
  propertyToEdit?: Property | null;
}

export default function AddPropertyModal({ isOpen, onClose, onSuccess, propertyToEdit }: AddPropertyModalProps) {
  // Form field states
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState(0);
  const [squareFootage, setSquareFootage] = useState(0);
  const [builtIn, setBuiltIn] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // State for dropdowns and multi-select
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!propertyToEdit;

  // Effect to pre-fill form when in edit mode or reset it for add mode
  useEffect(() => {
    if (isEditMode && propertyToEdit) {
      setAddress(propertyToEdit.address);
      setPrice(propertyToEdit.price);
      setSquareFootage(propertyToEdit.square_footage);
      setBuiltIn(new Date(propertyToEdit.built_in).toISOString().split('T')[0]);
      
      // THE FIX: Access the ._id property from the expanded object, not ._ref
      setSelectedAgentId(propertyToEdit.agent?._id || '');
      setSelectedClientIds(propertyToEdit.clients?.map(c => c._id) || []);
      
    } else {
      // Reset form when opening for "Add New"
      setAddress('');
      setPrice(0);
      setSquareFootage(0);
      setBuiltIn('');
      setSelectedAgentId('');
      setSelectedClientIds([]);
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  }, [propertyToEdit, isEditMode, isOpen]); // isOpen is key to trigger reset on "Add New"

  // Effect to fetch agents and clients when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const agentQuery = `*[_type == "user" && role == "agent"]{_id, firstname, lastname}`;
          const clientQuery = `*[_type == "client"]{_id, first_name, last_name}`;
          const [agents, clients] = await Promise.all([
            client.fetch<Agent[]>(agentQuery),
            client.fetch<Client[]>(clientQuery)
          ]);
          setAvailableAgents(agents);
          setAvailableClients(clients);
        } catch (err) {
          console.error("Failed to fetch data for modal:", err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Effect to clean up image preview object URLs to prevent memory leaks
  useEffect(() => {
    return () => { imagePreviews.forEach(url => URL.revokeObjectURL(url)); };
  }, [imagePreviews]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleClientSelectionChange = (clientId: string) => {
    setSelectedClientIds(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!address || !price || !squareFootage || !builtIn) {
      setError('Please fill out all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert selectedFiles to data URLs for server-side upload
      const imageDataUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const readFile = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => { reader.abort(); reject(new Error('Failed to read image file')); };
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        });
        for (const f of selectedFiles) {
          const dataUrl = await readFile(f);
          imageDataUrls.push(dataUrl);
        }
      }

      const propertyData = {
        address,
        price,
        square_footage: squareFootage,
        built_in: builtIn,
        agentId: selectedAgentId || null,
        clientIds: selectedClientIds,
        imageDataUrls, // server will upload
      };

      const endpoint = isEditMode ? `/api/edit-property` : '/api/add-property';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...propertyData, propertyId: isEditMode ? propertyToEdit?._id : undefined }),
      });

      if (!response.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} property.`);
      
      const result = await response.json();
      onSuccess(result);
      onClose();
    } catch (err: unknown) { 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message || String(err)); 
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Property' : 'Add New Property'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" id="price" value={price || ''} onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, '')))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">Square Footage</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" id="sqft" value={squareFootage || ''} onChange={(e) => setSquareFootage(Number(e.target.value.replace(/\D/g, '')))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
          </div>
          <div>
            <label htmlFor="builtIn" className="block text-sm font-medium text-gray-700">Built In (Date)</label>
            <input type="date" id="builtIn" value={builtIn} onChange={(e) => setBuiltIn(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label htmlFor="agent" className="block text-sm font-medium text-gray-700">Assign to Agent</label>
            <select id="agent" value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="">-- No Agent --</option>
              {availableAgents.map((agent) => (<option key={agent._id} value={agent._id}>{agent.firstname} {agent.lastname}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign to Client(s)</label>
            <div className="mt-2 border border-gray-300 rounded-md p-2 h-32 overflow-y-auto">
              {availableClients.length > 0 ? (availableClients.map((client) => (
                <div key={client._id} className="flex items-center">
                  <input id={`client-${client._id}`} type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" checked={selectedClientIds.includes(client._id)} onChange={() => handleClientSelectionChange(client._id)} />
                  <label htmlFor={`client-${client._id}`} className="ml-3 block text-sm text-gray-900">{client.first_name} {client.last_name}</label>
                </div>
              ))) : (<p className="text-sm text-gray-500">No clients available.</p>)}
            </div>
          </div>
          {!isEditMode && (
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">Property Images</label>
              <input type="file" id="images" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" multiple accept="image/*" />
            </div>
          )}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {imagePreviews.map((previewUrl, index) => (
                <div key={index} className="relative">
                  <Image src={previewUrl} alt={`Preview ${index + 1}`} width={100} height={100} className="w-full h-24 object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-red-500 hover:text-red-700" aria-label="Remove image">
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}