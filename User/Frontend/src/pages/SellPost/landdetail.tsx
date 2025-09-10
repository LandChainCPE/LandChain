import React, { useEffect, useState } from "react";
import { MapPin, Phone, User, Home, Calendar, Ruler, Map, MessageCircle, Share2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LandDetail() {
  // สมมติว่าได้ id จาก useParams
  const id = "1";
  const [land, setLand] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLarge, setIsLarge] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const navigate = useNavigate(); // เพิ่มบรรทัดนี้

  useEffect(() => {
    const onResize = () => setIsLarge(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const fetchLandDetail = async () => {
      setLand({
        ID: id,
        Name: "ที่ดินติดถนนใหญ่ ย่านราชดำเนิน",
        Price: 2500000,
        PricePerRai: 1250000,
        Area: "2 ไร่",
        PhoneNumber: "081-234-5678",
        OwnerName: "คุณสมชาย จันทร์แก้ว",
        Description:
          "ที่ดินเปล่าสวยงาม ติดถนนใหญ่ 2 หน้า เหมาะสำหรับการลงทุน หรือสร้างที่อยู่อาศัย ใกล้สถานีรถไฟฟ้า ห้างสรรพสินค้า และโรงพยาบาล น้ำไฟฟ้าพร้อม เข้าออกสะดวก",
        Location: "ถนนราชดำเนิน กรุงเทพมหานคร",
        PostedDate: "15 ธันวาคม 2567",
        LandType: "ที่ดินเปล่า",
        Title: "โฉนดที่ดิน",
        Width: "40 เมตร",
        Depth: "80 เมตร",
        Features: ["ติดถนนใหญ่ 2 หน้า", "น้ำประปา-ไฟฟ้าพร้อม", "ใกล้รถไฟฟ้า BTS", "เข้าออกสะดวก", "เหมาะลงทุน"],
        Images: ["/api/placeholder/800/500", "/api/placeholder/800/500", "/api/placeholder/800/500", "/api/placeholder/800/500"],
        Coordinates: { lat: 13.7563, lng: 100.5018 },
      });
    };
    fetchLandDetail();
  }, [id]);

  if (!land) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "9999px",
              border: "3px solid #2563EB",
              borderTopColor: "transparent",
              margin: "0 auto",
            }}
          />
          <p style={{ marginTop: 16, color: "#4B5563" }}>กำลังโหลดรายละเอียด...</p>
        </div>
      </div>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % land.Images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + land.Images.length) % land.Images.length);

  // ==== Styles ====
  const styles = {
    page: { minHeight: "100vh", backgroundColor: "#F9FAFB" }, // gray-50
    header: { backgroundColor: "#FFFFFF", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" },
    container: { maxWidth: 1152, margin: "0 auto", padding: "16px" }, // ~6xl
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
    listItem: {
      display: "flex",
      gap: 12,
      padding: 12,
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      cursor: "pointer",
      alignItems: "center",
    },
    listThumb: { width: 80, height: 60, objectFit: "cover" as const, borderRadius: 8 },
    smallText: { fontSize: 12, color: "#6B7280" },
    smallTitle: { fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
    smallPrice: { fontSize: 14, fontWeight: 700, color: "#2563EB" },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
<button
  style={styles.headerBtn}
  onClick={() => navigate("/user/sellpostmain")}
>
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
            <img src={land.Images[currentImageIndex]} alt={`รูปที่ดิน ${currentImageIndex + 1}`} style={styles.image} />
            <div style={styles.imageOverlay} />
            <button onClick={prevImage} style={{ ...styles.navBtn, left: 16 }}>←</button>
            <button onClick={nextImage} style={{ ...styles.navBtn, right: 16 }}>→</button>
            <div style={styles.imgCounter}>{currentImageIndex + 1} / {land.Images.length}</div>
          </div>

          <div style={styles.thumbsRow}>
            {land.Images.map((img: string, index: number) => (
              <button key={index} onClick={() => setCurrentImageIndex(index)} style={styles.thumb(index === currentImageIndex)}>
                <img src={img} alt={`ภาพย่อ ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                <span>{land.Location}</span>
              </div>
              <div style={styles.priceRow}>
                <div style={styles.price}>{land.Price.toLocaleString()} ฿</div>
                <div style={styles.priceNote}>({land.PricePerRai.toLocaleString()} ฿/ไร่)</div>
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
                    <div style={{ fontWeight: 500 }}>{land.Area}</div>
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
                    <div style={{ fontWeight: 500 }}>{land.PostedDate}</div>
                  </div>
                </div>
              </div>

              <div style={styles.dimGrid}>
                <div style={styles.dimCell}>
                  <div style={styles.dimLabel}>หน้ากว้าง</div>
                  <div style={styles.dimValue}>{land.Width}</div>
                </div>
                <div style={styles.dimCell}>
                  <div style={styles.dimLabel}>ลึก</div>
                  <div style={styles.dimValue}>{land.Depth}</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h2 style={styles.sectionTitle}>จุดเด่น</h2>
              <div style={styles.featuresGrid}>
                {land.Features.map((feature: string, index: number) => (
                  <div key={index} style={styles.featureRow}>
                    <div style={{ width: 8, height: 8, background: "#10B981", borderRadius: 9999 }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h2 style={styles.sectionTitle}>รายละเอียดเพิ่มเติม</h2>
              <p style={styles.desc}>{land.Description}</p>
            </div>

            {/* Map */}
            <div style={{ ...styles.card, ...styles.cardPad }}>
              <h2 style={styles.sectionTitle}>แผนที่</h2>
              <div style={styles.mapBox}>
                <div style={styles.fakeMap}>
                  <div>
                    <MapPin style={{ width: 48, height: 48, margin: "0 auto 8px auto", display: "block" }} />
                    <div>แผนที่ตำแหน่งที่ดิน</div>
                    <div style={{ fontSize: 12 }}>{land.Location}</div>
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
            {/* Contact Card */}
            <div style={{ ...styles.card, ...styles.cardPad, ...styles.sticky }}>
              <h2 style={styles.sectionTitle}>ติดต่อเจ้าของ</h2>

              <div style={styles.contactRow}>
                <div style={styles.avatar}>
                  <User style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{land.OwnerName}</div>
                  <div style={styles.smallText}>เจ้าของที่ดิน</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <a href={`tel:${land.PhoneNumber}`} style={styles.contactBtn("call") as React.CSSProperties}>
                  <Phone style={{ width: 20, height: 20 }} />
                  โทร {land.PhoneNumber}
                </a>

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
