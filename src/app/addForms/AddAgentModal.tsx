import React, { useState, useEffect } from 'react';
import type { User } from '../../../types';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  userToEdit?: User | null;
}

export default function AddAgentModal({ isOpen, onClose, onSuccess, userToEdit }: AddAgentModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agentId, setAgentId] = useState<number | undefined>();
  const [contact, setContact] = useState<number | undefined>();
  const [role, setRole] = useState<'agent' | 'admin'>('agent');
  const [image, setImage] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && userToEdit) {
        setFirstName(userToEdit.first_name);
        setLastName(userToEdit.last_name);
        setEmail(userToEdit.email);
        setContact(userToEdit.contact);
        setRole(userToEdit.role);
        setAgentId(userToEdit.agent_id);
      } else {
        // Reset form for "Add" mode
        setFirstName(''); setLastName(''); setEmail(''); setContact(undefined);
        setRole('agent'); setAgentId(undefined);
      }
      setImage(null); setError(null);
    }
  }, [isOpen, isEditMode, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!firstName || !lastName || !email || (role === 'agent' && !agentId)) {
      setError('All fields, including Agent ID for agents, are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert image to data URL (base64) on the client and send metadata to server
      let imageBase64: string | undefined = undefined;
      let imageName: string | undefined = undefined;
      let imageType: string | undefined = undefined;
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const agentData: any = { firstname: firstName, lastname: lastName, email, contact, role, agent_id: agentId };
      if (imageBase64) {
        agentData.imageBase64 = imageBase64;
        agentData.imageName = imageName;
        agentData.imageType = imageType;
      }

      const response = await fetch(isEditMode ? '/api/edit-agent' : '/api/add-agent', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agentData, userId: isEditMode ? userToEdit?._id : undefined }),
      });

      if (!response.ok) throw new Error(await response.text());

      const result = await response.json();
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const inputBaseClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit User' : 'Add New Agent'}</h2>
        <form id="agentForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputBaseClass} />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className={inputBaseClass} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputBaseClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="text-sm font-medium">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as 'agent' | 'admin')} className={inputBaseClass}>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {role === 'agent' && (
              <div>
                <label className="text-sm font-medium">Agent ID</label>
                <input type="text" inputMode="numeric" value={agentId || ''} onChange={e => setAgentId(Number(e.target.value.replace(/\D/g, '')))} required={role === 'agent'} className={inputBaseClass} />
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Contact (Optional)</label>
            <input type="text" inputMode="numeric" value={contact || ''} onChange={e => setContact(Number(e.target.value.replace(/\D/g, '')))} className={inputBaseClass} />
          </div>
          <div>
            <label className="text-sm font-medium">Profile Image</label>
            <input type="file" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} accept="image/*" className="mt-1 block w-full text-sm"/>
          </div>
        </form>
        <div className="mt-8 flex justify-end items-center space-x-4 border-t pt-5">
          {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button type="submit" form="agentForm" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            {isSubmitting ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </div>
    </div>
  );
}