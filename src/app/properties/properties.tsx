"use client";
import React, { useEffect, useState, useMemo } from "react";
import { client } from '../../../sanity/sanity-utils';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { UserIcon, UsersIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'; // Outline icons for UI
import AddPropertyModal from "../addForms/AddPropertyModal";
import type { Property } from "../../../types";

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const query = `*[_type == "property"]{
          ...,
          property_img[]{ asset->{url} },
          agent->{ _id, first_name, last_name },
          clients[]->{ _id, first_name, last_name }
        } | order(_createdAt desc)`;
        const data = await client.fetch<Property[]>(query);
        setProperties(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err);
        else setError(new Error("Unknown error occurred"));
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Optimized filtering logic with useMemo
  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return properties.filter(p => {
      const addressMatch = (p.address?.toLowerCase() ?? '').includes(lowercasedTerm);
      const agentMatch = (p.agent ? `${p.agent.first_name} ${p.agent.last_name}`.toLowerCase() : '').includes(lowercasedTerm);
      const clientMatch = p.clients?.some(c => 
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(lowercasedTerm)
      );
      return addressMatch || agentMatch || clientMatch;
    });
  }, [properties, searchTerm]);

  const handleOpenEditModal = (property: Property) => { setEditingProperty(property); setIsModalOpen(true); };
  const handleOpenAddModal = () => { setEditingProperty(null); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingProperty(null); };
  
  const handleSuccess = (newOrUpdatedProperty: Property) => {
    // We need to re-fetch the full data to get expanded refs
    const reFetchData = async () => {
        const query = `*[_type == "property" && _id == "${newOrUpdatedProperty._id}"]{
            ..., property_img[]{ asset->{url} },
            agent->{ _id, first_name, last_name },
            clients[]->{ _id, first_name, last_name }
        }[0]`;
        const freshData = await client.fetch<Property>(query);
        if (editingProperty) {
            setProperties(prev => prev.map(p => p._id === freshData._id ? freshData : p));
        } else {
            setProperties(prev => [freshData, ...prev]);
        }
    }
    reFetchData();
  };

  const handleDelete = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch('/api/delete-property', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
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

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Available Properties</h1>
            <input
                type="text"
                placeholder="Search by address, agent, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto max-w-sm p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredProperties.map((property) => (
            <div key={property._id} className="group relative border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col">
              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => handleOpenEditModal(property)} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white" aria-label="Edit property">
                  <PencilIcon className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={() => handleDelete(property._id)} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white" aria-label="Delete property">
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
              
              {property.property_img && property.property_img.length > 0 ? (
                <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} className="w-full h-48">
                  {property.property_img.map((img, index) => (
                    img.asset?.url && (
                      <SwiperSlide key={index}>
                        <div className="relative w-full h-full">
                          <Image src={img.asset.url} alt={`Property at ${property.address}`} fill style={{ objectFit: "cover" }} sizes="30vw" />
                        </div>
                      </SwiperSlide>
                    )
                  ))}
                </Swiper>
              ) : (
                <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400"><p>No Image</p></div>
              )}
              
              <div className="p-4 flex-grow flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 truncate" title={property.address}>{property.address}</h2>
                <p className="text-2xl font-extrabold text-green-600 my-2">${property.price.toLocaleString()}</p>
                
                <div className="border-t border-gray-100 mt-2 pt-3 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400"/>
                        <span>{property.square_footage.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-gray-400"/>
                        <span className="truncate">{property.agent ? `${property.agent.first_name} ${property.agent.last_name}` : 'Unassigned Agent'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-gray-400"/>
                        <span className="truncate">{property.clients && property.clients.length > 0 ? property.clients.map(c => c.first_name + " " +c.last_name).join(', ') : 'No Clients'}</span>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-right">ID: {property.property_id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && !loading && (
             <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-gray-700">No Properties Found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search term.</p>
             </div>
        )}
      </div>

      <button onClick={handleOpenAddModal} className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-110" aria-label="Add new property">
        <PlusIcon className="h-8 w-8" />
      </button>

      <AddPropertyModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleSuccess} propertyToEdit={editingProperty} />
    </>
  );
}