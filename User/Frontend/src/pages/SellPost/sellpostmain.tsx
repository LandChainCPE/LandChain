import React, { useEffect, useState } from "react";
import { Search, MapPin, Calendar, Phone, Filter, Grid, List } from "lucide-react";
import { useNavigate } from 'react-router-dom';

type Land = {
  ID: number;
  Name?: string;
  PhoneNumber?: string;
  AdressLandplot?: string;
  Price?: number;
  UpdatedAt?: string;
  Area?: string;
  Type?: string;
  Features?: string[];
};

function SellPostMain() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handlePostLand = () => {
    navigate("/user/sellpost");  // Navigate to the post land page
  };

  useEffect(() => {
    const hardcodedLands: Land[] = [
      {
        ID: 1,
        Name: "ที่ดินติดถนนใหญ่ ย่านราชดำเนิน",
        AdressLandplot: "ถนนราชดำเนิน, เขตดุสิต, กรุงเทพฯ",
        Price: 2000000,
        UpdatedAt: "2025-08-17T10:00:00",
        Area: "50 ตร.ว.",
        Type: "ที่ดินเปล่า",
        PhoneNumber: "081-234-5678",
        Features: ["ติดถนนใหญ่", "มีไฟฟ้า", "มีน้ำประปา", "ใกล้ BTS"]
      },
      {
        ID: 2,
        Name: "ที่ดินพร้อมสวน ย่านสุขุมวิท",
        AdressLandplot: "ซอยสุขุมวิท 71, เขตวัฒนา, กรุงเทพฯ",
        Price: 1500000,
        UpdatedAt: "2025-08-16T15:30:00",
        Area: "35 ตร.ว.",
        Type: "ที่ดินมีสวน",
        PhoneNumber: "089-567-1234",
        Features: ["มีต้นไม้", "ใกล้รถไฟฟ้า", "ชุมชนดี", "เงียบสงบ"]
      },
      {
        ID: 3,
        Name: "ที่ดินเชิงพาณิชย์ ย่านอโศก",
        AdressLandplot: "ย่านอโศก, เขตวัฒนา, กรุงเทพฯ",
        Price: 3500000,
        UpdatedAt: "2025-08-15T09:15:00",
        Area: "80 ตร.ว.",
        Type: "ที่ดินพาณิชย์",
        PhoneNumber: "092-345-6789",
        Features: ["หน้าร้าน", "ติดถนนหลัก", "พร้อมใช้งาน", "ใกล้MRT"]
      }
    ];

    setTimeout(() => {
      setLands(hardcodedLands);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLands = lands.filter(land =>
    land.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.AdressLandplot?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #cce7ff, #ffffff, #d9f5d0)" }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูลที่ดิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #cce7ff, #ffffff, #d9f5d0)" }}>
      {/* Header Hero Section */}
      <div style={{ position: "relative", background: "linear-gradient(to right, #3b82f6, #9333ea)", color: "white" }}>
        <div style={{ position: "absolute", inset: "0", backgroundColor: "rgba(0, 0, 0, 0.2)" }}></div>
        <div style={{ position: "relative", maxWidth: "1024px", margin: "0 auto", padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "bold", background: "linear-gradient(to right, #fff, #87cefa)", backgroundClip: "text", color: "transparent" }}>
              ประกาศขายที่ดิน
            </h1>
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={handlePostLand}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                fontWeight: "bold",
                borderRadius: "20px",
                fontSize: "1.2rem",
                cursor: "pointer",
                border: "none",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s, transform 0.3s",
              }}
            >
              + ประกาศขายที่ดิน
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", marginTop: "30px" }}>
        <input
          type="text"
          placeholder="ค้นหาที่ดิน, ที่อยู่, หรือพื้นที่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "1rem",
            borderRadius: "30px",
            border: "2px solid #3b82f6",
            outline: "none",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            color: "#333",
          }}
        />
        <Search style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#3b82f6", fontSize: "1.5rem" }} />
      </div>

      {/* Controls Section */}
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1rem", color: "#333" }}>
            ผลการค้นหา: {filteredLands.length} รายการ
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ padding: "10px 15px", backgroundColor: "#3b82f6", color: "white", borderRadius: "20px", fontSize: "1rem", display: "flex", alignItems: "center", gap: "5px" }}>
              <Filter style={{ fontSize: "1.2rem" }} />
              ตัวกรอง
            </button>
            <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: "20px" }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: "10px",
                  backgroundColor: viewMode === 'grid' ? "#3b82f6" : "white",
                  color: viewMode === 'grid' ? "white" : "#333",
                  borderRadius: "20px 0 0 20px",
                }}
              >
                <Grid style={{ fontSize: "1.5rem" }} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: "10px",
                  backgroundColor: viewMode === 'list' ? "#3b82f6" : "white",
                  color: viewMode === 'list' ? "white" : "#333",
                  borderRadius: "0 20px 20px 0",
                }}
              >
                <List style={{ fontSize: "1.5rem" }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Land Listings */}
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem" }}>
        {viewMode === 'grid' ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {filteredLands.map((land) => (
              <div key={land.ID} style={{ backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ height: "200px", background: "linear-gradient(to right, #3b82f6, #9333ea)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ color: "white", textAlign: "center" }}>
                      <MapPin style={{ fontSize: "3rem" }} />
                      <p style={{ fontSize: "1.2rem" }}>{land.Area}</p>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }}>{land.Name || "ชื่อที่ดินไม่ระบุ"}</h3>
                  <div style={{ display: "flex", alignItems: "center", marginTop: "10px", color: "#666" }}>
                    <MapPin style={{ fontSize: "1rem", marginRight: "5px" }} />
                    <span>{land.AdressLandplot || "ที่อยู่ไม่ระบุ"}</span>
                  </div>
                  {land.Features && (
                    <div style={{ marginTop: "10px" }}>
                      {land.Features.map((feature, index) => (
                        <span key={index} style={{ display: "inline-block", padding: "5px 10px", backgroundColor: "#e0f7fa", marginRight: "5px", fontSize: "0.875rem", borderRadius: "20px", color: "#00796b" }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#00796b" }}>
                      {land.Price ? `${land.Price.toLocaleString()} ฿` : "ติดต่อสอบถาม"}
                    </span>
                    {land.PhoneNumber && (
                      <button style={{ color: "#00796b", border: "1px solid #00796b", padding: "5px 10px", borderRadius: "20px", fontSize: "0.875rem" }}>
                        <Phone style={{ fontSize: "1rem", marginRight: "5px" }} />
                        ติดต่อ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "1.5rem" }}>
            {filteredLands.map((land) => (
              <div key={land.ID} style={{ backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
                <div style={{ background: "linear-gradient(to right, #3b82f6, #9333ea)", color: "white", padding: "20px", borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <MapPin style={{ fontSize: "2rem" }} />
                    <p style={{ fontSize: "1.2rem", marginLeft: "10px" }}>{land.Area}</p>
                  </div>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>{land.Name || "ชื่อที่ดินไม่ระบุ"}</h3>
                  <div style={{ display: "flex", alignItems: "center", marginTop: "10px", color: "#666" }}>
                    <MapPin style={{ fontSize: "1rem", marginRight: "5px" }} />
                    <span>{land.AdressLandplot || "ที่อยู่ไม่ระบุ"}</span>
                  </div>
                  {land.Features && (
                    <div style={{ marginTop: "10px" }}>
                      {land.Features.map((feature, index) => (
                        <span key={index} style={{ display: "inline-block", padding: "5px 10px", backgroundColor: "#e0f7fa", marginRight: "5px", fontSize: "0.875rem", borderRadius: "20px", color: "#00796b" }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#00796b" }}>
                      {land.Price ? `${land.Price.toLocaleString()} ฿` : "ติดต่อสอบถาม"}
                    </span>
                    {land.PhoneNumber && (
                      <button style={{ color: "#00796b", border: "1px solid #00796b", padding: "5px 10px", borderRadius: "20px", fontSize: "0.875rem" }}>
                        <Phone style={{ fontSize: "1rem", marginRight: "5px" }} />
                        ติดต่อ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellPostMain;
