// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LandToBlockchain.css';

interface LandData {
  walletId: string;
  metadata: {
    landTitle: string;
    location: string;
    area: string;
    owner: string;
    registrationDate: string;
  };
  signature: string;
}
function LandToBlockchain() {
  const location = useLocation();
  const navigate = useNavigate();
  const [landData, setLandData] = useState<LandData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  // รับ landId จาก state ที่ส่งมาจากหน้าก่อน
  const [landId] = useState<string | undefined>(location.state?.landId);

  // จำลองการดึงข้อมูลตาม landId
  useEffect(() => {
    if (!landId) {
      navigate('/landcardlist');
      return;
    }
    console.log("LandID ที่รับมา", landId);

    const fetchLandData = async () => {
      try {

        // จำลองข้อมูลโฉนดต่างๆ ตาม ID
        const mockDataMap: { [key: string]: LandData } = {
          '1': {
            walletId: '0x742d35Cc6637C0532e38E123dAC32d1D3c8c9F8B',
            metadata: {
              landTitle: 'โฉนดที่ดิน นส.4ก เลขที่ 12345',
              location: 'บางนา, กรุงเทพมหานคร',
              area: '2-1-50 ไร่',
              owner: 'นายสมชาย ใจดี',
              registrationDate: '2024-01-15'
            },
            signature: '0x8d5e2f1a9b3c4d7e6f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b'
          },
          '2': {
            walletId: '0x9A4d25Cc6637C0532e38E123dAC32d1D3c8c9F7A',
            metadata: {
              landTitle: 'โฉนดที่ดิน นส.3ข เลขที่ 67890',
              location: 'ลาดกระบัง, กรุงเทพมหานคร',
              area: '1-2-75 ไร่',
              owner: 'นางสมใส หวังดี',
              registrationDate: '2024-02-20'
            },
            signature: '0x7c4e1f2a9b3c4d7e6f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a8c'
          },
          '3': {
            walletId: '0x8B3e26Cc6637C0532e38E123dAC32d1D3c8c9F6B',
            metadata: {
              landTitle: 'โฉนดที่ดิน นส.4ง เลขที่ 24680',
              location: 'วังทองหลาง, กรุงเทพมหานคร',
              area: '3-0-25 ไร่',
              owner: 'นายประสิทธิ์ เก่งจริง',
              registrationDate: '2024-03-10'
            },
            signature: '0x6b3d0e1f2a9b3c4d7e6f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f7b'
          }
          // เพิ่มข้อมูลโฉนดอื่นๆ ตามต้องการ
        };

        const selectedLandData = mockDataMap[landId];
        if (selectedLandData) {
          setLandData(selectedLandData);
        } else {
          // ถ้าไม่เจอข้อมูลให้กลับไปหน้ารายการ
          navigate('/landcardlist');
        }
      } catch (error) {
        console.error('Error fetching land data:', error);
        navigate('/landcardlist');
      }
    };

    fetchLandData();
  }, [landId, navigate]);

  const handleTransaction = async () => {
    setIsLoading(true);
    setTransactionStatus('กำลังประมวลผลธุรกรรม...');

    try {
      // จำลองการทำธุรกรรม
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransactionStatus('ธุรกรรมสำเร็จ! ข้อมูลที่ดินถูกบันทึกลงบล็อกเชนแล้ว');
    } catch (error) {
      setTransactionStatus('ธุรกรรมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  if (!landData) {
    return (
      <div className="loading-container">
        <div className="loading-text">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="land-container">
      <div className="land-wrapper">
        {/* Back Button */}
        <div className="back-button-container">
          <button 
            onClick={() => navigate('/user/landcardlist')}
            className="back-button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปรายการโฉนด
          </button>
        </div>

        <div className="land-header">
          <h1 className="land-title">
            บันทึกข้อมูลที่ดินลงบล็อกเชน
          </h1>
          <p className="land-subtitle">
            ตรวจสอบข้อมูลก่อนทำการบันทึกลงบล็อกเชน
          </p>
        </div>

        {/* 3 กล่องเรียงกันในแนวนอน */}
        <div className="boxes-grid">
          {/* WalletID Box */}
          <div className="info-box">
            <div className="box-header">
              <div className="box-icon wallet">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="box-title">Wallet ID</h3>
            </div>
            <div className="box-content">
              <p className="box-label">หมายเลขกระเป๋าเงินดิจิทัล</p>
              <p className="box-value">
                {landData.walletId}
              </p>
            </div>
          </div>

          {/* Metadata Box */}
          <div className="info-box">
            <div className="box-header">
              <div className="box-icon metadata">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="box-title">Metadata</h3>
            </div>
            <div className="box-content">
              <div className="metadata-content">
                <div className="metadata-item">
                  <p className="metadata-label">เลขที่โฉนด</p>
                  <p className="metadata-value">{landData.metadata.landTitle}</p>
                </div>
                <div className="metadata-item">
                  <p className="metadata-label">ที่ตั้ง</p>
                  <p className="metadata-value">{landData.metadata.location}</p>
                </div>
                <div className="metadata-item">
                  <p className="metadata-label">เนื้อที่</p>
                  <p className="metadata-value">{landData.metadata.area}</p>
                </div>
                <div className="metadata-item">
                  <p className="metadata-label">เจ้าของ</p>
                  <p className="metadata-value">{landData.metadata.owner}</p>
                </div>
                <div className="metadata-item">
                  <p className="metadata-label">วันที่จดทะเบียน</p>
                  <p className="metadata-value">{landData.metadata.registrationDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Box */}
          <div className="info-box">
            <div className="box-header">
              <div className="box-icon signature">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="box-title">Signature</h3>
            </div>
            <div className="box-content">
              <p className="box-label">ลายเซ็นดิจิทัล</p>
              <p className="signature-value">
                {landData.signature}
              </p>
              <div className="signature-status">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="signature-status-text">ลายเซ็นถูกต้อง</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Button */}
        <div className="transaction-section">
          <button
            onClick={handleTransaction}
            disabled={isLoading}
            className="transaction-button"
          >
            {isLoading ? (
              <>
                <svg className="spinner" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังประมวลผล...
              </>
            ) : (
              <>
                <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ทำธุรกรรม (Transaction)
              </>
            )}
          </button>

          {/* Transaction Status */}
          {transactionStatus && (
            <div className={`transaction-status ${
              transactionStatus.includes('สำเร็จ') 
                ? 'success' 
                : transactionStatus.includes('ไม่สำเร็จ')
                ? 'error'
                : 'processing'
            }`}>
              <p className="transaction-status-text">{transactionStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandToBlockchain;
