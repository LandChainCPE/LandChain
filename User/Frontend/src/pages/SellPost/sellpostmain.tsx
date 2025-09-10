import React, { useEffect, useState } from "react";
import { Search, MapPin, Phone } from "lucide-react";
import { useNavigate } from 'react-router-dom';

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
  Province?: { Name: string };
  District?: { Name: string };
  Subdistrict?: { Name: string };
  Area?: string;
};

function SellPostMain() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handlePostLand = () => {
    navigate("/user/sellpost"); // Navigate to post land page
  };

  useEffect(() => {
    const hardcodedLands: Land[] = [
      { ID: 1, Name: "ที่ดินติดถนนใหญ่ ย่านราชดำเนิน", Price: 2000000, PhoneNumber: "081-234-5678" },
      { ID: 2, Name: "ที่ดินพร้อมสวน ย่านสุขุมวิท", Price: 1500000, PhoneNumber: "089-567-1234" },
      { ID: 3, Name: "ที่ดินเชิงพาณิชย์ ย่านอโศก", Price: 3500000, PhoneNumber: "092-345-6789" }
    ];

    setTimeout(() => {
      setLands(hardcodedLands);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLands = lands.filter(land =>
    land.Name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <div style={{ position: "relative", background: "linear-gradient(to right, #3b82f6, #9333ea)", color: "white" }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" }}></div>
        <div style={{ position: "relative", maxWidth: "1024px", margin: "0 auto", padding: "2rem" }}>
          <h1 style={{ textAlign: "center", fontSize: "3rem", fontWeight: "bold", background: "linear-gradient(to right, #fff, #87cefa)", backgroundClip: "text", color: "transparent", marginBottom: "2rem" }}>
            ประกาศขายที่ดิน
          </h1>
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
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                transition: "0.3s"
              }}
            >
              + ประกาศขายที่ดิน
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: "600px", margin: "30px auto 0", position: "relative" }}>
        <input
          type="text"
          placeholder="ค้นหาที่ดิน, จังหวัด, อำเภอ, ตำบล..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "1rem",
            borderRadius: "30px",
            border: "2px solid #3b82f6",
            outline: "none",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            color: "#333",
          }}
        />
        <Search style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#3b82f6", fontSize: "1.5rem" }} />
      </div>

      {/* Listings */}
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem" }}>
        {viewMode === 'grid' ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {filteredLands.map((land) => (
              <div
                key={land.ID}
                style={{
                  backgroundColor: "white",
                  borderRadius: "15px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  cursor: "pointer"
                }}
                onClick={() => navigate(`/user/landdetail/${land.ID}`)}
              >
                <div style={{ height: "200px", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to right, #3b82f6, #9333ea)" }}>
                  <img
                    src={land.Image || "/default-image.png"}
                    alt="land"
                    style={{ width: "3rem", height: "3rem", objectFit: "cover", borderRadius: "50%" }}
                  />
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }}>{land.Name || "ชื่อที่ดินไม่ระบุ"}</h3>
                  <div style={{ display: "flex", alignItems: "center", marginTop: "10px", color: "#666" }}>
                    <MapPin style={{ fontSize: "1rem", marginRight: "5px" }} />
                    <span>{land.Subdistrict?.Name}, {land.District?.Name}, {land.Province?.Name}</span>
                  </div>
                  {land.Price && (
                    <p style={{ fontWeight: "bold", color: "#00796b", marginTop: "10px" }}>{land.Price.toLocaleString()} ฿</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "1.5rem" }}>
            {/* List view implementation ถ้าต้องการ */}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellPostMain;
