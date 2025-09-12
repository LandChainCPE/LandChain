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
            alert("โฉนดนี้ถูกล็อก ไม่สามารถทำรายการได้");
            return;
        }
        
        setSelectedLand(tokenID);
        if (tokenID) {
            try {
                const res = await GetRequestBuybyLandID(tokenID);
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
        if (modalEl) {
            const modal = new Modal(modalEl);
            modal.show();
        }
    };

    const handleRejectRequest = (buyRequest: any) => {
        setSelectedBuyRequest(buyRequest);
        
        const modalEl = document.getElementById('rejectModal');
        if (modalEl) {
            const modal = new Modal(modalEl);
            modal.show();
        }
    };

    const confirmAccept = async () => {
        if (!selectedBuyRequest || !selectedLand || !acceptPriceTHB) return;

        if (Number(acceptPriceTHB) <= 0) {
            alert("กรุณากรอกราคาที่ถูกต้อง");
            return;
        }

        try {
            await CreateTransation(
                selectedBuyRequest.Seller?.ID,
                selectedBuyRequest.Buyer?.ID,
                Number(acceptPriceTHB),
                selectedLand
            );

            // Refresh requests
            const res = await GetRequestBuybyLandID(selectedLand);
            setRequestBuyData(res || []);

            // Close modal
            const modalEl = document.getElementById('acceptModal');
            if (modalEl) {
                const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
                modal.hide();
            }

            alert("สร้างธุรกรรมสำเร็จ!");
            setSelectedBuyRequest(null);
        } catch (err: any) {
            console.error(err);
            alert("เกิดข้อผิดพลาด: " + (err.message || err));
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
            alert("เกิดข้อผิดพลาดในการปฏิเสธ");
        }
    };

    const selectedLandData = landMetadata.find(land => land.tokenID === selectedLand);

    if (loading) return <Loader />;

    return (
        <div className="page-container">
            <Navbar />
            <div className="content-wrapper">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1>จำหน่ายที่ดิน</h1>
                            <p className="page-subtitle">เลือกที่ดินที่ต้องการจำหน่ายและจัดการคำขอซื้อ</p>
                        </div>
                        {walletAddress && (
                            <div className="connection-status status-connected">
                                <div className="status-dot"></div>
                                <span>เชื่อมต่อ Wallet แล้ว</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="error-alert">
                        <div className="error-icon">⚠️</div>
                        <div>
                            <h3>เกิดข้อผิดพลาด</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* User Information */}
                {tokenData && (
                    <div className="info-card">
                        <div className="card-header">
                            <h2>ข้อมูลผู้ใช้</h2>
                        </div>
                        <div className="user-details">
                            <div className="detail-item">
                                <label>ชื่อ-นามสกุล</label>
                                <span>{tokenData.first_name} {tokenData.last_name}</span>
                            </div>
                            <div className="detail-item">
                                <label>Wallet Address</label>
                                <span className="wallet-address">{tokenData.wallet_address}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="main-grid">
                    {/* Land Selection Section */}
                    <div className="land-selection-section">
                        <div className="section-header">
                            <h2>ที่ดินของคุณ</h2>
                            <span className="land-count">({landMetadata.length} รายการ)</span>
                        </div>

                        {landMetadata.length > 0 ? (
                            <div className="land-list">
                                {landMetadata.map((land, index) => (
                                    <div
                                        key={index}
                                        className={`land-card ${selectedLand === land.tokenID ? 'selected' : ''} ${land.isLocked ? 'locked' : ''}`}
                                        onClick={() => handleSelectLand(land.tokenID, land.isLocked)}
                                    >
                                        <div className="land-card-header">
                                            <h3>โฉนด #{land.parsedFields["Map"] || land.tokenID}</h3>
                                            <div className={`status-badge ${land.isLocked ? 'locked' : 
                                                land.buyer === "0x0000000000000000000000000000000000000000" ? 'available' : 'sold'}`}>
                                                {land.isLocked ? 'ล็อกแล้ว' : 
                                                 land.buyer === "0x0000000000000000000000000000000000000000" ? 'พร้อมจำหน่าย' : 'ขายแล้ว'}
                                            </div>
                                        </div>
                                        <div className="land-details-grid">
                                            <div className="detail-item">
                                                <label>จังหวัด</label>
                                                <span>{land.parsedFields["Province"] || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>TokenID</label>
                                                <span>{land.tokenid || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📄</div>
                                <h3>ไม่พบที่ดิน</h3>
                                <p>คุณยังไม่มีที่ดินในระบบ</p>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    กลับไปหน้าหลัก
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Buy Requests Section */}
                    <div className="buy-requests-section">
                        {selectedLand ? (
                            <>
                                <div className="section-header">
                                    <h2>คำขอซื้อ</h2>
                                    <span className="request-count">({requestBuyData.length} คำขอ)</span>
                                </div>

                                {selectedLandData && (
                                    <div className="selected-land-info">
                                        <h3>โฉนด #{selectedLandData.parsedFields["Land No"]}</h3>
                                        <div className="land-meta">
                                            <span>TokenID: {selectedLandData.price}</span>
                                            <span className={`status ${selectedLandData.buyer === "0x0000000000000000000000000000000000000000" ? 'available' : 'sold'}`}>
                                                {selectedLandData.buyer === "0x0000000000000000000000000000000000000000" ? 'พร้อมจำหน่าย' : 'ขายแล้ว'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {requestBuyData.length > 0 ? (
                                    <div className="requests-list">
                                        {requestBuyData.map((request) => (
                                            <div key={request.ID} className="request-card">
                                                <div className="request-header">
                                                    <div className="buyer-info">
                                                        <h4>{request.Buyer?.Firstname} {request.Buyer?.Lastname}</h4>
                                                        <p className="buyer-email">{request.Buyer?.Email}</p>
                                                    </div>
                                                    <div className="request-id">#{request.ID}</div>
                                                </div>
                                                <div className="request-actions">
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleRejectRequest(request)}
                                                    >
                                                        ปฏิเสธ
                                                    </button>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleAcceptRequest(request)}
                                                    >
                                                        ยอมรับ
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-requests">
                                        <div className="empty-icon">📝</div>
                                        <p>ยังไม่มีคำขอซื้อสำหรับโฉนดนี้</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-selection">
                                <div className="empty-icon">👈</div>
                                <h3>เลือกที่ดิน</h3>
                                <p>กรุณาเลือกที่ดินจากด้านซ้ายเพื่อดูคำขอซื้อ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Accept Modal */}
                <div className="modal fade" id="acceptModal" tabIndex={-1} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">ยืนยันการขายที่ดิน</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedBuyRequest && (
                                    <div className="transaction-summary">
                                        <div className="summary-item">
                                            <span>โฉนด:</span>
                                            <span>#{selectedLand}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span>ผู้ซื้อ:</span>
                                            <span>{selectedBuyRequest.Buyer?.Firstname} {selectedBuyRequest.Buyer?.Lastname}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span>อีเมล:</span>
                                            <span>{selectedBuyRequest.Buyer?.Email}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="price-input">
                                    <label>ราคาขาย (บาท)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={acceptPriceTHB}
                                        onChange={(e) => setAcceptPriceTHB(e.target.value)}
                                        placeholder="กรอกราคาขายเป็นบาท"
                                        min="1"
                                    />
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
                                    className="btn btn-primary"
                                    onClick={confirmAccept}
                                    disabled={!acceptPriceTHB || Number(acceptPriceTHB) <= 0}
                                >
                                    ยืนยันการขาย
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reject Modal */}
                <div className="modal fade" id="rejectModal" tabIndex={-1} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">ยืนยันการปฏิเสธ</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>คุณต้องการปฏิเสธคำขอซื้อจาก</p>
                                {selectedBuyRequest && (
                                    <div className="buyer-summary">
                                        <strong>{selectedBuyRequest.Buyer?.Firstname} {selectedBuyRequest.Buyer?.Lastname}</strong>
                                        <br />
                                        <small className="text-muted">{selectedBuyRequest.Buyer?.Email}</small>
                                    </div>
                                )}
                                <p className="mt-3 text-warning">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
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
        </div>
    );
}

export default RequestSell;