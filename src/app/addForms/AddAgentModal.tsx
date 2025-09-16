import React, { useState } from 'react';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: unknown) => void;
}

export default function AddAgentModal({ isOpen, onClose, onSuccess }: AddAgentModalProps) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState<number | undefined>();
  const [image, setImage] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!firstname || !lastname || !email) {
      setError('First Name, Last Name, and Email are required.');
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
  const agentData: any = { firstname, lastname, email, contact };
      if (imageBase64) {
        agentData.imageBase64 = imageBase64;
        agentData.imageName = imageName;
        agentData.imageType = imageType;
      }

      const response = await fetch('/api/add-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create agent.');
      }

      const newAgent = await response.json();
      onSuccess(newAgent);
      onClose();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Add New Agent</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
            <input type="text" placeholder="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
          </div>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required />
          <input type="text" inputMode="numeric" placeholder="Contact (Optional)" value={contact || ''} onChange={(e) => setContact(Number(e.target.value.replace(/\D/g, '')))} className="w-full border border-gray-300 rounded-md p-2" />
          <div>
            <label htmlFor="agent-image" className="block text-sm font-medium text-gray-700">Agent Image (Optional)</label>
            <input type="file" id="agent-image" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold" accept="image/*" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {isSubmitting ? 'Adding...' : 'Add Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}