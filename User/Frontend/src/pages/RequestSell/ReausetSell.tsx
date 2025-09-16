import Loader from "../../component/third-patry/Loader";
import Navbar from "../../component/user/Navbar";
import { useEffect, useState } from "react";
import { ethers, getAddress } from "ethers";
import { 
    GetInfoUserByToken, 
    GetLandTitleInfoByWallet, 
    GetLandMetadataByWallet, 
    GetRequestBuybyLandID, 
    DeleteRequestBuy, 
    convertTHBtoETH, 
    CreateTransation 
} from "../../service/https/bam/bam";
import { useNavigate } from "react-router-dom";
import { Modal } from 'bootstrap';
import './RequestSell.css';
import RequestBuy from "./RequsetBuy"
import Swal from "sweetalert2";

function RequestSell() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [tokenData, setTokenData] = useState<any | null>(null);
    const [landTokens, setLandTokens] = useState<any[]>([]);
    const [landMetadata, setLandMetadata] = useState<any[]>([]);
    const [requestBuyData, setRequestBuyData] = useState<any[]>([]);
    const [selectedLand, setSelectedLand] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acceptPriceTHB, setAcceptPriceTHB] = useState<string>("");
    const [selectedBuyRequest, setSelectedBuyRequest] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const connectWalletAndFetchUser = async () => {
            if (!(window as any).ethereum) {
                setError("กรุณาติดตั้ง MetaMask ก่อนใช้งาน");
                setLoading(false);
                return;
            }

            try {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const address = accounts[0];
                setWalletAddress(address);

                const userInfo = await GetInfoUserByToken();
                if (userInfo.error) {
                    setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
                } else {
                    setTokenData(userInfo);
                }

                const res = await GetLandTitleInfoByWallet();
                setLandTokens(res.tokens || []);

                const metadata = await GetLandMetadataByWallet();
                const parsedMetadata = (metadata.metadata || []).map((item: any) => ({
                    ...item,
                    parsedFields: parseMetaFields(item.metaFields)
                }));
                setLandMetadata(parsedMetadata);
            } catch (err) {
                console.error("Error:", err);
                setError("เกิดข้อผิดพลาดในการเชื่อมต่อ MetaMask");
            } finally {
                setLoading(false);
            }
        };

        connectWalletAndFetchUser();
    }, [navigate]);

    function parseMetaFields(metaString: string) {
        const obj: Record<string, string> = {};
        const fields = metaString.split(",");
        fields.forEach(field => {
            const [key, ...rest] = field.split(":");
            if (key && rest.length > 0) {
                obj[key.trim()] = rest.join(":").trim();
            }
        });
        return obj;
    }

    const handleSelectLand = async (tokenID: string, isLocked: boolean) => {
        if (isLocked) {
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
        if (tokenID) {
            try {
                console.log("Fetching request buy for tokenID:", tokenID);
                const tokenIdNumber = Number(tokenID);
                const res = await GetRequestBuybyLandID(tokenIdNumber);
                console.log("Response:", res);
                setRequestBuyData(res || []);
            } catch (err) {
                console.error("Error fetching request buy:", err);
                setRequestBuyData([]);
            }
        } else {
            setRequestBuyData([]);
        }
    };


    const handleAcceptRequest = (buyRequest: any) => {
        setSelectedBuyRequest(buyRequest);
        setAcceptPriceTHB("");
        
        
        const modalEl = document.getElementById('acceptModal');
if (!modalEl) return;

let modal = Modal.getInstance(modalEl);
if (!modal) {
  modal = new Modal(modalEl, { backdrop: 'static', keyboard: false });
}

modal.show();
    };

    const handleRejectRequest = (buyRequest: any) => {
        setSelectedBuyRequest(buyRequest);
        
       const modalEl = document.getElementById('acceptModal');
if (!modalEl) return;

let modal = Modal.getInstance(modalEl);
if (!modal) {
  modal = new Modal(modalEl, { backdrop: 'static', keyboard: false });
}

modal.show();
    };

    const confirmAccept = async () => {
    if (!selectedBuyRequest || !selectedLand || !acceptPriceTHB) return;

    if (Number(acceptPriceTHB) <= 0) {
        Swal.fire({
                icon: "warning",
                title: "ข้อมูลไม่ถูกต้อง",
                text: "กรุณาระบุราคา",
                confirmButtonColor: "#e74c3c",
                });
        return;
    }

    try {
        const transaction = await CreateTransation(
            selectedBuyRequest.Seller?.ID,
            selectedBuyRequest.Buyer?.ID,
            Number(acceptPriceTHB),
            selectedLand
        );

        // อัพเดทสถานะโฉนดใน state ทันที
        setLandMetadata(prev =>
            prev.map(land =>
                land.tokenID === selectedLand
                    ? { ...land, isLocked: true }
                    : land
            )
        );

        // รีเฟรชคำขอซื้อ
        const res = await GetRequestBuybyLandID(selectedLand);
        setRequestBuyData(res || []);

        // ปิด modal
        const modalEl = document.getElementById('acceptModal');
        if (modalEl) {
            const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
            modal.hide();
        }

        Swal.fire({
                icon: "success",
                title: "สร้างธุรกรรมสำเร็จ",
                confirmButtonColor: "green",
                });
        setSelectedBuyRequest(null);
    } catch (err: any) {
        console.error(err);
        Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: (err.message || err),
                confirmButtonColor: "#e74c3c",
                });
    }
};

    const confirmReject = async () => {
        if (!selectedBuyRequest || !selectedLand) return;

        try {
            await DeleteRequestBuy(selectedBuyRequest.Buyer?.ID, selectedLand);
            
            // Refresh requests
            const res = await GetRequestBuybyLandID(selectedLand);
            setRequestBuyData(res || []);

            // Close modal
            const modalEl = document.getElementById('rejectModal');
            if (modalEl) {
                const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
                modal.hide();
            }

            setSelectedBuyRequest(null);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาดในการปฏิเสธ",
                confirmButtonColor: "#e74c3c",
                });
        }
    };

    const selectedLandData = landMetadata.find(land => land.tokenID === selectedLand);

    if (loading) return <Loader />;

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
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span>💼 Land Management System</span>
                        </div>
                        <h1 className="hero-title">
                            <span className="gradient-text">จำหน่ายที่ดิน</span>
                        </h1>
                        <p className="hero-subtitle">
                            เลือกที่ดินที่ต้องการจำหน่ายและจัดการคำขอซื้อ
                            <br />
                            ด้วยระบบที่ปลอดภัยและโปร่งใส
                        </p>
                            
                    </div>
                </div>
            </div>

            <div className="main-container container">
                {/* Error Alert */}
                {error && (
                    <div className="alert-modern error">
                        <div className="alert-icon">⚠️</div>
                        <div className="alert-content">
                            <div className="alert-title">เกิดข้อผิดพลาด</div>
                            <div className="alert-message">{error}</div>
                        </div>
                    </div>
                )}

                {/* User Information */}
                {tokenData && (
                    <div className="glass-card user-info-card">
                        <div className="card-glow"></div>
                        <div className="card-header-modern">
                            <div className="header-content">
                                <div className="status-indicator">👤</div>
                                <div className="header-text">
                                    <h3 className="card-title-modern">ข้อมูลผู้ใช้</h3>
                                    <p className="card-subtitle-modern">รายละเอียดบัญชีผู้ใช้งาน</p>
                                </div>
                            </div>
                        </div>
                        <div className="card-body-modern">
                            <div className="info-grid">
                                <div className="info-card">
                                    <div className="info-header">
                                        <div className="info-icon owner-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                                                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                                            </svg>
                                        </div>
                                        <span className="info-label">ชื่อ-นามสกุล</span>
                                    </div>
                                    <div className="owner-name-display">
                                        <span className="owner-name-text">{tokenData.first_name} {tokenData.last_name}</span>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-header">
                                        <div className="info-icon wallet-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M21 12V7H5.5C4.11929 7 3 5.88071 3 4.5C3 3.11929 4.11929 2 5.5 2H21V4H5.5C4.67157 4 4 4.67157 4 5.5C4 6.32843 4.67157 7 5.5 7H21V12M21 16V14H5.5C4.67157 14 4 14.6716 4 15.5C4 16.3284 4.67157 17 5.5 17H21V19H5.5C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14H21V16ZM21 12H5.5C4.67157 12 4 11.3284 4 10.5C4 9.67157 4.67157 9 5.5 9H21V12Z" fill="currentColor"/>
                                            </svg>
                                        </div>
                                        <span className="info-label">Wallet Address</span>
                                    </div>
                                    <div className="wallet-display">
                                        <span className="wallet-address-full">{tokenData.wallet_address.slice(0, 6)}...{tokenData.wallet_address.slice(-4)}</span>
                                        <button 
                                            className="copy-btn"
                                            onClick={() => navigator.clipboard.writeText(tokenData.wallet_address)}
                                            title="Copy to clipboard"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H16M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="main-grid">
                    {/* Land Selection Section */}
                    <div className="glass-card land-selection-section">
                        <div className="card-glow"></div>
                        <div className="section-header">
                            <div className="section-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 21H21M3 10H21M5 6L12 3L19 6M4 10V21H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="section-text">
                                <h2>ที่ดินของคุณ</h2>
                                <span className="land-count">({landMetadata.length} รายการ)</span>
                            </div>
                        </div>

                        {landMetadata.length > 0 ? (
    <div className="land-list">
        {landMetadata.map((land, index) => (
            <div
                key={index}
                className={`land-card-modern ${selectedLand === land.tokenID ? 'selected' : ''} ${land.isLocked ? 'locked' : ''}`}
                onClick={() => handleSelectLand(land.tokenID, land.isLocked)}
            >
                <div className="card-shine"></div>
                <div className="land-card-header">
                    <div className="land-info">
                        <h3>โฉนด #{land.parsedFields["Map"] || land.tokenID}</h3>
                        <div className="land-meta">
                            <span>จังหวัด: {land.parsedFields["Province"] || '-'}</span>
                            <span>อำเภอ: {land.parsedFields["District"] || '-'}</span>
                            <span>ตำบล: {land.parsedFields["Subdistrict"] || '-'}</span>
                            <span>ขนาดที่ดิน: {land.parsedFields["Rai"] || '-'} ตร.ว.</span>
                            <span>Token ID: {land.tokenID}</span>
                        </div>
                    </div>
                    <div className={`status-badge-modern ${land.isLocked ? 'locked' : 
                        land.buyer === "0x0000000000000000000000000000000000000000" ? 'available' : 'sold'}`}>
                        {land.isLocked ? '🔒 ล็อกแล้ว' : 
                         land.buyer === "0x0000000000000000000000000000000000000000" ? '✅ พร้อมขาย' : '❌ ขายแล้ว'}
                    </div>
                </div>
            </div>
        ))}
    </div>
) : (
    <div className="empty-state">
        <div className="empty-icon">📄</div>
        <h3 className="empty-title">ไม่พบที่ดิน</h3>
        <p className="empty-message">คุณยังไม่มีที่ดินในระบบ</p>
        <button 
            className="btn-secondary-modern"
            onClick={() => navigate('/dashboard')}
        >
            กลับไปหน้าหลัก
        </button>
    </div>
)}
                    </div>

                    {/* Buy Requests Section */}
                    <div className="glass-card buy-requests-section">
                        <div className="card-glow"></div>
                        {selectedLand ? (
                            <>
                                <div className="section-header">
                                    <div className="section-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4V2M16 4V6M8 4V2M8 4V6M4 10H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <div className="section-text">
                                        <h2>คำขอซื้อ</h2>
                                        <span className="request-count">({requestBuyData.length} คำขอ)</span>
                                    </div>
                                </div>

                                {selectedLandData && (
                                    <div className="selected-land-info">
                                        <div className="selected-header">
                                            <div className="selected-icon">🏛️</div>
                                            <div className="selected-text">
                                                <h3>โฉนด #{selectedLandData.parsedFields["Map"]}</h3>
                                                <div className="land-meta">
                                                    <span>TokenID: {selectedLandData.tokenID}</span>
                                                    <span className={`status ${selectedLandData.buyer === "0x0000000000000000000000000000000000000000" ? 'available' : 'sold'}`}>
                                                        {selectedLandData.buyer === "0x0000000000000000000000000000000000000000" ? 'พร้อมจำหน่าย' : 'ขายแล้ว'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {requestBuyData.length > 0 ? (
                                    <div className="requests-list">
                                        {requestBuyData.map((request) => (
                                            <div key={request.ID} className="request-card-modern">
                                                <div className="request-shine"></div>
                                                <div className="request-header">
                                                    <div className="buyer-info">
                                                        <div className="buyer-avatar">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                                                                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                                                            </svg>
                                                        </div>
                                                        <div className="buyer-details">
                                                            <h4>{request.Buyer?.Firstname} {request.Buyer?.Lastname}</h4>
                                                            <p className="buyer-email">{request.Buyer?.Email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="request-id">#{request.ID}</div>
                                                </div>
                                                <div className="request-actions">
                                                    <button
                                                        className="btn-modern btn-reject"
                                                        onClick={() => handleRejectRequest(request)}
                                                    >
                                                        <span className="btn-content">
                                                            <span className="btn-icon">❌</span>
                                                            <span>ปฏิเสธ</span>
                                                        </span>
                                                    </button>
                                                    <button
                                                        className="btn-modern btn-accept"
                                                        onClick={() => handleAcceptRequest(request)}
                                                    >
                                                        <span className="btn-content">
                                                            <span className="btn-icon">✅</span>
                                                            <span>ยอมรับ</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">📝</div>
                                        <h3 className="empty-title">ยังไม่มีคำขอซื้อ</h3>
                                        <p className="empty-message">ยังไม่มีคำขอซื้อสำหรับโฉนดนี้</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-selection">
                                <div className="empty-icon">👈</div>
                                <h3 className="empty-title">เลือกที่ดิน</h3>
                                <p className="empty-message">กรุณาเลือกที่ดินจากด้านซ้ายเพื่อดูคำขอซื้อ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Accept Modal */}
                <div className="modal fade" id="acceptModal" tabIndex={-1} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content-modern">
                            <div className="modal-header-modern">
                                <div className="modal-icon success">✅</div>
                                <div className="modal-title-text">
                                    <h5 className="modal-title">ยืนยันการขายที่ดิน</h5>
                                    <p className="modal-subtitle">กรุณาระบุราคาขายและยืนยันการทำรายการ</p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close-modern"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body-modern">
                                {selectedBuyRequest && (
                                    <div className="transaction-summary">
                                        <div className="summary-header">
                                            <h6>รายละเอียดการขาย</h6>
                                        </div>
                                        <div className="summary-grid">
                                            <div className="summary-item">
                                                <span className="summary-label">ผู้ซื้อ:</span>
                                                <span className="summary-value">{selectedBuyRequest.Buyer?.Firstname} {selectedBuyRequest.Buyer?.Lastname}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">อีเมล:</span>
                                                <span className="summary-value">{selectedBuyRequest.Buyer?.Email}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="price-input-modern">
                                    <label className="modern-label">
                                        <span className="label-icon">💰</span>
                                        ราคาขาย (บาท)
                                    </label>
                                    <div className="input-group-modern">
                                        <input
                                            type="number"
                                            className="form-control-glass"
                                            value={acceptPriceTHB}
                                            onChange={(e) => setAcceptPriceTHB(e.target.value)}
                                            placeholder="กรอกราคาขายเป็นบาท"
                                            min="1"
                                        />
                                        <div className="input-highlight"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer-modern">
                                <button
                                    type="button"
                                    className="btn-modern btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    <span className="btn-content">
                                        <span className="btn-icon">❌</span>
                                        <span>ยกเลิก</span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-modern btn-primary"
                                    onClick={confirmAccept}
                                    disabled={!acceptPriceTHB || Number(acceptPriceTHB) <= 0}
                                >
                                    <span className="btn-content">
                                        <span className="btn-icon">✅</span>
                                        <span>ยืนยันการขาย</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reject Modal */}
                <div className="modal fade" id="rejectModal" tabIndex={-1} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content-modern">
                            <div className="modal-header-modern">
                                <div className="modal-icon danger">⚠️</div>
                                <div className="modal-title-text">
                                    <h5 className="modal-title">ยืนยันการปฏิเสธ</h5>
                                    <p className="modal-subtitle">คุณแน่ใจหรือไม่ที่จะปฏิเสธคำขอซื้อนี้</p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close-modern"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body-modern">
                                <div className="warning-message">
                                    <p>คุณต้องการปฏิเสธคำขอซื้อจาก</p>
                                    {selectedBuyRequest && (
                                        <div className="buyer-summary-modern">
                                            <div className="buyer-avatar">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                                                    <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                                                </svg>
                                            </div>
                                            <div className="buyer-details">
                                                <strong>{selectedBuyRequest.Buyer?.Firstname} {selectedBuyRequest.Buyer?.Lastname}</strong>
                                                <small>{selectedBuyRequest.Buyer?.Email}</small>
                                            </div>
                                        </div>
                                    )}
                                    <p className="warning-text">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmReject}
                                >
                                    ยืนยันการปฏิเสธ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <RequestBuy/>
        </div>
    );
}

export default RequestSell;