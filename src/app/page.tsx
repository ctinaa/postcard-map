'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { Postcard } from '@/types/postcard';
import PostcardMarquee from '@/components/PostcardMarquee';
import UploadModal from '@/components/UploadModal';

// Dynamically import the map component to avoid SSR issues with Leaflet
const PostcardMap = dynamic(() => import('@/components/PostcardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <p className="text-xl text-gray-700 font-semibold">Loading map...</p>
      </div>
    </div>
  ),
});

const LocationSearch = dynamic(() => import('@/components/LocationSearch'), {
  ssr: false,
  loading: () => <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>,
});

// Demo data for fallback
const demoPostcards: Postcard[] = [
  {
    id: '1',
    title: 'Beautiful Lisbon',
    image_url: 'https://via.placeholder.com/400x250?text=Lisbon',
    city: 'Lisbon',
    country: 'Portugal',
    latitude: 38.7223,
    longitude: -9.1393,
  },
  {
    id: '2',
    title: 'Tokyo Tower',
    image_url: 'https://via.placeholder.com/400x250?text=Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    id: '3',
    title: 'New York Skyline',
    image_url: 'https://via.placeholder.com/400x250?text=New+York',
    city: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
  },
];

interface LocationData {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  address: string;
}

export default function Home() {
  const [postcards, setPostcards] = useState<Postcard[]>(demoPostcards);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLocation, setInitialLocation] = useState<LocationData | undefined>(undefined);
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  useEffect(() => {
    fetchPostcards();
  }, []);

  async function fetchPostcards() {
    try {
      const { data, error } = await supabase
        .from('postcards')
        .select('id, title, image_url, city, country, latitude, longitude')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching postcards:', error);
        // Keep using demo data on error
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setPostcards(data);
      }
      // If no data, keep demo postcards
    } catch (error) {
      console.error('Error fetching postcards:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleMapClick = async (lat: number, lng: number) => {
    // Reverse geocode to get location details
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      const city = data.address?.city || data.address?.town || data.address?.village || null;
      const country = data.address?.country || null;
      
      setInitialLocation({
        latitude: lat,
        longitude: lng,
        city,
        country,
        address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      setInitialLocation({
        latitude: lat,
        longitude: lng,
        city: null,
        country: null,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
    }
    
    setIsModalOpen(true);
  };

  const handleAddPostcardClick = () => {
    setInitialLocation(undefined);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchPostcards(); // Refresh postcards after successful upload
  };

  const handleLocationSearch = (lat: number, lng: number, placeName: string) => {
    setFlyToLocation({ lat, lng, zoom: 13 });
    // Reset after a moment to allow re-selection of the same location
    setTimeout(() => setFlyToLocation(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Postcard Map</h1>
          <button
            onClick={handleAddPostcardClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Postcard
          </button>
        </div>
      </header>

      {/* Location Search Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <LocationSearch onLocationSelect={handleLocationSearch} />
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Search for a location to explore on the map, or click anywhere on the map to add a postcard
          </p>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-[600px] relative">
        <PostcardMap 
          postcards={postcards} 
          onMapClick={handleMapClick}
          flyToLocation={flyToLocation}
        />
      </div>

      {/* Postcard Marquee Section */}
      <div className="bg-white border-t border-gray-200">
        <PostcardMarquee postcards={postcards} />
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialLocation={initialLocation}
      />
    </div>
  );
}
