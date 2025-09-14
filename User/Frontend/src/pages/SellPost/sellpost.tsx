import React, { useEffect, useState } from "react";
import { Select, Upload, message, Form, Button, Card, Row, Col, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { MapPin, Check, Phone, User, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetTags,CreateLandPost, getLandtitleIdByTokenId } from "../../service/https/jib/jib";
import { ethers } from "ethers";
import { GetInfoUserByToken, GetLandTitleInfoByWallet, GetLandMetadataByToken } from "../../service/https/bam/bam";
import { GetAllProvinces, GetDistrict, GetSubdistrict, } from "../../service/https/garfield/http";

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
  const [tags, setTags] = useState<Tag[]>([]);
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<ProvinceDTO[]>([]);
  const [districts, setDistricts] = useState<DistrictDTO[]>([]);
  const [subdistricts, setSubdistricts] = useState<SubdistrictDTO[]>([]);
  const [image, setImage] = useState<string>("");
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    name: "",
    price: "",
    tag_id: "",
    image: "",
    province_id: "",
    district_id: "",
    subdistrict_id: "",
    landtitle_id: "",
	  user_id: "",
  });

    useEffect(() => {
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

    // ฟังก์ชันอัปโหลดรูป
const handleUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    messageApi.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น");
    return false;
  }

  // ใช้ FileReader แปลงเป็น Data URL
  const reader = new FileReader();
  reader.onload = () => {
    // เซต state เมื่ออ่านไฟล์เสร็จแล้ว
    setFormData((prev) => ({
      ...prev,
      image: reader.result as string, // ใช้ Data URL ที่ได้จาก FileReader
    }));
  };
  reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL

  return false; // ถ้าใช้กับ Ant Design Upload
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
      // Map ให้เป็น { id, Tag, icon }
      const mappedTags = (tagsData || []).map((tag: any) => ({
        id: tag.ID,         // ✅ ใช้ ID จาก backend
        Tag: tag.Tag,
        icon: tag.icon || "", // ถ้าไม่มี icon ให้เป็น ""
      }));
      setTags(mappedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };
  fetchTags();
}, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // ตรวจสอบข้อมูลจังหวัด/อำเภอ/ตำบล
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
  image: formData.image,
  price: Number(formData.price),
  province_id: Number(formData.province_id),
  district_id: Number(formData.district_id),
  subdistrict_id: Number(formData.subdistrict_id),
  tag_id: Number(formData.tag_id),
  landtitle_id: Number(formData.landtitle_id),
  user_id: Number(userId),
};

    await CreateLandPost(payload);

    message.success("✅ โพสต์ขายที่ดินสำเร็จ!");
    setCurrentStep(2);

    setTimeout(() => {
      navigate("/user/sellpostmain");
    }, 2000);
  } catch (error) {
    message.error("❌ เกิดข้อผิดพลาด: " + (error || "ไม่ทราบสาเหตุ"));
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #cce7ff, #ffffff, #d9f5d0)" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#ffffff", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "1.5rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#4a4a4a", display: "flex", alignItems: "center", gap: "1rem" }}>
            🏡 ประกาศขายที่ดิน
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          {steps.map((step, index) => (
            <div key={step.number} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", color: currentStep >= step.number ? "#007bff" : "#a0a0a0" }}>
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem",
                    backgroundColor: currentStep >= step.number ? "#e0f7ff" : "#f0f0f0",
                    color: currentStep >= step.number ? "#007bff" : "#a0a0a0",
                    border: currentStep >= step.number ? "2px solid #007bff" : "2px solid #f0f0f0"
                  }}
                >
                  {step.icon}
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: "5rem",
                    height: "2px",
                    margin: "0 1rem",
                    backgroundColor: currentStep > step.number ? "#007bff" : "#e0e0e0"
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
              <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
                
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  📋 ตรวจสอบโฉนดที่ดินของคุณ
                </h2>
                <p style={{ color: "#616161", marginBottom: "1.5rem" }}>
                  เลือกโฉนดที่ดินที่คุณต้องการประกาศขายจากรายการด้านล่างนี้:</p>

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
            {/*<h4 style={{ margin: 0, fontSize: "15px" }}>โฉนด Token #{tokenId}</h4>*/}
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

                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setCurrentStep(2)}
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
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue from Step 2: Personal Information */}
      {currentStep === 2 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            👤 ข้อมูลส่วนตัว
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>ชื่อ</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกชื่อ"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>นามสกุล</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>เบอร์โทรศัพท์</label>
              <div style={{ position: "relative" }}>
                <Phone style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#e0e0e0",
                color: "#616161",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={() => setCurrentStep(3)}
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
              ถัดไป
            </button>
          </div>
        </div>
      )}
      {currentStep === 3 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            🏞️ รายละเอียดที่ดิน
          </h2>

        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem", display: "block" }}>
            รูปที่ดิน
          </label>
          <Upload
            beforeUpload={handleUpload}
            listType="picture"
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>อัปโหลดรูปภาพ</Button>
          </Upload>

          {formData.image && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <img src={formData.image} alt="Preview" style={{ maxWidth: "100%", borderRadius: "1rem", maxHeight: 300, objectFit: "cover" }}/>
            </div>
          )}
        </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>ชื่อที่ดิน</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกชื่อที่ดิน"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>ราคา (บาท)</label>
              <div style={{ position: "relative" }}>
                <DollarSign style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="number"
                  name="price"
                  step="1" // ✅ ไม่ให้กรอกทศนิยม
                  value={formData.price}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกราคา"
                />
              </div>
            </div>

            <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>คุณสมบัติที่ดิน</label>
