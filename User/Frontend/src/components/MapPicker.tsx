import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9oYXJ0MjU0NiIsImEiOiJjbWVmZ3YzMGcwcTByMm1zOWRkdjJkNTd0In0.DBDjy1rBDmc8A4PN3haQ4A';

type Coordinate = { lng: number; lat: number };

interface MapPickerProps {
  value: Coordinate[];
  onChange: (v: Coordinate[]) => void;
  height?: number;
  center?: [number, number];
}

const MapPicker: React.FC<MapPickerProps> = ({ 
  value, 
  onChange, 
  height = 300, 
  center = [100.5018, 13.7563] 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const currentValueRef = useRef<Coordinate[]>([]);

  // Keep refs updated
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Set token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Create map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: 12,
      doubleClickZoom: false,
    });

    mapRef.current.on('load', () => {
      if (!mapRef.current) return;

      // Add sources
      mapRef.current.addSource('markers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      mapRef.current.addSource('polygon', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Add layers
      mapRef.current.addLayer({
        id: 'markers',
        type: 'circle',
        source: 'markers',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ff4444',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });

      mapRef.current.addLayer({
        id: 'marker-labels',
        type: 'symbol',
        source: 'markers',
        layout: {
          'text-field': ['get', 'sequence'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      });

      mapRef.current.addLayer({
        id: 'polygon-fill',
        type: 'fill',
        source: 'polygon',
        paint: {
          'fill-color': '#ff4444',
          'fill-opacity': 0.3,
        },
      });

      mapRef.current.addLayer({
        id: 'polygon-outline',
        type: 'line',
        source: 'polygon',
        paint: {
          'line-color': '#ff0000',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      // Add click handler directly in map load
      mapRef.current.on('click', (e) => {
        // Prevent event bubbling
        e.preventDefault();
        
        if (!isDrawingRef.current) return;

        const newCoordinate = { lng: e.lngLat.lng, lat: e.lngLat.lat };
        const newCoordinates = [...currentValueRef.current, newCoordinate];
        onChange(newCoordinates);
      });
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update cursor based on drawing mode
  useEffect(() => {
    if (!mapRef.current) return;
    
    const canvas = mapRef.current.getCanvas();
    canvas.style.cursor = isDrawing ? 'crosshair' : '';
  }, [isDrawing]);

  // Update map data when coordinates change
  useEffect(() => {
    if (!mapRef.current) return;

    const markersSource = mapRef.current.getSource('markers') as mapboxgl.GeoJSONSource;
    const polygonSource = mapRef.current.getSource('polygon') as mapboxgl.GeoJSONSource;

    if (!markersSource || !polygonSource) return;

    // Update markers
    const markerFeatures = value.map((coord, index) => ({
      type: 'Feature' as const,
      properties: { sequence: index + 1 },
      geometry: { type: 'Point' as const, coordinates: [coord.lng, coord.lat] },
    }));

    markersSource.setData({
      type: 'FeatureCollection',
      features: markerFeatures,
    });

    // Update polygon
    let polygonFeatures: any[] = [];
    if (value.length >= 3) {
      const coordinates = [...value.map(c => [c.lng, c.lat]), [value[0].lng, value[0].lat]];
      polygonFeatures = [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      }];
    }

    polygonSource.setData({
      type: 'FeatureCollection',
      features: polygonFeatures,
    });
  }, [value]);

  // Event handlers
  const handleToggleDrawing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(!isDrawing);
  };

  const handleRemoveLastPoint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange([]);
    setIsDrawing(false);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height, 
          borderRadius: 16, 
          overflow: 'hidden',
        }} 
      />
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginTop: 12,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={handleToggleDrawing}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: 'none',
            background: isDrawing ? '#dc2626' : '#3b82f6',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {isDrawing ? '🛑 หยุดมาร์ค' : '🎯 เริ่มมาร์คที่ดิน'}
        </button>

        {value.length > 0 && (
          <>
            <button
              type="button"
              onClick={handleRemoveLastPoint}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                background: '#FBBF24',
                color: '#111827',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ↶ ยกเลิกจุดสุดท้าย
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                background: '#6B7280',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              🗑️ ลบทั้งหมด
            </button>
          </>
        )}

        <span style={{ 
          color: '#6B7280',
          fontSize: '14px',
          fontWeight: '500',
          marginLeft: '8px'
        }}>
          จุดที่เลือก: <strong style={{ color: '#1F2937' }}>{value.length}</strong>
        </span>
      </div>
      
      {/* Status Messages */}
      {isDrawing && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          color: '#1e40af',
          fontSize: '14px',
          fontWeight: '600',
          textAlign: 'center',
        }}>
          🎯 คลิกบนแผนที่เพื่อวางจุดมาร์ค - จุดที่ {value.length + 1}
        </div>
      )}

      {value.length >= 3 && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: 'rgba(5, 150, 105, 0.1)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          color: '#047857',
          fontSize: '12px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          ✅ พร้อมสร้างพื้นที่แล้ว ({value.length} จุด)
        </div>
      )}
    </div>
  );
};

export default MapPicker;