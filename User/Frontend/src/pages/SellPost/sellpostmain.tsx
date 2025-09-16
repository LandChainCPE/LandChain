import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Grid3X3, List, Filter, SortAsc } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetAllPostLandData } from "../../service/https/jib/jib";

type Land = {
  ID: number;
  Name?: string;
  PhoneNumber?: string;
  Images?: string[];
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
  const extractTags = (raw: any, tagsArr: any): string[] | undefined => {
    let result: string[] = [];
    if (raw) {
      if (Array.isArray(raw)) {
        result = raw.map((t) => t?.Tag ?? t?.tag ?? t?.name ?? t?.Name).filter(Boolean);
      } else {
        const one = raw?.Tag ?? raw?.tag ?? raw?.name ?? raw?.Name;
        if (one) result.push(one);
      }
    }
    if (Array.isArray(tagsArr)) {
      result = result.concat(
        tagsArr.map((t: any) => t?.Tag ?? t?.tag ?? t?.name ?? t?.Name).filter(Boolean)
      );
    }
    return result.length ? result : undefined;
  };

  let images: string[] = [];
  if (Array.isArray(item.Photoland) && item.Photoland.length > 0) {
    images = item.Photoland.map((p: any) => p.Path).filter(Boolean);
  } else if (item.image ?? item.Image) {
    images = [item.image ?? item.Image];
  }

  const provinceObj = item.province ?? item.Province ?? item.ProvinceTH ?? item.provinceTH ?? undefined;
  const districtObj = item.district ?? item.District ?? undefined;
  const subdistrictObj = item.subdistrict ?? item.Subdistrict ?? undefined;
  const landtitleObj = item.landtitle ?? item.Landtitle ?? undefined;

  return {
    ID: item.id ?? item.ID,
    Name: item.name ?? item.Name,
    PhoneNumber: item.phone_number ?? item.PhoneNumber,
    Images: images,
    ProvinceID: item.province_id ?? item.ProvinceID,
    DistrictID: item.district_id ?? item.DistrictID,
    SubdistrictID: item.subdistrict_id ?? item.SubdistrictID,
    Price: item.price ?? item.Price,
    Tag: extractTags(item.tag ?? item.Tag, item.tags ?? item.Tags),
    Province: provinceObj ? { NameTH: provinceObj.name_th ?? provinceObj.NameTH } : undefined,
    District: districtObj ? { NameTH: districtObj.name_th ?? districtObj.NameTH } : undefined,
    Subdistrict: subdistrictObj ? { NameTH: subdistrictObj.name_th ?? subdistrictObj.NameTH } : undefined,
    Area: item.area ?? item.Area,
    Landtitle: landtitleObj ? {
      Rai: landtitleObj.rai ?? landtitleObj.Rai,
      Ngan: landtitleObj.ngan ?? landtitleObj.Ngan,
      SquareWa: landtitleObj.square_wa ?? landtitleObj.SquareWa,
      TitleDeedNumber: landtitleObj.title_deed_number ?? landtitleObj.TitleDeedNumber,
    } : undefined,
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
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
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
    let filtered = lands;
    
    if (term) {
      filtered = lands.filter((land) => {
        const name = land.Name?.toLowerCase() ?? "";
        const prov = land.Province?.NameTH?.toLowerCase() ?? "";
        const dist = land.District?.NameTH?.toLowerCase() ?? "";
        const subd = land.Subdistrict?.NameTH?.toLowerCase() ?? "";
        return [name, prov, dist, subd].some((x) => x.includes(term));
      });
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.Price ?? 0) - (b.Price ?? 0);
        case "price-high":
          return (b.Price ?? 0) - (a.Price ?? 0);
        default:
          return b.ID - a.ID; // newest first
      }
    });

    return filtered;
  }, [lands, searchTerm, sortBy]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff, #f3e8ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            margin: '0 auto'
          }}>
            <div style={{
              position: 'absolute',
              inset: '0',
              border: '4px solid #c7d2fe',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              inset: '0',
              border: '4px solid #2563eb',
              borderRadius: '50%',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>กำลังโหลดข้อมูลที่ดิน</h3>
            <p style={{
              color: '#4b5563'
            }}>โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff, #f3e8ff)'
    }}>
      {/* Enhanced Header */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(to right, #172E25, #3F5658, #6F969B)',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.1)'
        }}></div>
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent)'
        }}></div>
        
        <div style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 24px'
        }}>
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            {/* Title Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h1 style={{
                fontSize: '50px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, white, #dbeafe, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontFamily: "kanit"
              }}>
                ประกาศขายที่ดิน
              </h1>
            </div>

            {/* CTA Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={handlePostLand}
                style={{
                  position: 'relative',
                  padding: '10px 20px',
                  background: 'linear-gradient(to right, #10b981, #059669)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(16, 185, 129, 0.25)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0) scale(1)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <span style={{
                  position: 'relative',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '18px'
                }}>
                  <span style={{ fontSize: '32px' }}>+</span>
                  ประกาศขายที่ดิน
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filter Bar */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '10px 15px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Enhanced Search Bar */}
            <div style={{
              position: 'relative',
              flex: 1,
              maxWidth: '768px',
              width: '100%'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                bottom: '0',
                left: '0',
                paddingLeft: '24px',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Search style={{
                  height: '24px',
                  width: '24px',
                  color: '#3b82f6'
                }} />
              </div>
              <input
                type="text"
                placeholder="ค้นหาที่ดิน, จังหวัด, อำเภอ, ตำบล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  paddingLeft: '64px',
                  paddingRight: '32px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  fontSize: '16px',
                  color: '#111827',
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '20px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                }}
              />
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '12px 20px',
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  color: '#374151',
                  fontWeight: '600',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                }}
              >
                <option value="newest">🕒 ใหม่ล่าสุด</option>
                <option value="price-low">💰 ราคาต่ำ - สูง</option>
                <option value="price-high">💎 ราคาสูง - ต่ำ</option>
              </select>

              {/* View Toggle */}
              <div style={{
                display: 'flex',
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '6px',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
              }}>
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    background: viewMode === "grid" ? '#3b82f6' : 'transparent',
                    color: viewMode === "grid" ? 'white' : '#6b7280',
                    boxShadow: viewMode === "grid" ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                    transform: viewMode === "grid" ? 'scale(1.05)' : 'scale(1)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== "grid") {
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== "grid") {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Grid3X3 style={{ width: '20px', height: '20px' }} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    background: viewMode === "list" ? '#3b82f6' : 'transparent',
                    color: viewMode === "list" ? 'white' : '#6b7280',
                    boxShadow: viewMode === "list" ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                    transform: viewMode === "list" ? 'scale(1.05)' : 'scale(1)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== "list") {
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== "list") {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <List style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        {filteredLands.length === 0 ? (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            paddingTop: '32px',
            paddingBottom: '32px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Search style={{ width: '40px', height: '40px', color: '#60a5fa' }} />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px'
            }}>ไม่พบผลลัพธ์</h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              {searchTerm 
                ? `ไม่พบที่ดินที่ตรงกับ "${searchTerm}"`
                : "ยังไม่มีประกาศขายที่ดิน"
              }
            </p>
            <button
              onClick={() => setSearchTerm("")}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                fontWeight: '600',
                borderRadius: '12px',
                transition: 'colors 0.2s ease',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6';
              }}
            >
              ดูทั้งหมด
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {filteredLands.map((land) => {
              const addr = addressText(land);
              return (
                <div
                  key={land.ID}
                  onClick={() => navigate(`/user/landdetail/${land.ID}`)}
                  style={{
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.5s ease',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transform: 'translateY(0) scale(1)',
                    border: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  {/* Image Container */}
                  <div style={{
                    position: 'relative',
                    height: '224px',
                    background: 'linear-gradient(to bottom right, #60a5fa, #a855f7, #4f46e5)',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={land.Images && land.Images.length > 0 ? land.Images[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3E ไม่มีรูปภาพ %3C/text%3E%3C/svg%3E"}
                      alt={land.Name ?? "land"}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3E ไม่มีรูปภาพ %3C/text%3E%3C/svg%3E";
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.7s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Price Badge */}
                    {land.Price != null && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#10b981',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}>
                        ฿{Number(land.Price).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <h3 style={{
                      fontWeight: 'bold',
                      fontSize: '20px',
                      color: '#1f2937',
                      transition: 'color 0.2s ease',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {land.Name || "ชื่อที่ดินไม่ระบุ"}
                    </h3>

                    {/* Location */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      color: '#4b5563'
                    }}>
                      <MapPin style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        flexShrink: 0,
                        color: '#3b82f6'
                      }} />
                      <span style={{
                        fontSize: '14px',
                        lineHeight: '1.625',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>{addr || "ไม่ระบุที่อยู่"}</span>
                    </div>

                    {/* Land Size */}
                    {land.Landtitle && (
                      <div style={{
                        background: '#eff6ff',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid #dbeafe'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          color: '#2563eb',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>📏 ขนาดที่ดิน</div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#1e40af'
                        }}>
                          {[
                            land.Landtitle.Rai && `${land.Landtitle.Rai} ไร่`,
                            land.Landtitle.Ngan && `${land.Landtitle.Ngan} งาน`,
                            land.Landtitle.SquareWa && `${land.Landtitle.SquareWa} ตร.วา`,
                          ].filter(Boolean).join(" ") || "ไม่ระบุขนาด"}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {land.Tag && land.Tag.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {land.Tag.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: '#f3e8ff',
                              color: '#7c3aed',
                              borderRadius: '50px',
                              border: '1px solid #e9d5ff'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {land.Tag.length > 3 && (
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: '#f3f4f6',
                            color: '#4b5563',
                            borderRadius: '50px'
                          }}>
                            +{land.Tag.length - 3} เพิ่มเติม
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {filteredLands.map((land) => {
              const addr = addressText(land);
              return (
                <div
                  key={land.ID}
                  onClick={() => navigate(`/user/landdetail/${land.ID}`)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    padding: '32px',
                    cursor: 'pointer',
                    border: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#c7d2fe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#f3f4f6';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px'
                  }}>
                    {/* Image */}
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={land.Images && land.Images.length > 0 ? land.Images[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%236b7280'%3E ไม่มีรูปภาพ %3C/text%3E%3C/svg%3E"}
                        alt={land.Name ?? "land"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%236b7280'%3E ไม่มีรูปภาพ %3C/text%3E%3C/svg%3E";
                        }}
                        style={{
                          width: '100%',
                          maxWidth: '256px',
                          height: '160px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{
                      flex: 1,
                      minWidth: 0
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            transition: 'color 0.2s ease',
                            marginBottom: '16px'
                          }}>
                            {land.Name || "ชื่อที่ดินไม่ระบุ"}
                          </h3>

                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            color: '#4b5563',
                            marginBottom: '12px'
                          }}>
                            <MapPin style={{
                              width: '20px',
                              height: '20px',
                              marginTop: '2px',
                              flexShrink: 0,
                              color: '#3b82f6'
                            }} />
                            <span style={{ fontSize: '16px' }}>{addr || "ไม่ระบุที่อยู่"}</span>
                          </div>

                          {/* Land Size */}
                          {land.Landtitle && (
                            <div style={{
                              fontSize: '16px',
                              color: '#374151',
                              marginBottom: '12px'
                            }}>
                              <span style={{
                                fontWeight: '600',
                                color: '#2563eb'
                              }}>📏 ขนาด: </span>
                              {[
                                land.Landtitle.Rai && `${land.Landtitle.Rai} ไร่`,
                                land.Landtitle.Ngan && `${land.Landtitle.Ngan} งาน`,
                                land.Landtitle.SquareWa && `${land.Landtitle.SquareWa} ตร.วา`,
                              ].filter(Boolean).join(" ") || "ไม่ระบุขนาด"}
                            </div>
                          )}

                          {/* Tags */}
                          {land.Tag && land.Tag.length > 0 && (
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}>
                              {land.Tag.slice(0, 5).map((tag, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    background: '#f3e8ff',
                                    color: '#7c3aed',
                                    borderRadius: '12px',
                                    border: '1px solid #e9d5ff'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        {land.Price != null && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontSize: '30px',
                              fontWeight: 'bold',
                              color: '#059669'
                            }}>
                              ฿{Number(land.Price).toLocaleString()}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              marginTop: '4px'
                            }}>ราคาขาย</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add CSS for spin animation
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style> */}
    </div>
  );
}

export default SellPostMain;