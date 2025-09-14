import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetAllPostLandData } from "../../service/https/jib/jib";

type Land = {
  ID: number;
  Name?: string;
  PhoneNumber?: string;
  Image?: string;
  ProvinceID?: number;
  DistrictID?: number;
  SubdistrictID?: number;
  Price?: number;
  Tag?: string[];
  Province?: { NameTH?: string };
  District?: { NameTH?: string };
  Subdistrict?: { NameTH?: string };
  Area?: string;
  Landtitle?: {
    Rai?: number;
    Ngan?: number;
    SquareWa?: number;
    TitleDeedNumber?: string;
  };
};

function normalizeLand(item: any): Land {
  // ดึงชื่อแท็กให้ได้ ไม่ว่าจะมาเป็น object/array/คีย์เล็ก/ใหญ่
  const extractTags = (raw: any): string[] | undefined => {
    if (!raw) return undefined;
    if (Array.isArray(raw)) {
      return raw
        .map((t) => t?.Tag ?? t?.tag ?? t?.name ?? t?.Name)
        .filter(Boolean);
    }
    const one = raw?.Tag ?? raw?.tag ?? raw?.name ?? raw?.Name;
    return one ? [one] : undefined;
  };

  const provinceObj =
    item.province ??
    item.Province ??
    item.ProvinceTH ??
    item.provinceTH ??
    undefined;

  const districtObj = item.district ?? item.District ?? undefined;
  const subdistrictObj = item.subdistrict ?? item.Subdistrict ?? undefined;

  const landtitleObj = item.landtitle ?? item.Landtitle ?? undefined;

  return {
    ID: item.id ?? item.ID,
    Name: item.name ?? item.Name,
    PhoneNumber: item.phone_number ?? item.PhoneNumber,
    Image: item.image ?? item.Image,
    ProvinceID: item.province_id ?? item.ProvinceID,
    DistrictID: item.district_id ?? item.DistrictID,
    SubdistrictID: item.subdistrict_id ?? item.SubdistrictID,
    Price: item.price ?? item.Price,
    Tag: extractTags(item.tag ?? item.Tag),
    Province: provinceObj
      ? { NameTH: provinceObj.name_th ?? provinceObj.NameTH }
      : undefined,
    District: districtObj
      ? { NameTH: districtObj.name_th ?? districtObj.NameTH }
      : undefined,
    Subdistrict: subdistrictObj
      ? { NameTH: subdistrictObj.name_th ?? subdistrictObj.NameTH }
      : undefined,
    Area: item.area ?? item.Area,
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

function addressText(land: Land) {
  return [land.Subdistrict?.NameTH, land.District?.NameTH, land.Province?.NameTH]
    .filter(Boolean)
    .join(", ");
}

const SellPostMain = () => { 
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handlePostLand = () => navigate("/user/sellpost");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const landsData = await GetAllPostLandData();
        const mapped = (landsData || []).map(normalizeLand);
        setLands(mapped);
      } catch (e) {
        console.error("Error fetching lands:", e);
        setLands([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredLands = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return lands;
    return lands.filter((land) => {
      const name = land.Name?.toLowerCase() ?? "";
      const prov = land.Province?.NameTH?.toLowerCase() ?? "";
      const dist = land.District?.NameTH?.toLowerCase() ?? "";
      const subd = land.Subdistrict?.NameTH?.toLowerCase() ?? "";
      return [name, prov, dist, subd].some((x) => x.includes(term));
    });
  }, [lands, searchTerm]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom right, #cce7ff, #ffffff, #d9f5d0)",
        }}
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลที่ดิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #cce7ff, #ffffff, #d9f5d0)",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(to right, #3b82f6, #9333ea)",
          color: "white",
        }}
      >
        <div
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" }}
        />
        <div
          style={{ position: "relative", maxWidth: 1024, margin: "0 auto", padding: "2rem" }}
        >
          <h1
            style={{
              textAlign: "center",
              fontSize: "3rem",
              fontWeight: "bold",
              background: "linear-gradient(to right, #fff, #87cefa)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: "2rem",
            }}
          >
            ประกาศขายที่ดิน
          </h1>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handlePostLand}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                fontWeight: "bold",
                borderRadius: "20px",
                fontSize: "1.05rem",
                cursor: "pointer",
                border: "none",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                transition: "0.3s",
              }}
            >
              + ประกาศขายที่ดิน
            </button>

            <button
              onClick={() =>
                setViewMode((v) => (v === "grid" ? "list" : "grid"))
              }
              style={{
                padding: "10px 16px",
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "white",
                fontWeight: 600,
                borderRadius: "14px",
                fontSize: "0.95rem",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              สลับมุมมอง: {viewMode === "grid" ? "Grid" : "List"}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: 600, margin: "30px auto 0", position: "relative" }}>
        <Search
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#3b82f6",
            fontSize: "1.5rem",
          }}
        />
        <input
          type="text"
          placeholder="ค้นหาที่ดิน, จังหวัด, อำเภอ, ตำบล..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px 12px 46px",
            fontSize: "1rem",
            borderRadius: "30px",
            border: "2px solid #3b82f6",
            outline: "none",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            color: "#333",
          }}
        />
      </div>

      {/* Listings */}
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "2rem" }}>
        {filteredLands.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
            }}
          >
            ไม่พบผลลัพธ์ที่ตรงกับ “{searchTerm}”
          </div>
        ) : viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredLands.map((land) => {
              const addr = addressText(land);
              return (
                <div
                  key={land.ID}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 15,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => navigate(`/user/landdetail/${land.ID}`)}
                >
                  <div
                    style={{
                      height: 180,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "linear-gradient(to right, #3b82f6, #9333ea)",
                    }}
                  >
                    {/* ใช้ภาพเต็มพื้นที่ถ้ามี */}
                    <img
                      src={land.Image || "/default-image.png"}
                      alt={land.Name ?? "land"}
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          "/default-image.png")
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: land.Image ? "cover" : "contain",
                      }}
                    />
                  </div>

                  <div style={{ padding: "1.1rem 1.2rem 1.25rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#222" }}>
                      {land.Name || "ชื่อที่ดินไม่ระบุ"}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 8,
                        color: "#666",
                        gap: 6,
                        lineHeight: 1.3,
                      }}
                    >
                      <MapPin style={{ fontSize: "1rem" }} />
                      <span>{addr || "—"}</span>
                    </div>

                    {land.Price != null && (
                      <p
                        style={{
                          fontWeight: 800,
                          color: "#0f766e",
                          marginTop: 10,
                          fontSize: "1.05rem",
                        }}
                      >
                        {Number(land.Price).toLocaleString()} ฿
                      </p>
                    )}

                    {/* Tags */}
                    {land.Tag && land.Tag.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                        {land.Tag.slice(0, 4).map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 12,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #dbeafe",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ขนาดที่ดิน (ถ้ามี) */}
                    {land.Landtitle && (
                      <div style={{ marginTop: 10, color: "#444", fontSize: 13 }}>
                        {[
                          (land.Landtitle.Rai ?? 0) + " ไร่",
                          (land.Landtitle.Ngan ?? 0) + " งาน",
                          (land.Landtitle.SquareWa ?? 0) + " ตร.วา",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List view เรียบง่าย
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredLands.map((land) => {
              const addr = addressText(land);
              return (
                <div
                  key={land.ID}
                  onClick={() => navigate(`/user/landdetail/${land.ID}`)}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: "0.9rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={land.Image || "/default-image.png"}
                    alt={land.Name ?? "land"}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = "/default-image.png")
                    }
                    style={{
                      width: 88,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 8,
                      flex: "0 0 auto",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#222" }}>
                      {land.Name || "ชื่อที่ดินไม่ระบุ"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#666" }}>
                      <MapPin style={{ fontSize: 14 }} />
                      <span style={{ fontSize: 14 }}>{addr || "—"}</span>
                    </div>
                  </div>
                  {land.Price != null && (
                    <div style={{ fontWeight: 800, color: "#0f766e" }}>
                      {Number(land.Price).toLocaleString()} ฿
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export default SellPostMain;