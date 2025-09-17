import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandCardList.css';

interface LandTitle {
  id: string;
  landNumber: string;
  landTitle: string;
  location: string;
  area: string;
  owner: string;
  isOnChain: boolean;
  isVerified: boolean;
  registrationDate: string;
  thumbnailImage?: string;
}

function LandCardList() {
  const [landTitles, setLandTitles] = useState<LandTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // จำลองการดึงข้อมูลโฉนดจาก API
  useEffect(() => {
    const fetchLandTitles = async () => {
      try {
        // จำลองข้อมูลโฉนด
        const mockData: LandTitle[] = [
          {
            id: '1',
            landNumber: 'นส.4ก เลขที่ 12345',
            landTitle: 'โฉนดที่ดิน นส.4ก เลขที่ 12345',
            location: 'บางนา, กรุงเทพมหานคร',
            area: '2-1-50 ไร่',
            owner: 'นายสมชาย ใจดี',
            isOnChain: true,
            isVerified: true,
            registrationDate: '2024-01-15'
          },
          {
            id: '2',
            landNumber: 'นส.3ข เลขที่ 67890',
            landTitle: 'โฉนดที่ดิน นส.3ข เลขที่ 67890',
            location: 'ลาดกระบัง, กรุงเทพมหานคร',
            area: '1-2-75 ไร่',
            owner: 'นางสมใส หวังดี',
            isOnChain: false,
            isVerified: true,
            registrationDate: '2024-02-20'
          },
          {
            id: '3',
            landNumber: 'นส.4ง เลขที่ 24680',
            landTitle: 'โฉนดที่ดิน นส.4ง เลขที่ 24680',
            location: 'วังทองหลาง, กรุงเทพมหานคร',
            area: '3-0-25 ไร่',
            owner: 'นายประสิทธิ์ เก่งจริง',
            isOnChain: true,
            isVerified: false,
            registrationDate: '2024-03-10'
          },
          {
            id: '4',
            landNumber: 'นส.2ค เลขที่ 13579',
            landTitle: 'โฉนดที่ดิน นส.2ค เลขที่ 13579',
            location: 'ประเวศ, กรุงเทพมหานคร',
            area: '1-1-20 ไร่',
            owner: 'นางสาวชนิดา สวยงาม',
            isOnChain: false,
            isVerified: false,
            registrationDate: '2024-04-05'
          },
          {
            id: '5',
            landNumber: 'นส.5จ เลขที่ 97531',
            landTitle: 'โฉนดที่ดิน นส.5จ เลขที่ 97531',
            location: 'สะพานสูง, กรุงเทพมหานคร',
            area: '2-3-10 ไร่',
            owner: 'นายวิชัย ถูกต้อง',
            isOnChain: true,
            isVerified: true,
            registrationDate: '2024-05-12'
          },
          {
            id: '6',
            landNumber: 'นส.1ฆ เลขที่ 86420',
            landTitle: 'โฉนดที่ดิน นส.1ฆ เลขที่ 86420',
            location: 'หนองจอก, กรุงเทพมหานคร',
            area: '4-2-15 ไร่',
            owner: 'นายสุรชัย มั่นคง',
            isOnChain: false,
            isVerified: true,
            registrationDate: '2024-06-18'
          }
        ];

        // จำลอง delay เหมือน API call จริง
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLandTitles(mockData);
      } catch (error) {
        console.error('Error fetching land titles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandTitles();
  }, []);

  const handleCardClick = (landId: string) => {
    console.log('Navigating to land ID:', landId);
    // ส่งข้อมูล landId ผ่าน state แทนการส่งผ่าน URL
    navigate('../landtoblockchain', { 
      state: { 
        landId: landId 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">กำลังโหลดข้อมูลโฉนดที่ดิน...</div>
      </div>
    );
  }

  return (
    <div className="land-list-container">
      <div className="land-list-wrapper">
        <div className="land-list-header">
          <h1 className="land-list-title">โฉนดที่ดินดิจิทัล</h1>
          <p className="land-list-subtitle">
            รายการโฉนดที่ดินทั้งหมดในระบบ คลิกเพื่อดูรายละเอียดและจัดการบล็อกเชน
          </p>
        </div>

        <div className="land-cards-grid">
          {landTitles.map((land) => (
            <div
              key={land.id}
              className="land-card"
              onClick={() => handleCardClick(land.id)}
            >
              {/* Verified Badge */}
              {land.isVerified && (
                <div className="verified-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}

              {/* Card Header */}
              <div className="land-card-header">
                <div className="land-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="land-card-number">
                  <h3>{land.landNumber}</h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="land-card-content">
                <div className="land-card-info">
                  <div className="info-item">
                    <span className="info-label">ที่ตั้ง:</span>
                    <span className="info-value">{land.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">เนื้อที่:</span>
                    <span className="info-value">{land.area}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">เจ้าของ:</span>
                    <span className="info-value">{land.owner}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">วันที่จดทะเบียน:</span>
                    <span className="info-value">{land.registrationDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer - Chain Status */}
              <div className="land-card-footer">
                <div className={`chain-status ${land.isOnChain ? 'on-chain' : 'off-chain'}`}>
                  <div className="status-indicator"></div>
                  <span className="status-text">
                    {land.isOnChain ? 'อยู่บนบล็อกเชน' : 'ยังไม่อยู่บนบล็อกเชน'}
                  </span>
                </div>
                <div className="view-details">
                  <span>คลิกเพื่อดูรายละเอียด</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-number">{landTitles.length}</div>
            <div className="stat-label">โฉนดทั้งหมด</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{landTitles.filter(land => land.isOnChain).length}</div>
            <div className="stat-label">อยู่บนบล็อกเชน</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{landTitles.filter(land => land.isVerified).length}</div>
            <div className="stat-label">ได้รับการยืนยัน</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandCardList;