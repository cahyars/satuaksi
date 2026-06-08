'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default function EarthquakeMap({ 
  earthquakes, 
  weatherCities,
  reports,
  selectedEq, 
  setSelectedEq, 
  selectedCity,
  setSelectedCity,
  selectedReport,
  setSelectedReport,
  mapTheme = 'admin',
  mode = 'earthquake' // 'earthquake' | 'weather' | 'overview'
}: any) {
  // Center roughly on Indonesia
  const centerPosition: [number, number] = [-2.5, 118.0];
  
  return (
    <div className="absolute inset-0 z-10 pointer-events-auto">
      <MapContainer 
        center={centerPosition} 
        zoom={5} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          opacity={0.9}
        />
        
        {/* MODE 1: EARTHQUAKES */}
        {mode === 'earthquake' && earthquakes && earthquakes.map((eq: any, idx: number) => {
          if (!eq.latitude || !eq.longitude) return null;
          
          const isSelected = selectedEq?.datetime === eq.datetime;
          
          let fillColor = '#a855f7'; // Purple default for admin
          let shadowClass = '';
          
          if (eq.dangerScore >= 80) {
            fillColor = '#ef4444'; // Red
            shadowClass = 'shadow-red-500/50';
          } else if (eq.dangerScore >= 50) {
            fillColor = '#f59e0b'; // Amber
            shadowClass = 'shadow-amber-500/50';
          } else if (mapTheme === 'warga') {
            fillColor = '#06b6d4'; // Cyan for warga minor
            shadowClass = 'shadow-cyan-500/50';
          }

          // Pulsing circle using standard Leaflet styling
          return (
            <CircleMarker
              key={`eq-${idx}`}
              center={[eq.latitude, eq.longitude]}
              radius={isSelected ? 10 : 6}
              pathOptions={{ 
                fillColor: fillColor, 
                fillOpacity: isSelected ? 1 : 0.7, 
                color: fillColor, 
                weight: isSelected ? 3 : 1 
              }}
              eventHandlers={{
                click: () => {
                  if (setSelectedEq) setSelectedEq(eq);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-xs font-mono font-bold text-slate-800">
                  M {eq.magnitude} - {eq.region.substring(0, 20)}...
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* MODE 2: WEATHER */}
        {mode === 'weather' && weatherCities && weatherCities.map((city: any, idx: number) => {
          if (!city.latitude || !city.longitude) return null;
          
          const isSelected = selectedCity?.name === city.name;
          
          let fillColor = '#10b981'; // Emerald for clear/sunny/cloudy (safe)
          
          if (city.dangerScore >= 80) {
            fillColor = '#ef4444'; // Red for thunderstorm/extreme heat
          } else if (city.dangerScore >= 50) {
            fillColor = '#f59e0b'; // Amber for heavy rain
          } else if (city.dangerScore >= 30) {
            fillColor = '#3b82f6'; // Blue for moderate rain/fog
          } else if (mapTheme === 'warga') {
            fillColor = '#06b6d4'; // Cyan default
          } else {
            fillColor = '#a855f7'; // Purple default for admin
          }

          return (
            <CircleMarker
              key={`weather-${idx}`}
              center={[city.latitude, city.longitude]}
              radius={isSelected ? 11 : 7}
              pathOptions={{ 
                fillColor: fillColor, 
                fillOpacity: isSelected ? 1 : 0.75, 
                color: fillColor, 
                weight: isSelected ? 3.5 : 1.5 
              }}
              eventHandlers={{
                click: () => {
                  if (setSelectedCity) setSelectedCity(city);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-xs font-mono font-bold flex flex-col p-1 space-y-0.5">
                  <span className="text-slate-800 font-extrabold">{city.name}</span>
                  <span className="text-cyan-600 font-black">{city.temperature}°C ({city.condition})</span>
                  <span className="text-[9px] text-slate-500 font-medium">Danger Factor: {city.dangerScore}%</span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* MODE 3: OVERVIEW SAFETY REPORTS & ACTIVE SOS */}
        {mode === 'overview' && reports && reports.map((rep: any, idx: number) => {
          if (!rep.latitude || !rep.longitude) return null;
          
          const isSelected = selectedReport?.id === rep.id;
          
          let fillColor = '#3b82f6'; // Blue for info/infra
          if (rep.isEmergency || rep.severity === 'CRITICAL' || rep.severity === 'HIGH') {
            fillColor = '#ef4444'; // Red for severe danger/SOS
          } else if (rep.severity === 'MEDIUM') {
            fillColor = '#f59e0b'; // Amber for medium severity
          }

          return (
            <CircleMarker
              key={`report-${idx}`}
              center={[rep.latitude, rep.longitude]}
              radius={isSelected ? 11 : 7}
              pathOptions={{ 
                fillColor: fillColor, 
                fillOpacity: isSelected ? 1 : 0.75, 
                color: fillColor, 
                weight: isSelected ? 3.5 : 1.5 
              }}
              eventHandlers={{
                click: () => {
                  if (setSelectedReport) setSelectedReport(rep);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-xs font-mono font-bold flex flex-col p-1 space-y-0.5">
                  <span className="text-red-600 font-extrabold flex items-center gap-1">
                    {rep.isEmergency ? '⚠️ SOS DARURAT' : `🚨 Lapor ${rep.category?.name || 'Bahaya'}`}
                  </span>
                  <span className="text-slate-800 font-bold line-clamp-1">{rep.title}</span>
                  <span className="text-[9px] text-slate-500 font-medium">{rep.address || 'Lokasi Terpetakan'}</span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

