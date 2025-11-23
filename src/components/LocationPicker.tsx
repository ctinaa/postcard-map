'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    city: string | null;
    country: string | null;
    address: string;
  }) => void;
  initialCenter?: { lat: number; lng: number };
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

export default function LocationPicker({ onLocationSelect, initialCenter }: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState(initialCenter || defaultCenter);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });

      // Reverse geocode to get location details
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const addressComponents = results[0].address_components;
          let city = null;
          let country = null;

          for (const component of addressComponents) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          }

          onLocationSelect({
            latitude: lat,
            longitude: lng,
            city,
            country,
            address: results[0].formatted_address,
          });
        }
      });
    }
  }, [onLocationSelect]);

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setSearchBox(autocomplete);
  }, []);

  const onPlaceChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });

        let city = null;
        let country = null;

        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          }
        }

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          city,
          country,
          address: place.formatted_address || '',
        });
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarkerPosition({ lat, lng });
          setMapCenter({ lat, lng });

          // Reverse geocode
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const addressComponents = results[0].address_components;
              let city = null;
              let country = null;

              for (const component of addressComponents) {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
                if (component.types.includes('country')) {
                  country = component.long_name;
                }
              }

              onLocationSelect({
                latitude: lat,
                longitude: lng,
                city,
                country,
                address: results[0].formatted_address,
              });
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select manually.');
        }
      );
    }
  };

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading Google Maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} className="flex-1">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Autocomplete>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Location
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>
      </div>

      <p className="text-sm text-gray-600">
        💡 Click on the map or search for a location to set your postcard's location
      </p>
    </div>
  );
}

