"use client"
import React, { useEffect, useState } from "react";
import { client } from '../../../sanity/sanity-utils';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import AddPropertyModal from "../addForms/AddPropertyModel";

// --- IMPORT THE CENTRALIZED TYPE ---
import type { Property } from "../../../types"; // Adjust path as needed

// --- REMOVE THE LOCAL INTERFACE DEFINITIONS ---
// interface ClientInfo { ... }
// interface Property { ... }

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const query = `*[_type == "property"]{
          ...,
          property_img[]{ asset->{url} },
          agent->{ _id, firstname, lastname },
          clients[]->{ _id, first_name, last_name }
        } | order(_createdAt desc)`;
        const data = await client.fetch<Property[]>(query);
        setProperties(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err);
        else setError(new Error("Unknown error occurred"));
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleOpenEditModal = (property: Property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
  };
  
  const handleSuccess = (newOrUpdatedProperty: Property) => {
    // The query for a single updated doc might not expand refs, so we merge
    if (editingProperty) {
      setProperties(prev => prev.map(p => p._id === newOrUpdatedProperty._id ? { ...p, ...newOrUpdatedProperty } : p));
    } else {
      setProperties(prev => [newOrUpdatedProperty, ...prev]);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch('/api/delete-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId }),
        });
        if (!response.ok) throw new Error('Failed to delete.');
        setProperties(prev => prev.filter(p => p._id !== propertyId));
      } catch (error) {
        console.error("Delete failed:", error);
        alert('Could not delete the property.');
      }
    }
  };

  if (loading) return <p className="text-center text-lg mt-8">Loading properties...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">Error: {error.message}</p>;
  if (properties.length === 0) return <p className="text-center text-gray-600 mt-8">No properties found.</p>;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Available Properties</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {properties.map((property) => (
            <div key={property._id} className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col">
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => handleOpenEditModal(property)} className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100" aria-label="Edit property">
                  <PencilIcon className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={() => handleDelete(property._id)} className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100" aria-label="Delete property">
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
              {/* ... Swiper and other JSX ... */}
              <div className="p-4 flex-grow flex flex-col">
                <h2 className="text-xl font-semibold mb-1 text-gray-800">{property.address}</h2>
                <p className="text-gray-700 text-sm mb-1"><strong>Price:</strong> ${property.price.toLocaleString()}</p>
                <p className="text-gray-700 text-sm mb-1"><strong>Size:</strong> {property.square_footage.toLocaleString()} sq ft</p>
                {property.agent && (
                  <p className="text-gray-700 text-sm mb-1"><strong>Agent:</strong> {property.agent.firstname} {property.agent.lastname}</p>
                )}
                {property.clients && property.clients.length > 0 && (
                  <p className="text-gray-700 text-sm mb-1">
                    <strong>Clients:</strong> {property.clients.map(c => `${c.first_name} ${c.last_name}`).join(', ')}
                  </p>
                )}
                <div className="mt-auto pt-2">
                  <p className="text-xs text-gray-500">Property ID: {property.property_id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleOpenAddModal} className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-110" aria-label="Add new property">
        <PlusIcon className="h-8 w-8" />
      </button>
      <AddPropertyModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleSuccess} propertyToEdit={editingProperty} />
    </>
  );
}