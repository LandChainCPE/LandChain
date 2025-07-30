import React, { useEffect, useRef } from 'react';
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ⚠️ แก้ไขให้เป็น Token จริงของคุณ
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2lraGFyZXQiLCJhIjoiY21kNGo4dGh0MGZieDJrc2QwMGdhOHd6NyJ9.AVch2x7jFOIt3p9wq6hhwQ';

const MapComponent: React.FC = () => {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView([13.7563, 100.5018], 13);
    mapRef.current = map;

    L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`, {
      tileSize: 512,
      zoomOffset: -1,
      attribution:
        '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Handle map click
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
        .openPopup();
    });
  }, []);

  return (
    <div
      ref={mapContainerRef}
      id="map"
      style={{ height: '100vh', width: '100%' }}
    />
  );
};

export default MapComponent;
