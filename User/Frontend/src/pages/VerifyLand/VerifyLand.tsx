import React, { useState } from 'react';
import { Upload, FileText, MapPin, User, CheckCircle, AlertCircle, Loader2, Shield, Hash } from 'lucide-react';
import { Container } from 'react-bootstrap';
import './VerifyLand.css';   // ✅ import CSS แยกไฟล์


interface LandDeed {
  id: string;
  title: string;
  area: number;
  location: string;
  owner: string;
  issueDate: string;
  expiryDate: string;
  verified: boolean;
  verificationDate: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  documentHash: string;
}

const VerifyLand: React.FC = () => {
  const [selectedDeed, setSelectedDeed] = useState<LandDeed | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');

  const verifiedDeeds: LandDeed[] = [
    {
      id: 'LD-001',
      title: 'โฉนดที่ดินเลขที่ 12345',
      area: 400,
      location: 'ตำบลในเมือง อำเภอเมือง จังหวดนครราชสีมา',
      owner: 'นายสมชาย ใจดี',
      issueDate: '2020-03-15',
      expiryDate: '2045-03-15',
      verified: true,
      verificationDate: '2024-12-01',
      coordinates: { lat: 14.9799, lng: 102.0977 },
      documentHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12'
    },
    {
      id: 'LD-002',
      title: 'โฉนดที่ดินเลขที่ 67890',
      area: 800,
      location: 'ตำบลปากช่อง อำเภอปากช่อง จังหวดนครราชสีมา',
      owner: 'นางสาววิมล รักดี',
      issueDate: '2018-07-22',
      expiryDate: '2043-07-22',
      verified: true,
      verificationDate: '2024-11-28',
      coordinates: { lat: 14.6307, lng: 101.3784 },
      documentHash: '0x9876543210fedcba0987654321fedcba09876543'
    }
  ];

  const handleUploadToBlockchain = async () => {
    if (!selectedDeed) return;

    setUploadStatus('uploading');
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 40)}`;
      setTransactionHash(mockTxHash);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
    }
  };

  const formatArea = (area: number) => `${area.toLocaleString()} ตารางวา`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="verify-land-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      <div className="hero-section">
        <Container>
          <div className="hero-content">
            <div className="hero-badge">
              <span>🏛️ Blockchain Land Verification</span>
            </div>
            <h1 className="hero-title">
              <span className="gradient-text">อัปโหลดโฉนดสู่ Blockchain</span>
            </h1>
            <p className="hero-subtitle">
              นำโฉนดที่ดินที่ผ่านการตรวจสอบแล้วขึ้นสู่ระบบ Blockchain
              <br />
              เพื่อความปลอดภัยและความโปร่งใสสูงสุด
            </p>
          </div>
        </Container>
      </div>

      <Container className="main-container">
        <div className="upload-grid">
          {/* Left Section */}
          <div className="upload-left">
            <div className="glass-card">
              <div className="card-glow"></div>
              <div className="section-card-body">
                <div className="section-header">
                  <div className="section-icon">
                    <FileText className="icon-xxl" />
                  </div>
                  <h2>เลือกโฉนดที่ดิน</h2>
                  <p>เลือกจากรายการโฉนดที่ผ่านการตรวจสอบแล้ว</p>
                </div>

                <div className="deed-list">
                  {verifiedDeeds.map((deed) => (
                    <div
                      key={deed.id}
                      onClick={() => setSelectedDeed(deed)}
                      className={`deed-item-modern ${selectedDeed?.id === deed.id ? 'active' : ''}`}
                    >
                      <div className="deed-card-shine"></div>
                      <div className="deed-item-header">
                        <h3>{deed.title}</h3>
                        <div className="verified-badge">
                          <CheckCircle className="icon-green" />
                          <span>ยืนยันแล้ว</span>
                        </div>
                      </div>
                      <div className="deed-info-grid">
                        <div className="deed-info-item">
                          <User className="icon-small" />
                          <span>{deed.owner}</span>
                        </div>
                        <div className="deed-info-item">
                          <MapPin className="icon-small" />
                          <span>{formatArea(deed.area)}</span>
                        </div>
                      </div>
                      <div className="deed-location">{deed.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="upload-right">
            {selectedDeed ? (
              <div className="glass-card">
                <div className="card-glow"></div>
                <div className="section-card-body">
                  <div className="section-header">
                    <div className="section-icon">
                      <Shield className="icon-xxl" />
                    </div>
                    <h2>รายละเอียดโฉนด</h2>
                    <p>ข้อมูลโฉนดที่เลือกและพร้อมอัปโหลด</p>
                  </div>

                  <div className="deed-details-modern">
                    <div className="alert-modern success">
                      <div className="alert-icon">✅</div>
                      <div className="alert-content">
                        <div className="alert-title">ได้รับการตรวจสอบแล้ว</div>
                        <div className="alert-message">เมื่อ {formatDate(selectedDeed.verificationDate)}</div>
                      </div>
                    </div>

                    <div className="deed-info-cards">
                      <div className="info-card">
                        <label>เลขที่โฉนด</label>
                        <p>{selectedDeed.id}</p>
                      </div>
                      <div className="info-card">
                        <label>เจ้าของ</label>
                        <p>{selectedDeed.owner}</p>
                      </div>
                      <div className="info-card">
                        <label>เนื้อที่</label>
                        <p>{formatArea(selectedDeed.area)}</p>
                      </div>
                      <div className="info-card">
                        <label>วันที่ออกโฉนด</label>
                        <p>{formatDate(selectedDeed.issueDate)}</p>
                      </div>
                      <div className="info-card">
                        <label>วันที่หมดอายุ</label>
                        <p>{formatDate(selectedDeed.expiryDate)}</p>
                      </div>
                      <div className="info-card">
                        <label>พิกัด</label>
                        <p>{selectedDeed.coordinates.lat}, {selectedDeed.coordinates.lng}</p>
                      </div>
                    </div>

                    <div className="info-card full-width">
                      <label>ที่ตั้ง</label>
                      <p>{selectedDeed.location}</p>
                    </div>

                    {/* Add spacing */}
                    <div style={{ marginTop: '1rem' }}></div>

                    <div className="hash-display">
                      <label>Wallet ID</label>
                    </div>

                    <div className="hash-display">
                      <label>Signature</label>
                    </div>
                  </div>

                  {/* Upload Section */}
                  <div className="upload-section-modern">
                    {uploadStatus === 'success' ? (
                      <div className="status-modern success">
                        <div className="status-icon-container">
                          <CheckCircle className="status-icon success" />
                        </div>
                        <h3>อัปโหลดสำเร็จ!</h3>
                        <div className="tx-hash-display">
                          <code>{transactionHash}</code>
                        </div>
                        <button
                          className="btn-modern secondary"
                          onClick={() => { setUploadStatus('idle'); setTransactionHash(''); }}
                        >
                          อัปโหลดอีกหนึ่งรายการ
                        </button>
                      </div>
                    ) : uploadStatus === 'error' ? (
                      <div className="status-modern error">
                        <div className="status-icon-container">
                          <AlertCircle className="status-icon error" />
                        </div>
                        <h3>เกิดข้อผิดพลาด</h3>
                        <button
                          className="btn-modern secondary"
                          onClick={() => setUploadStatus('idle')}
                        >
                          ลองใหม่
                        </button>
                      </div>
                    ) : (
                      <div className="status-modern idle">
                        <div className="status-icon-container">
                          <Upload className="status-icon idle" />
                        </div>
                        <h3>พร้อมอัปโหลดสู่ Blockchain</h3>
                        <button
                          className="btn-modern primary"
                          onClick={handleUploadToBlockchain}
                          disabled={uploadStatus === 'uploading'}
                        >
                          <div className="btn-content">
                            {uploadStatus === 'uploading' ? (
                              <>
                                <Loader2 className="btn-icon spin" />
                                <span>กำลังอัปโหลด...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="btn-icon" />
                                <span>อัปโหลดสู่ Blockchain</span>
                                <div className="btn-arrow">→</div>
                              </>
                            )}
                          </div>
                          <div className="btn-ripple"></div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">เลือกโฉนดที่ดิน</h3>
                <p className="empty-message">
                  กรุณาเลือกโฉนดที่ดินจากรายการทางซ้ายเพื่อดูรายละเอียดและอัปโหลดสู่ Blockchain
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default VerifyLand;
