import React, { useState } from 'react';
import { Upload, FileText, MapPin, User, CheckCircle, AlertCircle, Loader2, Shield, Hash } from 'lucide-react';
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
    <div className="upload-container">
      <div className="upload-wrapper">
        <div className="upload-header">
          <h1>อัปโหลดโฉนดที่ดินสู่ Blockchain</h1>
          <p>นำโฉนดที่ดินที่ผ่านการตรวจสอบแล้วขึ้นสู่ระบบ Blockchain เพื่อความปลอดภัยสูงสุด</p>
        </div>

        <div className="upload-grid">
          {/* Left */}
          <div className="upload-left">
            <div className="section-header">
              <FileText className="icon-blue" />
              <h2>เลือกโฉนดที่ดิน</h2>
            </div>
            <div className="deed-list">
              {verifiedDeeds.map((deed) => (
                <div
                  key={deed.id}
                  onClick={() => setSelectedDeed(deed)}
                  className={`deed-item ${selectedDeed?.id === deed.id ? 'active' : ''}`}
                >
                  <div className="deed-item-header">
                    <h3>{deed.title}</h3>
                    <div className="verified">
                      <CheckCircle className="icon-green" />
                      <span>ยืนยันแล้ว</span>
                    </div>
                  </div>
                  <div className="deed-info">
                    <div><User className="icon-small" /> {deed.owner}</div>
                    <div><MapPin className="icon-small" /> {formatArea(deed.area)}</div>
                  </div>
                  <div className="deed-location">{deed.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="upload-right">
            {selectedDeed ? (
              <>
                <div className="section-header">
                  <Shield className="icon-green" />
                  <h2>รายละเอียดโฉนด</h2>
                </div>

                <div className="deed-details">
                  <div className="verified-box">
                    <CheckCircle className="icon-green" />
                    <span>ได้รับการตรวจสอบแล้วเมื่อ {formatDate(selectedDeed.verificationDate)}</span>
                  </div>

                  <div className="deed-grid">
                    <div>
                      <label>เลขที่โฉนด</label>
                      <p>{selectedDeed.id}</p>
                    </div>
                    <div>
                      <label>เจ้าของ</label>
                      <p>{selectedDeed.owner}</p>
                    </div>
                    <div>
                      <label>เนื้อที่</label>
                      <p>{formatArea(selectedDeed.area)}</p>
                    </div>
                    <div>
                      <label>วันที่ออกโฉนด</label>
                      <p>{formatDate(selectedDeed.issueDate)}</p>
                    </div>
                    <div>
                      <label>วันที่หมดอายุ</label>
                      <p>{formatDate(selectedDeed.expiryDate)}</p>
                    </div>
                    <div>
                      <label>พิกัด</label>
                      <p>{selectedDeed.coordinates.lat}, {selectedDeed.coordinates.lng}</p>
                    </div>
                  </div>

                  <div>
                    <label>ที่ตั้ง</label>
                    <p>{selectedDeed.location}</p>
                  </div>

                  <div className="hash-box">
                    <Hash className="icon-small" /> {selectedDeed.documentHash}
                  </div>
                </div>

                {/* Upload */}
                <div className="upload-section">
                  {uploadStatus === 'success' ? (
                    <div className="status success">
                      <CheckCircle className="status-icon success" />
                      <h3>อัปโหลดสำเร็จ!</h3>
                      <p className="tx-hash">{transactionHash}</p>
                      <button onClick={() => { setUploadStatus('idle'); setTransactionHash(''); }}>
                        อัปโหลดอีกหนึ่งรายการ
                      </button>
                    </div>
                  ) : uploadStatus === 'error' ? (
                    <div className="status error">
                      <AlertCircle className="status-icon error" />
                      <h3>เกิดข้อผิดพลาด</h3>
                      <button onClick={() => setUploadStatus('idle')}>ลองใหม่</button>
                    </div>
                  ) : (
                    <div className="status idle">
                      <Upload className="status-icon idle" />
                      <h3>พร้อมอัปโหลดสู่ Blockchain</h3>
                      <button onClick={handleUploadToBlockchain} disabled={uploadStatus === 'uploading'}>
                        {uploadStatus === 'uploading' ? <Loader2 className="spin" /> : <Upload />}
                        {uploadStatus === 'uploading' ? 'กำลังอัปโหลด...' : 'อัปโหลดสู่ Blockchain'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty">
                <FileText className="empty-icon" />
                <h3>เลือกโฉนดที่ดิน</h3>
                <p>กรุณาเลือกโฉนดที่ดินจากรายการทางซ้ายเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyLand;
