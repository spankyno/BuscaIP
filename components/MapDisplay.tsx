import React, { useEffect, useRef } from 'react';
import { GeoData } from '../types';

// Augment the global scope with the Leaflet type
declare global {
  interface Window {
    L: any;
  }
}

interface MapDisplayProps {
  geoData: GeoData | null;
  isLoading: boolean;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ geoData, isLoading }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize map
      const map = window.L.map(mapContainerRef.current).setView([20, 0], 2);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && geoData) {
      const { lat, lon, city, country } = geoData;
      const map = mapInstanceRef.current;

      // Delay map operations to ensure the container is visible and rendered.
      // This fixes issues where map tiles don't load correctly if the map
      // was initialized while its container was hidden.
      setTimeout(() => {
        map.invalidateSize();
        map.setView([lat, lon], 13);
        
        // Clear previous markers
        map.eachLayer((layer: any) => {
          if (layer instanceof window.L.Marker) {
            map.removeLayer(layer);
          }
        });

        window.L.marker([lat, lon]).addTo(map)
          .bindPopup(`<b>${city}, ${country}</b>`)
          .openPopup();
      }, 100);
    }
  }, [geoData]);

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 shadow-lg min-h-[300px] md:min-h-[400px] flex flex-col">
      <h2 className="text-xl font-semibold mb-3 text-teal-300">Geolocation Map</h2>
      <div className="w-full flex-grow rounded-lg relative" style={{ minHeight: '350px' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-700 rounded-lg animate-pulse z-10 flex items-center justify-center">
            <p className="text-gray-400">Loading map data...</p>
          </div>
        )}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full rounded-lg z-0"
        ></div>
      </div>
    </div>
  );
};

export default MapDisplay;