import React, { useMemo, useState, useEffect } from "react";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
import { GetUserinfoByID } from "../../service/https/garfield/http";
import { UserCheck, CheckSquare } from "react-feather"; // Assuming 'react-feather' contains the User and Home icons
import { GetInfoUserByToken, GetLandTitleInfoByWallet, GetLandMetadataByToken } from "../../service/https/bam/bam";



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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <button
      onClick={onClick}
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
  tokenId: string;
  landNo: string;
  location: string;
  area: string;
  contract: string;
  status: TitleStatus;
}

/* ===== Mock Data ===== */
const MOCK_TITLES: LandTitle[] = [
  { tokenId: "721-0001", landNo: "PHL-100/2567", location: "อ.เมืองพิษณุโลก จ.พิษณุโลก", area: "2-1-35 ไร่", contract: "0xABCD...EF12", status: "active" },
  { tokenId: "721-0002", landNo: "BKK-77/2568", location: "เขตบางเขน กทม.", area: "1-0-12 ไร่", contract: "0xABCD...EF12", status: "encumbered" },
  { tokenId: "721-0003", landNo: "CM-22/2568", location: "อ.เมือง เชียงใหม่", area: "0-3-75 ไร่", contract: "0xABCD...EF12", status: "under_review" },
];

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
  useEffect(() => {
    const user_id = localStorage.getItem("user_id") || "";
    console.log("User id:", user_id);
    if (user_id) {
      GetUserinfoByID(user_id).then(({ result }) => {
        console.log("API result:", result);
        if (result && (result.firstName || result.lastName)) {
          setUserInfo({
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            user_verification_id: result.user_verification_id,
          });
          // อัปเดต localStorage ให้ตรงกับ backend
          localStorage.setItem("firstName", result.firstName || "");
          localStorage.setItem("lastName", result.lastName || "");
          localStorage.setItem("email", result.email || "");
          localStorage.setItem("user_verification_id", result.user_verification_id || "");
        }
      });
    }
  }, []);
  // ถ้าใช้ react-router-dom ให้แทน navigate นี้ด้วย useNavigate()

  const { total, active, encumbered, reviewing } = useMemo(() => {
    const total = titles.length;
    const active = titles.filter((t) => t.status === "active").length;
    const encumbered = titles.filter((t) => t.status === "encumbered").length;
    const reviewing = titles.filter((t) => t.status === "under_review").length;
    return { total, active, encumbered, reviewing };
  }, [titles]);

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
        const data = await GetLandTitleInfoByWallet();
        if (data && Array.isArray(data)) {
          setTitles(data);
        }
      } catch (error) {
        console.error("Failed to fetch land titles:", error);
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
                {(userInfo.user_verification_id !== 0 && userInfo.user_verification_id !== null && userInfo.user_verification_id !== undefined) && (
                  <ShieldCheck className="icon-lg text-white" />
                )}
                {userInfo.firstName || "User"} {userInfo.lastName || ""}
              </div>
            </CardTitle>
          </div>
          <CardDescription>
            {userInfo.email ? userInfo.email : "-"}
          </CardDescription>

          <div className="chip-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {userInfo.user_verification_id ? (
                <span className="chip chip-strong chip-green">
                  <BadgeCheck className="icon-sm mr-1" />
                  Verified
                </span>
              ) : (
                <span className="chip chip-strong chip-red">
                  <BadgeCheck className="icon-sm mr-1" />
                  Unverified
                </span>
              )}
              <span className="chip chip-soft">
                <Wallet className="icon-sm mr-1" />
                Wallet Linked
              </span>
            </div>
            <Button
              variant="primary"
              className="button-registland"
              onClick={handleRegisterLandClick}
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
        <StatCard title="ที่ดินบนเชนทั้งหมด" value={total} />
        <StatCard title="พร้อมใช้งาน" value={active} />
        <StatCard title="มีภาระผูกพัน" value={encumbered} />
        <StatCard title="รอตรวจสอบ" value={reviewing} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการที่ดิน (บน Blockchain)</CardTitle>
          <CardDescription>ทรัพย์สินดิจิทัลที่ลงทะเบียนแล้ว</CardDescription>
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
                  <th className="text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((t) => (
                  <tr key={t.tokenId} className="row-hover">
                    <td>
                      <code className="code">{t.tokenId}</code>
                    </td>
                    <td>{t.landNo}</td>
                    <td>
                      <div className="loc">
                        <MapPin className="icon-xs text-muted" />
                        <span>{t.location}</span>
                      </div>
                    </td>
                    <td>{t.area}</td>
                    <td>
                      <StatusPill status={t.status} />
                    </td>
                    <td>
                      <div className="actions">
                        <Button variant="outline" className="btn-sm" onClick={() => navigate(`/titles/${t.tokenId}`)}>
                          รายละเอียด
                        </Button>
                        <Button variant="outline" className="btn-sm" onClick={() => navigate(`/listings/new?tokenId=${t.tokenId}`)}>
                          ประกาศขาย
                        </Button>
                        <div className="inline-actions">
                          <ExplorerLink txOrContract={t.contract} label="Explorer" />
                          <Copyable text={t.contract} />
                        </div>
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
