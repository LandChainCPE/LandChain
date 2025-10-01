import React, { useEffect, useState } from "react";
import { Select, Upload, message, Button, Card, Row, Col, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Check, Phone, User, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetTags,CreateLandPost, getLandtitleIdByTokenId, checkLandsalepostByLandId } from "../../service/https/jib/jib";
import { ethers } from "ethers";
import { GetInfoUserByToken, GetLandTitleInfoByWallet, GetLandMetadataByToken } from "../../service/https/bam/bam";
import { GetAllProvinces, GetDistrict, GetSubdistrict, } from "../../service/https/garfield";
import MapPicker from "../../components/MapPicker";
import { GetUserIDByWalletAddress } from "../../service/https/bam/bam";
import { getLocationCoordinates } from "../../components/locationUtils";

const URLBackend = import.meta.env.VITE_URL_Backend;

type Coordinate = { lng: number; lat: number };

async function saveLocations(
  landsalepostId: number,
  coords: Coordinate[],
  opts?: { apiBase?: string; token?: string; tokenType?: string }
) {
  if (!coords?.length) return;

  // const API_BASE =
  //   opts?.apiBase ??
  //   (import.meta as any)?.env?.VITE_API_BASE_URL ??
  //   "https://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io";

  const token = opts?.token ?? sessionStorage.getItem("token") ?? "";
  const tokenType = opts?.tokenType ?? sessionStorage.getItem("token_type") ?? "Bearer";

  const payload = coords.map((c, i) => ({
    sequence: i + 1,
    latitude: c.lat,
    longitude: c.lng,
    landsalepost_id: landsalepostId,
  }));

  const res = await fetch(`${URLBackend}/location`, {
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

// เช็ค zero address โดยไม่ hard-code
const isZeroAddress = (addr?: string) => {
  try { return ethers.getAddress(addr ?? "") === ethers.ZeroAddress; } catch { return false; }
};


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
  const [messageApi] = message.useMessage();
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([100.5018, 13.7563]); // Default: Bangkok
  const [mapZoom, setMapZoom] = useState<number>(12); // Default zoom level

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
    land_id: "",
      user_id: "",
  });

  // สำหรับเก็บข้อมูลที่อยู่ที่รอการประมวลผล
  const [pendingLocationData, setPendingLocationData] = useState<{
    provinceName: string;
    districtName: string;
    subdistrictName: string;
    land_id: string;
  } | null>(null);

    const [errors, setErrors] = useState<{
      firstName: string;
      lastName: string;
      phoneNumber: string;
      images: string;
      name: string;
      price: string;
      tag_id: string;
      province_id: string;
      district_id: string;
      subdistrict_id: string;
      mapCoords: string;
    }>({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      images: "",
      name: "",
      price: "",
      tag_id: "",
      province_id: "",
      district_id: "",
      subdistrict_id: "",
      mapCoords: "",
    });
  // Enhanced CSS styles using the color scheme
  const styles = {
    card: {
      background: "linear-gradient(135deg, #ffffff, #f8fafc)",
      borderRadius: "20px",
      boxShadow: "0 12px 32px rgba(43, 66, 58, 0.1)",
      border: "1px solid rgba(31, 54, 51, 0.2)",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease"
    },
    infoCard: {
      background: "linear-gradient(135deg, #ffffff, #f8fafc)",
      borderRadius: "16px",
      padding: "1.5rem",
      boxShadow: "0 8px 24px rgba(43, 66, 58, 0.08)",
      border: "1px solid rgba(31, 54, 51, 0.2)",
      transition: "all 0.3s ease"
    },
    button: {
      primary: {
        background: "linear-gradient(135deg, #2b423a, #1f3b33)",
        color: "#ffffff",
        border: "none",
        borderRadius: "12px",
        padding: "0.875rem 2rem",
        fontWeight: "600",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(43, 66, 58, 0.3)"
      },
      secondary: {
        background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
        color: "#2b423a",
        border: "1px solid rgba(43, 66, 58, 0.2)",
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
  // ดึง land_id ที่แท้จริงจาก backend
  try {
    const res = await getLandtitleIdByTokenId(tokenID);
    const land_id = res?.land_id ? String(res.land_id) : tokenID;

    // เช็คว่ามีโพสต์ขายที่ดินนี้แล้วหรือยัง
    const checkRes = await checkLandsalepostByLandId(land_id);
    if (checkRes?.exists) {
      message.error("ที่ดินนี้ได้ทำการโพสต์ขายไปแล้ว ไม่สามารถเลือกซ้ำได้");
      return;
    }

    setSelectedLand(tokenID);

    // หาข้อมูล metadata ของโฉนดที่เลือก
    const selectedLandData = landMetadata.find(land => land.tokenID === tokenID);

    // Debug: ดูข้อมูลใน console
    console.log("🔍 Selected Token ID:", tokenID);
    console.log("📋 Selected Land Data:", selectedLandData);
    console.log("🏛️ All Provinces:", provinces);
    console.log("🏘️ All Districts:", districts);
    console.log("🏞️ All Subdistricts:", subdistricts);

    if (selectedLandData?.meta) {
      const provinceName = selectedLandData.meta["Province"] || "";
      const districtName = selectedLandData.meta["District"] || "";
      const subdistrictName = selectedLandData.meta["Subdistrict"] || "";

      console.log("🎯 Found location data:", { provinceName, districtName, subdistrictName });

      // คำนวณพิกัดและ zoom level สำหรับแผนที่
      const locationData = getLocationCoordinates(provinceName, districtName, subdistrictName);
      console.log("📍 Calculated location data:", locationData);

      // อัปเดตพิกัดและ zoom level ของแผนที่
      setMapCenter(locationData.center);
      setMapZoom(locationData.zoom);

      // บันทึกข้อมูลสำหรับการค้นหา
      setPendingLocationData({
        provinceName,
        districtName,
        subdistrictName,
        land_id
      });

      // หา ID ของจังหวัดจากชื่อ
      const foundProvince = provinces.find(p =>
        p.name_th?.toLowerCase().includes(provinceName.toLowerCase()) ||
        provinceName.toLowerCase().includes(p.name_th?.toLowerCase())
      );

      console.log("🔍 Province search result:", foundProvince);
      console.log("🔍 Province search criteria:", provinceName);

      if (foundProvince) {
        console.log("✅ Found province:", foundProvince);

        // เซ็ตจังหวัดและรีเซ็ตอำเภอ/ตำบล
        setFormData((prev) => ({
          ...prev,
          land_id: land_id,
          province_id: String(foundProvince.ID),
          district_id: "",
          subdistrict_id: ""
        }));
      } else {
        console.log("Province not found:", provinceName);
        setFormData((prev) => ({
          ...prev,
          land_id: land_id,
          province_id: "",
          district_id: "",
          subdistrict_id: ""
        }));
      }
    } else {
      setPendingLocationData(null);
      setFormData((prev) => ({
        ...prev,
        land_id: land_id
      }));
    }

    console.log("Selected land token:", tokenID, "Mapped land_id:", land_id);
  } catch (err) {
    setPendingLocationData(null);
    setFormData((prev) => ({
      ...prev,
      land_id: tokenID // fallback
    }));
    console.error("Error mapping land_id:", err);
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

  // useEffect สำหรับจัดการข้อมูลที่อยู่จาก blockchain เมื่อ districts โหลดเสร็จ
  useEffect(() => {
    console.log("🏘️ Districts useEffect triggered:", { pendingLocationData, districtsCount: districts.length });
    
    if (!pendingLocationData || !districts.length) return;

    const { districtName } = pendingLocationData;
    
    console.log("🔍 Searching for district:", districtName);
    console.log("🏘️ Available districts:", districts.map(d => ({ id: d.ID, name: d.name_th })));

    // Normalize ชื่อสำหรับการเปรียบเทียบ
    const normalizeText = (text: string) => {
      return text.toLowerCase()
        .replace(/อำเภอ/g, '')
        .replace(/เมือง/g, '')
        .replace(/\s+/g, '')
        .trim();
    };

    const normalizedDistrictName = normalizeText(districtName);
    console.log("🔍 Normalized district name:", normalizedDistrictName);

    // ค้นหาอำเภอด้วยวิธีต่างๆ
    const foundDistrict = districts.find(d => {
      if (!d.name_th) return false;
      
      const normalizedDbName = normalizeText(d.name_th);
      
      // ตรวจสอบการตรงกันแบบต่างๆ
      return (
        d.name_th === districtName || // ตรงทุกตัวอักษร
        normalizedDbName === normalizedDistrictName || // ตรงหลัง normalize
        normalizedDbName.includes(normalizedDistrictName) || // มีส่วนที่ตรง
        normalizedDistrictName.includes(normalizedDbName) // ชื่อใน blockchain มีส่วนที่ตรงกับฐานข้อมูล
      );
    });

    if (foundDistrict) {
      console.log("✅ Found district:", foundDistrict);
      
      // เซ็ตอำเภอ
      setFormData((prev) => ({
        ...prev,
        district_id: String(foundDistrict.ID)
      }));
    } else {
      console.log("❌ District not found:", districtName);
      console.log("🔍 Available district names:", districts.map(d => d.name_th));
    }
  }, [districts, pendingLocationData]);

  // useEffect สำหรับจัดการข้อมูลที่อยู่จาก blockchain เมื่อ subdistricts โหลดเสร็จ
  useEffect(() => {
    console.log("🏞️ Subdistricts useEffect triggered:", { pendingLocationData, subdistrictsCount: subdistricts.length });
    
    if (!pendingLocationData || !subdistricts.length) return;

    const { subdistrictName } = pendingLocationData;
    
    console.log("🔍 Searching for subdistrict:", subdistrictName);
    console.log("🏞️ Available subdistricts:", subdistricts.map(s => ({ id: s.ID, name: s.name_th })));

    // Normalize ชื่อสำหรับการเปรียบเทียบ
    const normalizeText = (text: string) => {
      return text.toLowerCase()
        .replace(/ตำบล/g, '')
        .replace(/แขวง/g, '')
        .replace(/เขต/g, '')
        .replace(/\s+/g, '')
        .trim();
    };

    const normalizedSubdistrictName = normalizeText(subdistrictName);
    console.log("🔍 Normalized subdistrict name:", normalizedSubdistrictName);

    // ค้นหาตำบลด้วยวิธีต่างๆ
    const foundSubdistrict = subdistricts.find(s => {
      if (!s.name_th) return false;
      
      const normalizedDbName = normalizeText(s.name_th);
      
      // ตรวจสอบการตรงกันแบบต่างๆ
      return (
        s.name_th === subdistrictName || // ตรงทุกตัวอักษร
        normalizedDbName === normalizedSubdistrictName || // ตรงหลัง normalize
        normalizedDbName.includes(normalizedSubdistrictName) || // มีส่วนที่ตรง
        normalizedSubdistrictName.includes(normalizedDbName) // ชื่อใน blockchain มีส่วนที่ตรงกับฐานข้อมูล
      );
    });

    if (foundSubdistrict) {
      console.log("✅ Found subdistrict:", foundSubdistrict);
      
      // เซ็ตตำบล
      setFormData((prev) => ({
        ...prev,
        subdistrict_id: String(foundSubdistrict.ID)
      }));

      // เคลียร์ pending data เมื่อเสร็จสิ้น
      setPendingLocationData(null);
    } else {
      console.log("❌ Subdistrict not found:", subdistrictName);
      console.log("🔍 Available subdistrict names:", subdistricts.map(s => s.name_th));
      setPendingLocationData(null);
    }
  }, [subdistricts, pendingLocationData]);

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

// useEffect สำหรับอัปเดตแผนที่เมื่อเปลี่ยน dropdown
useEffect(() => {
  console.log("🔄 Dropdown useEffect triggered with:", { 
    province_id: formData.province_id, 
    district_id: formData.district_id, 
    subdistrict_id: formData.subdistrict_id 
  });

  const updateMapFromDropdown = () => {
    let provinceName = "";
    let districtName = "";
    let subdistrictName = "";

    // หาชื่อจังหวัด
    if (formData.province_id) {
      const selectedProvince = provinces.find(p => String(p.ID) === String(formData.province_id));
      provinceName = selectedProvince?.name_th || "";
      console.log("📍 Found province:", provinceName);
    }

    // หาชื่ออำเภอ
    if (formData.district_id) {
      const selectedDistrict = districts.find(d => String(d.ID) === String(formData.district_id));
      districtName = selectedDistrict?.name_th || "";
      console.log("🏘️ Found district:", districtName);
    }

    // หาชื่อตำบล
    if (formData.subdistrict_id) {
      const selectedSubdistrict = subdistricts.find(s => String(s.ID) === String(formData.subdistrict_id));
      subdistrictName = selectedSubdistrict?.name_th || "";
      console.log("🏞️ Found subdistrict:", subdistrictName);
    }

    // อัปเดตแผนที่หากมีการเลือกจังหวัดอย่างน้อย
    if (provinceName) {
      const { center, zoom } = getLocationCoordinates(provinceName, districtName, subdistrictName);
      console.log("🗺️ Updating map from dropdown:", { provinceName, districtName, subdistrictName, center, zoom });
      console.log("🎯 Setting mapCenter to:", center);
      console.log("🔍 Setting mapZoom to:", zoom);
      
      setMapCenter(center);
      setMapZoom(zoom);
    } else {
      console.log("❌ No province selected, skipping map update");
    }
  };

  updateMapFromDropdown();
}, [formData.province_id, formData.district_id, formData.subdistrict_id, provinces, districts, subdistricts]);


// 
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    // ดึง user_id จาก wallet
    const fetchUserId = async () => {
      try {
        // import ให้ถูกต้องตามที่ใช้จริง
        // @ts-ignore
        const result = await GetUserIDByWalletAddress();
          setCurrentUserId(result.user_id);
      } catch (error) {
        console.error("Error calling GetUserIDByWalletAddress:", error);
      }
    };
    fetchUserId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

      // สร้าง object เก็บ error
      const newErrors: any = {};

      if (!formData.province_id) newErrors.province_id = "กรุณาเลือกจังหวัด";
      if (!formData.district_id) newErrors.district_id = "กรุณาเลือกอำเภอ";
      if (!formData.subdistrict_id) newErrors.subdistrict_id = "กรุณาเลือกตำบล";
      if (mapCoords.length < 3) newErrors.mapCoords = "เลือกอย่างน้อย 3 จุดเพื่อขึ้นรูปพื้นที่";

      setErrors(newErrors); // อัปเดต state เพื่อให้ JSX แสดงข้อความแดง

      if (Object.keys(newErrors).length > 0) {
        setLoading(false);
        return; // หยุดการ submit
      }

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        name: formData.name,
        price: Number(formData.price),
        province_id: Number(formData.province_id),
        district_id: Number(formData.district_id),
        subdistrict_id: Number(formData.subdistrict_id),
        land_id: Number(formData.land_id),
        user_id: Number(currentUserId),
        locations: mapCoords.map((c, i) => ({
          sequence: i + 1,
          latitude: c.lat,
          longitude: c.lng,
        })),
        tag_id: formData.tag_id,
        images: images, // array ของ base64
      };

      await CreateLandPost(payload);


      // 1) สร้างโพสต์
      console.log("Submitting payload:", payload);
      const created = await CreateLandPost(payload);
      const newId =
        created?.ID ?? created?.id ?? created?.data?.ID ?? created?.data?.id;

      // 2) บันทึกพิกัด (ถ้ามี ≥ 3 จุด) ผูกกับ landsalepost_id ที่เพิ่งได้
      if (newId && mapCoords.length >= 3) {
        await saveLocations(Number(newId), mapCoords);
      }

      message.success("✅ โพสต์ขายที่ดินสำเร็จ!");

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



  return (
    <>
      <style>{`
        .request-sell-container {
          font-family: 'Inter', sans-serif;
        }
        
        .main-container1 {
          max-width: 100%;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
      fontFamily: "'Inter', sans-serif",
      position: "relative"
    }}>
      {/* Loading overlay removed as requested */}
      {/* Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #2b423a 0%, #1f3b33 100%)",
        boxShadow: "0 4px 6px -1px rgba(23, 46, 37, 0.1)", 
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem 1.5rem" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "800", 
            color: "#ffffff", 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem",
            margin: 0,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
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
            color: "rgba(255, 255, 255, 0.9)", 
            fontSize: "1.1rem", 
            margin: "8px 0 0 0",
            fontWeight: "500"
          }}>
            โพสต์ขายที่ดินของคุณอย่างง่ายดายและปลอดภัย
          </p>
        </div>
      </div>

      {/* Progress Steps ข้างบน*/}
      <div style={{ maxWidth: "1500px", padding: "1rem 1rem" }}>
        <div style={{
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "3rem",
          marginLeft:"100px",
          marginRight:"100px",
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
      </div>

      {/* Step 1: Land Selection ขนาด */}
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
                                      const deedNo = land.meta?.["TitleDeedNumber"] || land.meta?.["TitleDeedNumber"] || "-";
                                      const m = land.meta || {};
                                      const map = m["SurveyNumber"] ?? "-";
                                      const landNo = m["LandNumber"] ?? "-";
                                      const surveyPage = m["SurveyPage"] ?? "-";
                                      const subdistrict = m["Subdistrict"] ?? "-";
                                      const district = m["District"] ?? "-";
                                      const province = m["Province"] ?? "-";
                                      const rai = m["Rai"] ?? "-";
                                      const ngan = m["Ngan"] ?? "-";
                                      const sqwa = m["SqWa"] ?? "-";
                                      const book = m["Volume"] ?? "-";
                                      const page = m["Page"] ?? "-";

                                      const available = isZeroAddress(land.buyer); // true = ว่างขาย
                                      const isSelected = selectedLand === land.tokenID;

                                      return (
                                        <div
                                          key={land.tokenID ?? index}
                                          style={{
                                            pointerEvents: 'auto',
                                            opacity: available ? 1 : 0.5,
                                            filter: available ? 'none' : 'grayscale(0.5)',
                                            marginBottom: 8,
                                          }}
                                          onClick={() => {
                                            if (!available) {
                                              message.warning('ที่ดินนี้เคยโพสต์ไปแล้ว');
                                            }
                                          }}
                                        >
                                          <Card
                                            title={<span style={{ fontSize: 13, fontWeight: 700 }}>โฉนด #{deedNo}</span>}
                                            size="small"
                                            hoverable={available}
                                            bordered
                                            onClick={available ? () => handleSelectLand(String(land.tokenID)) : undefined}
                                            className="cursor-pointer transition-all"
                                            style={{
                                              borderColor: isSelected ? "#1677ff" : undefined,
                                              boxShadow: isSelected ? "0 4px 12px rgba(22,119,255,.2)" : undefined,
                                              borderRadius: 6,
                                              background: available ? undefined : '#f5f5f5',
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
                                            {!available && (
                                              <div style={{ color: '#b91c1c', fontWeight: 600, marginTop: 8, fontSize: 13 }}>
                                                ที่ดินนี้ถูกโพสต์ขายแล้ว
                                              </div>
                                            )}
                                          </Card>
                                        </div>
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
                  {/* Show selected deed number only once above the grid */}
                  {selectedLand && (() => {
                    const land = landMetadata.find((l: any) => String(l.tokenID) === String(selectedLand));
                    const deedNo = land?.meta?.["TitleDeedNumber"] || land?.meta?.["TitleDeedNumber"] || "-";
                    return (
                      <div style={{ marginBottom: 12, textAlign: "center" }}>
                        <span style={{ color: "#1677ff", fontWeight: 600, fontSize: "1.1rem" }}>
                          คุณเลือกโฉนด{deedNo}
                        </span>
                      </div>
                    );
                  })()}
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
                    onClick={() => selectedLand && setCurrentStep(2)}
                    disabled={!selectedLand}
                    style={{
                      ...styles.button.primary,
                      fontSize: "1.1rem",
                      padding: "1rem 2.5rem",
                      opacity: !selectedLand ? 0.5 : 1,
                      cursor: !selectedLand ? "not-allowed" : "pointer"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLand) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(111, 150, 155, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLand) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(111, 150, 155, 0.3)";
                      }
                    }}
                  >
                    {selectedLand ? "ถัดไป →" : "เลือกโฉนดที่ดินก่อน"}
                  </button>
                </div>
              </div>
      )}
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
            {/* ชื่อ */}
            <div>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
                ชื่อ
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                  width: "1.25rem", height: "1.25rem", color: "#6F969B", zIndex: 1 }} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: "3.5rem" }}
                  placeholder="กรอกชื่อ"
                />
              </div>
              {errors.firstName && (
                <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* นามสกุล */}
            <div>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
                นามสกุล
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                  width: "1.25rem", height: "1.25rem", color: "#6F969B", zIndex: 1 }} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: "3.5rem" }}
                  placeholder="กรอกนามสกุล"
                />
              </div>
              {errors.lastName && (
                <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
                เบอร์โทรศัพท์
              </label>
              <div style={{ position: "relative", maxWidth: "330px", width: "100%" }}>
                <Phone style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                  width: "1.25rem", height: "1.25rem", color: "#6F969B", zIndex: 1 }} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    // อนุญาตเฉพาะตัวเลข
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phoneNumber: value });
                  }}
                  style={{ ...styles.input, paddingLeft: "3.5rem", width: "100%" }}
                  placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                  maxLength={10} // จำกัดความยาวสูงสุด
                />
              </div>
              {errors.phoneNumber && (
                <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* ปุ่มถัดไป & ย้อนกลับ */}
                    {/* ปุ่มย้อนกลับ & ถัดไป */}
          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setCurrentStep(1)} style={styles.button.secondary}>← ย้อนกลับ</button>
            <button
                onClick={() => {
                  let newErrors = {
                    firstName: "",
                    lastName: "",
                    phoneNumber: "",
                    images: "",
                    name: "",
                    price: "",
                    tag_id: "",
                    province_id: "",
                    district_id: "",
                    subdistrict_id: "",
                    mapCoords: ""
                  };
                  let valid = true;

                  if (!formData.firstName.trim()) {
                    newErrors.firstName = "กรุณากรอกชื่อ";
                    valid = false;
                  }
                  if (!formData.lastName.trim()) {
                    newErrors.lastName = "กรุณากรอกนามสกุล";
                    valid = false;
                  }
                  if (!formData.phoneNumber.trim()) {
                    newErrors.phoneNumber = "กรุณากรอกเบอร์โทรศัพท์";
                    valid = false;
                  } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
                    newErrors.phoneNumber = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก";
                    valid = false;
                  }

                  setErrors(newErrors);

                  if (valid) {
                    setCurrentStep(3);
                  }
                }}
              style={styles.button.primary}
            >
              ถัดไป →
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div style={{ ...styles.card, padding: "3rem", marginTop: "1rem" }}>
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
          <p style={{ color: "#3F5658", marginBottom: "2rem", fontSize: "1.1rem", lineHeight: "1.6", fontWeight: "500" }}>
            เพิ่มรูปภาพและข้อมูลรายละเอียดของที่ดินที่ต้องการขาย
          </p>

          {/* รูปที่ดิน */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "1rem", display: "block" }}>
              รูปที่ดิน
            </label>
            <div style={{
              border: `2px dashed ${errors.images ? "red" : "#6F969B"}`,
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              marginBottom: "0.5rem"
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
            </div>
            {errors.images && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.images}</p>}

            {images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: "relative", background: "#fff", borderRadius: "12px", padding: "8px", boxShadow: "0 4px 12px rgba(23,46,37,0.1)", border: "1px solid #e2e8f0" }}>
                    <img src={img} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "120px", borderRadius: "8px", objectFit: "cover", marginBottom: "8px" }} />
                    <Button size="small" danger onClick={() => setImages(images.filter((_, i) => i !== idx))} style={{ width: "100%", borderRadius: "8px" }}>
                      ลบ
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ชื่อและราคา */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
                ชื่อที่ดิน
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "1.25rem", height: "1.25rem", color: "#6F969B", zIndex: 1 }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "3.5rem",
                    borderColor: errors.name ? "red" : undefined
                  }}
                  placeholder="กรอกชื่อที่ดิน"
                />
              </div>
              {errors.name && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
                ราคา (บาท)
              </label>
              <div style={{ position: "relative" }}>
                <DollarSign style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "1.25rem", height: "1.25rem", color: "#6F969B", zIndex: 1 }} />
                <input
                  type="number"
                  name="price"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "3.5rem",
                    borderColor: errors.price ? "red" : undefined
                  }}
                  placeholder="กรอกราคา"
                />
              </div>
              {errors.price && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.price}</p>}
            </div>
          </div>

          {/* แท็ก */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
              คุณสมบัติที่ดิน
            </label>
            <Select
              mode="multiple"
              allowClear
              value={formData.tag_id}
              onChange={(values) => setFormData({ ...formData, tag_id: values })}
              style={{ width: "100%", borderRadius: "12px", borderColor: errors.tag_id ? "red" : undefined }}
              placeholder="เลือกคุณสมบัติที่ดิน (ได้หลายข้อ)"
              options={tags.map(t => ({ value: t.id, label: t.Tag }))}
              size="large"
            />
            {errors.tag_id && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.tag_id}</p>}
          </div>

          {/* ปุ่มย้อนกลับ & ถัดไป */}
          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setCurrentStep(2)} style={styles.button.secondary}>← ย้อนกลับ</button>
            <button
              onClick={() => {
                // Ensure newErrors matches the shape of errors state
                let newErrors = {
                  firstName: "",
                  lastName: "",
                  phoneNumber: "",
                  images: "",
                  name: "",
                  price: "",
                  tag_id: "",
                  province_id: "",
                  district_id: "",
                  subdistrict_id: "",
                  mapCoords: ""
                };
                let valid = true;

                if (images.length === 0) { newErrors.images = "กรุณาอัปโหลดรูปที่ดิน"; valid = false; }
                if (!formData.name.trim()) { newErrors.name = "กรุณากรอกชื่อที่ดิน"; valid = false; }
                if (!formData.price || Number(formData.price) <= 0) { newErrors.price = "กรุณากรอกราคามากกว่า 0"; valid = false; }
                if (!formData.tag_id || formData.tag_id.length === 0) { newErrors.tag_id = "กรุณาเลือกคุณสมบัติที่ดิน"; valid = false; }

                // The rest fields are not required in this step, but keep shape for type safety
                setErrors(newErrors);

                if (valid) setCurrentStep(4);
              }}
              style={styles.button.primary}
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

          {selectedLand && (
            <div style={{
              background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
              border: "1px solid #93c5fd",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "2rem",
              fontSize: "0.95rem",
              color: "#1e40af",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <span style={{ fontSize: "1.2rem" }}>💡</span>
              <span>
                <strong>ข้อมูลจากโฉนดที่ดิน:</strong> ระบบได้ดึงข้อมูลจังหวัด อำเภอ ตำบล จากโฉนดที่ดินที่คุณเลือกมาใส่ให้โดยอัตโนมัติแล้ว คุณสามารถแก้ไขได้หากต้องการ
              </span>
            </div>
          )}

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "2rem",
            marginBottom: "2rem"
          }}>
            {/* จังหวัด */}
            <div>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
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
              {errors.province_id && (
                <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {errors.province_id}
                </p>
              )}
            </div>

            {/* อำเภอ */}
            <div>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
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
              {errors.district_id && (
                <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {errors.district_id}
                </p>
              )}
            </div>

            {/* ตำบล */}
            <div>
              <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "0.75rem", display: "block" }}>
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
              {errors.subdistrict_id && (
                <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {errors.subdistrict_id}
                </p>
              )}
            </div>
          </div>

          {/* แผนที่ */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ fontSize: "1rem", fontWeight: "600", color: "#172E25", marginBottom: "1rem", display: "block" }}>
              แผนที่ตำแหน่ง
            </label>
            {pendingLocationData && (
              <div style={{
                background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                border: "1px solid #93c5fd",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                color: "#1e40af",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <span style={{ fontSize: "1.2rem" }}>📍</span>
                <div>
                  <strong>แผนที่ได้ซูมไปยังตำแหน่ง:</strong>{" "}
                  {pendingLocationData.subdistrictName && `${pendingLocationData.subdistrictName} `}
                  {pendingLocationData.districtName && `${pendingLocationData.districtName} `}
                  {pendingLocationData.provinceName}
                  <br />
                  <small>สามารถมาร์คจุดรอบๆ พื้นที่นี้เพื่อระบุขอบเขตที่ดินได้เลย</small>
                </div>
              </div>
            )}

            <div style={{
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              border: "2px solid #e2e8f0",
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "0.25rem",
              position: "relative"
            }}>
              <MapPicker 
                value={mapCoords} 
                onChange={setMapCoords} 
                height={500} 
                center={mapCenter}
                zoom={mapZoom}
              />
            </div>
            {errors.mapCoords && (
              <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {errors.mapCoords}
              </p>
            )}

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