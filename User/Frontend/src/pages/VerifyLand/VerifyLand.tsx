import './VerifyLand.css';   // ✅ import CSS แยกไฟล์
import React, { useState } from 'react';
import { useEffect } from 'react';
import { GetLandtitlesByUser } from '../../service/https/garfield/http';
import { Upload, FileText, MapPin, User, CheckCircle, AlertCircle, Loader2, Shield} from 'lucide-react';
import { Container } from 'react-bootstrap';
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3 } from 'web3';
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
import contractABI from "../VerifyUser/ContractABI.json";
import Navbar from '../../component/user/Navbar';


interface LandDeed {
  id: string;
  title: string;
  rai: number;
  ngan: number;
  square_wa: number;
  area: number; // รวมเป็นตารางวา (ถ้ามี)
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
  land_verification_id?: string; // Add this property if it exists in the data
  documentHash: string;
  wallet: string;
  metafields: string;
  signature: string;
}

const VerifyLand: React.FC = () => {
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
    rai: Number(raw.rai ?? 0),
    ngan: Number(raw.ngan ?? 0),
    square_wa: Number(raw.square_wa ?? 0),
    area: Number(raw.area ?? 0),
    location:
      (raw.Subdistrict?.name_th
        ? `ตำบล${raw.Subdistrict.name_th} `
        : raw.Subdistrict?.Name
          ? `ตำบล${raw.Subdistrict.Name} `
          : raw.SubdistrictID
            ? `ตำบลID:${raw.SubdistrictID} `
            : '') +
      (raw.District?.name_th
        ? `อำเภอ${raw.District.name_th} `
        : raw.District?.Name
          ? `อำเภอ${raw.District.Name} `
          : raw.DistrictID
            ? `อำเภอID:${raw.DistrictID} `
            : '') +
      (raw.Province?.name_th
        ? `จังหวัด${raw.Province.name_th}`
        : raw.Province?.Name
          ? `จังหวัด${raw.Province.Name}`
          : raw.ProvinceID
            ? `จังหวัดID:${raw.ProvinceID}`
            : ''),
    owner: raw.User?.Firstname ? `${raw.User.Firstname} ${raw.User.Lastname}` : '',
    issueDate: raw.CreatedAt ? new Date(raw.CreatedAt).toISOString().slice(0, 10) : '',
    expiryDate: raw.UpdatedAt ? new Date(raw.UpdatedAt).toISOString().slice(0, 10) : '',
    verified: !!raw.Status_verify,
    verificationDate: raw.UpdatedAt ? new Date(raw.UpdatedAt).toISOString().slice(0, 10) : '',
    coordinates: { lat: 0, lng: 0 }, // ปรับตามข้อมูลจริงถ้ามี
    land_verification_id: raw.land_verification_id || raw.LandVerification?.ID || '',
    documentHash: raw.Uuid || '',
    wallet: raw.LandVerification?.wallet || '',
    metafields: raw.LandVerification?.metafields || '',
    signature: raw.LandVerification?.signature || ''
  });

  useEffect(() => {
    console.log('ss', location)
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    console.log('DEBUG user_id:', userId);
    console.log('DEBUG token:', token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('DEBUG token payload:', payload);
      } catch (e) {
        console.log('DEBUG token decode error:', e);
      }
    }
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
      // import web3, detectEthereumProvider, contractABI, contractAddress
      // (already imported at top)
      const provider: any = await detectEthereumProvider();
      if (!provider) {
        alert("กรุณาติดตั้ง MetaMask");
        setUploadStatus('error');
        return;
      }
      const web3 = new Web3(provider);
      const accounts = await web3.eth.requestAccounts();
      const wallet = accounts[0];
      const contractInstance = new web3.eth.Contract(
        contractABI as any,
        contractAddress
      );
      // mintLandTitleNFT(address wallet, string metaFields, bytes signature)
      const tx = await contractInstance.methods.mintLandTitleNFT(
        wallet,
        selectedDeed.metafields,
        selectedDeed.signature
      ).send({ from: wallet });
      setTransactionHash(tx.transactionHash);
      setUploadStatus('success');
      alert('อัปโหลดข้อมูลที่ดินขึ้น Blockchain สำเร็จ!');
    } catch (error: any) {
      setUploadStatus('error');
      alert('Error: ' + (error?.message || error));
    }
  };

  const formatArea = (rai: number, ngan: number, square_wa: number) => {
    return `${rai} ไร่ ${ngan} งาน ${square_wa} ตารางวา`;
  };

  return (
    <div className="verify-land-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      <div className="hero-section">
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
      </div>

      <Container className="main-container">
        <div className="upload-grid">
          {/* Left Section */}
          <div className="upload-left">
            <div className="verifyCard">
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
                          {deed.land_verification_id ? (
                            <div className="verified-badge">
                              <CheckCircle className="icon-green" />
                              <span>ยืนยันแล้ว</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="deed-info-grid">
                          <div className="deed-info-item">
                            <User className="icon-small" />
                            <span>{deed.owner}</span>
                          </div>
                          <div className="deed-info-item">
                            <MapPin className="icon-small" />
                            <span>{formatArea(deed.rai, deed.ngan, deed.square_wa)}</span>
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
              <div className="verifyCard">
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
                    {selectedDeed ? (
                      selectedDeed.verified ? (
                        <div className="alert-modern success">
                          <div className="alert-icon">✅</div>
                          <div className="alert-content">
                            <div className="alert-title">ได้รับการตรวจสอบแล้ว</div>
                          </div>
                        </div>
                      ) : (
                        <div className="alert-modern" style={{ border: '2px solid #dc2626', background: '#fff5f5' }}>
                          <div className="alert-icon">⚠️</div>
                          <div className="alert-content">
                            <div className="alert-title" style={{ color: '#dc2626' }}>ยังไม่ได้รับการตรวจสอบ</div>
                          </div>
                        </div>
                      )
                    ) : null}

                    <div className="deed-info-cards">
                      <div className="info-card full-width">
                        <label>Wallet</label>
                        <p>{selectedDeed.wallet || '-'}</p>
                      </div>
                      <div className="info-card full-width">
                        <label>Signature</label>
                        <div style={{
                          background: '#e9ecef', // same as label background
                          borderRadius: '6px',
                          padding: '8px',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          fontSize: '0.95em',
                          border: '1px solid #e0e0e0'
                        }}>
                          {selectedDeed.signature || '-'}
                        </div>
                      </div>
                      <div className="info-card full-width">
                        <label>Metafields</label>
                        <p>{selectedDeed.metafields || '-'}</p>
                      </div>
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
