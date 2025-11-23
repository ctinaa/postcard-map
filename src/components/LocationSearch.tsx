'use client';

import { useState, useCallback, useRef } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, placeName: string) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setSearchBox(autocomplete);
  }, []);

  const onPlaceChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const placeName = place.formatted_address || place.name || 'Selected location';
        
        onLocationSelect(lat, lng, placeName);
        
        // Clear the input
        if (searchInputRef.current) {
          searchInputRef.current.value = '';
        }
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get place name
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              onLocationSelect(lat, lng, results[0].formatted_address);
            } else {
              onLocationSelect(lat, lng, 'Your location');
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please search manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-800 text-sm">Error loading location search. Please check your Google Maps API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <div className="flex gap-2">
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} className="flex-1">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="🔍 Search for a location to explore..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
      </Autocomplete>
      <button
        type="button"
        onClick={getCurrentLocation}
        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2 font-medium"
        title="Use my current location"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="hidden sm:inline">My Location</span>
      </button>
    </div>
  );
}

