// src/pages/Map/Map.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAllLocations, getLocationsByLandSalePostId } from '../../service/https/jo';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9oYXJ0MjU0NiIsImEiOiJjbWVmZ3YzMGcwcTByMm1zOWRkdjJkNTd0In0.DBDjy1rBDmc8A4PN3haQ4A';

const apiUrl = "http://localhost:8080";

interface Coordinate {
  lng: number;
  lat: number;
}

interface SaveStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface LocationInput {
  sequence: number;
  latitude: number;
  longitude: number;
  landsalepost_id: number;
}

interface Location {
  id?: number;
  latitude: number;
  longitude: number;
  sequence: number;
  landsalepost_id: number;
}

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygonId, setCurrentPolygonId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    loading: false,
    success: false,
    error: null
  });
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [currentLandSalePostId, setCurrentLandSalePostId] = useState<number>(1);
  const [allLocationsData, setAllLocationsData] = useState<Location[]>([]);

  // Function to make authenticated API calls
  const makeApiCall = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type") || "Bearer";

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `${tokenType} ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${apiUrl}${url}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
        window.location.href = "/login";
      }
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // ถ้า parse JSON ไม่ได้ ใช้ error message เดิม
      }
      
      throw new Error(errorMessage);
    }

    return response;
  };

  // Handle map click with useCallback to ensure fresh state
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    console.log('Map clicked!', { isDrawing });

    if (isDrawing) {
      console.log('Adding point...');
      e.preventDefault();

      const newCoordinate: Coordinate = {
        lng: e.lngLat.lng,
        lat: e.lngLat.lat
      };

      console.log('New coordinate:', newCoordinate);

      setCoordinates(prev => {
        const updated = [...prev, newCoordinate];
        console.log('Updated coordinates:', updated);
        return updated;
      });
    }
  }, [isDrawing]);

  // 🔧 ปรับปรุงฟังก์ชันสำหรับดึงข้อมูลจาก database และแสดงผล
  // ปรับปรุงฟังก์ชันสำหรับดึงข้อมูลจาก database และแสดงผล
const loadLocationData = async (landSalePostId?: number) => {
  setLoadingData(true);
  setSaveStatus({ loading: false, success: false, error: null });
  
  try {
    console.log('Loading location data...');
    
    let locations: Location[] = [];
    
    if (landSalePostId) {
      // ดึงข้อมูลเฉพาะ land sale post id ที่กำหนด
      console.log(`Loading locations for land sale post id: ${landSalePostId}`);
      locations = await getLocationsByLandSalePostId(landSalePostId);
    } else {
      // ดึงข้อมูลทั้งหมด
      console.log('Loading all locations...');
      locations = await getAllLocations();
    }
    
    console.log('Raw locations from API:', locations);

    // เช็คว่าข้อมูลที่ได้มาเป็น array หรือมี error
    if (locations && Array.isArray(locations) && locations.length > 0) {
      // ปรับปรุง: รองรับทั้ง field names ตัวใหญ่และตัวเล็ก
      const sortedLocations = locations
        .filter(location => {
          // รองรับทั้ง field names แบบตัวใหญ่ (Sequence, Latitude, Longitude) 
          // และแบบตัวเล็ก (sequence, latitude, longitude)
          const seq = location.sequence !== undefined ? location.sequence : (location as any).Sequence;
          const lat = location.latitude !== undefined ? location.latitude : (location as any).Latitude;
          const lng = location.longitude !== undefined ? location.longitude : (location as any).Longitude;
          
          return seq !== undefined && lat !== undefined && lng !== undefined;
        })
        .sort((a, b) => {
          const seqA = a.sequence !== undefined ? a.sequence : (a as any).Sequence;
          const seqB = b.sequence !== undefined ? b.sequence : (b as any).Sequence;
          return seqA - seqB;
        });
      
      console.log('Sorted locations:', sortedLocations);

      // แปลงเป็น Coordinate format โดยรองรับทั้งสอง format
      const sortedCoordinates: Coordinate[] = sortedLocations.map((location) => {
        const lat = location.latitude !== undefined ? location.latitude : (location as any).Latitude;
        const lng = location.longitude !== undefined ? location.longitude : (location as any).Longitude;
        
        return {
          lat: lat,
          lng: lng,
        };
      });

      console.log('Converted coordinates:', sortedCoordinates);

      // อัพเดท state
      setCoordinates(sortedCoordinates);
      setAllLocationsData(sortedLocations);

      // ถ้ามีข้อมูลมากกว่า 2 จุด ให้สร้าง polygon อัตโนมัติ
      if (sortedCoordinates.length >= 3) {
        console.log('Creating polygon from loaded data...');
        // รอให้ map โหลดเสร็จก่อน
        setTimeout(() => {
          createPolygonFromCoordinates(sortedCoordinates);
        }, 500);
      } else if (sortedCoordinates.length > 0) {
        // ถ้ามีข้อมูลน้อยกว่า 3 จุด แค่แสดง markers
        setTimeout(() => {
          updateMarkersOnly(sortedCoordinates);
        }, 500);
      }

      // ถ้ามีข้อมูล ให้ zoom ไปยังพื้นที่นั้น
      if (map.current && sortedCoordinates.length > 0) {
        fitMapToBounds(sortedCoordinates);
      }

      console.log(`Loaded ${sortedCoordinates.length} points successfully`);
      
      setSaveStatus({
        loading: false,
        success: true,
        error: null
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, success: false }));
      }, 3000);

    } else if (locations && (locations as any).error) {
      // กรณีที่ API ส่ง error กลับมา
      console.log('API returned error:', (locations as any).error);
      setCoordinates([]);
      setAllLocationsData([]);
      setSaveStatus({
        loading: false,
        success: false,
        error: (locations as any).error
      });
    } else {
      console.log('No location data found');
      setCoordinates([]);
      setAllLocationsData([]);
      setSaveStatus({
        loading: false,
        success: false,
        error: null
      });
    }
  } catch (error) {
    console.error("Error loading location data:", error);
    setCoordinates([]);
    setAllLocationsData([]);
    setSaveStatus({
      loading: false,
      success: false,
      error: `ไม่สามารถดึงข้อมูลได้: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  } finally {
    setLoadingData(false);
  }
};
  // ฟังก์ชันสำหรับ update markers เฉพาะ (ไม่สร้าง polygon)
  const updateMarkersOnly = (coords: Coordinate[]) => {
    if (!map.current || !map.current.getSource('markers')) return;

    const features = coords.map((coord, index) => ({
      type: 'Feature' as const,
      properties: {
        id: index,
        description: `จุดที่ ${index + 1}`,
        sequence: index + 1
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [coord.lng, coord.lat]
      }
    }));

    const source = map.current.getSource('markers') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: features
      });
    }
  };

  // ฟังก์ชันสำหรับ fit map ให้เหมาะสมกับข้อมูลที่มี
  const fitMapToBounds = (coords: Coordinate[]) => {
    if (!map.current || coords.length === 0) return;

    if (coords.length === 1) {
      // ถ้ามี 1 จุด ให้ center ไปที่จุดนั้น
      map.current.flyTo({
        center: [coords[0].lng, coords[0].lat],
        zoom: 16
      });
    } else {
      // ถ้ามีหลายจุด ให้ fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach(coord => {
        bounds.extend([coord.lng, coord.lat]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 18
      });
    }
  };

  // 🔧 ปรับปรุง Create polygon function ให้มีแรเงาและสวยงามขึ้น
  const createPolygonFromCoordinates = (coords: Coordinate[]) => {
    if (!map.current || coords.length < 3) return;

    console.log('Creating polygon with coordinates:', coords);

    const polygonCoords = coords.map(coord => [coord.lng, coord.lat]);
    // เชื่อมจุดสุดท้ายกับจุดแรกเพื่อปิด polygon
    polygonCoords.push([coords[0].lng, coords[0].lat]);

    const polygonId = `polygon-${Date.now()}`;
    const area = calculateArea(coords);

    // สร้าง polygon feature with shadow effect
    const polygonFeature = {
      type: 'Feature' as const,
      properties: {
        id: polygonId,
        area: area,
        description: `พื้นที่ดิน ${coords.length} จุด`
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [polygonCoords]
      }
    };

    // สร้าง shadow polygon (เลื่อนตำแหน่งเล็กน้อย)
    const shadowOffset = 0.0001; // ปรับค่านี้ตามความต้องการ
    const shadowCoords = coords.map(coord => [coord.lng + shadowOffset, coord.lat - shadowOffset]);
    shadowCoords.push([coords[0].lng + shadowOffset, coords[0].lat - shadowOffset]);

    const shadowFeature = {
      type: 'Feature' as const,
      properties: {
        id: `${polygonId}-shadow`,
        type: 'shadow'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [shadowCoords]
      }
    };

    console.log('Polygon feature:', polygonFeature);
    console.log('Shadow feature:', shadowFeature);

    const polygonsSource = map.current.getSource('polygons') as mapboxgl.GeoJSONSource;
    const shadowSource = map.current.getSource('polygon-shadow') as mapboxgl.GeoJSONSource;
    
    if (polygonsSource && shadowSource) {
      // ล้างข้อมูลเก่าก่อน แล้วใส่ polygon ใหม่
      polygonsSource.setData({
        type: 'FeatureCollection',
        features: [polygonFeature]
      });

      // เพิ่ม shadow
      shadowSource.setData({
        type: 'FeatureCollection',
        features: [shadowFeature]
      });
      
      setCurrentPolygonId(polygonId);
      console.log(`Polygon created successfully. Area: ${area.toLocaleString()} ตร.ม.`);
    } else {
      console.error('Polygons or shadow source not found');
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadLocationData(currentLandSalePostId);
  }, [currentLandSalePostId]); // รีโหลดเมื่อ currentLandSalePostId เปลี่ยน

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (mapContainer.current) {
      console.log('Initializing map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [100.5018, 13.7563], // Default center (Bangkok)
        zoom: 10,
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');

        // Add source for markers
        map.current!.addSource('markers', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        // Add source for polygons
        map.current!.addSource('polygons', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        // Add source for polygon shadow
        map.current!.addSource('polygon-shadow', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        // Add shadow layer (render ก่อน polygon หลัก)
        map.current!.addLayer({
          id: 'polygon-shadow',
          type: 'fill',
          source: 'polygon-shadow',
          paint: {
            'fill-color': '#000000',
            'fill-opacity': 0.2
          }
        });

        // Add marker layer
        map.current!.addLayer({
          id: 'markers',
          type: 'circle',
          source: 'markers',
          paint: {
            'circle-radius': 8,
            'circle-color': '#ff4444',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add marker labels
        map.current!.addLayer({
          id: 'marker-labels',
          type: 'symbol',
          source: 'markers',
          layout: {
            'text-field': ['get', 'sequence'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 0],
            'text-anchor': 'center'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add polygon layers
        map.current!.addLayer({
          id: 'polygon-fill',
          type: 'fill',
          source: 'polygons',
          paint: {
            'fill-color': '#ff4444',
            'fill-opacity': 0.4
          }
        });

        map.current!.addLayer({
          id: 'polygon-outline',
          type: 'line',
          source: 'polygons',
          paint: {
            'line-color': '#ff0000',
            'line-width': 3,
            'line-dasharray': [2, 2] // เส้นประ
          }
        });

        console.log('Map layers added successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });
    }
  }, []);

  // Add/remove click handler when isDrawing changes
  useEffect(() => {
    if (!map.current) return;

    if (isDrawing) {
      console.log('Adding click handler');
      map.current.getCanvas().style.cursor = 'crosshair';
      map.current.on('click', handleMapClick);
    } else {
      console.log('Removing click handler');
      map.current.getCanvas().style.cursor = '';
      map.current.off('click', handleMapClick);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [isDrawing, handleMapClick]);

  // Update markers when coordinates change
  useEffect(() => {
    if (!map.current || !map.current.getSource('markers')) return;

    const features = coordinates.map((coord, index) => ({
      type: 'Feature' as const,
      properties: {
        id: index,
        description: `จุดที่ ${index + 1}`,
        sequence: index + 1
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [coord.lng, coord.lat]
      }
    }));

    const source = map.current.getSource('markers') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: features
      });
    }
  }, [coordinates]);

  // Calculate area
  const calculateArea = (coords: Coordinate[]): number => {
    if (coords.length < 3) return 0;

    let area = 0;
    const n = coords.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coords[i].lng * coords[j].lat;
      area -= coords[j].lng * coords[i].lat;
    }

    return Math.abs(area / 2) * 111319.9; // ประมาณค่าแปลงเป็นตารางเมตร
  };

  // บันทึกข้อมูลลง database
  // บันทึกข้อมูลลง database
// บันทึกข้อมูลลง database
const saveCoordinatesToDatabase = async () => {
  if (coordinates.length === 0) {
    alert('ไม่มีข้อมูลตำแหน่งให้บันทึก');
    return;
  }

  if (coordinates.length < 3) {
    alert('ต้องมีอย่างน้อย 3 จุดเพื่อสร้างพื้นที่');
    return;
  }

  setSaveStatus({ loading: true, success: false, error: null });

  try {
    const locations = coordinates.map((coord, index) => ({
      sequence: index + 1,
      latitude: coord.lat,
      longitude: coord.lng,
      landsalepost_id: currentLandSalePostId
    }));

    console.log('Sending locations data:', locations);

    const response = await makeApiCall('/location', {
      method: 'POST',
      body: JSON.stringify(locations)
    });

    if (!response.ok) {
      throw new Error(`Failed to save locations: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Save response:', responseData);

    setSaveStatus({
      loading: false,
      success: true,
      error: null
    });

    console.log('All coordinates saved successfully!');
    alert(`บันทึกตำแหน่ง ${coordinates.length} จุด สำเร็จ!`);

    // Clear จุดที่มาร์คไว้เพื่อให้พร้อมสำหรับการมาร์คครั้งใหม่
    setCoordinates([]);
    setIsDrawing(false); // หยุด drawing mode
    setCurrentPolygonId(null);
    
    // เคลียร์ markers บนแผนที่ที่เป็นจุดที่พึ่งมาร์ค (ยกเว้น polygon ที่บันทึกแล้ว)
    if (map.current) {
      const markersSource = map.current.getSource('markers') as mapboxgl.GeoJSONSource;
      if (markersSource) {
        markersSource.setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    }

    // โหลดข้อมูลกลับมาแสดงผลเป็น polygon จากฐานข้อมูล
    await loadLocationData(currentLandSalePostId);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, success: false }));
    }, 3000);

  } catch (error: any) {
    console.error('Error saving coordinates:', error);

    let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = error.message;
    }

    setSaveStatus({
      loading: false,
      success: false,
      error: errorMessage
    });

    alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
  }
};
  // Create polygon (สำหรับปุ่มสร้าง polygon แบบ manual)
  const createPolygon = () => {
    if (coordinates.length >= 3) {
      createPolygonFromCoordinates(coordinates);
    } else {
      alert('ต้องมีอย่างน้อย 3 จุดเพื่อสร้างพื้นที่');
    }
  };

  // Toggle drawing mode
  const toggleDrawing = () => {
    console.log('Toggling drawing mode from:', isDrawing, 'to:', !isDrawing);
    setIsDrawing(!isDrawing);
    setSaveStatus({ loading: false, success: false, error: null });
  };

  // Clear all data
  const clearAll = () => {
    if (window.confirm('คุณต้องการลบข้อมูลทั้งหมดหรือไม่?')) {
      setCoordinates([]);
      setIsDrawing(false);
      setCurrentPolygonId(null);
      setSaveStatus({ loading: false, success: false, error: null });
      setAllLocationsData([]);

      if (map.current) {
        const markersSource = map.current.getSource('markers') as mapboxgl.GeoJSONSource;
        const polygonsSource = map.current.getSource('polygons') as mapboxgl.GeoJSONSource;
        const shadowSource = map.current.getSource('polygon-shadow') as mapboxgl.GeoJSONSource;

        if (markersSource) {
          markersSource.setData({
            type: 'FeatureCollection',
            features: []
          });
        }

        if (polygonsSource) {
          polygonsSource.setData({
            type: 'FeatureCollection',
            features: []
          });
        }

        if (shadowSource) {
          shadowSource.setData({
            type: 'FeatureCollection',
            features: []
          });
        }
      }

      console.log('All data cleared');
    }
  };

  // Undo last point
  const undoLastPoint = () => {
    if (coordinates.length > 0) {
      const newCoords = coordinates.slice(0, -1);
      setCoordinates(newCoords);
      console.log('Last point removed, remaining:', newCoords.length);
    }
  };

  // รีโหลดข้อมูลจาก database
  const reloadData = () => {
    loadLocationData(currentLandSalePostId);
  };

  // เปลี่ยน Land Sale Post ID
  // เปลี่ยน Land Sale Post ID
const changeLandSalePostId = () => {
  const newId = prompt('กรุณาใส่ Land Sale Post ID:', currentLandSalePostId.toString());
  if (newId && !isNaN(parseInt(newId))) {
    const parsedId = parseInt(newId);
    if (parsedId > 0) {
      // Clear ข้อมูลเก่าทั้งหมดก่อนเปลี่ยน ID
      setCoordinates([]);
      setIsDrawing(false);
      setCurrentPolygonId(null);
      setAllLocationsData([]);
      setSaveStatus({ loading: false, success: false, error: null });
      
      // Clear markers และ polygons บนแผนที่
      if (map.current) {
        const markersSource = map.current.getSource('markers') as mapboxgl.GeoJSONSource;
        const polygonsSource = map.current.getSource('polygons') as mapboxgl.GeoJSONSource;
        const shadowSource = map.current.getSource('polygon-shadow') as mapboxgl.GeoJSONSource;

        if (markersSource) {
          markersSource.setData({
            type: 'FeatureCollection',
            features: []
          });
        }

        if (polygonsSource) {
          polygonsSource.setData({
            type: 'FeatureCollection',
            features: []
          });
        }

        if (shadowSource) {
          shadowSource.setData({
            type: 'FeatureCollection',
            features: []
          });
        }
      }
      
      // เปลี่ยน ID (จะทำให้ useEffect โหลดข้อมูลใหม่อัตโนมัติ)
      setCurrentLandSalePostId(parsedId);
      
      console.log(`Changed to Land Sale Post ID: ${parsedId}, cleared all existing data`);
    } else {
      alert('กรุณาใส่เลขที่มากกว่า 0');
    }
  }
};

// เพิ่มฟังก์ชันสำหรับสร้าง Land Sale Post ID ใหม่อัตโนมัติ
const createNewLandSalePost = () => {
  if (window.confirm('คุณต้องการสร้าง Land Sale Post ใหม่หรือไม่? ข้อมูลปัจจุบันจะถูกล้าง')) {
    // สร้าง ID ใหม่จาก timestamp
    const newId = Math.floor(Date.now() / 1000); // ใช้ Unix timestamp
    
    // Clear ข้อมูลเก่าทั้งหมด
    setCoordinates([]);
    setIsDrawing(false);
    setCurrentPolygonId(null);
    setAllLocationsData([]);
    setSaveStatus({ loading: false, success: false, error: null });
    
    // Clear แผนที่
    if (map.current) {
      const markersSource = map.current.getSource('markers') as mapboxgl.GeoJSONSource;
      const polygonsSource = map.current.getSource('polygons') as mapboxgl.GeoJSONSource;
      const shadowSource = map.current.getSource('polygon-shadow') as mapboxgl.GeoJSONSource;

      if (markersSource) {
        markersSource.setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      if (polygonsSource) {
        polygonsSource.setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      if (shadowSource) {
        shadowSource.setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    }
    
    // ตั้ง ID ใหม่
    setCurrentLandSalePostId(newId);
    
    alert(`สร้าง Land Sale Post ID ใหม่: ${newId}`);
    console.log(`Created new Land Sale Post ID: ${newId}`);
  }
};

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Loading Overlay */}
      {loadingData && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🔄 กำลังโหลดข้อมูล...
        </div>
      )}

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        minWidth: '320px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🗺️ เครื่องมือมาร์คที่ดิน</h3>

        {/* Land Sale Post ID Control */}
        <div style={{
          marginBottom: '10px',
          padding: '8px',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>
            🏠 Land Sale Post ID: {currentLandSalePostId}
          </div>
          <button
            onClick={changeLandSalePostId}
            disabled={loadingData || saveStatus.loading}
            style={{
              width: '100%',
              padding: '5px 8px',
              backgroundColor: '#007cbf',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: (loadingData || saveStatus.loading) ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              opacity: (loadingData || saveStatus.loading) ? 0.6 : 1
            }}
          >
            🔄 เปลี่ยน ID
          </button>
        </div>

        {/* Reload Data Button */}
        <button
          onClick={reloadData}
          disabled={loadingData || saveStatus.loading}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loadingData || saveStatus.loading) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            marginBottom: '10px',
            opacity: (loadingData || saveStatus.loading) ? 0.6 : 1
          }}
        >
          🔄 รีโหลดข้อมูลจากฐานข้อมูล
        </button>

        {/* Status Display */}
        <div style={{
          marginBottom: '10px',
          padding: '8px',
          backgroundColor: isDrawing ? '#e7f3ff' : '#f8f9fa',
          borderRadius: '4px',
          border: `1px solid ${isDrawing ? '#b3d9ff' : '#dee2e6'}`
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            สถานะ: {isDrawing ? '🎯 กำลังมาร์ค' : '📋 พร้อมใช้งาน'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            จุดที่เลือก: {coordinates.length} จุด
          </div>
          {coordinates.length >= 3 && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              พื้นที่: {calculateArea(coordinates).toLocaleString()} ตร.ม.
            </div>
          )}
          {allLocationsData.length > 0 && (
            <div style={{ fontSize: '11px', color: '#28a745', marginTop: '2px' }}>
              ✅ โหลดข้อมูลจากฐานข้อมูล: {allLocationsData.length} จุด
            </div>
          )}
        </div>

        {/* Save Status Display */}
        {(saveStatus.loading || saveStatus.success || saveStatus.error) && (
          <div style={{
            marginBottom: '10px',
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: saveStatus.success ? '#d4edda' : saveStatus.error ? '#f8d7da' : '#e2e3e5',
            border: `1px solid ${saveStatus.success ? '#c3e6cb' : saveStatus.error ? '#f5c6cb' : '#d6d8db'}`,
            color: saveStatus.success ? '#155724' : saveStatus.error ? '#721c24' : '#383d41'
          }}>
            {saveStatus.loading && (
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                <span>⏳ กำลังบันทึก...</span>
              </div>
            )}
            {saveStatus.success && (
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                ✅ โหลดข้อมูลสำเร็จ!
              </div>
            )}
            {saveStatus.error && (
              <div style={{ fontSize: '12px' }}>
                ❌ {saveStatus.error}
              </div>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={toggleDrawing}
            disabled={saveStatus.loading || loadingData}
            style={{
              padding: '10px 15px',
              backgroundColor: isDrawing ? '#dc3545' : '#007cbf',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (saveStatus.loading || loadingData) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: (saveStatus.loading || loadingData) ? 0.7 : 1
            }}
          >
            {isDrawing ? '🛑 หยุดมาร์ค' : '🎯 เริ่มมาร์คที่ดิน'}
          </button>

          {coordinates.length > 0 && (
            <>
              <button
                onClick={undoLastPoint}
                disabled={!isDrawing || saveStatus.loading || loadingData}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (isDrawing && !saveStatus.loading && !loadingData) ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  opacity: (isDrawing && !saveStatus.loading && !loadingData) ? 1 : 0.6
                }}
              >
                ↶ ยกเลิกจุดสุดท้าย
              </button>

              <button
                onClick={saveCoordinatesToDatabase}
                disabled={saveStatus.loading || isDrawing || coordinates.length < 3 || loadingData}
                style={{
                  padding: '12px 15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!saveStatus.loading && !isDrawing && coordinates.length >= 3 && !loadingData) ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: (!saveStatus.loading && !isDrawing && coordinates.length >= 3 && !loadingData) ? 1 : 0.6
                }}
              >
                {saveStatus.loading ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูลลงฐานข้อมูล'}
              </button>
            </>
          )}

          {coordinates.length >= 3 && (
            <button
              onClick={createPolygon}
              disabled={saveStatus.loading || loadingData}
              style={{
                padding: '10px 15px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (saveStatus.loading || loadingData) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: (saveStatus.loading || loadingData) ? 0.7 : 1
              }}
            >
              ✏️ วาดพื้นที่ ({coordinates.length} จุด)
            </button>
          )}

          <button
            onClick={clearAll}
            disabled={saveStatus.loading || loadingData}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (saveStatus.loading || loadingData) ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              opacity: (saveStatus.loading || loadingData) ? 0.7 : 1
            }}
          >
            🗑️ ลบทั้งหมด
          </button>
        </div>

        {/* Instructions */}
        {isDrawing && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>💡 วิธีใช้:</div>
            <div>• คลิกบนแผนที่เพื่อวางจุดมาร์ค</div>
            <div>• ต้องมีอย่างน้อย 3 จุดเพื่อสร้างพื้นที่</div>
            <div>• กด "หยุดมาร์ค" เมื่อเสร็จสิ้น</div>
            <div>• กด "บันทึกข้อมูล" เพื่อส่งข้อมูลไปยังฐานข้อมูล</div>
          </div>
        )}

        {/* Database Info */}
        <div style={{
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#495057'
        }}>
          <div style={{ fontWeight: 'bold' }}>ข้อมูลการบันทึก:</div>
          <div>Land Sale Post ID: {currentLandSalePostId}</div>
          <div>จำนวนจุดที่จะบันทึก: {coordinates.length}</div>
          <div>สถานะ: {coordinates.length >= 3 ? '✅ พร้อมบันทึก' : `❌ ต้องการอีก ${3 - coordinates.length} จุด`}</div>
        </div>

        {/* Coordinates List */}
        {coordinates.length > 0 && (
          <div style={{
            marginTop: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
            fontSize: '11px',
            backgroundColor: '#f8f9fa',
            padding: '8px',
            borderRadius: '4px'
          }}>
            <strong>พิกัดที่เลือก:</strong>
            {coordinates.map((coord, index) => (
              <div key={index} style={{
                margin: '2px 0',
                fontFamily: 'monospace',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>จุดที่ {index + 1}:</span>
                <span>{coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawing Status Overlay */}
      {isDrawing && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 123, 191, 0.9)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: 999,
          pointerEvents: 'none'
        }}>
          🎯 คลิกบนแผนที่เพื่อวางจุดมาร์ค - จุดที่ {coordinates.length + 1}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default Map;