import React, { useEffect, useMemo, useState, useRef } from "react";
import { MapPin, Phone, User, Home, Calendar, Ruler, Map, MessageCircle, Share2, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { GetAllPostLandData, CreateRequestBuySell } from "../../service/https/jib/jib";
import { message, Modal } from "antd"; 
import "leaflet/dist/leaflet.css";
//import L from "leaflet";
//import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from "react-leaflet";

/** Mapbox GL JS */
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';


type LandDetailType = {
  ID: number | string;
  Name?: string;
  Price?: number;
  PhoneNumber?: string;
  OwnerName?: string;
  Description?: string;
  LocationText?: string;
  PostedDate?: string;
  LandType?: string;
  Title?: string;
  Width?: string;
  Depth?: string;
  Features?: string[];
  Image?: string[]; // เปลี่ยนจาก string เป็น string[]
  Province?: { NameTH?: string };
  District?: { NameTH?: string };
  Subdistrict?: { NameTH?: string };
  Landtitle?: { Rai?: number; Ngan?: number; SquareWa?: number; TitleDeedNumber?: string };
  Location?: { Sequence: number; Latitude: number; Longitude: number }[];
};

/** ---------------- Utils ---------------- */
const thDate = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d as string;
  return dt.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
};

const areaText = (lt?: LandDetailType["Landtitle"]) => {
  if (!lt) return "";
  const rai = lt.Rai ?? 0;
  const ngan = lt.Ngan ?? 0;
  const sq = lt.SquareWa ?? 0;
  return `${rai} ไร่ ${ngan} งาน ${sq} ตร.วา`;
};

const calcPricePerRai = (price?: number, lt?: LandDetailType["Landtitle"]) => {
  if (!price || !lt) return null;
  const sqw = (lt.Rai ?? 0) * 400 + (lt.Ngan ?? 0) * 100 + (lt.SquareWa ?? 0);
  if (sqw <= 0) return null;
  const rai = sqw / 400;
  if (rai <= 0) return null;
  return Math.round(price / rai);
};

/** ---------------- Normalize Data ---------------- */
function normalizeDetail(item: any): LandDetailType {
  const provinceObj = item.province ?? item.Province ?? undefined;
  const districtObj = item.district ?? item.District ?? undefined;
  const subdistrictObj = item.subdistrict ?? item.Subdistrict ?? undefined;
  const landtitleObj = item.landtitle ?? item.Landtitle ?? undefined;
  const locationArr: any[] = item.location ?? item.Location ?? [];

     // ดึงรูปจาก Photoland (ถ้ามี)
  let images: string[] = [];
  if (Array.isArray(item.Photoland) && item.Photoland.length > 0) {
    images = item.Photoland.map((p: any) => p.Path).filter(Boolean);
  } else if (item.image ?? item.Image) {
    images = [item.image ?? item.Image];
  }


  const features: string[] = [];
  const tagOne = item.tag ?? item.Tag;
  if (tagOne?.Tag || tagOne?.name || tagOne?.Name || typeof tagOne === "string") {
    features.push(tagOne.Tag ?? tagOne.name ?? tagOne.Name ?? tagOne);
  }
  const tagsArr = item.tags ?? item.Tags;
  if (Array.isArray(tagsArr)) {
    tagsArr.forEach((t) => features.push((t?.Tag ?? t?.name ?? t?.Name ?? "").toString()));
  }

  // เจ้าของ
  const first = item.first_name ?? item.FirstName ?? "";
  const last = item.last_name ?? item.LastName ?? "";
  const owner = [first, last].filter(Boolean).join(" ").trim();

  const desc =
    item.description ??
    item.Description ??
    `ที่ดินใน${subdistrictObj?.name_th ?? subdistrictObj?.NameTH ?? ""} ${
      districtObj?.name_th ?? districtObj?.NameTH ?? ""
    } ${provinceObj?.name_th ?? provinceObj?.NameTH ?? ""}`.trim();

  return {
    ID: item.id ?? item.ID,
    Name: item.name ?? item.Name ?? "ที่ดิน",
    Price: Number(item.price ?? item.Price ?? 0),
    PhoneNumber: item.phone_number ?? item.PhoneNumber ?? "",
    OwnerName: owner || item?.Users?.name || item?.Users?.Name || "เจ้าของที่ดิน",
    Description: desc,
    LocationText: [
      subdistrictObj?.name_th ?? subdistrictObj?.NameTH,
      districtObj?.name_th ?? districtObj?.NameTH,
      provinceObj?.name_th ?? provinceObj?.NameTH,
    ]
      .filter(Boolean)
      .join(", "),
    PostedDate: thDate(item.created_at ?? item.CreatedAt ?? item.createdAt) || undefined,
    LandType: item.land_type ?? item.LandType ?? "ที่ดิน",
    Title: "โฉนดที่ดิน",
    Width: item.width ?? item.Width ?? undefined,
    Depth: item.depth ?? item.Depth ?? undefined,
    Features: features.filter(Boolean),
    Image: images, // ใช้รูปจาก entity landsalepost
    Province: provinceObj ? { NameTH: provinceObj.name_th ?? provinceObj.NameTH } : undefined,
    District: districtObj ? { NameTH: districtObj.name_th ?? districtObj.NameTH } : undefined,
    Subdistrict: subdistrictObj ? { NameTH: subdistrictObj.name_th ?? subdistrictObj.NameTH } : undefined,
    Landtitle: landtitleObj
      ? {
          Rai: landtitleObj.rai ?? landtitleObj.Rai,
          Ngan: landtitleObj.ngan ?? landtitleObj.Ngan,
          SquareWa: landtitleObj.square_wa ?? landtitleObj.SquareWa,
          TitleDeedNumber: landtitleObj.title_deed_number ?? landtitleObj.TitleDeedNumber,
        }
      : undefined,
    Location: Array.isArray(locationArr)
      ? locationArr
          .map((l) => ({
            Sequence: l.sequence ?? l.Sequence,
            Latitude: l.latitude ?? l.Latitude,
            Longitude: l.longitude ?? l.Longitude,
          }))
          .filter((l) => typeof l.Latitude === "number" && typeof l.Longitude === "number")
          .sort((a, b) => (a.Sequence ?? 0) - (b.Sequence ?? 0))
      : [],
  };
}

