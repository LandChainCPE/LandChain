import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Phone,
  User,
  Home,
  Calendar,
  Ruler,
  Map,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { GetAllPostLandData /*, GetPostLandByID*/ } from "../../service/https/jib/jib";

/** ---------------- Utils ---------------- */
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
  Images: string[];
  Province?: { NameTH?: string };
  District?: { NameTH?: string };
  Subdistrict?: { NameTH?: string };
  Landtitle?: {
    Rai?: number;
    Ngan?: number;
    SquareWa?: number;
    TitleDeedNumber?: string;
  };
};

const thDate = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

/** รองรับคีย์ตัวเล็ก/ใหญ่ และโครงสร้างที่อาจต่างกัน */
function normalizeDetail(item: any): LandDetailType {
  const provinceObj = item.province ?? item.Province ?? undefined;
  const districtObj = item.district ?? item.District ?? undefined;
  const subdistrictObj = item.subdistrict ?? item.Subdistrict ?? undefined;
  const landtitleObj = item.landtitle ?? item.Landtitle ?? undefined;

  // ดึงรูปภาพจาก Photoland (เดา key หลัก ๆ)
  const photosRaw: any[] = item.photoland ?? item.Photoland ?? [];
  const images: string[] =
    Array.isArray(photosRaw) && photosRaw.length
      ? photosRaw
          .map((p) => p?.url ?? p?.URL ?? p?.image ?? p?.Image ?? p?.path ?? p?.Path)
          .filter(Boolean)
      : [];

  const features: string[] = [];
  // ถ้าเป็น tag เดี่ยว
  const tagOne = item.tag ?? item.Tag;
  if (tagOne?.Tag || tagOne?.name || tagOne?.Name || typeof tagOne === "string") {
    features.push(tagOne.Tag ?? tagOne.name ?? tagOne.Name ?? tagOne);
  }
  // ถ้าเป็น tags array
  const tagsArr = item.tags ?? item.Tags;
  if (Array.isArray(tagsArr)) {
    tagsArr.forEach((t) =>
      features.push(t?.Tag ?? t?.name ?? t?.Name ?? "").toString()
    );
  }

  // เจ้าของ
  const first = item.first_name ?? item.FirstName ?? "";
  const last = item.last_name ?? item.LastName ?? "";
  const owner = [first, last].filter(Boolean).join(" ").trim();

  // คำอธิบาย (ถ้าไม่มี ใช้ชื่อ/ที่ตั้งแทนเพื่อไม่ให้โล่ง)
  const desc =
    item.description ??
    item.Description ??
    `ที่ดินใน${subdistrictObj?.name_th ?? subdistrictObj?.NameTH ?? ""} ${districtObj?.name_th ?? districtObj?.NameTH ?? ""} ${provinceObj?.name_th ?? provinceObj?.NameTH ?? ""}`.trim();

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
    PostedDate:
      thDate(item.created_at ?? item.CreatedAt ?? item.createdAt) || undefined,
    LandType: item.land_type ?? item.LandType ?? "ที่ดิน",
    Title: "โฉนดที่ดิน",
    Width: item.width ?? item.Width ?? undefined,
    Depth: item.depth ?? item.Depth ?? undefined,
    Features: features.filter(Boolean),
    Images: images.length ? images : ["/default-image.png"],
    Province: provinceObj
      ? { NameTH: provinceObj.name_th ?? provinceObj.NameTH }
      : undefined,
    District: districtObj
      ? { NameTH: districtObj.name_th ?? districtObj.NameTH }
      : undefined,
    Subdistrict: subdistrictObj
      ? { NameTH: subdistrictObj.name_th ?? subdistrictObj.NameTH }
      : undefined,
    Landtitle: landtitleObj
      ? {
          Rai: landtitleObj.rai ?? landtitleObj.Rai,
          Ngan: landtitleObj.ngan ?? landtitleObj.Ngan,
          SquareWa: landtitleObj.square_wa ?? landtitleObj.SquareWa,
          TitleDeedNumber:
            landtitleObj.title_deed_number ?? landtitleObj.TitleDeedNumber,
        }
      : undefined,
  };
}

