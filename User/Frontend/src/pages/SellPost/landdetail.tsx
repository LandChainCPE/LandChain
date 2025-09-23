import Loader from "../../component/third-patry/Loader";
import "../../component/third-patry/Loader.css";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { MapPin, Phone, User, Home, Calendar, Ruler, Map, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { GetAllPostLandData, CreateRequestBuySell } from "../../service/https/jib/jib";
import { Modal } from "antd"; 
import "leaflet/dist/leaflet.css";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CreateNewRoom } from "../../service/https/bam/bam";

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
  user_id?: number;
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
};//

/** ---------------- Normalize Data ---------------- */
function normalizeDetail(item: any): LandDetailType & { user_id?: number } {
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
  user_id: item.user_id ?? item.UserID ?? item.userId ?? item.userid, // รองรับทุกแบบ
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
  // const [msgApi] = message.useMessage();
  const [messageState, setMessageState] = useState<{ type: 'error' | 'success'; content: string } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = Number(localStorage.getItem("user_id"));

  // ฟังก์ชันสร้างห้องแชทใหม่
  const handleCreateRoom = async () => {
    if (!userId) {
      setMessageState({ type: 'error', content: "กรุณาเข้าสู่ระบบก่อนส่งข้อความ" });
      return;
    }
    if (!land?.user_id) {
      setMessageState({ type: 'error', content: "ไม่พบเจ้าของที่ดิน" });
      return;
    }
    if (userId === land.user_id) {
      setMessageState({ type: 'error', content: "ไม่สามารถส่งข้อความหาตัวเองได้" });
      return;
    }

    try {
      const res = await CreateNewRoom(userId, land.user_id);
      if (res?.room_id) {
        navigate(`/user/chat/${res.room_id}`);
      } else {
        setMessageState({ type: 'error', content: res?.error || res?.message || "เกิดข้อผิดพลาด" });
      }
    } catch (e) {
      setMessageState({ type: 'error', content: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    }
  };
  // Show message from state (to avoid calling in render)
  useEffect(() => {
    if (messageState) {
      alert(messageState.content);
      setMessageState(null);
    }
  }, [messageState]);

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
    setMessageState({ type: 'error', content: "กรุณาเข้าสู่ระบบก่อนทำรายการซื้อ" });
    return;
  }
  // DEBUG log ตรวจสอบค่าจริง
  console.log('userId:', userId, 'land.user_id:', land?.user_id, 'land:', land);
  // เช็คว่า userId เป็นเจ้าของโพสต์หรือไม่
  if (userId === land?.user_id) {
    setMessageState({ type: 'error', content: "ไม่สามารถซื้อโพสต์ของตัวเองได้" });
    return;
  }
  try {
    const res = await CreateRequestBuySell({
      buyer_id: userId,
      land_id: land?.ID,
    });
    if (res?.error) {
      setMessageState({ type: 'error', content: res.error || "เกิดข้อผิดพลาด" });
      return;
    }
    setMessageState({ type: 'success', content: "ส่งคำขอซื้อสำเร็จ" });
    // redirect หรืออัพเดต UI ต่อได้
  } catch (e) {
    setMessageState({ type: 'error', content: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
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
  //const pricePerRai = useMemo(() => calcPricePerRai(land?.Price, land?.Landtitle), [land]);

  if (loading) {
    return <Loader />;
  }

  if (!land) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
          <button style={{ color: "#0f511eff", display: "flex", alignItems: "center", gap: 8 }} onClick={() => navigate("/user/sellpostmain")}>
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
    page: { 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 100%)",
      position: "relative",
      overflow: "hidden"
    },
    header: { 
      backgroundColor: "rgba(255, 255, 255, 0.8)", 
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
    },
    container: { 
      maxWidth: 1152, 
      margin: "0 auto", 
      padding: "16px",
      position: "relative",
      zIndex: 1
    },
    headerRow: { 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between" as const,
      padding: "12px 24px",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    },
    headerBtn: { 
      color: "#2563EB", 
      display: "flex", 
      alignItems: "center", 
      gap: 8,
      transition: "all 0.3s ease"
    },
    iconBtn: (active = false) => ({
      padding: 8,
      borderRadius: 9999,
      backgroundColor: active ? "rgba(239,68,68,0.15)" : "#F3F4F6",
      color: active ? "#DC2626" : "#4B5563",
      border: "none",
      cursor: "pointer",
    }),
    body: { maxWidth: 1152, margin: "0 auto", padding: "24px 16px", display: "block" },
    card: { 
      backgroundColor: "rgba(255, 255, 255, 0.8)", 
      borderRadius: 16, 
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: "all 0.3s ease",
      transform: "translateY(0)"
    },
    cardPad: { 
      padding: 24,
      backdropFilter: "blur(10px)"
    },
    imageWrap: { 
      position: "relative" as const, 
      width: "100%", 
      height: 384, 
      overflow: "hidden" as const, 
      borderRadius: 16,
      boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)",
      transition: "all 0.3s ease",
      border: "1px solid rgba(255, 255, 255, 0.2)"
    },
    image: { 
      width: "100%", 
      height: "100%", 
      objectFit: "cover" as const,
      transition: "transform 0.3s ease"
    },
    imageOverlay: { position: "absolute" as const, inset: 0, backgroundColor: "rgba(0,0,0,0.2)" },
    navBtn: { position: "absolute" as const, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", borderRadius: 9999, padding: 8, border: "none", cursor: "pointer" },
    imgCounter: { position: "absolute" as const, right: 16, bottom: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "6px 10px", borderRadius: 9999, fontSize: 12 },
    thumbsRow: { display: "flex", gap: 8, padding: 16, overflowX: "auto" as const },
    thumb: (active = false) => ({ flexShrink: 0, width: 80, height: 64, borderRadius: 8, overflow: "hidden", border: `2px solid ${active ? "#3B82F6" : "#E5E7EB"}`, cursor: "pointer", padding: 0, background: "transparent" }),
    grid: { display: "grid", gridTemplateColumns: isLarge ? "2fr 1fr" : "1fr", gap: 24 },
    title: { 
      fontWeight: 800, 
      color: "#1E293B", 
      marginBottom: 16, 
      fontSize: 28,
      background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.02em"
    },
    locRow: { 
      display: "flex", 
      alignItems: "center", 
      gap: 8, 
      color: "#64748B", 
      marginBottom: 16,
      padding: "8px 12px",
      background: "rgba(241, 245, 249, 0.5)",
      borderRadius: "8px",
      backdropFilter: "blur(4px)"
    },
    priceRow: { 
      display: "flex", 
      flexDirection: "column" as const, 
      gap: 8,
      padding: "16px",
      background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      borderRadius: "12px",
      border: "1px solid rgba(37, 99, 235, 0.1)"
    },
    price: { 
      fontSize: 32, 
      fontWeight: 800, 
      background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: "0 2px 4px rgba(37, 99, 235, 0.1)"
    },
    priceNote: { 
      color: "#64748B",
      fontSize: "14px" 
    },
    sectionTitle: { 
      fontSize: 20, 
      fontWeight: 700, 
      marginBottom: 16,
      color: "#334155",
      position: "relative",
      paddingLeft: "12px"
    },
    detailsGrid: { 
      display: "grid", 
      gridTemplateColumns: isLarge ? "1fr 1fr" : "1fr", 
      gap: 16, 
      marginBottom: 24 
    },
    detailItem: { 
      display: "flex", 
      alignItems: "center", 
      gap: 12,
      padding: "16px",
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(8px)",
      cursor: "default",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        background: "rgba(255, 255, 255, 0.9)"
      }
    },
    dimGrid: { 
      display: "grid", 
      gridTemplateColumns: "1fr 1fr", 
      gap: 16, 
      background: "rgba(249, 250, 251, 0.8)", 
      padding: "20px",
      borderRadius: "12px",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      transition: "all 0.3s ease"
    },
    dimCell: { 
      textAlign: "center" as const,
      padding: "12px",
      background: "rgba(255, 255, 255, 0.5)",
      borderRadius: "8px",
      transition: "all 0.3s ease"
    },
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
      const base: React.CSSProperties = { 
        width: "100%", 
        borderRadius: 12, 
        padding: "14px 20px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: 8, 
        cursor: "pointer", 
        border: "none",
        fontWeight: 600,
        transition: "all 0.3s ease",
        transform: "translateY(0)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      };
      if (variant === "call") return { 
        ...base, 
        background: "linear-gradient(135deg, #059669 0%, #16A34A 100%)", 
        color: "#fff",
        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
      };
      if (variant === "msg") return { 
        ...base, 
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", 
        color: "#fff",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
      };
      return { 
        ...base, 
        background: "rgba(255, 255, 255, 0.8)", 
        color: "#374151", 
        border: "2px solid rgba(37, 99, 235, 0.2)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
      };
    },
    warn: { marginTop: 16, background: "#FEF3C7", color: "#92400E", padding: 16, borderRadius: 10, fontSize: 14 },
    smallText: { fontSize: 12, color: "#6B7280" },
    smallTitle: { fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
    smallPrice: { fontSize: 14, fontWeight: 700, color: "#2563EB" },
  } as const;

  /** --------------- Render --------------- */
  return (
    <div style={styles.page}>
      <div style={{ 
        background: "linear-gradient(135deg, #2b423aff 0%, #1f3b33ff 100%)",
        padding: "40px 0",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)",
          animation: "rotate 20s linear infinite"
        }} />
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 16px", position: "relative" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              padding: "12px 20px",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              marginBottom: 12,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transform: "translateY(0)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            <span style={{ 
              fontSize: 20, 
              lineHeight: 1,
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>←</span> 
            ย้อนกลับ
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div style={styles.body}>
        {/* Image Gallery */}
<div style={{ 
  ...styles.card, 
  overflow: "hidden",
  background: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.8))",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.4)"
}}>
  {/* กรอบรูปหลัก */}
  <div style={{
    ...styles.imageWrap,
    position: "relative",
    height: 450,
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)"
  }}>
    <img
      src={images[currentImageIndex] || "/default-image.png"}
      alt={`รูปที่ดิน ${currentImageIndex + 1}`}
      style={{
        ...styles.image,
        transform: "scale(1.0)",
        transition: "transform 0.5s ease-out"
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/default-image.png";
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1.0)";
      }}
    />
    <div style={{
      ...styles.imageOverlay,
      background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))"
    }} />
    {images.length > 1 && (
      <>
        <button 
          onClick={prevImage} 
          style={{
            ...styles.navBtn,
            left: 20,
            width: "40px",
            height: "40px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "#1E40AF",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
        >←</button>
        <button 
          onClick={nextImage} 
          style={{
            ...styles.navBtn,
            right: 20,
            width: "40px",
            height: "40px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "#1E40AF",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
        >→</button>
      </>
    )}
    <div style={{
      ...styles.imgCounter,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: 500,
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "10px" }}>
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
            <div style={{ 
              ...styles.card, 
              ...styles.cardPad,
              background: "linear-gradient(to bottom right, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              transform: "translateY(0)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
            }}>
              <h2 style={{
                ...styles.sectionTitle,
                fontSize: "24px",
                background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "24px"
              }}>รายละเอียดที่ดิน</h2>

              <div style={{
                ...styles.detailsGrid,
                gap: "20px"
              }}>
                <div style={{
                  ...styles.detailItem,
                  background: "rgba(255,255,255,0.6)",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Ruler style={{ width: 24, height: 24, color: "#ffffff" }} />
                  </div>
                  <div>
                    <div style={{
                      ...styles.smallText,
                      color: "#6B7280",
                      fontSize: "14px",
                      marginBottom: "4px"
                    }}>ขนาด</div>
                    <div style={{ 
                      fontWeight: 600,
                      color: "#1E40AF",
                      fontSize: "16px"
                    }}>{areaStr || "-"}</div>
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
            <div style={{ 
              ...styles.card, 
              ...styles.cardPad,
              background: "linear-gradient(to bottom right, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{
                ...styles.sectionTitle,
                fontSize: "24px",
                background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "24px"
              }}>แผนที่</h2>
              <div style={{ 
                padding: "16px",
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1px solid rgba(217, 119, 6, 0.2)",
                color: "#92400E",
                borderRadius: "12px",
                marginBottom: "20px",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.1)",
                fontSize: "14px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                    stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                แผนที่นี้มีไว้เพื่อประกอบการพิจารณา
              </div>
              <div style={{
                ...styles.mapBox,
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)"
              }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "10px" }}>
            <div style={{ 
              ...styles.card, 
              ...styles.cardPad, 
              ...styles.sticky,
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{
                ...styles.sectionTitle,
                fontSize: "24px",
                background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "24px"
              }}>ติดต่อเจ้าของ</h2>

              <div style={{
                ...styles.contactRow,
                background: "rgba(255,255,255,0.6)",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.4)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease"
              }}>
                <div style={{
                  ...styles.avatar,
                  background: "linear-gradient(135deg, #2b423aff 0%, #1f3b33ff 100%)",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  border: "2px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
                }}>
                  <User style={{ width: 24, height: 24, color: "#ffffff" }} />
                </div>
                <div>
                  <div style={{ 
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#1E40AF",
                    marginBottom: "4px"
                  }}>{land.OwnerName || "เจ้าของที่ดิน"}</div>
                  <div style={{
                    ...styles.smallText,
                    color: "#6B7280",
                    fontSize: "14px"
                  }}>เจ้าของที่ดิน</div>
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

                {/* แสดงปุ่มส่งข้อความและส่งคำขอซื้อ เฉพาะถ้าไม่ใช่เจ้าของโพสต์ และที่ดินยังไม่ถูกโพสต์ขาย */}
                {userId !== land.user_id && land?.ID && (
                  <>
                    <button style={styles.contactBtn("msg")} onClick={handleCreateRoom}>
                      <MessageCircle style={{ width: 20, height: 20 }} />
                      ส่งข้อความ
                    </button>
                    <button
                      style={styles.contactBtn("ghost")}
                      onClick={showModal}
                      disabled={confirmLoading}
                    >
                      {confirmLoading ? "กำลังดำเนินการ..." : "ส่งคำขอซื้อ"}
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
                  </>
                )}
                {/* ถ้าที่ดินถูกโพสต์ขายแล้ว (มีโพสต์นี้อยู่แล้ว) ให้ disable ปุ่ม */}
                {userId !== land.user_id && !land?.ID && (
                  <>
                    <button style={{ ...styles.contactBtn("msg"), opacity: 0.5, cursor: "not-allowed" }} disabled>
                      <MessageCircle style={{ width: 20, height: 20 }} />
                      ส่งข้อความ (ที่ดินนี้ถูกโพสต์ขายแล้ว)
                    </button>
                    <button style={{ ...styles.contactBtn("ghost"), opacity: 0.5, cursor: "not-allowed" }} disabled>
                      ส่งคำขอซื้อ (ที่ดินนี้ถูกโพสต์ขายแล้ว)
                    </button>
                  </>
                )}
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