<Select
  value={formData.tag_id || undefined}
  onChange={value => setFormData({ ...formData, tag_id: value })}
  style={{ width: "100%", borderRadius: "1rem", marginBottom: "1rem" }}
  placeholder="เลือกคุณสมบัติที่ดิน"
>
  <Select.Option value="" disabled>
    -- เลือกคุณสมบัติที่ดิน --
  </Select.Option>
  {tags.map(tag => (
    <Select.Option key={tag.id} value={tag.id}>
      {tag.Tag}
    </Select.Option>
  ))}
</Select>



          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(2)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#e0e0e0",
                color: "#616161",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={() => setCurrentStep(4)}
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
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Location */}
      {currentStep === 4 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            📍 ตำแหน่งที่ตั้ง
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#616161", marginBottom: "0.5rem" }}>
                จังหวัด
              </label>
                <select
                  name="province_id"
                  value={formData.province_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">
                    {loadingP ? "กำลังโหลด..." : "-- เลือกจังหวัด --"}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.ID} value={String(p.ID)}> {/* ใช้ province.ID แทนชื่อจังหวัด */}
                      {p.name_th}
                    </option>
                  ))}
                </select>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#616161", marginBottom: "0.5rem" }}>
                อำเภอ
              </label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  className="input"
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
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#616161", marginBottom: "0.5rem" }}>
                ตำบล
              </label>
                <select
                  name="subdistrict_id"
                  value={formData.subdistrict_id}
                  onChange={handleChange}
                  className="input"
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


          <div style={{ marginTop: "1.5rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>แผนที่ตำแหน่ง</label>
            <div
              style={{
                backgroundColor: "#f0f0f0",
                borderRadius: "1rem",
                height: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MapPin style={{ width: "3rem", height: "3rem", color: "#9e9e9e" }} />
              <p style={{ color: "#616161", textAlign: "center" }}>
                คลิกเพื่อเลือกตำแหน่งบนแผนที่</p>
            </div>
          </div>  

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(3)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#e0e0e0",
                color: "#616161",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#28a745",
                color: "#ffffff",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              โพสต์ประกาศ
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
  );
};

export default SellPost;
