import React, { useEffect, useState } from "react";
import { Select, Upload, message, Form, Button, Card, Row, Col, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Check, Phone, User, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetTags,CreateLandPost, getLandtitleIdByTokenId } from "../../service/https/jib/jib";
import { ethers } from "ethers";
import { GetInfoUserByToken, GetLandTitleInfoByWallet, GetLandMetadataByToken } from "../../service/https/bam/bam";
import { GetAllProvinces, GetDistrict, GetSubdistrict, } from "../../service/https/garfield/http";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN =
  (import.meta as any)?.env?.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1Ijoiam9oYXJ0MjU0NiIsImEiOiJjbWVmZ3YzMGcwcTByMm1zOWRkdjJkNTd0In0.DBDjy1rBDmc8A4PN3haQ4A';

// ---- Helpers for saving polygon to backend ----
type Coordinate = { lng: number; lat: number };

async function saveLocations(
  landsalepostId: number,
  coords: Coordinate[],
  opts?: { apiBase?: string; token?: string; tokenType?: string }
) {
  if (!coords?.length) return;

  const API_BASE =
    opts?.apiBase ??
    (import.meta as any)?.env?.VITE_API_BASE_URL ??
    "http://localhost:8080";

  const token = opts?.token ?? localStorage.getItem("token") ?? "";
  const tokenType = opts?.tokenType ?? localStorage.getItem("token_type") ?? "Bearer";

  const payload = coords.map((c, i) => ({
    sequence: i + 1,
    latitude: c.lat,
    longitude: c.lng,
    landsalepost_id: landsalepostId,
  }));

  const res = await fetch(`${API_BASE}/location`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `${tokenType} ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText || "บันทึกพิกัดไม่สำเร็จ");
  }

  return res.json();
}

const { Text } = Typography;

type ProvinceDTO = { ID: number; name_th: string; name_en?: string };
type DistrictDTO = { ID: number; name_th: string; province_id: number; name_en?: string };
type SubdistrictDTO = { ID: number; name_th: string; district_id: number; name_en?: string };

type Tag = {
  id: number;
  Tag: string;
  icon: string;
};

// แปลงเป็น checksum (ถ้าไม่ถูกต้องจะคืน "")
const toChecksum = (addr?: string) => {
  try { return ethers.getAddress(addr ?? ""); } catch { return ""; }
};

// ย่อ address สำหรับแสดงผล
const truncate = (addr?: string, head = 6, tail = 4) =>
  addr ? `${addr.slice(0, head)}…${addr.slice(-tail)}` : "";

// เช็ค zero address โดยไม่ hard-code
const isZeroAddress = (addr?: string) => {
  try { return ethers.getAddress(addr ?? "") === ethers.ZeroAddress; } catch { return false; }
};

//const ZERO_ADDR = "0xf55988edca178d5507454107945a0c96f3af628c";

function normalizeMetaFields(raw: string = ""): string {
  return raw.trim().replace(/^"/, "").replace(/";?$/, "").trim();
}

// "Key:Value, Key:Value" -> { Key: Value, ... }
function parseMetaFields(raw: string = ""): Record<string, string> {
  const meta: Record<string, string> = {};
  const clean = normalizeMetaFields(raw);
  if (!clean) return meta;
  for (const part of clean.split(",")) {
    const [k, ...rest] = part.split(":");
    if (!k || rest.length === 0) continue;
    meta[k.trim()] = rest.join(":").trim();
  }
  return meta;
}

function toEth(weiStr?: string): string {
  try {
    const v = BigInt(weiStr ?? "0");
    return ethers.formatEther(v);
  } catch {
    return "0";
  }
}

const SellPost = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tags, setTags] = useState<{ id: number; Tag: string; icon?: string }[]>([]);
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<ProvinceDTO[]>([]);
  const [districts, setDistricts] = useState<DistrictDTO[]>([]);
  const [subdistricts, setSubdistricts] = useState<SubdistrictDTO[]>([]);
  const [images, setImages] = useState<string[]>([]); // เปลี่ยนจาก image เดี่ยวเป็น array
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<any | null>(null);
  const [landTokens, setLandTokens] = useState<any[]>([]);
  const [landMetadata, setLandMetadata] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedLand, setSelectedLand] = useState<string | null>(null);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingS, setLoadingS] = useState(false);
  const [mapCoords, setMapCoords] = useState<Coordinate[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    name: "",
    price: "",
    tag_id: [] as number[],  
    image: "",
    province_id: "",
    district_id: "",
    subdistrict_id: "",
    landtitle_id: "",
      user_id: "",
  });

  // Enhanced CSS styles using the color scheme
  const styles = {
    card: {
      background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))",
      borderRadius: "20px",
      boxShadow: "0 12px 32px rgba(23, 46, 37, 0.1)",
      border: "1px solid rgba(111, 150, 155, 0.2)",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease"
    },
    infoCard: {
      background: "linear-gradient(135deg, #ffffff, #f8fafc)",
      borderRadius: "16px",
      padding: "1.5rem",
      boxShadow: "0 8px 24px rgba(23, 46, 37, 0.08)",
      border: "1px solid #e2e8f0",
      transition: "all 0.3s ease"
    },
    button: {
      primary: {
        background: "linear-gradient(135deg, #6F969B, #3F5658)",
        color: "#ffffff",
        border: "none",
        borderRadius: "12px",
        padding: "0.875rem 2rem",
        fontWeight: "600",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(111, 150, 155, 0.3)"
      },
      secondary: {
        background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
        color: "#172E25",
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        padding: "0.875rem 2rem",
        fontWeight: "600",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }
    },
    input: {
      width: "100%",
      padding: "1rem 1.25rem",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "1rem",
      color: "#172E25",
      outline: "none",
      transition: "all 0.3s ease",
      background: "#ffffff"
    }
  };    useEffect(() => {
      const connectWalletAndFetchUser = async () => {
        if (!(window as any).ethereum) {
          setError("กรุณาติดตั้ง MetaMask ก่อนใช้งาน");
          setLoading(false);
          return;
        }

        try {
          // 🔗 เชื่อม MetaMask
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          const address = accounts[0];
          setWalletAddress(address);
          console.log("✅ Connected wallet:", address);

          // ดึงข้อมูลผู้ใช้
          const userInfo = await GetInfoUserByToken();
          if (userInfo.error) {
            console.error("❌ Error fetching user info:", userInfo.error);
            setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
          } else {
            setTokenData(userInfo);
            console.log(userInfo);
          }

          // ดึง token IDs
          const resTokens = await GetLandTitleInfoByWallet();
          const tokens: string[] = resTokens?.tokens || [];
          setLandTokens(tokens);

          // ดึง metadata ราย token แล้ว "แปลง" ให้พร้อมใช้
          const allMetadata = await Promise.all(
            tokens.map(async (tokenId: string) => {
              const md = await GetLandMetadataByToken(tokenId);

              // รูปแบบที่คาดหวังคือ { buyer, metaFields, price, tokenID?, walletID? }
              const buyer = (md?.buyer || "").toLowerCase();
              const metaFields = md?.metaFields || md?.meta || ""; // กันหลายชื่อ
              const meta = parseMetaFields(metaFields);

              return {
                tokenID: String(md?.tokenID ?? tokenId),
                meta,
                buyer: buyer,
                price: String(md?.price ?? "0"), // wei
                priceEth: toEth(String(md?.price ?? "0")),
              };
            })
          );

          console.log("User land metadata (mapped):", allMetadata);
          setLandMetadata(allMetadata);

          // debug: log ค่าภายใน meta
          allMetadata.forEach((x) => {
            console.log(`--- Metadata for Token #${x.tokenID} ---`);
            Object.entries(x.meta || {}).forEach(([k, v]) =>
              console.log(`${k}: ${v}`)
            );
          });
        } catch (err) {
          console.error("❌ Error connecting MetaMask or fetching user:", err);
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อหรือดึงข้อมูล");
        } finally {
          setLoading(false);
        }
      };

      connectWalletAndFetchUser();
    }, [navigate]);

