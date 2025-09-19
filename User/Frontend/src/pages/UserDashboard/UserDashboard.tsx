import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GetUserinfoByID } from "../../service/https/garfield/http";
import { UserCheck, CheckSquare } from "react-feather"; // Assuming 'react-feather' contains the User and Home icons
import { GetInfoUserByToken, GetLandTitleInfoByWallet, GetLandMetadataByToken } from "../../service/https/bam/bam";
import "./UserDashboard.css";



/* =======================
   Icon Components (SVG)
   ======================= */
const Banknote = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="m6 16-2-2 2-2" />
    <path d="m16 8 2 2-2 2" />
  </svg>
);
const MessageSquare = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
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
const CopyIcon = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);
const ExternalLink = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h6v6" />
    <path d="m10 14 9-9" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
const MapPin = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const User = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
  <div className={`card ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="card-header">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="card-title">{children}</h2>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="card-description">{children}</p>
);
const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-content ${className}`}>{children}</div>
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

/* ===== Data Processing ===== */
const processLandTitleData = (rawData: any): LandTitle => {
  console.log("Processing raw data:", rawData);
  // แปลงข้อมูลจาก API format ให้เป็น LandTitle interface
  const determineStatus = (status: any): TitleStatus => {
    if (status === 'active') return 'active';
    if (status === 'encumbered') return 'encumbered';
    if (status === 'under_review') return 'under_review';
    return 'under_review'; // default status
  };

  const processed: LandTitle = {
    tokenId: rawData.tokenId || rawData.id || rawData.token_id || rawData.tokenID || String(rawData.tokenId || ''),
    landNo: rawData.landNo || rawData.title_no || rawData.land_no || rawData.titleNumber || rawData.titleNo || '',
    location: rawData.location ||
      rawData.address ||
      (rawData.province && rawData.district ?
        `${rawData.subdistrict || ''} ${rawData.district || ''} ${rawData.province || ''}`.trim() : '') ||
      (rawData.tambons && rawData.amphures && rawData.provinces ?
        `ต.${rawData.tambons} อ.${rawData.amphures} จ.${rawData.provinces}` : '') ||
      '',
    area: rawData.area || rawData.size || rawData.landSize || rawData.dimension || '',
    contract: rawData.contract || rawData.contract_address || rawData.contractAddress || '',
    status: determineStatus(rawData.status)
  };
  console.log("Processed data:", processed);
  return processed;
};

/* ===== Helpers ===== */
const StatusPill = ({ status }: { status: TitleStatus }) => {
  const label =
    status === "active" ? "พร้อมใช้งาน" :
      status === "encumbered" ? "มีภาระผูกพัน" : "รอตรวจสอบ";
  return <span className={`badge ${status === "active" ? "badge-green" : status === "encumbered" ? "badge-amber" : "badge-slate"}`}>{label}</span>;
};

const Copyable = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      className="btn-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 900);
      }}
    >
      <CopyIcon className="icon-sm mr-1" />
      {copied ? "คัดลอกแล้ว" : "คัดลอก"}
    </Button>
  );
};

const ExplorerLink = ({ txOrContract, label = "Explorer" }: { txOrContract: string; label?: string }) => (
  <a
    href={`https://polygonscan.com/address/${txOrContract.replace(/\s/g, "")}`}
    target="_blank"
    rel="noreferrer"
    className="explorer-link"
  >
    {label} <ExternalLink className="icon-xs" />
  </a>
);

