import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

/** Mapbox GL JS Config */
const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9oYXJ0MjU0NiIsImEiOiJjbWVmZ3YzMGcwcTByMm1zOWRkdjJkNTd0In0.DBDjy1rBDmc8A4PN3haQ4A';
mapboxgl.accessToken = MAPBOX_TOKEN;

type LocationPoint = {
  Sequence?: number;
  Latitude: number;
  Longitude: number;
};

interface FullMapViewProps {}

const FullMapView: React.FC<FullMapViewProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Get data from navigation state
  const { points, landName } = location.state as {
    points: LocationPoint[];
    landName: string;
  } || { points: [], landName: 'ที่ดิน' };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Transform points to coordinates
    const coordinates: [number, number][] = (points || [])
      .filter((p) => typeof p.Latitude === "number" && typeof p.Longitude === "number")
      .sort((a, b) => (a.Sequence ?? 0) - (b.Sequence ?? 0))
      .map((p) => [p.Longitude, p.Latitude]); // Mapbox uses [lng, lat]

    const center: [number, number] = coordinates[0] ?? [100.5018, 13.7563]; // fallback: Bangkok

    // Create map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: 16,
      doubleClickZoom: true,
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    mapRef.current.on('load', () => {
      if (!mapRef.current || !coordinates.length) return;

      // Add markers source
      mapRef.current.addSource('markers', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: coordinates.map((coord, idx) => ({
            type: 'Feature',
            properties: { sequence: (points[idx]?.Sequence ?? idx + 1).toString() },
            geometry: { type: 'Point', coordinates: coord },
          })),
        },
      });

      // Add polygon/line source
      if (coordinates.length >= 3) {
        // สำหรับ polygon ต้องมีอย่างน้อย 3 จุด และต้องปิดให้เป็นรูปหลายเหลี่ยม
        let polygonCoordinates = [...coordinates];
        
        // ตรวจสอบว่าจุดแรกและจุดสุดท้ายเหมือนกันหรือไม่ (ปิด polygon)
        const firstPoint = coordinates[0];
        const lastPoint = coordinates[coordinates.length - 1];
        const isClosed = firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1];
        
        // ถ้ายังไม่ปิด ให้ปิดให้เป็น polygon
        if (!isClosed) {
          polygonCoordinates = [...coordinates, firstPoint];
        }

        // เพิ่ม source สำหรับ polygon
        mapRef.current.addSource('boundary', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [polygonCoordinates],
            },
          },
        });

        // เพิ่ม layer สำหรับพื้นที่ polygon (สีแดงโปร่งแสง)
        mapRef.current.addLayer({
          id: 'polygon-fill',
          type: 'fill',
          source: 'boundary',
          paint: {
            'fill-color': '#DC2626', // สีแดง
            'fill-opacity': 0.3,
          },
        });

        // เพิ่ม layer สำหรับเส้นขอบ polygon
        mapRef.current.addLayer({
          id: 'boundary-line',
          type: 'line',
          source: 'boundary',
          paint: {
            'line-color': '#DC2626', // สีแดง
            'line-width': 4,
            'line-opacity': 0.9,
          },
        });
      } else if (coordinates.length === 2) {
        // ถ้ามีแค่ 2 จุด ให้วาดเป็นเส้นตรง
        mapRef.current.addSource('boundary', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
          },
        });

        mapRef.current.addLayer({
          id: 'boundary-line',
          type: 'line',
          source: 'boundary',
          paint: {
            'line-color': '#DC2626', // สีแดง
            'line-width': 4,
            'line-opacity': 0.9,
          },
        });
      }

      // Add marker layers
      mapRef.current.addLayer({
        id: 'markers',
        type: 'circle',
        source: 'markers',
        paint: {
          'circle-radius': 10,
          'circle-color': '#DC2626',
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
          'text-size': 14,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2,
        },
      });

      // Fit map to show all points with padding
      if (coordinates.length === 1) {
        mapRef.current.setCenter(coordinates[0]);
        mapRef.current.setZoom(18);
      } else if (coordinates.length > 1) {
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds()
        );
        mapRef.current.fitBounds(bounds, { padding: 100 });
      }

      // Add popups on marker click
      mapRef.current.on('click', 'markers', (e) => {
        if (!e.features?.[0]) return;
        
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        const sequence = e.features[0].properties?.sequence || '1';
        
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 12px; text-align: center;">
              <strong style="color: #DC2626;">จุดที่ ${sequence}</strong><br/>
              <small style="color: #6B7280;">
                ละติจูด: ${coordinates[1].toFixed(6)}<br/>
                ลองจิจูด: ${coordinates[0].toFixed(6)}
              </small>
            </div>
          `)
          .addTo(mapRef.current!);
      });

      // Change cursor on hover
      mapRef.current.on('mouseenter', 'markers', () => {
        if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer';
      });

      mapRef.current.on('mouseleave', 'markers', () => {
        if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
      });
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleFitToArea = () => {
    if (!mapRef.current || !points || points.length === 0) return;
    
    const coordinates: [number, number][] = points
      .filter((p) => typeof p.Latitude === "number" && typeof p.Longitude === "number")
      .map((p) => [p.Longitude, p.Latitude]);

    if (coordinates.length === 1) {
      mapRef.current.setCenter(coordinates[0]);
      mapRef.current.setZoom(18);
    } else if (coordinates.length > 1) {
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds()
      );
      mapRef.current.fitBounds(bounds, { padding: 100 });
    }
  };

  if (!points || points.length === 0) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#F9FAFB", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <h2 style={{ color: "#4B5563", marginBottom: 16 }}>ไม่มีข้อมูลตำแหน่งที่ดิน</h2>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#2563EB",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "0 auto"
            }}
          >
            ← ย้อนกลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Header */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        padding: "16px 24px",
        borderBottom: "1px solid #E5E7EB"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "0 auto"
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 20, 
              fontWeight: 700, 
              color: "#111827" 
            }}>
              {landName}
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: 14, 
              color: "#6B7280" 
            }}>
              แผนที่ขนาดใหญ่ • {points.length} จุด
            </p>
          </div>
          
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#DC2626",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            <X size={16} />
            ปิด
          </button>
        </div>
      </div>

      {/* Map */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: "100%", 
          height: "100%",
          marginTop: 0
        }} 
      />

      {/* Control Panel */}
      <div style={{
        position: "absolute",
        bottom: 24,
        left: 24,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 1000
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleZoomIn}
            style={{
              background: "#2563EB",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="ซูมเข้า"
          >
            <ZoomIn size={18} />
          </button>
          
          <button
            onClick={handleZoomOut}
            style={{
              background: "#6B7280",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="ซูมออก"
          >
            <ZoomOut size={18} />
          </button>
          
          <button
            onClick={handleFitToArea}
            style={{
              background: "#059669",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="ดู area เต็ม"
          >
            <Maximize2 size={18} />
          </button>
        </div>
        
        <div style={{ 
          marginTop: 8, 
          fontSize: 12, 
          color: "#6B7280", 
          textAlign: "center" 
        }}>
          พื้นที่สีแดง = ขอบเขตที่ดิน
        </div>
      </div>
    </div>
  );
};

export default FullMapView;