const handleSelectLand = async (tokenID: string) => {
  setSelectedLand(tokenID);

  // ดึง landtitle_id ที่แท้จริงจาก backend
  try {
    const res = await getLandtitleIdByTokenId(tokenID);
    const landtitleId = res?.landtitle_id ? String(res.landtitle_id) : tokenID; // fallback เป็น tokenID ถ้าไม่เจอ

    setFormData((prev) => ({
      ...prev,
      landtitle_id: landtitleId
    }));
    console.log("Selected land token:", tokenID, "Mapped landtitle_id:", landtitleId);
  } catch (err) {
    setFormData((prev) => ({
      ...prev,
      landtitle_id: tokenID // fallback
    }));
    console.error("Error mapping landtitle_id:", err);
  }
};

// ฟังก์ชันอัปโหลดรูปหลายรูป
const handleUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    messageApi.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น");
    return false;
  }
  const reader = new FileReader();
  reader.onload = () => {
    setImages((prev) => [...prev, reader.result as string]);
  };
  reader.readAsDataURL(file);
  return false;
};

    // โหลดจังหวัด
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoadingP(true);
      try {
        const data = await GetAllProvinces(ctrl.signal);
        // เผื่อ backend บางตัวส่ง { result: [] } มา
        const list: ProvinceDTO[] = Array.isArray(data) ? data : data?.result ?? [];
        setProvinces(list);
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoadingP(false);
      }
    })();
    return () => ctrl.abort();
  }, []);


  // when province changes -> load districts & reset district/subdistrict
  useEffect(() => {
    const pidStr = formData.province_id;
    const ctrl = new AbortController();

    const pidNum = Number(pidStr);
    
    console.log("province_id (ID):", pidNum);

    if (!Number.isFinite(pidNum) || pidNum <= 0) {
      setDistricts([]);
      setSubdistricts([]);
      setFormData((p) => ({ ...p, district_id: "", subdistrict_id: "" }));
      return;
    }

    (async () => {
      setLoadingD(true);
      try {
        const data = await GetDistrict(pidNum, ctrl.signal);

        console.log("Received districts data:", data);

        const list: DistrictDTO[] = Array.isArray(data) ? data : data?.result ?? [];
        setDistricts(list);

        console.log("Districts after setting:", list);
        
        setSubdistricts([]);
        setFormData((p) => ({ ...p, district_id: "", subdistrict_id: "" }));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoadingD(false);
      }
    })();

    return () => ctrl.abort();
  }, [formData.province_id]);



  // when district changes -> load subdistricts & reset subdistrict
  useEffect(() => {
    const didStr = formData.district_id;
    const ctrl = new AbortController();

    const didNum = Number(didStr);
    if (!Number.isFinite(didNum) || didNum <= 0) {
      setSubdistricts([]);
      setFormData((p) => ({ ...p, subdistrict_id: "" }));
      return;
    }

    (async () => {
      setLoadingS(true);
      try {
        const data = await GetSubdistrict(didNum, ctrl.signal);
        const list: SubdistrictDTO[] = Array.isArray(data) ? data : data?.result ?? [];
        setSubdistricts(list);
        setFormData((p) => ({ ...p, subdistrict_id: "" }));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoadingS(false);
      }
    })();

    return () => ctrl.abort();
  }, [formData.district_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  if (name === "province_id") {
    console.log("Selected province_id (value):", value, typeof value); // ควรเป็นเลข string เช่น "1"
  }
  setFormData((prev) => ({ ...prev, [name]: value }));
};


  // โหลดแท็ก
useEffect(() => {
  const fetchTags = async () => {
    try {
      const tagsData = await GetTags();
      const mapped = (tagsData || []).map((tag: any) => ({
        id: Number(tag.ID ?? tag.id),
        Tag: tag.Tag,
        icon: tag.icon || "",
      }));
      setTags(mapped);
    } catch (e) {
      console.error("Error fetching tags:", e);
    }
  };
  fetchTags();
}, []);


// 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.province_id || !formData.district_id || !formData.subdistrict_id) {
      message.error("กรุณาเลือกจังหวัด อำเภอ และตำบลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    const userId = localStorage.getItem("user_id");

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        name: formData.name,
        images,// image: formData.image,
        price: Number(formData.price),
        province_id: Number(formData.province_id),
        district_id: Number(formData.district_id),
        subdistrict_id: Number(formData.subdistrict_id),
        tag_id: formData.tag_id,        // ✅ ส่ง array ของตัวเลข
        landtitle_id: Number(formData.landtitle_id),
        user_id: Number(userId),
      };

      // 1) สร้างโพสต์
      const created = await CreateLandPost(payload);
      const newId =
        created?.ID ?? created?.id ?? created?.data?.ID ?? created?.data?.id;

      // 2) บันทึกพิกัด (ถ้ามี ≥ 3 จุด) ผูกกับ landsalepost_id ที่เพิ่งได้
      if (newId && mapCoords.length >= 3) {
        await saveLocations(Number(newId), mapCoords);
      }

      message.success("✅ โพสต์ขายที่ดินสำเร็จ!");
      setCurrentStep(2);

      setTimeout(() => {
        navigate("/user/sellpostmain");
      }, 2000);
    } catch (error: any) {
      message.error("❌ เกิดข้อผิดพลาด: " + (error?.message || error || "ไม่ทราบสาเหตุ"));
    } finally {
      setLoading(false);
    }
  };


  const steps = [
    { number: 1, title: "เลือกโฉนดที่ดิน", icon: "📋" },
    { number: 2, title: "กรอกข้อมูลส่วนตัว", icon: "👤" },
    { number: 3, title: "รายละเอียดที่ดิน", icon: "🏞️" },
    { number: 4, title: "ตำแหน่งที่ตั้ง", icon: "📍" }
  ];

  const MapPicker: React.FC<{
  value: Coordinate[];
  onChange: (v: Coordinate[]) => void;
  height?: number;
  center?: [number, number]; // [lng, lat]
}> = ({ value, onChange, height = 300, center = [100.5018, 13.7563] }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ตั้ง token ครั้งเดียว
  useEffect(() => {
    (mapboxgl as any).accessToken = MAPBOX_TOKEN;
  }, []);

  // init map
  useEffect(() => {
    if (map.current || !ref.current) return;
    map.current = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom: 12,
    });

    map.current.on('load', () => {
      // sources
      map.current!.addSource('markers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.current!.addSource('poly', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // layers
      map.current!.addLayer({
        id: 'markers',
        type: 'circle',
        source: 'markers',
        paint: {
          'circle-radius': 6,
          'circle-color': '#ff4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      map.current!.addLayer({
        id: 'marker-labels',
        type: 'symbol',
        source: 'markers',
        layout: {
          'text-field': ['get', 'sequence'],
          'text-size': 11,
          'text-offset': [0, 0],
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      });
      map.current!.addLayer({
        id: 'poly-fill',
        type: 'fill',
        source: 'poly',
        paint: { 'fill-color': '#ff4444', 'fill-opacity': 0.35 },
      });
      map.current!.addLayer({
        id: 'poly-line',
        type: 'line',
        source: 'poly',
        paint: { 'line-color': '#ff0000', 'line-width': 2, 'line-dasharray': [2, 2] },
      });

      updateAll();
    });
  }, []);

  // วาด/อัปเดต markers + polygon ทุกครั้งที่ value เปลี่ยน
  const updateAll = React.useCallback(() => {
    if (!map.current) return;

    const markerFeatures = value.map((c, i) => ({
      type: 'Feature' as const,
      properties: { sequence: i + 1 },
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
    }));

    (map.current.getSource('markers') as mapboxgl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: markerFeatures,
    });

    const poly =
      value.length >= 3
        ? [
            [
              ...value.map((c) => [c.lng, c.lat] as [number, number]),
              [value[0].lng, value[0].lat],
            ],
          ]
        : [];

    (map.current.getSource('poly') as mapboxgl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: poly.length
        ? [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: poly } }]
        : [],
    });
  }, [value]);

  useEffect(() => updateAll(), [value, updateAll]);

  // คลิกเพื่อเพิ่มจุดเมื่ออยู่ในโหมดวาด
  useEffect(() => {
    if (!map.current) return;
    const onClick = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawing) return;
      onChange([...value, { lng: e.lngLat.lng, lat: e.lngLat.lat }]);
    };
    map.current.on('click', onClick);
    map.current.getCanvas().style.cursor = isDrawing ? 'crosshair' : '';
    return () => {
      map.current?.off('click', onClick);
      if (map.current) map.current.getCanvas().style.cursor = '';
    };
  }, [isDrawing, value, onChange]);


  return (
    <div>
      <div ref={ref} style={{ width: '100%', height, borderRadius: 16, overflow: 'hidden' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={() => setIsDrawing((d) => !d)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: 'none',
            background: isDrawing ? '#dc2626' : '#3b82f6',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {isDrawing ? '🛑 หยุดมาร์ค' : '🎯 เริ่มมาร์คที่ดิน'}
        </button>

        <button
          type="button"
          onClick={() => onChange(value.slice(0, -1))}
          disabled={!value.length}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            background: '#FBBF24',
            color: '#111827',
            fontWeight: 600,
            opacity: value.length ? 1 : 0.6,
          }}
        >
          ↶ ยกเลิกจุดสุดท้าย
        </button>

        <span style={{ alignSelf: 'center', color: '#6B7280' }}>จุดที่เลือก: {value.length}</span>
      </div>
    </div>
  );
};

  return (
    <>
      <style>{`
        .request-sell-container {
          font-family: 'Inter', sans-serif;
        }
        
        .main-container1 {
          max-width: 100%;
        }
        
        .error-alert {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
        }
        
        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        
        .info-card {
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 24px rgba(23, 46, 37, 0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }
        
        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(23, 46, 37, 0.12);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .card-icon.success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        
        .card-icon.info {
          background: linear-gradient(135deg, #6F969B, #3F5658);
          color: white;
        }
        
        .card-icon.land {
          background: linear-gradient(135deg, #172E25, #3F5658);
          color: white;
        }
        
        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #172E25;
          margin: 0;
        }
        
        .wallet-display, .user-info, .land-summary {
          font-size: 0.95rem;
          line-height: 1.6;
        }
        
        .wallet-label, .info-label {
          color: #3F5658;
          font-weight: 600;
        }
        
        .wallet-address, .info-value {
          color: #172E25;
          font-weight: 500;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
        }
        
        .info-item {
          margin-bottom: 0.75rem;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        
        .land-tokens-section {
          margin-top: 1.5rem;
        }
        
        .section-title {
          color: #172E25;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .land-tokens-container {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }
        
        .land-tokens-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .land-tokens-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .land-tokens-container::-webkit-scrollbar-thumb {
          background: #6F969B;
          border-radius: 3px;
        }
        
        .land-token-card {
          transition: all 0.3s ease;
        }
        
        .land-token-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(111, 150, 155, 0.2) !important;
        }
        
        .land-token-card.selected {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7) !important;
          border-color: #6F969B !important;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #64748b;
        }
        
        .empty-icon {
          margin: 0 auto 1rem auto;
          color: #94a3b8;
        }
        
        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
        }
        
        .empty-description {
          color: #64748b;
          margin: 0;
        }
        
        .user-error {
          text-align: center;
          padding: 1.5rem;
        }
        
        .user-error-icon {
          margin: 0 auto 0.75rem auto;
          color: #f59e0b;
        }
        
        .user-error-title {
          font-size: 1rem;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 0.25rem;
        }
        
        .user-error-subtitle {
          color: #a16207;
          font-size: 0.875rem;
          margin: 0;
        }
        
        .land-count {
          font-size: 1.125rem;
          font-weight: 600;
          color: #172E25;
        }
        
        .input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          fontSize: 1rem;
          color: #172E25;
          outline: none;
          transition: all 0.3s ease;
          background: #ffffff;
        }
        
        .input:focus {
          border-color: #6F969B;
          box-shadow: 0 0 0 3px rgba(111, 150, 155, 0.1);
        }
        
        .input:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: "#FFFFFF", 
        boxShadow: "0 4px 6px -1px rgba(23, 46, 37, 0.1)", 
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e2e8f0"
      }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem 1.5rem" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "800", 
            color: "#172E25", 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem",
            margin: 0,
            textShadow: "0 2px 4px rgba(23, 46, 37, 0.1)"
          }}>
            <span style={{ 
              background: "linear-gradient(135deg, #6F969B, #3F5658)",
              borderRadius: "16px",
              padding: "12px",
              fontSize: "2rem"
            }}>🏡</span>
            ประกาศขายที่ดิน
          </h1>
          <p style={{ 
            color: "#3F5658", 
            fontSize: "1.1rem", 
            margin: "8px 0 0 0",
            fontWeight: "500"
          }}>
            โพสต์ขายที่ดินของคุณอย่างง่ายดายและปลอดภัย
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "3rem",
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: "20px",
          padding: "2rem",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(23, 46, 37, 0.1)"
        }}>
          {steps.map((step, index) => (
            <div key={step.number} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", color: currentStep >= step.number ? "#6F969B" : "#94a3b8" }}>
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.75rem",
                    background: currentStep >= step.number 
                      ? "linear-gradient(135deg, #6F969B, #3F5658)" 
                      : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                    color: currentStep >= step.number ? "#ffffff" : "#64748b",
                    border: currentStep >= step.number ? "3px solid #172E25" : "3px solid #e2e8f0",
                    boxShadow: currentStep >= step.number 
                      ? "0 8px 24px rgba(111, 150, 155, 0.3)" 
                      : "0 4px 12px rgba(148, 163, 184, 0.2)",
                    transition: "all 0.3s ease",
                    transform: currentStep >= step.number ? "scale(1.05)" : "scale(1)"
                  }}
                >
                  {step.icon}
                </div>
                <span style={{ 
                  fontSize: "0.9rem", 
                  fontWeight: "600",
                  color: currentStep >= step.number ? "#172E25" : "#64748b"
                }}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: "6rem",
                    height: "4px",
                    margin: "0 1.5rem",
                    background: currentStep > step.number 
                      ? "linear-gradient(90deg, #6F969B, #3F5658)" 
                      : "linear-gradient(90deg, #e2e8f0, #cbd5e1)",
                    borderRadius: "2px",
                    transition: "all 0.3s ease"
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          {/* Main Content */}
          <div style={{ gridColumn: "span 2" }}>
            {/* Step 1: Land Selection */}
            {currentStep === 1 && (
              <div style={{ 
                ...styles.card, 
                padding: "3rem",
                marginTop: "1rem"
              }}>
                
                <h2 style={{ 
                  fontSize: "2rem", 
                  fontWeight: "800", 
                  color: "#172E25", 
                  marginBottom: "1rem", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem"
                }}>
                  <span style={{
                    background: "linear-gradient(135deg, #6F969B, #3F5658)",
                    borderRadius: "16px",
                    padding: "12px",
                    fontSize: "1.5rem",
                    color: "#fff"
                  }}>📋</span>
                  ตรวจสอบโฉนดที่ดินของคุณ
                </h2>
                <p style={{ 
                  color: "#3F5658", 
                  marginBottom: "2rem", 
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  fontWeight: "500"
                }}>
                  เลือกโฉนดที่ดินที่คุณต้องการประกาศขายจากรายการด้านล่างนี้
                </p>

        <div className="request-sell-container">            
            {/* Header Section */}
            <div className="main-container1">

                {/* Error Alert */}
                {error && (
                    <div className="error-alert">
                        <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Wallet Connection Card */}
                {walletAddress && (
                    <div className="info-card">
                        <div className="card-header">
                          <div className="card-icon success">
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              style={{ width: "50px", height: "50px" }} // 👈 กำหนดขนาดเล็กลง
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                            <h4 className="card-title">เชื่อมต่อ Wallet แล้ว</h4>
                        </div>
                        <div 
                          className="wallet-display" 
                          style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <p className="wallet-label" style={{ margin: 0 }}>Wallet Address:</p>
                          <p className="wallet-address" style={{ margin: 0 }}>{walletAddress}</p>
                        </div>
                    </div>
                )}

                {/* User Info Card */}
                <div className="grid-2">
                    {tokenData ? (
                        <div className="info-card">
                            <div className="card-header">
                              <div className="card-icon info">
                                <svg
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  style={{ width: "50px", height: "50px" }} // 👈 ย่อขนาดลง
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                                <h4 className="card-title">ข้อมูลผู้ใช้</h4>
                            </div>
                            <div className="user-info">
                              <div className="info-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <p className="info-label" style={{ margin: 0 }}>ชื่อ:</p>
                                <p className="info-value" style={{ margin: 0 }}>{tokenData.first_name}</p>
                              </div>
                              <div className="info-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <p className="info-label" style={{ margin: 0 }}>นามสกุล:</p>
                                <p className="info-value" style={{ margin: 0 }}>{tokenData.last_name}</p>
                              </div>
                              <div className="info-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <p className="info-label" style={{ margin: 0 }}>Wallet Address:</p>
                                <p className="wallet-address" style={{ margin: 0 }}>{tokenData.wallet_address}</p>
                              </div>
                            </div>
                        </div>
                    ) : (
                        <div className="info-card">
                          <div className="user-error">
                            <svg
                              className="user-error-icon"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              style={{ width: "20px", height: "20px" }} // 👈 กำหนดขนาดที่ต้องการ
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            <p className="user-error-title">ไม่พบข้อมูลผู้ใช้</p>
                            <p className="user-error-subtitle">กรุณาลองใหม่อีกครั้ง</p>
                          </div>
                        </div>

                    )}

                    {/* Land Tokens Summary */}
                    <div className="info-card">
                        <div className="card-header">
                          <div className="card-icon land">
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              style={{ width: "50px", height: "50px" }} // 👈 ย่อขนาดไอคอน
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                            <h4 className="card-title">ที่ดินของคุณ</h4>
                        </div>
                        <div className="land-summary">
                            <div className="land-count">
                               {/* Land Tokens Section */}
                              {landMetadata.length > 0 && (
                                <div className="land-tokens-section">
                                  <h4 className="section-title" style={{ fontSize: 15, marginBottom: 8 }}>
                                    เลือกที่ดินที่ต้องการจำหน่าย
                                  </h4>

                                  <div className="land-tokens-container">
                                    {landMetadata.map((land: any, index: number) => {
                                      const deedNo = land.meta?.["Deed No"] || land.meta?.["DeedNo"] || "-";
                                      const m = land.meta || {};
                                      const map = m["Map"] ?? "-";
                                      const landNo = m["Land No"] ?? "-";
                                      const surveyPage = m["Survey Page"] ?? "-";
                                      const subdistrict = m["Subdistrict"] ?? "-";
                                      const district = m["District"] ?? "-";
                                      const province = m["Province"] ?? "-";
                                      const rai = m["Rai"] ?? "-";
                                      const ngan = m["Ngan"] ?? "-";
                                      const sqwa = m["SqWa"] ?? "-";
                                      const book = m["Book"] ?? "-";
                                      const page = m["Page"] ?? "-";

                                      const available = isZeroAddress(land.buyer); // true = ว่างขาย
                                      const isSelected = selectedLand === land.tokenID;

                                      return (
                                        <Card
                                          key={land.tokenID ?? index}
                                          title={<span style={{ fontSize: 13, fontWeight: 700 }}>โฉนด #{deedNo}</span>}
                                          size="small"
                                          hoverable
                                          bordered
                                          onClick={() => handleSelectLand(String(land.tokenID))}
                                          className="cursor-pointer transition-all"
                                          style={{
                                            marginBottom: 8,
                                            borderColor: isSelected ? "#1677ff" : undefined,
                                            boxShadow: isSelected ? "0 4px 12px rgba(22,119,255,.2)" : undefined,
                                            borderRadius: 6,
                                            opacity: available ? 1 : 0.7,
                                          }}
                                          headStyle={{ padding: "8px 10px", minHeight: 0 }}
                                          bodyStyle={{ padding: "8px 10px" }}
                                        >
                                          <Row gutter={[12, 6]} style={{ fontSize: 12, lineHeight: 1.4 }}>
                                            <Col span={12}><Text strong type="secondary">Token ID</Text></Col>
                                            <Col span={12}>{land.tokenID}</Col>

                                            <Col span={12}><Text strong type="secondary">แผนที่ระวาง</Text></Col>
                                            <Col span={12}>{map}</Col>

                                            <Col span={12}><Text strong type="secondary">เลขที่ดิน</Text></Col>
                                            <Col span={12}>{landNo}</Col>

                                            <Col span={12}><Text strong type="secondary">เลขหน้าสำรวจ</Text></Col>
                                            <Col span={12}>{surveyPage}</Col>

                                            <Col span={12}><Text strong type="secondary">เล่ม</Text></Col>
                                            <Col span={12}>{book}</Col>

                                            <Col span={12}><Text strong type="secondary">หน้า</Text></Col>
                                            <Col span={12}>{page}</Col>

                                            <Col span={12}><Text strong type="secondary">พื้นที่</Text></Col>
                                            <Col span={12}>{rai} ไร่ {ngan} งาน {sqwa} ตร.วา</Col>

                                            <Col span={12}><Text strong type="secondary">จังหวัด</Text></Col>
                                            <Col span={12}>{province}</Col>

                                            <Col span={12}><Text strong type="secondary">อำเภอ</Text></Col>
                                            <Col span={12}>{district}</Col>

                                            <Col span={12}><Text strong type="secondary">ตำบล</Text></Col>
                                            <Col span={12}>{subdistrict}</Col>
                                          </Row>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Land Tokens Grid */}
                <div className="land-tokens-section">
                  <div className="grid-3">
                    {landTokens.map((tokenId: string) => {
                      const isSelected = selectedLand === String(tokenId);
                      return (
                        <div
                          key={tokenId}
                          className={`land-token-card${isSelected ? " selected" : ""}`}
                          onClick={() => handleSelectLand(String(tokenId))}
                          style={{
                            cursor: "pointer",
                            border: isSelected ? "2px solid #1677ff" : "1px solid #e0e0e0",
                            borderRadius: 8,
                            boxShadow: isSelected ? "0 4px 12px rgba(22,119,255,.2)" : "0 1px 4px rgba(0,0,0,.06)",
                            background: "#fff",
                            marginBottom: "1rem"
                          }}
                        >
                          <div style={{ padding: 12 }}>
                            {isSelected && <span style={{ color: "#1677ff" }}>คุณเลือกโฉนดนี้</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Empty State */}
                {landTokens.length === 0 && !loading && (
                    <div className="empty-state">
                      <svg
                        className="empty-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ width: "50px", height: "50px" }} // 👈 ย่อขนาด
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                      </svg>
                        <h4 className="empty-title">ไม่พบที่ดิน</h4>
                        <p className="empty-description">คุณยังไม่มีที่ดินในระบบ</p>
                    </div>
                )}
            </div>
        </div>

                <div style={{ marginTop: "3rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{
                      ...styles.button.primary,
                      fontSize: "1.1rem",
                      padding: "1rem 2.5rem"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(111, 150, 155, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(111, 150, 155, 0.3)";
                    }}
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue from Step 2: Personal Information */}
      {currentStep === 2 && (
        <div style={{ 
          ...styles.card, 
          padding: "3rem",
          marginTop: "1rem"
        }}>
          <h2 style={{ 
            fontSize: "2rem", 
            fontWeight: "800", 
            color: "#172E25", 
            marginBottom: "1rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem"
          }}>
            <span style={{
              background: "linear-gradient(135deg, #6F969B, #3F5658)",
              borderRadius: "16px",
              padding: "12px",
              fontSize: "1.5rem",
              color: "#fff"
            }}>👤</span>
            ข้อมูลส่วนตัว
          </h2>
          <p style={{ 
            color: "#3F5658", 
            marginBottom: "2rem", 
            fontSize: "1.1rem",
            lineHeight: "1.6",
            fontWeight: "500"
          }}>
            กรอกข้อมูลการติดต่อของคุณเพื่อให้ผู้สนใจสามารถติดต่อได้
          </p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                ชื่อ
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ 
                  position: "absolute", 
                  left: "1rem", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: "1.25rem", 
                  height: "1.25rem", 
                  color: "#6F969B",
                  zIndex: 1
                }} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "3.5rem"
                  }}
                  placeholder="กรอกชื่อ"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#6F969B";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 150, 155, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                นามสกุล
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ 
                  position: "absolute", 
                  left: "1rem", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: "1.25rem", 
                  height: "1.25rem", 
                  color: "#6F969B",
                  zIndex: 1
                }} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "3.5rem"
                  }}
                  placeholder="กรอกนามสกุล"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#6F969B";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 150, 155, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                เบอร์โทรศัพท์
              </label>
              <div style={{ position: "relative" }}>
                <Phone style={{ 
                  position: "absolute", 
                  left: "1rem", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: "1.25rem", 
                  height: "1.25rem", 
                  color: "#6F969B",
                  zIndex: 1
                }} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "3.5rem"
                  }}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#6F969B";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 150, 155, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(1)}
              style={styles.button.secondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(148, 163, 184, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ← ย้อนกลับ
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              style={styles.button.primary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(111, 150, 155, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(111, 150, 155, 0.3)";
              }}
            >
              ถัดไป →
            </button>
          </div>
        </div>
      )}
      {currentStep === 3 && (
        <div style={{ 
          ...styles.card, 
          padding: "3rem",
          marginTop: "1rem"
        }}>
          <h2 style={{ 
            fontSize: "2rem", 
            fontWeight: "800", 
            color: "#172E25", 
            marginBottom: "1rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem"
          }}>
            <span style={{
              background: "linear-gradient(135deg, #6F969B, #3F5658)",
              borderRadius: "16px",
              padding: "12px",
              fontSize: "1.5rem",
              color: "#fff"
            }}>🏞️</span>
            รายละเอียดที่ดิน
          </h2>
          <p style={{ 
            color: "#3F5658", 
            marginBottom: "2rem", 
            fontSize: "1.1rem",
            lineHeight: "1.6",
            fontWeight: "500"
          }}>
            เพิ่มรูปภาพและข้อมูลรายละเอียดของที่ดินที่ต้องการขาย
          </p>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ 
              fontSize: "1rem", 
              fontWeight: "600", 
              color: "#172E25", 
              marginBottom: "1rem",
              display: "block"
            }}>
              รูปที่ดิน
            </label>
            <div style={{
              border: "2px dashed #6F969B",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              marginBottom: "1rem"
            }}>
              <Upload
                beforeUpload={handleUpload}
                listType="picture"
                multiple
                accept="image/*"
                showUploadList={false}
              >
                <Button 
                  icon={<UploadOutlined />}
                  style={{
                    background: "linear-gradient(135deg, #6F969B, #3F5658)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "0.75rem 2rem",
                    fontWeight: "600",
                    fontSize: "1rem",
                    height: "auto"
                  }}
                >
                  อัปโหลดรูปภาพ
                </Button>
              </Upload>
              <p style={{ 
                color: "#3F5658", 
                marginTop: "1rem", 
                fontSize: "0.9rem" 
              }}>
                รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB
              </p>
            </div>
            
            {images.length > 0 && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
                gap: "1rem" 
              }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ 
                    position: "relative",
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "8px",
                    boxShadow: "0 4px 12px rgba(23, 46, 37, 0.1)",
                    border: "1px solid #e2e8f0"
                  }}>
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      style={{ 
                        width: "100%", 
                        height: "120px",
                        borderRadius: "8px", 
                        objectFit: "cover",
                        marginBottom: "8px"
                      }}
                    />
                    <Button 
                      size="small" 
                      danger 
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      style={{
                        width: "100%",
                        borderRadius: "8px"
                      }}
                    >
                      ลบ
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                ชื่อที่ดิน
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ 
                  position: "absolute", 
                  left: "1rem", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: "1.25rem", 
                  height: "1.25rem", 
                  color: "#6F969B",
                  zIndex: 1
                }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "3.5rem"
                  }}
                  placeholder="กรอกชื่อที่ดิน"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#6F969B";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 150, 155, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                ราคา (บาท)
              </label>
              <div style={{ position: "relative" }}>
                <DollarSign style={{ 
                  position: "absolute", 
                  left: "1rem", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: "1.25rem", 
                  height: "1.25rem", 
                  color: "#6F969B",
                  zIndex: 1
                }} />
                <input
                  type="number"
                  name="price"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "3.5rem"
                  }}
                  placeholder="กรอกราคา"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#6F969B";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 150, 155, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ 
              fontSize: "1rem", 
              fontWeight: "600", 
              color: "#172E25", 
              marginBottom: "0.75rem",
              display: "block"
            }}>
              คุณสมบัติที่ดิน
            </label>
            <Select
              mode="multiple"                                    
              allowClear
              value={formData.tag_id}
              onChange={(values) => setFormData({ ...formData, tag_id: values })}
              style={{ 
                width: "100%", 
                borderRadius: "12px"
              }}
              placeholder="เลือกคุณสมบัติที่ดิน (ได้หลายข้อ)"
              options={tags.map(t => ({ value: t.id, label: t.Tag }))}
              optionFilterProp="label"
              size="large"
            />
          </div>

          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(2)}
              style={styles.button.secondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(148, 163, 184, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ← ย้อนกลับ
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              style={styles.button.primary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(111, 150, 155, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(111, 150, 155, 0.3)";
              }}
            >
              ถัดไป →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Location */}
      {currentStep === 4 && (
        <div style={{ 
          ...styles.card, 
          padding: "3rem",
          marginTop: "1rem"
        }}>
          <h2 style={{ 
            fontSize: "2rem", 
            fontWeight: "800", 
            color: "#172E25", 
            marginBottom: "1rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem"
          }}>
            <span style={{
              background: "linear-gradient(135deg, #6F969B, #3F5658)",
              borderRadius: "16px",
              padding: "12px",
              fontSize: "1.5rem",
              color: "#fff"
            }}>📍</span>
            ตำแหน่งที่ตั้ง
          </h2>
          <p style={{ 
            color: "#3F5658", 
            marginBottom: "2rem", 
            fontSize: "1.1rem",
            lineHeight: "1.6",
            fontWeight: "500"
          }}>
            เลือกจังหวัด อำเภอ ตำบล และกำหนดพื้นที่ของที่ดินบนแผนที่
          </p>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "2rem",
            marginBottom: "2rem"
          }}>
            <div>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                จังหวัด
              </label>
              <select
                name="province_id"
                value={formData.province_id}
                onChange={handleChange}
                style={styles.input}
                disabled={loadingP}
              >
                <option value="">
                  {loadingP ? "กำลังโหลด..." : "-- เลือกจังหวัด --"}
                </option>
                {provinces.map((p) => (
                  <option key={p.ID} value={String(p.ID)}>
                    {p.name_th}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                อำเภอ
              </label>
              <select
                name="district_id"
                value={formData.district_id}
                onChange={handleChange}
                style={styles.input}
                disabled={!formData.province_id || loadingD}
              >
                <option value="">
                  {loadingD ? "กำลังโหลด..." : "-- เลือกอำเภอ --"}
                </option>
                {districts.map((d) => (
                  <option key={d.ID} value={String(d.ID)}>
                    {d.name_th}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: "#172E25", 
                marginBottom: "0.75rem",
                display: "block"
              }}>
                ตำบล
              </label>
              <select
                name="subdistrict_id"
                value={formData.subdistrict_id}
                onChange={handleChange}
                style={styles.input}
                disabled={!formData.district_id || loadingS}
              >
                <option value="">
                  {loadingS ? "กำลังโหลด..." : "-- เลือกตำบล --"}
                </option>
                {subdistricts.map((s) => (
                  <option key={s.ID} value={String(s.ID)}>
                    {s.name_th}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ 
              fontSize: "1rem", 
              fontWeight: "600", 
              color: "#172E25", 
              marginBottom: "1rem",
              display: "block"
            }}>
              แผนที่ตำแหน่ง
            </label>
            
            <div style={{
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              border: "2px solid #e2e8f0",
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "1rem"
            }}>
              <MapPicker value={mapCoords} onChange={setMapCoords} height={500} />
            </div>
            
            <div style={{ 
              fontSize: "0.9rem", 
              color: mapCoords.length >= 3 ? "#059669" : "#f59e0b", 
              marginTop: "0.5rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              {mapCoords.length >= 3 ? (
                <>
                  <span style={{ color: "#059669" }}>✓</span>
                  ได้พื้นที่แล้ว สามารถโพสต์ได้เลย ({mapCoords.length} จุด)
                </>
              ) : (
                <>
                  <span style={{ color: "#f59e0b" }}>⚠</span>
                  เลือกอย่างน้อย 3 จุดเพื่อขึ้นรูปพื้นที่ (เลือกแล้ว {mapCoords.length} จุด)
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(3)}
              style={styles.button.secondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(148, 163, 184, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ← ย้อนกลับ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.button.primary,
                background: loading 
                  ? "linear-gradient(135deg, #94a3b8, #64748b)" 
                  : "linear-gradient(135deg, #059669, #16a34a)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(5, 150, 105, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(5, 150, 105, 0.3)";
                }
              }}
            >
              {loading ? "กำลังโพสต์..." : "🚀 โพสต์ประกาศ"}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isModalVisible && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "4rem",
                height: "4rem",
                backgroundColor: "#28a745",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                marginBottom: "1rem",
              }}
            >
              <Check style={{ color: "#ffffff", width: "2rem", height: "2rem" }} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1rem" }}>
              สำเร็จ!
            </h3>
            <p style={{ color: "#616161", marginBottom: "1.5rem" }}>ประกาศขายที่ดินของคุณได้รับการโพสต์เรียบร้อยแล้ว</p>
            <button
              onClick={() => setIsModalVisible(false)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#007bff",
                color: "#ffffff",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default SellPost;