const StatCard = ({ title, value, sub }: { title: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode }) => (
  <div className="card stat-card">
    <div className="card-content">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

/* ===================================================
   UserProfilePage
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
        console.log("API result:", result);
        if (result && (result.firstName || result.lastName || result.email)) {
          setUserInfo({
            firstName: result.firstName || "",
            lastName: result.lastName || "",
            email: result.email || "",
            user_verification_id: result.user_verification_id || 0,
          });
          // อัปเดต localStorage ให้ตรงกับ backend
          localStorage.setItem("firstName", result.firstName || "");
          localStorage.setItem("lastName", result.lastName || "");
          localStorage.setItem("email", result.email || "");
          localStorage.setItem("user_verification_id", result.user_verification_id ? String(result.user_verification_id) : "0");
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
  // ถ้าใช้ react-router-dom ให้แทน navigate นี้ด้วย useNavigate()

  const { total, active, encumbered, reviewing } = useMemo(() => {
    // ถ้ายังโหลดข้อมูลอยู่ ให้ return 0 ทั้งหมด
    if (isLoadingTitles) {
      return { total: 0, active: 0, encumbered: 0, reviewing: 0 };
    }

    const total = titles.length;
    const active = titles.filter((t) => t.status === "active").length;
    const encumbered = titles.filter((t) => t.status === "encumbered").length;
    const reviewing = titles.filter((t) => t.status === "under_review").length;
    return { total, active, encumbered, reviewing };
  }, [titles, isLoadingTitles]);

  const navigate = useNavigate();

  const handleRegisterLandClick = () => {
    navigate('/user/userregisland');
  };
  useEffect(() => {
    console.log("User info:", userInfo);
  }, [userInfo]);

  useEffect(() => {
    async function fetchLandTitles() {
      try {
        setIsLoadingTitles(true);
        setTitlesError(null);
        console.log("Fetching land titles...");
        const data = await GetLandTitleInfoByWallet();
        console.log("Land titles API response:", data);

        // ตรวจสอบว่า API response มี tokens array หรือไม่
        if (data && data.tokens && Array.isArray(data.tokens)) {
          console.log("Processing titles data from tokens:", data.tokens);
          const processedTitles = data.tokens.map(processLandTitleData);
          console.log("Processed titles:", processedTitles);
          setTitles(processedTitles);
        } else if (data && Array.isArray(data)) {
          // กรณีที่ API ส่งกลับเป็น array โดยตรง
          console.log("Processing titles data as array:", data);
          const processedTitles = data.map(processLandTitleData);
          console.log("Processed titles:", processedTitles);
          setTitles(processedTitles);
        } else if (data === null || data === undefined || (data.tokens && data.tokens.length === 0)) {
          console.log("No land titles found");
          setTitles([]);
        } else {
          console.log("Invalid data format:", data);
          setTitlesError("รูปแบบข้อมูลที่ดินไม่ถูกต้อง");
          setTitles([]);
        }
      } catch (error) {
        console.error("Failed to fetch land titles:", error);
        setTitlesError("เกิดข้อผิดพลาดในการโหลดข้อมูลที่ดิน");
        setTitles([]);
      } finally {
        setIsLoadingTitles(false);
      }
    }

    fetchLandTitles();
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <CardTitle>
              <div style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                {isLoadingUser ? (
                  <LoadingSpinner className="icon-lg text-white" />
                ) : (
                  userError ? null : (
                    (userInfo.user_verification_id && userInfo.user_verification_id !== 0) && (
                      <ShieldCheck className="icon-lg text-white" />
                    )
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

      <div className="card-row">
        <Card>
          <div className="card-header user-header">
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
          <div className="card-header land-header">
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

      {/* Land Titles Dashboard */}
      <div className="grid-4">
        <StatCard
          title="ที่ดินบนเชนทั้งหมด"
          value={isLoadingTitles ? <LoadingSpinner className="icon" /> : total}
        />
        <StatCard
          title="พร้อมใช้งาน"
          value={isLoadingTitles ? <LoadingSpinner className="icon" /> : active}
        />
        <StatCard
          title="รอตรวจสอบ"
          value={isLoadingTitles ? <LoadingSpinner className="icon" /> : reviewing}
        />
      </div>

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
                  <th>การดำเนินการ</th>
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
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        ลองใหม่
                      </Button>
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
                        <td>
                          <div className="actions">
                            <Button variant="outline" className="btn-sm" onClick={() => navigate(`/titles/${t.tokenId}`)}>
                              รายละเอียด
                            </Button>
                            <Button variant="outline" className="btn-sm" onClick={() => navigate(`/listings/new?tokenId=${t.tokenId}`)}>
                              ประกาศขาย
                            </Button>
                            {t.contract && (
                              <div className="inline-actions">
                                <ExplorerLink txOrContract={t.contract} label="Explorer" />
                                <Copyable text={t.contract} />
                              </div>
                            )}
                          </div>
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

      {/* Quick Links */}
      <div className="grid-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Banknote className="icon" />
              ประกาศขาย
            </CardTitle>
            <CardDescription>จัดการประกาศขายที่ดินของคุณ</CardDescription>
          </CardHeader>
          <CardContent className="quicklink-content">
            <Button className="w-full" onClick={() => navigate("/listings")}>
              ไปที่หน้า ประกาศขาย
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <MessageSquare className="icon" />
              ข้อความ
            </CardTitle>
            <CardDescription>ติดต่อผู้ซื้อ ผู้ขาย และเจ้าหน้าที่</CardDescription>
          </CardHeader>
          <CardContent className="quicklink-content">
            <Button className="w-full" onClick={() => navigate("/messages")}>
              ไปที่หน้า ข้อความ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