const LandDetail = () => { 
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [land, setLand] = useState<LandDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLarge, setIsLarge] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const onResize = () => setIsLarge(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // ถ้ามี API รายตัว ให้ใช้แทน (ปลดคอมเมนต์บรรทัดด้านล่าง และลบ fallback)
        // const one = await GetPostLandByID(Number(id));
        // setLand(normalizeDetail(one));
        // Fallback: ดึงทั้งหมดแล้วค้นหา ID ที่ตรง
        const all = await GetAllPostLandData();
        const raw =
          (all || []).find(
            (x: any) => String(x.id ?? x.ID) === String(id)
          ) ?? null;
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

  const images = land?.Images ?? [];
  const nextImage = () =>
    setCurrentImageIndex((p) => (p + 1) % (images.length || 1));
  const prevImage = () =>
    setCurrentImageIndex((p) => (p - 1 + (images.length || 1)) % (images.length || 1));

  const areaStr = useMemo(() => areaText(land?.Landtitle), [land]);
  const pricePerRai = useMemo(
    () => calcPricePerRai(land?.Price, land?.Landtitle),
    [land]
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9FAFB",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "9999px",
              border: "3px solid #2563EB",
              borderTopColor: "transparent",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: 16, color: "#4B5563" }}>กำลังโหลดรายละเอียด...</p>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
          <button
            style={{ color: "#2563EB", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => navigate("/user/sellpostmain")}
          >
            ← ย้อนกลับ
          </button>
          <div
            style={{
              marginTop: 16,
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
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
    navBtn: {
      position: "absolute" as const,
      top: "50%",
      transform: "translateY(-50%)",
      background: "rgba(255,255,255,0.85)",
      borderRadius: 9999,
      padding: 8,
      border: "none",
      cursor: "pointer",
    },
    imgCounter: {
      position: "absolute" as const,
      right: 16,
      bottom: 16,
      background: "rgba(0,0,0,0.6)",
      color: "#fff",
      padding: "6px 10px",
      borderRadius: 9999,
      fontSize: 12,
    },
    thumbsRow: { display: "flex", gap: 8, padding: 16, overflowX: "auto" as const },
    thumb: (active = false) => ({
      flexShrink: 0,
      width: 80,
      height: 64,
      borderRadius: 8,
      overflow: "hidden",
      border: `2px solid ${active ? "#3B82F6" : "#E5E7EB"}`,
      cursor: "pointer",
      padding: 0,
      background: "transparent",
    }),
    grid: {
      display: "grid",
      gridTemplateColumns: isLarge ? "2fr 1fr" : "1fr",
      gap: 24,
    },
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
    fakeMap: {
      width: "100%",
      height: 256,
      background: "#E5E7EB",
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#6B7280",
      textAlign: "center" as const,
      padding: 12,
    },
    mapBtn: {
      position: "absolute" as const,
      top: 16,
      right: 16,
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      padding: "8px 12px",
      fontSize: 14,
      cursor: "pointer",
    },
    sticky: { position: isLarge ? "sticky" as const : "static" as const, top: 24 },
    contactRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 9999,
      background: "#DBEAFE",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#2563EB",
    },
    contactBtn: (variant: "call" | "msg" | "ghost") => {
      const base: React.CSSProperties = {
        width: "100%",
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        border: "none",
      };
      if (variant === "call") return { ...base, background: "#16A34A", color: "#fff" };
      if (variant === "msg") return { ...base, background: "#2563EB", color: "#fff" };
      return { ...base, background: "#fff", color: "#374151", border: "1px solid #D1D5DB" };
    },
    warn: { marginTop: 16, background: "#FEF3C7", color: "#92400E", padding: 16, borderRadius: 10, fontSize: 14 },
    smallText: { fontSize: 12, color: "#6B7280" },
    smallTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: "#111827",
      whiteSpace: "nowrap" as const,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    smallPrice: { fontSize: 14, fontWeight: 700, color: "#2563EB" },
  };

  /** --------------- Render --------------- */
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <button style={styles.headerBtn} onClick={() => navigate("/user/sellpostmain")}>
              ← ย้อนกลับ
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setIsFavorite(!isFavorite)} style={styles.iconBtn(isFavorite)}>
                <Heart style={{ width: 20, height: 20, ...(isFavorite ? { fill: "currentColor" } : {}) }} />
              </button>
              <button style={styles.iconBtn(false)}>
                <Share2 style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {/* Image Gallery */}
        <div style={{ ...styles.card, overflow: "hidden" }}>
          <div style={styles.imageWrap}>
            <img
              src={images[currentImageIndex]}
              alt={`รูปที่ดิน ${currentImageIndex + 1}`}
              style={styles.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-image.png";
              }}
            />
            <div style={styles.imageOverlay} />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} style={{ ...styles.navBtn, left: 16 }}>
                  ←
                </button>
                <button onClick={nextImage} style={{ ...styles.navBtn, right: 16 }}>
                  →
                </button>
              </>
            )}
            <div style={styles.imgCounter}>
              {Math.min(currentImageIndex + 1, images.length)} / {images.length || 1}
            </div>
          </div>

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
                {typeof land.Price === "number" && (
                  <div style={styles.price}>{land.Price.toLocaleString()} ฿</div>
                )}
                {pricePerRai != null && (
                  <div style={styles.priceNote}>(~{pricePerRai.toLocaleString()} ฿/ไร่)</div>
                )}
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
                    <div style={{ fontWeight: 500 }}>
                      {land.PostedDate || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* มิติหน้ากว้าง/ลึก (ถ้ามี) */}
              {(land.Width || land.Depth) && (
                <div style={styles.dimGrid}>
                  <div style={styles.dimCell}>
                    <div style={styles.dimLabel}>หน้ากว้าง</div>
                    <div style={styles.dimValue}>{land.Width || "-"}</div>
                  </div>
                  <div style={styles.dimCell}>
                    <div style={styles.dimLabel}>ลึก</div>
                    <div style={styles.dimValue}>{land.Depth || "-"}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {land.Features && land.Features.length > 0 && (
              <div style={{ ...styles.card, ...styles.cardPad }}>
                <h2 style={styles.sectionTitle}>จุดเด่น</h2>
                <div style={styles.featuresGrid}>
                  {land.Features.map((feature, idx) => (
                    <div key={idx} style={styles.featureRow}>
                      <div
                        style={{ width: 8, height: 8, background: "#10B981", borderRadius: 9999 }}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h2 style={styles.sectionTitle}>รายละเอียดเพิ่มเติม</h2>
              <p style={styles.desc}>{land.Description || "-"}</p>
            </div>

            {/* Map (placeholder) */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h2 style={styles.sectionTitle}>แผนที่</h2>
              <div style={styles.mapBox}>
                <div style={styles.fakeMap}>
                  <div>
                    <MapPin
                      style={{ width: 48, height: 48, margin: "0 auto 8px auto", display: "block" }}
                    />
                    <div>แผนที่ตำแหน่งที่ดิน</div>
                    <div style={{ fontSize: 12 }}>{land.LocationText || "-"}</div>
                  </div>
                </div>
                <button style={styles.mapBtn}>
                  <Map style={{ width: 16, height: 16, marginRight: 8, verticalAlign: "text-bottom" }} />
                  ดูแผนที่ขนาดใหญ่
                </button>
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

                <button style={styles.contactBtn("ghost")}>นัดชมที่ดิน</button>
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
}


export default LandDetail;
