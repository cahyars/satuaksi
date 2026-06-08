'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

interface EmergencyMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

// Sub-component to center map dynamically when coordinates change
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16); // Close zoom for precise positioning
  }, [center]);
  return null;
}

// Sub-component to handle click events on the map
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function EmergencyMap({ latitude, longitude, onChange }: EmergencyMapProps) {
  const centerPosition: [number, number] = useMemo(() => [latitude, longitude], [latitude, longitude]);
  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChange(latLng.lat, latLng.lng);
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-10">
      <MapContainer
        center={centerPosition}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          opacity={0.95}
        />
        
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={centerPosition}
          ref={markerRef}
        />
        
        <RecenterMap center={centerPosition} />
        <MapClickHandler onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm border border-slate-200 rounded px-2 py-0.5 text-[8px] font-mono font-bold text-slate-600 shadow-sm pointer-events-none">
        Geser marker atau klik peta untuk koreksi presisi
      </div>
    </div>
  );
}
