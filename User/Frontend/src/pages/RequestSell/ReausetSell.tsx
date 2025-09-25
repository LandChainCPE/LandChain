import { useEffect, useState  } from "react";
import { Container, Card, Button, Modal, Form } from "react-bootstrap";
import { GetInfoUserByToken, GetLandMetadataByWallet, GetRequestBuybyLandID, DeleteRequestBuy, CreateTransation, CreateNewRoom,  } from "../../service/https/bam/bam";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../component/third-patry/Loader";
import Navbar from "../../component/user/Navbar";
import "./RequestSell.css";
import RequestBuyPage from "./RequsetBuy";

interface LandData {
  tokenID: string;
  metaFields: string;
  parsedFields: Record<string, string>;
  isLocked: boolean;
  buyer: string;
}

interface BuyRequest {
  ID: number;
  Buyer?: {
    ID: number;
    Firstname: string;
    Lastname: string;
    Email: string;
  };
  Seller?: {
    ID: number;
  };
}

function RequestSell() {
  const [tokenData, setTokenData] = useState<any>(null);
  const [landMetadata, setLandMetadata] = useState<LandData[]>([]);
  const [selectedLand, setSelectedLand] = useState<string | null>(null);
  const [requestBuyData, setRequestBuyData] = useState<BuyRequest[]>([]);
  const [selectedBuyRequest, setSelectedBuyRequest] = useState<BuyRequest | null>(null);
  const [acceptPriceTHB, setAcceptPriceTHB] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userID, setUserID] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const userInfo = await GetInfoUserByToken();
      setTokenData(userInfo);
      setUserID(userInfo.id); // <-- ใช้ id จาก userInfo
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const userInfo = await GetInfoUserByToken();
      setTokenData(userInfo);
      console.log("TOken data:", userInfo);
      setUserID(userInfo.id); // <-- เพิ่มตรงนี้
      console.log(userInfo.id);
      const metadata = await GetLandMetadataByWallet();
      console.log(metadata);
      setLandMetadata((metadata.metadata || []).map((item: any) => ({
        ...item,
        parsedFields: parseMetaFields(item.metaFields)
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  function parseMetaFields(metaString: string) {
    const obj: Record<string, string> = {};
    metaString?.split(",").forEach(field => {
      const [key, ...rest] = field.split(":");
      if (key && rest.length > 0) obj[key.trim()] = rest.join(":").trim();
    });
    return obj;
  }

  const handleSelectLand = async (tokenID: string) => {
    const land = landMetadata.find((l) => l.tokenID === tokenID);
    if (!land) return;

    if (land.isLocked) {
      Swal.fire({
        icon: "warning",
        title: "โฉนดนี้ถูกล็อก",
        text: "ไม่สามารถทำรายการได้",
        confirmButtonColor: "#e74c3c",
      });
      return;
    }
    console.log(tokenID)
    setSelectedLand(tokenID);
    try {
      const res = await GetRequestBuybyLandID(Number(tokenID));
      setRequestBuyData(res || []);
    } catch {
      setRequestBuyData([]);
    }
  };

  const handleAcceptRequest = (request: BuyRequest) => {
    setSelectedBuyRequest(request);
    setAcceptPriceTHB("");
    setShowAcceptModal(true);
    
  };

  const handleRejectRequest = (request: BuyRequest) => {
    setSelectedBuyRequest(request);
    setShowRejectModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedBuyRequest || !selectedLand || !acceptPriceTHB) return;
    try {
      await CreateTransation(selectedBuyRequest.Seller?.ID || 0, selectedBuyRequest.Buyer?.ID || 0, Number(acceptPriceTHB), selectedLand);
      Swal.fire("สำเร็จ", "สร้างธุรกรรมสำเร็จ", "success");
      const res = await GetRequestBuybyLandID(Number(selectedLand));
      setRequestBuyData(res || []);
      setShowAcceptModal(false);

      setLandMetadata(prev =>
      prev.map(land =>
      land.tokenID === selectedLand ? { ...land, isLocked: true } : land
      
    )
);
navigate(`/user/transation`);
    } catch (err) {
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาด", "error");
    }
  };

  const confirmReject = async () => {
    if (!selectedBuyRequest || !selectedLand) return;
    try {
      await DeleteRequestBuy(selectedBuyRequest.Buyer?.ID || 0, selectedLand, selectedBuyRequest.Seller?.ID || 0);
      const res = await GetRequestBuybyLandID(Number(selectedLand));
      setRequestBuyData(res || []);
      setShowRejectModal(false);
      Swal.fire("Success", "ลบสำเร็จ", "success");
    } catch {
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการปฏิเสธ", "error");
    }
  };

  const formatWallet = (wallet: string) => {
    if (!wallet || wallet.length <= 10) return wallet;
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const getStatusInfo = (land: LandData) => {
    if (land.isLocked) return { text: "ล็อกแล้ว", color: "warning", icon: "🔒" };
    if (land.buyer === "0x0000000000000000000000000000000000000000") return { text: "พร้อมขาย", color: "success", icon: "✅" };
    return { text: "ขายแล้ว", color: "secondary", icon: "✔️" };
  };

  const handleContact = async (req: BuyRequest) => {
  if (!userID || !req.Buyer?.ID) {
    console.error("User ID or Buyer ID not loaded yet");
    return;
  }

  try {
    const res: any = await CreateNewRoom(userID, req.Buyer.ID);
    const roomID = res.room_id;

    if (!roomID) {
      console.error("Room ID not returned from backend.");
      return;
    }

    console.log("Room created:", roomID);
    navigate(`/user/chat/${roomID}`);
  } catch (err) {
    console.error("Failed to go to chat:", err);
  }
};


const [priceError, setPriceError] = useState<string>("");
  if (loading) return <Loader />;

  const selectedLandData = landMetadata.find(land => land.tokenID === selectedLand);

  return (
    <div className="request-sell-container">
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
              <span>🏡 Real Estate Management</span>
            </div>
            <h1 className="hero-title">
              <span className="gradient-text">จัดการคำขอซื้อที่ดิน</span>
            </h1>
            <p className="hero-subtitle">
              รับและจัดการคำขอซื้อที่ดินของคุณผ่านระบบ Blockchain
              <br />
              ที่โปร่งใส ปลอดภัย และตรวจสอบได้
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{landMetadata.length}</div>
                <div className="stat-label">ที่ดินทั้งหมด</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{requestBuyData.length}</div>
                <div className="stat-label">คำขอซื้อ</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">ความปลอดภัย</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="main-container">
        {/* User Info */}
        {tokenData && (
          <div className="user-info-section">
            <Card className="glass-card user-info-card">
              <div className="card-glow"></div>
              <div className="user-info-body">
                <div className="user-info-header">
                  <div className="user-avatar-modern">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="user-details">
                    <h3 className="user-name-modern">{tokenData.first_name} {tokenData.last_name}</h3>
                    <div className="user-wallet-display">
                      <span className="wallet-label">Wallet:</span>
                      <span className="wallet-address">{formatWallet(tokenData.wallet_address)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Land Selection Section */}
        <div className="land-selection-section">
          <div className="section-header-modern">
           
            <h2 className="section-title-modern">
              <span className="gradient-text">รายการที่ดินของคุณ</span>
            </h2>
            <p className="section-subtitle-modern">
              คลิกเลือกที่ดินเพื่อดูคำขอซื้อ • <span className="highlight-number">{landMetadata.length}</span> รายการ
            </p>
          </div>

          <div className="land-grid-modern">
            {landMetadata.map((land) => {
              const status = getStatusInfo(land);
              const isSelected = selectedLand === land.tokenID;
              
              return (
                <Card 
                  key={land.tokenID} 
                  className={`glass-card land-card-modern ${isSelected ? 'selected' : ''} ${land.isLocked ? 'locked' : ''}`}
                  onClick={() => handleSelectLand(land.tokenID)}
                >
                  <div className="card-glow"></div>
                  <div className="card-shine"></div>
                  
                  <div className="land-card-header">
                    <div className="land-title-section">
                      <h4 className="land-title-text">โฉนด #{ land.parsedFields?.["Deed No"]  || land.tokenID}</h4>
                      <div className={`land-status-badge ${status.color}`}>
                        <span className="status-icon">{status.icon}</span>
                        <span>{status.text}</span>
                      </div>
                    </div>
                    <h6 className="land-title-text">TokenID: {land.tokenID}</h6>
                  </div>
                  
                  <div className="land-card-body">
                    <div className="land-info-grid">
                      <div className="land-info-item">
                        <div className="info-icon-wrapper location">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10C21 17-9 23-9 23S3 17 3 10C3 5.02944 7.02944 1 12 1S21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className="info-content">
                          <span className="info-label">ที่ตั้ง</span>
                          <span className="info-value">{land.parsedFields?.Subdistrict || '-'}, {land.parsedFields?.District || '-'}, {land.parsedFields?.Province || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="land-info-item">
                        <div className="info-icon-wrapper size">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className="info-content">
                          <span className="info-label">ขนาด</span>
                          <span className="info-value">{land.parsedFields?.Rai || '0'} ไร่ {land.parsedFields?.Ngan || '0'} งาน {land.parsedFields?.SqWa || '0'} ตร.วา</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Buy Requests Section */}
        {selectedLand && (
          <div className="buy-requests-section">
            <div className="section-header-modern">
              <div className="section-badge-modern">
                <span className="badge-icon">📋</span>
                <span>คำขอซื้อ</span>
              </div>
              <h2 className="section-title-modern">
                <span className="gradient-text">คำขอซื้อโฉนด #{selectedLandData?.parsedFields?.["Deed No"] || selectedLand}</span>
              </h2>
              <p className="section-subtitle-modern">
                พบคำขอทั้งหมด <span className="highlight-number">{requestBuyData.length}</span> รายการ
              </p>
            </div>

            {requestBuyData.length > 0 ? (
              <div className="requests-timeline">
                {requestBuyData.map((req, index) => (
                  <div key={req.ID} className="request-timeline-item">
                    <div className="timeline-connector-modern">
                      <div className="timeline-node-modern">
                        <div className="node-ring-modern"></div>
                        <div className="node-core-modern">
                          <span className="node-number-modern">{index + 1}</span>
                        </div>
                      </div>
                    </div>

                    <Card className="glass-card request-card-modern">
                      <div className="card-glow"></div>
                      <div className="card-shine"></div>
                      
                      <div className="request-card-header">
                        <div className="buyer-info-section">
                          <div className="buyer-avatar-modern">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                              <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                            </svg>
                          </div>
                          <div className="buyer-details-modern">
                            <h4 className="buyer-name-modern">{req.Buyer?.Firstname} {req.Buyer?.Lastname}</h4>
                            <p className="buyer-email-modern">{req.Buyer?.Email}</p>
                          </div>
                        </div>
                        <div className="request-id-badge">#{req.ID}</div>
                      </div>

                      <div className="request-card-body">
                        <div className="request-actions-modern">

                          <Button 
                            className="btn-modern btn-reject-modern"
                            onClick={() => handleContact(req)}
                          >
                            <div className="btn-content-modern">
                              <span className="btn-icon-modern"></span>
                              <span>ติดต่อ</span>
                              <div className="btn-arrow-modern"></div>
                            </div>
                          </Button>

                          <Button 
                            className="btn-modern btn-reject-modern"
                            onClick={() => handleRejectRequest(req)}
                          >
                            <div className="btn-content-modern">
                              <span className="btn-icon-modern">❌</span>
                              <span>ปฏิเสธคำขอ</span>
                              <div className="btn-arrow-modern">→</div>
                            </div>
                          </Button>
                          <Button 
                            className="btn-modern btn-accept-modern"
                            onClick={() => handleAcceptRequest(req)}
                          >
                            <div className="btn-content-modern">
                              <span className="btn-icon-modern">✅</span>
                              <span>อนุมัติคำขอ</span>
                              <div className="btn-arrow-modern">→</div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-modern">
                <div className="empty-icon-modern">📭</div>
                <h3 className="empty-title-modern">ไม่มีคำขอซื้อ</h3>
                <p className="empty-message-modern">
                  ยังไม่มีคำขอซื้อสำหรับโฉนด #{selectedLandData?.parsedFields?.["Deed No"] || selectedLand}
                </p>
                <Button 
                  className="btn-secondary-modern" 
                  onClick={() => setSelectedLand(null)}
                >
                  เลือกที่ดินอื่น
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>

      {/* Accept Modal */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)} centered>
        <div className="modal-modern">
          <Modal.Header closeButton className="modal-header-modern">
            <Modal.Title className="modal-title-modern">
              <span className="modal-icon-modern">✅</span>
              ยืนยันการอนุมัติ
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-modern">
            {selectedBuyRequest && (
              <div className="modal-content-modern">
                <div className="buyer-card-modern">
                  <div className="buyer-avatar-large-modern">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="buyer-info-large-modern">
                    <h5 className="buyer-name-large">{selectedBuyRequest.Buyer?.Firstname} {selectedBuyRequest.Buyer?.Lastname}</h5>
                    <p className="buyer-email-large">{selectedBuyRequest.Buyer?.Email}</p>
                  </div>
                </div>
                
                <Form.Group className="price-input-group-modern">
                  <Form.Label className="modern-label-modern">
                    <span className="label-icon-modern">💰</span>
                    ราคาขาย (บาท)
                  </Form.Label>
                  <div className="input-group-modern">
                   <Form.Control
                      type="number"
                      placeholder="กรอกราคาที่ต้องการขาย"
                      value={acceptPriceTHB}
                      onChange={(e) => setAcceptPriceTHB(e.target.value)} // ให้พิมพ์อะไรก็ได้
                      onBlur={(e) => {
                        const num = Number(e.target.value);

                        if (isNaN(num) || e.target.value === "") {
                          setPriceError("กรุณากรอกราคาเป็นตัวเลข");
                          return;
                        }

                        if (num < 10000) {
                          setPriceError("ราคาต้องไม่น้อยกว่า 50,000 บาท");
                        } else if (num > 5000000) {
                          setPriceError("ราคาต้องไม่เกิน 5,000,000 บาท");
                        } else {
                          setPriceError(""); // ผ่าน ไม่มี error
                        }
                      }}
                      className={`form-control-glass-modern ${priceError ? "is-invalid" : ""}`}
                      min={50000}      // hint สำหรับ UI
                      max={5000000}
                    />

                    {priceError && <div className="invalid-feedback">{priceError}</div>}

                    
                  </div>
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="modal-footer-modern">
            <Button 
              className="btn-secondary-modern" 
              onClick={() => setShowAcceptModal(false)}
            >
              ยกเลิก
            </Button>
           <Button 
              className="btn-modern btn-accept-modern" 
              onClick={confirmAccept}
              disabled={!acceptPriceTHB || !!priceError} // ✅ ปิดถ้าว่างหรือมี error
            >
              <div className="btn-content-modern">
                <span className="btn-icon-modern">✅</span>
                <span>ยืนยันการขาย</span>
              </div>
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <div className="modal-modern">
          <Modal.Header closeButton className="modal-header-modern">
            <Modal.Title className="modal-title-modern">
              <span className="modal-icon-modern">❌</span>
              ยืนยันการปฏิเสธ
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-modern">
            {selectedBuyRequest && (
              <div className="modal-content-modern">
                <div className="warning-card-modern">
                  <div className="warning-icon-modern">⚠️</div>
                  <div className="warning-content-modern">
                    <p className="warning-text-modern">คุณต้องการปฏิเสธคำขอซื้อจาก</p>
                    <h5 className="warning-name-modern">{selectedBuyRequest.Buyer?.Firstname} {selectedBuyRequest.Buyer?.Lastname}</h5>
                    <p className="warning-note-modern">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="modal-footer-modern">
            <Button 
              className="btn-secondary-modern" 
              onClick={() => setShowRejectModal(false)}
            >
              ยกเลิก
            </Button>
            <Button 
              className="btn-modern btn-reject-modern" 
              onClick={confirmReject}
            >
              <div className="btn-content-modern">
                <span className="btn-icon-modern">❌</span>
                <span>ยืนยันปฏิเสธ</span>
              </div>
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

          <RequestBuyPage/>
    </div>
  );
}

export default RequestSell;