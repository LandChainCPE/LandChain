import React, { useState } from "react";
import { Button, Form, Container, Card } from "react-bootstrap";
import Navbar from "../../component/user/Navbar";
import { GetLandHistory, GetInfoUsersByWallets } from "../../service/https/bam/bam";
import "./LandHistory.css";
import CheckLandowner from "../RequestSell/Checklandowner";

interface OwnerInfo {
  wallet: string;
  name?: string;
}

const LandHistory: React.FC = () => {
  const [tokenID, setTokenID] = useState<string>("");
  const [owners, setOwners] = useState<OwnerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFetchHistory = async () => {
    if (!tokenID) {
      setError("กรุณากรอก Token ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await GetLandHistory(tokenID);
      if (data.error) {
        setError(data.error);
        setOwners([]);
        return;
      }

      let ownerWallets: string[] = data.owners || [];
      if (ownerWallets.length <= 1) {
        // ไม่มีข้อมูล หรือเหลือแค่คนแรกที่เป็นข้อมูลผิด
        setOwners([]);
        return;
      }

      // ตัดเจ้าของคนแรกออก (index 0)
      ownerWallets = ownerWallets.slice(1);

      // reverse ลำดับเจ้าของ เพื่อให้เจ้าของปัจจุบันขึ้นบนสุด
      const reversedWallets = [...ownerWallets].reverse();

      const ownerInfos = await GetInfoUsersByWallets(reversedWallets);

      const finalOwners: OwnerInfo[] = reversedWallets.map((wallet) => {
        const info = ownerInfos.find(
          (u: any) => u.Metamaskaddress.toLowerCase() === wallet.toLowerCase()
        );
        return {
          wallet,
          name: info?.Firstname ? `${info.Firstname} ${info.Lastname}` : "-",
        };
      });

      console.log("data ", data);
      console.log("ownerWallets ", ownerWallets);
      console.log("finalOwners ", finalOwners);

      setOwners(finalOwners);
    } catch (e) {
      setError("เกิดข้อผิดพลาด");
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };


  const formatWallet = (wallet: string) => {
    if (wallet.length <= 10) return wallet;
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  
  return (
    <div className="land-history-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>
      
      <Navbar />

      <div className="hero-section">
        <Container>
          <div className="hero-content">
            <div className="hero-badge">
              <span>🏛️ Blockchain Technology</span>
            </div>
            <h1 className="hero-title">
              <span className="gradient-text">ตรวจสอบประวัติโฉนด</span>
            </h1>
            <p className="hero-subtitle">
              ติดตามประวัติการเปลี่ยนมือของที่ดินผ่าน Blockchain Timeline 
              <br />
              ด้วยเทคโนโลยีที่โปร่งใสและปลอดภัย
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">ความโปร่งใส</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">ให้บริการ</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">∞</div>
                <div className="stat-label">ความปลอดภัย</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="main-container">
        
        <div className="search-section">
          <Card className="glass-card search-card">
            <div className="card-glow"></div>
            <div className="search-card-body">
              <div className="search-header">
                <div className="search-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>ค้นหาประวัติโฉนด</h3>
              </div>
              
              <Form onSubmit={(e) => { e.preventDefault(); handleFetchHistory(); }}>
                <Form.Group controlId="tokenID" className="mb-4">
                  <Form.Label className="modern-label">
                    <span className="label-icon">🔑</span>
                    Token ID
                  </Form.Label>
                  <div className="input-group-modern">
                    <Form.Control
                      type="text"
                      placeholder="กรอกหมายเลข Token ID ของที่ดิน"
                      value={tokenID}
                      onChange={(e) => setTokenID(e.target.value)}
                      className="form-control-glass"
                    />
                    <div className="input-highlight"></div>
                  </div>
                </Form.Group>
                
                <div className="search-actions">
                  <Button 
                    className="btn-modern"
                    onClick={handleFetchHistory} 
                    disabled={loading}
                  >
                    <div className="btn-content">
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          <span>กำลังค้นหา...</span>
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🔍</span>
                          <span>ตรวจสอบประวัติ</span>
                          <div className="btn-arrow">→</div>
                        </>
                      )}
                    </div>
                    <div className="btn-ripple"></div>
                  </Button>
                </div>
              </Form>
            </div>
          </Card>
        </div>

        {error && (
          <div className="alert-modern error">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <div className="alert-title">เกิดข้อผิดพลาด</div>
              <div className="alert-message">{error}</div>
            </div>
          </div>
        )}

        {owners.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <div className="results-badge">
                <span className="badge-icon">📊</span>
                <span>ผลการค้นหา</span>
              </div>
              <h2 className="results-title">
                <span className="gradient-text">ประวัติการเปลี่ยนมือ</span>
              </h2>
              <p className="results-subtitle">
                พบประวัติทั้งหมด <span className="highlight-number">{owners.length}</span> รายการ
              </p>
            </div>

            <div className="timeline-modern">
              <div className="timeline-track">
                <div className="timeline-progress" style={{height: `${(owners.length * 200)}px`}}></div>
              </div>


              {owners.map((owner, index) => (
                <div key={index} className={`timeline-node ${index === 0 ? "current" : ""}`}>
                  <div className="timeline-connector">
                    <div className="node-indicator">
                      <div className="node-ring"></div>
                      <div className="node-core">
                      </div>
                    </div>
                  </div>

                  <div className="timeline-card-modern">
                    <div className="card-shine"></div>
                    <div className={`card-header-modern ${index === 0 ? "current" : ""}`}>
                      <div className="header-content">
                        <div className="status-indicator">
                          {index === 0 ? "👑" : "🏛️"}
                        </div>
                        <div className="header-text">
                          <h4 className="card-title-modern">
                            {index === 0 ? "เจ้าของปัจจุบัน" : `เจ้าของคนที่ ${owners.length - index}`}
                          </h4>
                          <p className="card-subtitle-modern">
                            {index === 0 ? "สถานะ: ปัจจุบัน" : `ลำดับ: ${owners.length - index}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-body-modern">
                      <div className="info-grid">
                        <div className="info-card wallet-info">
                          <div className="info-header">
                            <div className="info-icon wallet-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 12V7H5.5C4.11929 7 3 5.88071 3 4.5C3 3.11929 4.11929 2 5.5 2H21V4H5.5C4.67157 4 4 4.67157 4 5.5C4 6.32843 4.67157 7 5.5 7H21V12M21 16V14H5.5C4.67157 14 4 14.6716 4 15.5C4 16.3284 4.67157 17 5.5 17H21V19H5.5C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14H21V16ZM21 12H5.5C4.67157 12 4 11.3284 4 10.5C4 9.67157 4.67157 9 5.5 9H21V12Z" fill="currentColor"/>
                              </svg>
                            </div>
                            <span className="info-label">Wallet Address</span>
                          </div>
                          <div className="wallet-display">
                            <span className="wallet-address-full">{formatWallet(owner.wallet)}</span>
                            <button 
                              className="copy-btn"
                              onClick={() => copyToClipboard(owner.wallet)}
                              title="Copy to clipboard"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H16M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="info-card owner-info">
                          <div className="info-header">
                            <div className="info-icon owner-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                              </svg>
                            </div>
                            <span className="info-label">ชื่อเจ้าของ</span>
                          </div>
                          <div className="owner-name-display">
                            <span className={`owner-name-text ${owner.name === '-' ? 'unknown' : ''}`}>
                              {owner.name === '-' ? 'ไม่ระบุชื่อ' : owner.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && owners.length === 0 && tokenID && !error && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">ไม่พบข้อมูล</h3>
            <p className="empty-message">
              ไม่พบประวัติการเปลี่ยนมือสำหรับ Token ID: <span className="token-highlight">{tokenID}</span>
            </p>
            <Button className="btn-secondary-modern" onClick={() => setTokenID("")}>
              ลองค้นหาอีกครั้ง
            </Button>
          </div>
        )}
      </Container>
      <CheckLandowner/>
    </div>
  );
};

export default LandHistory;