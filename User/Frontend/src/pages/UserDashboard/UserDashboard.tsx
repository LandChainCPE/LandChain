import "./UserDashboard.css";
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GetUserinfoByID, GetLandtitlesByUser } from "../../service/https/garfield/http";
import { Table, Tag, Card as AntCard, Row, Col, Statistic, Empty } from "antd";
import { FileTextOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, } from "@ant-design/icons";
import { GetAllPetition } from "../../service/https/jib/jib";
import { UserCheck, CheckSquare } from "react-feather"; // Assuming 'react-feather' contains the User and Home icons
import { GetLandTitleInfoByWallet, GetLandMetadataByToken } from "../../service/https/bam/bam";
import Navbar from "../../component/user/Navbar";

/* =======================
   Icon Components (SVG)
   ======================= */

const FileText = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);
const ShieldCheck = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const Wallet = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
const BadgeCheck = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const MapPin = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LoadingSpinner = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', ...style }}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

/* =======================
   Lightweight Primitives
   ======================= */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`lcCard ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="lcCardHeader">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="lcCardTitle">{children}</h2>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="lcCardDescription">{children}</p>
);
const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`lcCardContent ${className}`}>{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  style,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : variant === "danger" ? "btn-danger" : "btn-ghost"} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

/* ============ Types ============ */
type TitleStatus = "active" | "encumbered" | "under_review";
interface LandTitle {
  tokenId?: string;
  landNo?: string;
  location?: string;
  area?: string;
  contract?: string;
  status?: TitleStatus;
  // เพิ่ม fields ที่อาจมาจาก API
  id?: string | number;
  title_no?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  size?: string;
  contract_address?: string;
}
interface State {
  id: number;
  name: string;
  color: string;
}
interface Petition {
  ID: number;
  first_name: string;
  last_name: string;
  topic: string;
  date: string;
  description: string;
  State: State | null;
}

/* ===== Helpers ===== */
const StatusPill = ({ status }: { status: TitleStatus }) => {
  const label = status === "active" ? "พร้อมใช้งาน" : status === "encumbered" ? "มีภาระผูกพัน" : "รอตรวจสอบ";
  return <span className={`badge ${status === "active" ? "badge-green" : status === "encumbered" ? "badge-amber" : "badge-slate"}`}>{label}</span>;
};



const StatCard = ({ title, value, sub }: { title: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode }) => (
  <div className="lcCard lcStatCard">
    <div className="lcCardContent">
      <div className="lcStatTitle">{title}</div>
      <div className="lcStatValue">{value}</div>
      {sub && <div className="lcStatSub">{sub}</div>}
    </div>
  </div>
);

/* ===================================================
   UserProfilePage (CLEAN LAYOUT)
   =================================================== */
export default function UserProfilePage() {
  // State สำหรับ user info
  const [userInfo, setUserInfo] = useState<{ firstName?: string; lastName?: string; email?: string; user_verification_id?: number }>({});
  const [titles, setTitles] = useState<LandTitle[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingTitles, setIsLoadingTitles] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [titlesError, setTitlesError] = useState<string | null>(null);
  useEffect(() => {
    const user_id = localStorage.getItem("user_id") || "";
    console.log("User id:", user_id);
    if (user_id) {
      setIsLoadingUser(true);
      setUserError(null);
      GetUserinfoByID(user_id).then(({ result }) => {
        if (result && (result.firstName || result.lastName || result.email)) {
          setUserInfo({
            firstName: result.firstName || "",
            lastName: result.lastName || "",
            email: result.email || "",
            user_verification_id: result.user_verification_id || 0,
          });
          // อัปเดต localStorage ให้ตรงกับ backend
          // localStorage.setItem("firstName", result.firstName || "");
          // localStorage.setItem("lastName", result.lastName || "");
          // localStorage.setItem("email", result.email || "");
          // localStorage.setItem("user_verification_id", result.user_verification_id ? String(result.user_verification_id) : "0");
        } else {
          console.log("No user data found or invalid format");
          setUserError("ไม่พบข้อมูลผู้ใช้");
        }
      }).catch((error) => {
        console.error("Failed to fetch user info:", error);
        setUserError("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
      }).finally(() => {
        setIsLoadingUser(false);
      });
    } else {
      console.log("No user_id found in localStorage");
      setUserError("ไม่พบ User ID");
      setIsLoadingUser(false);
    }
  }, []);

  // ---------- Titles stats ----------
  // State สำหรับจำนวนที่ดินจาก backend
  const [totalLandCount, setTotalLandCount] = useState<number>(0);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id") || "";
    if (user_id) {
      GetLandtitlesByUser(user_id).then((res) => {
        if (Array.isArray(res)) {
          setTotalLandCount(res.length);
        } else if (res?.result && Array.isArray(res.result)) {
          setTotalLandCount(res.result.length);
        } else {
          setTotalLandCount(0);
        }
      }).catch(() => setTotalLandCount(0));
    } else {
      setTotalLandCount(0);
    }
  }, []);

  // State สำหรับจำนวนที่ดินที่ยังไม่ verify จาก backend
  const [notverifyCount, setNotverifyCount] = useState<number>(0);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id") || "";
    if (user_id) {
      GetLandtitlesByUser(user_id).then((res) => {
        let arr = Array.isArray(res) ? res : (res?.result && Array.isArray(res.result) ? res.result : []);
        // รองรับทั้ง Status_verify และ status_verify
        const count = arr.filter((item: any) => item.Status_verify === false || item.status_verify === false).length;
        setNotverifyCount(count);
      }).catch(() => setNotverifyCount(0));
    } else {
      setNotverifyCount(0);
    }
  }, []);

  const active = useMemo(() => {
    if (isLoadingTitles) return 0;
    return titles.filter(t => t.status === "active").length;
  }, [titles, isLoadingTitles]);

  const navigate = useNavigate();

  const handleRegisterLandClick = () => {
    navigate('/user/userregisland');
  };
  useEffect(() => {
    console.log("User info:", userInfo);
  }, [userInfo]);

  // ---------- Petitions ----------
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loadingPetition, setLoadingPetition] = useState(false);
  useEffect(() => {
    const fetchPetitions = async () => {
      setLoadingPetition(true);
      try {
        const response = await GetAllPetition();
        setPetitions(response);
      } catch {
        // noop
      } finally {
        setLoadingPetition(false);
      }
    };
    fetchPetitions();
  }, []);

  const getStatusIcon = (state?: State | null) => {
    switch (state?.name) {
      case "รอตรวจสอบ":
        return <ClockCircleOutlined />;
      case "อนุมัติแล้ว":
        return <CheckCircleOutlined />;
      case "กำลังดำเนินการ":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const petitionColumns = [
    {
      title: "เลขคำร้อง",
      dataIndex: "ID",
      key: "ID",
      width: 120,
      render: (id: number) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>#{id}</Tag>
      ),
    },
    { title: "ชื่อ", dataIndex: "first_name", key: "first_name" },
    { title: "นามสกุล", dataIndex: "last_name", key: "last_name" },
    { title: "เรื่อง", dataIndex: "topic", key: "topic" },
    { title: "รายละเอียด", dataIndex: "description", key: "description" },
    {
      title: "วันที่ยื่น",
      dataIndex: "date",
      key: "date",
      width: 130,
      render: (date: string) => {
        const formattedDate = date
          ? new Date(date).toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })
          : "ไม่ระบุวันที่";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarOutlined style={{ color: "#8c8c8c" }} />
            <span>{formattedDate}</span>
          </div>
        );
      },
    },
    {
      title: "สถานะ",
      key: "status",
      width: 150,
      render: (record: Petition) => {
        const state = record.State;
        const color = state?.color || "default";
        const statusName = state?.name || "ไม่ระบุสถานะ";
        return (
          <Tag color={color} icon={getStatusIcon(state)} style={{ borderRadius: 16, padding: "4px 12px", fontWeight: 600 }}>
            {statusName}
          </Tag>
        );
      },
    },
  ];
  useEffect(() => {
    console.log("User info:", userInfo);
  }, [userInfo]);

  // ฟังก์ชันเชื่อมต่อ MetaMask และบันทึก wallet address
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          localStorage.setItem("wallet", accounts[0]);
          setWallet(accounts[0]);
          setTitlesError(null);
          fetchLandTitlesFromBlockchain(accounts[0]);
        }
      } catch (err) {
        setTitlesError("เชื่อมต่อ MetaMask ไม่สำเร็จ");
      }
    } else {
      setTitlesError("ไม่พบ MetaMask ในเบราว์เซอร์");
    }
  };

  // State สำหรับ wallet address
  const [wallet, setWallet] = useState<string>(localStorage.getItem("wallet") || "");

  // ฟังก์ชันดึงข้อมูลที่ดินจาก blockchain
  const fetchLandTitlesFromBlockchain = async (walletAddr?: string) => {
    setIsLoadingTitles(true);
    setTitlesError(null);
    let walletToUse = walletAddr || wallet || localStorage.getItem("wallet") || "";
    if (!walletToUse && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        walletToUse = accounts[0] || "";
        if (walletToUse) {
          localStorage.setItem("wallet", walletToUse);
          setWallet(walletToUse);
        }
      } catch { }
    }
    if (!walletToUse) {
      setTitlesError("ไม่พบ Wallet Address กรุณาเชื่อมต่อ MetaMask");
      setTitles([]);
      setIsLoadingTitles(false);
      return;
    }
    try {
      // ดึง token IDs จาก wallet
      const resTokens = await GetLandTitleInfoByWallet();
      const tokens: string[] = resTokens?.tokens || [];
      // ดึง metadata ราย token แล้ว "แปลง" ให้พร้อมใช้
      const allMetadata = await Promise.all(
        tokens.map(async (tokenId: string) => {
          const metaRes = await GetLandMetadataByToken(tokenId);
          // กรณี metaFields เป็น string ให้แปลงเป็น object
          let metaObj: any = {};
          if (typeof metaRes?.metaFields === "string") {
            metaRes.metaFields.split(",").forEach((pair: string) => {
              const [key, value] = pair.split(":");
              if (key && value !== undefined) metaObj[key.trim()] = value.trim();
            });
          } else if (metaRes?.metaFields) {
            metaObj = parseMetaFields(metaRes.metaFields);
          }
          return { tokenID: tokenId, meta: metaObj, ...metaRes };
        })
      );
      // สร้าง titles สำหรับแสดงผล
      const processedTitles = allMetadata.map((data) => ({
        tokenId: data.tokenID,
        landNo: data.meta["TitleDeedNumber"] || "",
        location: `${data.meta["Subdistrict"] || ""} ${data.meta["District"] || ""} ${data.meta["Province"] || ""}`.trim(),
        area: `${data.meta["Rai"] || "-"} ไร่ ${data.meta["Ngan"] || "-"} งาน ${data.meta["SqWa"] || "-"} ตารางวา`,
        contract: walletToUse,
        status: "active" as TitleStatus
      }));
      setTitles(processedTitles);
    } catch (error) {
      setTitlesError("เกิดข้อผิดพลาดในการโหลดข้อมูลที่ดินจาก Blockchain");
      setTitles([]);
    } finally {
      setIsLoadingTitles(false);
    }
  };

  // ดึงข้อมูลที่ดินเมื่อ mount หรือ wallet เปลี่ยน
  useEffect(() => {
    fetchLandTitlesFromBlockchain();
  }, [wallet]);

  return (
    <div className="lcContainer">
      <Navbar />
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="header-row">
            <CardTitle>
              <div style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                {isLoadingUser ? (
                  <LoadingSpinner className="icon-lg text-white" />
                ) : (
                  userError ? null : (
                    userInfo.user_verification_id && userInfo.user_verification_id !== 0 ? (
                      <ShieldCheck className="icon-lg text-white" />
                    ) : null
                  )
                )}
                {isLoadingUser ? "กำลังโหลด..." :
                  userError ? "ข้อมูลผู้ใช้" :
                    `${userInfo.firstName || "User"} ${userInfo.lastName || ""}`.trim()}
              </div>
            </CardTitle>
          </div>
          <CardDescription>
            {isLoadingUser ? "กำลังโหลดข้อมูลผู้ใช้..." :
              userError ? userError :
                (userInfo.email ? userInfo.email : "-")}
          </CardDescription>

          <div className="chip-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {isLoadingUser ? (
                <span className="chip chip-soft">
                  <LoadingSpinner className="icon-sm mr-1" />
                  กำลังตรวจสอบ...
                </span>
              ) : userError ? (
                <span className="chip chip-strong" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#dc2626' }}>
                  ⚠️ {userError}
                </span>
              ) : (
                <>
                  {userInfo.user_verification_id && userInfo.user_verification_id !== 0 ? (
                    <span className="chip chip-strong" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#16a34a' }}>
                      <BadgeCheck className="icon-sm mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="chip chip-strong" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#dc2626' }}>
                      <BadgeCheck className="icon-sm mr-1" />
                      Unverified
                    </span>
                  )}
                  <span className="chip chip-soft">
                    <Wallet className="icon-sm mr-1" />
                    Wallet Linked
                  </span>
                </>
              )}
            </div>
            <Button
              variant="primary"
              className="button-registland"
              onClick={handleRegisterLandClick}
              disabled={isLoadingUser}
            >
              <FileText className="icon mr-1" />
              ลงทะเบียนโฉนดที่ดิน
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 2) ACTION CARDS */}
      <div className="lcCardRow">
        <Card>
          <div className="lcCardHeader userHeader">
            <CardTitle>ยืนยันตัวตนบน Blockchain</CardTitle>
            <CardDescription>นำข้อมูลผู้ใช้ของคุณขึ้น Blockchain เพื่อความปลอดภัย</CardDescription>
          </div>
          <CardContent className="user-content">
            <div className="col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="action-icon">
                <UserCheck className="icon-xxl" />
              </div>
              <Button
                className="usertoblockchain"
                variant="primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/user/verifyusertoblockchain')}
              >
                ยืนยันตัวตน
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <div className="lcCardHeader landHeader">
            <CardTitle>ลงทะเบียนที่ดินบน Blockchain</CardTitle>
            <CardDescription>นำข้อมูลที่ดินของคุณขึ้น Blockchain สร้างความโปร่งใส</CardDescription>
          </div>
          <CardContent className="land-content">
            <div className="col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="action-icon">
                <CheckSquare className="icon-xxl" />
              </div>
              <Button
                className="landtoblockchain"
                variant="primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/user/verifyland')}
              >
                ลงทะเบียนที่ดิน
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3) TITLES STATS */}
      <div className="grid-4">
        <StatCard
          title="ที่ดินทั้งหมด"
          value={isLoadingTitles ? <LoadingSpinner className="icon" /> : totalLandCount}
        />
        <StatCard
          title="ที่ดินบน Blockchain"
          value={isLoadingTitles ? <LoadingSpinner className="icon" /> : active}
        />
        <StatCard
          title="รอตรวจสอบ"
          value={isLoadingTitles ? <LoadingSpinner className="icon" /> : notverifyCount}
        />
      </div>

      {/* 4) TITLES TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>รายการที่ดิน (บน Blockchain)</CardTitle>
          <CardDescription>
            {isLoadingTitles ? "กำลังโหลดข้อมูลที่ดิน..." :
              titlesError ? titlesError :
                "ทรัพย์สินดิจิทัลที่ลงทะเบียนแล้ว"}
          </CardDescription>
        </CardHeader>
        <CardContent className="titles-content">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Token ID</th>
                  <th>เลขโฉนด</th>
                  <th>ที่ตั้ง</th>
                  <th>ขนาด</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTitles ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <LoadingSpinner className="icon-lg" style={{ margin: '0 auto' }} />
                      <div style={{ marginTop: '8px' }}>กำลังโหลดข้อมูลที่ดิน...</div>
                    </td>
                  </tr>
                ) : titlesError ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <div style={{ color: '#dc2626', marginBottom: '8px' }}>⚠️ {titlesError}</div>
                      {titlesError?.includes("Wallet") ? (
                        <Button variant="primary" onClick={connectWallet}>
                          เชื่อมต่อ MetaMask
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => window.location.reload()}>
                          ลองใหม่
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  <>
                    {titles.map((t, index) => (
                      <tr key={t.tokenId || `title-${index}`} className="row-hover">
                        <td>
                          <code className="code">{t.tokenId || '-'}</code>
                        </td>
                        <td>{t.landNo || '-'}</td>
                        <td>
                          <div className="loc">
                            <MapPin className="icon-xs text-muted" />
                            <span>{t.location || '-'}</span>
                          </div>
                        </td>
                        <td>{t.area || '-'}</td>
                        <td>
                          <StatusPill status={t.status || 'under_review'} />
                        </td>
                      </tr>
                    ))}
                    {titles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-cell">
                          ยังไม่มีรายการที่ดินบนเชน — เริ่มต้นด้วยการลงทะเบียนโฉนดแรกของคุณ
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5) PETITIONS OVERVIEW + TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>ติดตามสถานะคำร้อง</CardTitle>
          <CardDescription>ดูสถานะคำร้องขอคัดโฉนดของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="petition-stats">
            <Row gutter={24}>
              <Col xs={24} sm={6}>
                <AntCard style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic title="คำร้องทั้งหมด" value={petitions.length} prefix={<FileTextOutlined style={{ color: "#1890ff" }} />} valueStyle={{ color: "#1890ff", fontWeight: 700 }} />
                </AntCard>
              </Col>
              <Col xs={24} sm={6}>
                <AntCard style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic title="รอตรวจสอบ" value={petitions.filter(p => p.State?.name === "รอตรวจสอบ").length} prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />} valueStyle={{ color: "#fa8c16", fontWeight: 700 }} />
                </AntCard>
              </Col>
              <Col xs={24} sm={6}>
                <AntCard style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic title="กำลังดำเนินการ" value={petitions.filter(p => p.State?.name === "กำลังดำเนินการ").length} prefix={<ExclamationCircleOutlined style={{ color: "#1890ff" }} />} valueStyle={{ color: "#1890ff", fontWeight: 700 }} />
                </AntCard>
              </Col>
              <Col xs={24} sm={6}>
                <AntCard style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic title="อนุมัติแล้ว" value={petitions.filter(p => p.State?.name === "อนุมัติแล้ว").length} prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />} valueStyle={{ color: "#52c41a", fontWeight: 700 }} />
                </AntCard>
              </Col>
            </Row>
          </div>

          <Table
            columns={petitionColumns as any}
            dataSource={petitions}
            rowKey="ID"
            loading={loadingPetition}
            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ` }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ไม่พบข้อมูลคำร้อง" /> }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
// ฟังก์ชันแปลง metaFields จาก blockchain เป็น object ที่ใช้งานง่าย
function parseMetaFields(metaFields: any) {
  if (!metaFields || typeof metaFields !== "object") return {};
  // สมมติ metaFields เป็น array ของ { key, value }
  if (Array.isArray(metaFields)) {
    const obj: any = {};
    metaFields.forEach((item: any) => {
      if (item && item.key) obj[item.key] = item.value;
    });
    return obj;
  }
  // ถ้าเป็น object อยู่แล้ว
  return metaFields;
}