/** ---------------- Mapbox GL JS Config ---------------- */
const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9oYXJ0MjU0NiIsImEiOiJjbWVmZ3YzMGcwcTByMm1zOWRkdjJkNTd0In0.DBDjy1rBDmc8A4PN3haQ4A';

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapDisplay: React.FC<{ 
  points: { Sequence?: number; Latitude: number; Longitude: number }[]; 
  name?: string 
}> = ({ points, name }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();

  const handleMapClick = () => {
    if (!points || points.length === 0) return;
    
    const confirmed = window.confirm(
      `คุณกำลังจะเปิดแผนที่ขนาดใหญ่เพื่อดูตำแหน่งที่ดินต้องการดำเนินการต่อหรือไม่?`
    );
    
    if (confirmed) {
      navigate('/user/fullmapview', {
        state: {
          points: points,
          landName: name || 'ที่ดิน'
        }
      });
    }
  };

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
      zoom: 15,
      doubleClickZoom: false,
    });

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
              'line-width': 3,
              'line-opacity': 0.8,
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
              'line-width': 3,
              'line-opacity': 0.8,
            },
          });
        }

      // Add marker layers
      mapRef.current.addLayer({
        id: 'markers',
        type: 'circle',
        source: 'markers',
        paint: {
          'circle-radius': 8,
          'circle-color': '#2563EB',
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

      // Fit map to show all points
      if (coordinates.length === 1) {
        mapRef.current.setCenter(coordinates[0]);
        mapRef.current.setZoom(16);
      } else if (coordinates.length > 1) {
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds()
        );
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }

      // Add popups on marker click
      mapRef.current.on('click', 'markers', (e) => {
        if (!e.features?.[0]) return;
        
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        const sequence = e.features[0].properties?.sequence || '1';
        
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 8px;">
              <strong>จุดที่ ${sequence}</strong><br/>
              <small>${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}</small>
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
  }, [points, name]);

  if (!points || points.length === 0) {
    return (
      <div style={{ 
        width: "100%", 
        height: 300, 
        background: "#E5E7EB", 
        borderRadius: 12, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: "#6B7280" 
      }}>
        <div style={{ textAlign: "center" }}>
          <Map size={32} style={{ margin: "0 auto 8px" }} />
          <p>ไม่มีข้อมูลตำแหน่งที่ดิน</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div 
        ref={mapContainerRef} 
        onClick={handleMapClick}
        style={{ 
          width: "100%", 
          height: 300, 
          borderRadius: 12, 
          overflow: "hidden",
          cursor: "pointer",
          position: "relative"
        }} 
      />
      
      {/* Click overlay */}
      <div 
        onClick={handleMapClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          transition: "opacity 0.2s",
          cursor: "pointer",
          borderRadius: 12,
          pointerEvents: "auto"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0";
        }}
      >
        <div style={{
          background: "rgba(255,255,255,0.95)",
          padding: "12px 20px",
          borderRadius: 8,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 500,
          color: "#2563EB"
        }}>
          <Map size={20} />
          คลิกเพื่อดูแผนที่ขนาดใหญ่
        </div>
      </div>
    </div>
  );
};

/** ---------------- Component ---------------- */
const LandDetail = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [land, setLand] = useState<LandDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLarge, setIsLarge] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const [msgApi, contextHolder] = message.useMessage();
  const [confirmLoading, setConfirmLoading] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = Number(localStorage.getItem("user_id"));

  useEffect(() => {
    const onResize = () => setIsLarge(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // const one = await GetPostLandByID(Number(id));
        // setLand(normalizeDetail(one));
        const all = await GetAllPostLandData();
        const raw = (all || []).find((x: any) => String(x.id ?? x.ID) === String(id)) ?? null;
        if (!raw) {
          setLand(null);
        } else {
          setLand(normalizeDetail(raw));
        }
      } catch (e) {
        console.error("fetch detail error:", e);
        setLand(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

const handleBuy = async () => {
  if (!userId) {
    msgApi.error("กรุณาเข้าสู่ระบบก่อนทำรายการซื้อ");
    return;
  }
  try {
    const res = await CreateRequestBuySell({
      buyer_id: userId,
      land_id: land?.ID,
    });
    if (res?.error) {
      msgApi.error(res.error || "เกิดข้อผิดพลาด");
      return;
    }
    msgApi.success("ส่งคำขอซื้อสำเร็จ");
    // redirect หรืออัพเดต UI ต่อได้
  } catch (e) {
    msgApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
  }
};

  const showModal = () => setIsModalOpen(true);
  const handleOk = async () => {
    setConfirmLoading(true);
    await handleBuy();
    setConfirmLoading(false);
    setIsModalOpen(false);
  };
  const handleCancel = () => setIsModalOpen(false);

  const images = land?.Image ?? [];
  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % (images.length || 1));
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + (images.length || 1)) % (images.length || 1));

  const areaStr = useMemo(() => areaText(land?.Landtitle), [land]);
  const pricePerRai = useMemo(() => calcPricePerRai(land?.Price, land?.Landtitle), [land]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "9999px", border: "3px solid #2563EB", borderTopColor: "transparent", margin: "0 auto", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 16, color: "#4B5563" }}>กำลังโหลดรายละเอียด...</p>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
          <button style={{ color: "#2563EB", display: "flex", alignItems: "center", gap: 8 }} onClick={() => navigate("/user/sellpostmain")}>
            ← ย้อนกลับ
          </button>
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            ไม่พบข้อมูลประกาศที่ดินนี้
          </div>
        </div>
      </div>
    );
  }

  /** --------------- Styles --------------- */
  const styles = {
    page: { minHeight: "100vh", backgroundColor: "#F9FAFB" },
    header: { backgroundColor: "#FFFFFF", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" },
    container: { maxWidth: 1152, margin: "0 auto", padding: "16px" },
    headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between" as const },
    headerBtn: { color: "#2563EB", display: "flex", alignItems: "center", gap: 8 },
    iconBtn: (active = false) => ({
      padding: 8,
      borderRadius: 9999,
      backgroundColor: active ? "rgba(239,68,68,0.15)" : "#F3F4F6",
      color: active ? "#DC2626" : "#4B5563",
      border: "none",
      cursor: "pointer",
    }),
    body: { maxWidth: 1152, margin: "0 auto", padding: "24px 16px", display: "block" },
    card: { backgroundColor: "#FFFFFF", borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" },
    cardPad: { padding: 24 },
    imageWrap: { position: "relative" as const, width: "100%", height: 384, overflow: "hidden" as const, borderRadius: 12 },
    image: { width: "100%", height: "100%", objectFit: "cover" as const },
    imageOverlay: { position: "absolute" as const, inset: 0, backgroundColor: "rgba(0,0,0,0.2)" },
    navBtn: { position: "absolute" as const, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", borderRadius: 9999, padding: 8, border: "none", cursor: "pointer" },
    imgCounter: { position: "absolute" as const, right: 16, bottom: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "6px 10px", borderRadius: 9999, fontSize: 12 },
    thumbsRow: { display: "flex", gap: 8, padding: 16, overflowX: "auto" as const },
    thumb: (active = false) => ({ flexShrink: 0, width: 80, height: 64, borderRadius: 8, overflow: "hidden", border: `2px solid ${active ? "#3B82F6" : "#E5E7EB"}`, cursor: "pointer", padding: 0, background: "transparent" }),
    grid: { display: "grid", gridTemplateColumns: isLarge ? "2fr 1fr" : "1fr", gap: 24 },
    title: { fontWeight: 800, color: "#111827", marginBottom: 16, fontSize: 24 },
    locRow: { display: "flex", alignItems: "center", gap: 8, color: "#4B5563", marginBottom: 16 },
    priceRow: { display: "flex", flexDirection: "column" as const, gap: 8 },
    price: { fontSize: 28, fontWeight: 800, color: "#2563EB" },
    priceNote: { color: "#4B5563" },
    sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
    detailsGrid: { display: "grid", gridTemplateColumns: isLarge ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 24 },
    detailItem: { display: "flex", alignItems: "center", gap: 12 },
    dimGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#F9FAFB", padding: 16, borderRadius: 10 },
    dimCell: { textAlign: "center" as const },
    dimLabel: { fontSize: 12, color: "#6B7280" },
    dimValue: { fontSize: 18, fontWeight: 600 },
    featuresGrid: { display: "grid", gridTemplateColumns: isLarge ? "1fr 1fr" : "1fr", gap: 8 },
    featureRow: { display: "flex", alignItems: "center", gap: 8, color: "#374151" },
    desc: { color: "#374151", lineHeight: 1.8 },
    mapBox: { position: "relative" as const },
    fakeMap: { width: "100%", height: 256, background: "#E5E7EB", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", textAlign: "center" as const, padding: 12 },
    mapBtn: { position: "absolute" as const, top: 16, right: 16, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 12px", fontSize: 14, cursor: "pointer" },
    sticky: { position: isLarge ? ("sticky" as const) : ("static" as const), top: 24 },
    contactRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
    avatar: { width: 48, height: 48, borderRadius: 9999, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" },
    contactBtn: (variant: "call" | "msg" | "ghost") => {
      const base: React.CSSProperties = { width: "100%", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", border: "none" };
      if (variant === "call") return { ...base, background: "#16A34A", color: "#fff" };
      if (variant === "msg") return { ...base, background: "#2563EB", color: "#fff" };
      return { ...base, background: "#fff", color: "#374151", border: "1px solid #D1D5DB" };
    },
    warn: { marginTop: 16, background: "#FEF3C7", color: "#92400E", padding: 16, borderRadius: 10, fontSize: 14 },
    smallText: { fontSize: 12, color: "#6B7280" },
    smallTitle: { fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
    smallPrice: { fontSize: 14, fontWeight: 700, color: "#2563EB" },
  } as const;

  /** --------------- Render --------------- */
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px 16px 0 16px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            color: "#2563EB",
            fontSize: 16,
            cursor: "pointer",
            padding: 0,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>←</span> ย้อนกลับ
        </button>
      </div>
      
      {/* Body */}
      <div style={styles.body}>
        {/* Image Gallery */}
<div style={{ ...styles.card, overflow: "hidden" }}>
  {/* กรอบรูปหลัก */}
  <div style={styles.imageWrap}>
    <img
      src={images[currentImageIndex] || "/default-image.png"}
      alt={`รูปที่ดิน ${currentImageIndex + 1}`}
      style={styles.image}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/default-image.png";
      }}
    />
    <div style={styles.imageOverlay} />
    {images.length > 1 && (
      <>
        <button onClick={prevImage} style={{ ...styles.navBtn, left: 16 }}>←</button>
        <button onClick={nextImage} style={{ ...styles.navBtn, right: 16 }}>→</button>
      </>
    )}
    <div style={styles.imgCounter}>
      {Math.min(currentImageIndex + 1, images.length)} / {images.length || 1}
    </div>
  </div>
  {/* thumbnails แยกออกมาอยู่นอกกรอบรูปหลัก */}
  {images.length > 1 && (
    <div style={styles.thumbsRow}>
      {images.map((img, index) => (
        <button
          key={index}
          onClick={() => setCurrentImageIndex(index)}
          style={styles.thumb(index === currentImageIndex)}
        >
          <img
            src={img}
            alt={`ภาพย่อ ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-image.png";
            }}
          />
        </button>
      ))}
    </div>
  )}
</div>


        <div style={styles.grid}>
          {/* Main Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Title and Price */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h1 style={styles.title}>{land.Name}</h1>
              <div style={styles.locRow}>
                <MapPin style={{ width: 16, height: 16 }} />
                <span>{land.LocationText || "-"}</span>
              </div>
              <div style={styles.priceRow}>
                {typeof land.Price === "number" && <div style={styles.price}>{land.Price.toLocaleString()} ฿</div>}
              </div>
            </div>

            {/* Property Details */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h2 style={styles.sectionTitle}>รายละเอียดที่ดิน</h2>

              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <Ruler style={{ width: 20, height: 20, color: "#2563EB" }} />
                  <div>
                    <div style={styles.smallText}>ขนาด</div>
                    <div style={{ fontWeight: 500 }}>{areaStr || "-"}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Home style={{ width: 20, height: 20, color: "#2563EB" }} />
                  <div>
                    <div style={styles.smallText}>ประเภท</div>
                    <div style={{ fontWeight: 500 }}>{land.LandType}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Map style={{ width: 20, height: 20, color: "#2563EB" }} />
                  <div>
                    <div style={styles.smallText}>เอกสาร</div>
                    <div style={{ fontWeight: 500 }}>{land.Title}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Calendar style={{ width: 20, height: 20, color: "#2563EB" }} />
                  <div>
                    <div style={styles.smallText}>ลงประกาศ</div>
                    <div style={{ fontWeight: 500 }}>{land.PostedDate || "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {land.Features && land.Features.length > 0 && (
              <div style={{ ...styles.card, ...styles.cardPad }}>
                <h2 style={styles.sectionTitle}>จุดเด่น</h2>
                <div style={styles.featuresGrid}>
                  {land.Features.map((feature, idx) => (
                    <div key={idx} style={styles.featureRow}>
                      <div style={{ width: 8, height: 8, background: "#10B981", borderRadius: 9999 }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map (real) */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h2 style={styles.sectionTitle}>แผนที่</h2>
              <div style={{ padding: 10, backgroundColor: "#fff3cd", border: "1px solid #ffeeba", color: "#856404", borderRadius: 4 }}>
                แผนที่นี้มีไว้เพื่อประกอบการพิจารณา
              </div>
              <div style={styles.mapBox}>
                {land.Location && land.Location.length > 0 ? (
                  <MapDisplay points={land.Location} name={land.Name} />
                ) : (
                  <div style={styles.fakeMap}>
                    <div>
                      <MapPin style={{ width: 48, height: 48, margin: "0 auto 8px auto", display: "block" }} />
                      <div>ยังไม่มีจุดพิกัดสำหรับแผนที่</div>
                    </div>
                  </div>
                )}

                {/* ปุ่มเปิด Google Maps โดยใช้พิกัดจุดแรก */}
                <a
                  href={
                    land.Location && land.Location.length
                      ? `https://www.google.com/maps?q=${land.Location[0].Latitude},${land.Location[0].Longitude}`
                      : `https://www.google.com/maps`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.mapBtn}
                >
                  <Map style={{ width: 16, height: 16, marginRight: 8, verticalAlign: "text-bottom" }} />
                  ดูแผนที่ขนาดใหญ่
                </a>
              </div>
            </div>
          </div>

          {/* Contact Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ ...styles.card, ...styles.cardPad, ...styles.sticky }}>
              <h2 style={styles.sectionTitle}>ติดต่อเจ้าของ</h2>

              <div style={styles.contactRow}>
                <div style={styles.avatar}>
                  <User style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{land.OwnerName || "เจ้าของที่ดิน"}</div>
                  <div style={styles.smallText}>เจ้าของที่ดิน</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {land.PhoneNumber ? (
                  <a href={`tel:${land.PhoneNumber}`} style={styles.contactBtn("call") as React.CSSProperties}>
                    <Phone style={{ width: 20, height: 20 }} />
                    โทร {land.PhoneNumber}
                  </a>
                ) : (
                  <button style={styles.contactBtn("ghost")}>โทรศัพท์ไม่พบ</button>
                )}

                <button style={styles.contactBtn("msg")}>
                  <MessageCircle style={{ width: 20, height: 20 }} />
                  ส่งข้อความ
                </button>

      <button
        style={styles.contactBtn("ghost")}
        onClick={showModal}
        disabled={confirmLoading}
      >
        {confirmLoading ? "กำลังดำเนินการ..." : "ซื้อ"}
      </button>
      <Modal
        title="ยืนยันการซื้อที่ดิน"
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        คุณต้องการยืนยันการซื้อที่ดินนี้ใช่หรือไม่?
      </Modal>
              </div>

              <div style={styles.warn}>
                <strong>เตือน:</strong> ระวังการโอนเงินก่อนดูที่ดินจริง ควรตรวจสอบเอกสารสิทธิ์ก่อนการซื้อขาย
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandDetail;
