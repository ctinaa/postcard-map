'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Postcard } from '@/types/postcard';

// Custom marker icon with better styling
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PostcardMapProps {
  postcards: Postcard[];
  onMarkerClick?: (postcard: Postcard) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  flyToLocation?: { lat: number; lng: number; zoom?: number } | null;
}

// Component to fit map bounds to markers
function MapBounds({ postcards }: { postcards: Postcard[] }) {
  const map = useMap();

  useEffect(() => {
    if (postcards.length > 0) {
      const validPostcards = postcards.filter(
        p => p.latitude !== null && p.longitude !== null
      );

      if (validPostcards.length > 0) {
        const bounds = L.latLngBounds(
          validPostcards.map(p => [p.latitude!, p.longitude!])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [postcards, map]);

  return null;
}

// Component to handle flying to a specific location
function FlyToLocation({ location }: { location: { lat: number; lng: number; zoom?: number } | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], location.zoom || 13, {
        duration: 2,
        easeLinearity: 0.5
      });
    }
  }, [location, map]);

  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const [clickPosition, setClickPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useMapEvents({
    click(e) {
      setClickPosition(e.latlng);
    },
  });

  useEffect(() => {
    const handlePopupClose = () => {
      setClickPosition(null);
    };

    map.on('popupclose', handlePopupClose);
    
    return () => {
      map.off('popupclose', handlePopupClose);
    };
  }, [map]);

  return clickPosition ? (
    <Popup position={clickPosition}>
      <div className="text-center p-2">
        <p className="text-sm text-gray-700 mb-3">Add a postcard at this location?</p>
        <button
          onClick={() => {
            onMapClick?.(clickPosition.lat, clickPosition.lng);
            setClickPosition(null);
          }}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          📸 Upload Postcard
        </button>
      </div>
    </Popup>
  ) : null;
}

export default function PostcardMap({ 
  postcards, 
  onMarkerClick,
  onMapClick,
  center = [20, 0],
  zoom = 2,
  flyToLocation
}: PostcardMapProps) {
  // Filter postcards with valid coordinates
  const validPostcards = postcards.filter(
    p => p.latitude !== null && p.longitude !== null
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="z-0 rounded-lg"
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      
      <MapBounds postcards={validPostcards} />
      <MapClickHandler onMapClick={onMapClick} />
      <FlyToLocation location={flyToLocation} />
      
      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        maxClusterRadius={50}
      >
        {validPostcards.map((postcard) => (
          <Marker
            key={postcard.id}
            position={[postcard.latitude!, postcard.longitude!]}
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick?.(postcard),
            }}
          >
            <Popup maxWidth={250} closeButton={true}>
              <div className="p-2">
                {postcard.image_url && (
                  <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                    <Image
                      src={postcard.image_url}
                      alt={postcard.title || postcard.city || 'Postcard'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-base">
                  {postcard.title || postcard.city || 'Untitled'}
                </h3>
                {postcard.city && postcard.country && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {postcard.city}, {postcard.country}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

