import React, { useState } from 'react';
import type { SanityImageAssetDocument } from 'next-sanity';
import { client } from '../../../sanity/sanity-utils';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClient: any) => void;
}

export default function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  // State for each form field
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState<number | undefined>();
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!firstName || !lastName || !email || !address) {
      setError('All fields except image and contact are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      let imageAsset: SanityImageAssetDocument | undefined = undefined;
      if (image) {
        // Upload the image asset to Sanity
        imageAsset = await client.assets.upload('image', image);
      }

      // Prepare the payload for our API route
      const clientData = {
        first_name: firstName,
        last_name: lastName,
        email,
        contact,
        address,
        imageAssetId: imageAsset?._id, // Send only the ID
      };

      // Send the data to our secure backend endpoint
      const response = await fetch('/api/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create client.');
      }

      const newClient = await response.json();
      onSuccess(newClient); // Update the UI on the parent page
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Add New Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
          </div>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
          <input type="text" inputMode="numeric" placeholder="Contact (Optional)" value={contact || ''} onChange={(e) => setContact(Number(e.target.value.replace(/\D/g, '')))} className="w-full border border-gray-300 rounded-md p-2" />
          <div>
            <label htmlFor="client-image" className="block text-sm font-medium text-gray-700">Client Image (Optional)</label>
            <input type="file" id="client-image" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold" accept="image/*" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}