import React, { useState } from 'react';
import { useEffect } from 'react';
import { GetLandtitlesByUser } from '../../service/https/garfield/http';
import { GetAllProvinces, GetDistrict, GetSubdistrict } from '../../service/https/garfield/http';
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
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);
  
  // โหลดข้อมูล lookup จังหวัด อำเภอ ตำบล
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const prov = await GetAllProvinces();
        setProvinces(Array.isArray(prov) ? prov : []);
        // ดึงอำเภอและตำบลทั้งหมด (ตัวอย่าง: provinceId=2, districtId=53)
        const dist = await GetDistrict(2);
        setDistricts(Array.isArray(dist) ? dist : []);
        const subdist = await GetSubdistrict(53);
        setSubdistricts(Array.isArray(subdist) ? subdist : []);
      } catch {}
    };
    fetchLookups();
  }, []);
  const [selectedDeed, setSelectedDeed] = useState<LandDeed | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');

  const [verifiedDeeds, setVerifiedDeeds] = useState<LandDeed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันแปลงข้อมูลจาก backend ให้ตรงกับ LandDeed interface
  const mapLandDeed = (raw: any): LandDeed => ({
    id: String(raw.ID ?? raw.id ?? ''),
    title: raw.title_deed_number || raw.title || '',
    area: Number(raw.rai ?? raw.area ?? 0),
      location:
        (() => {
          // province
          let provinceName = '';
          if (raw.Province?.name_th) provinceName = raw.Province.name_th;
          else if (raw.Province?.Name) provinceName = raw.Province.Name;
          else if (raw.ProvinceID && provinces.length > 0) {
            const found = provinces.find((p) => Number(p.ID ?? p.id) === Number(raw.ProvinceID));
            provinceName = found?.name_th || found?.Name || '';
          }
          // district
          let districtName = '';
          if (raw.District?.name_th) districtName = raw.District.name_th;
          else if (raw.District?.Name) districtName = raw.District.Name;
          else if (raw.DistrictID && districts.length > 0) {
            const found = districts.find((d) => Number(d.ID ?? d.id) === Number(raw.DistrictID));
            districtName = found?.name_th || found?.Name || '';
          }
          // subdistrict
          let subdistrictName = '';
          if (raw.Subdistrict?.name_th) subdistrictName = raw.Subdistrict.name_th;
          else if (raw.Subdistrict?.Name) subdistrictName = raw.Subdistrict.Name;
          else if (raw.SubdistrictID && subdistricts.length > 0) {
            const found = subdistricts.find((s) => Number(s.ID ?? s.id) === Number(raw.SubdistrictID));
            subdistrictName = found?.name_th || found?.Name || '';
          }
          // fallback เป็น ID เฉพาะกรณี lookup ยังไม่โหลดหรือไม่พบข้อมูล
          return `ตำบล${subdistrictName || raw.SubdistrictID || ''} อำเภอ${districtName || raw.DistrictID || ''} จังหวัด${provinceName || raw.ProvinceID || ''}`;
        })(),
    owner: raw.User?.Firstname ? `${raw.User.Firstname} ${raw.User.Lastname}` : '',
    issueDate: raw.CreatedAt ? new Date(raw.CreatedAt).toISOString().slice(0, 10) : '',
    expiryDate: raw.UpdatedAt ? new Date(raw.UpdatedAt).toISOString().slice(0, 10) : '',
    verified: !!raw.Status_verify,
    verificationDate: raw.UpdatedAt ? new Date(raw.UpdatedAt).toISOString().slice(0, 10) : '',
    coordinates: { lat: 0, lng: 0 }, // ปรับตามข้อมูลจริงถ้ามี
    documentHash: raw.Uuid || '',
  });

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    if (userId && token) {
      const fetchLandDeeds = async () => {
        setLoading(true);
        setError(null);
        try {
          const { result } = await GetLandtitlesByUser(userId);
          if (Array.isArray(result)) {
            setVerifiedDeeds(result.map(mapLandDeed));
          } else {
            setVerifiedDeeds([]);
            setError('ไม่พบข้อมูลโฉนดที่ดิน');
          }
        } catch (err) {
          setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
          setVerifiedDeeds([]);
        } finally {
          setLoading(false);
        }
      };
      fetchLandDeeds();
    } else {
      setError('กรุณาเข้าสู่ระบบก่อน');
      setVerifiedDeeds([]);
      setLoading(false);
    }
  }, []);

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
                  {loading ? (
                    <div className="deed-item-modern">กำลังโหลดข้อมูล...</div>
                  ) : error ? (
                    <div className="deed-item-modern" style={{ color: 'red' }}>{error}</div>
                  ) : verifiedDeeds.length === 0 ? (
                    <div className="deed-item-modern">ไม่พบข้อมูลโฉนดที่ดิน</div>
                  ) : (
                    verifiedDeeds.map((deed) => (
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
                    ))
                  )}
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
