import Loader from "../../component/third-patry/Loader";
import Navbar from "../../component/user/Navbar";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { GetInfoUserByToken, GetLandTitleInfoByWallet, GetLandMetadataByWallet } from "../../service/https/bam/bam";
import { useNavigate } from "react-router-dom";
import './RequestSell.css'

function RequestSell() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [tokenData, setTokenData] = useState<any | null>(null);
    const [landTokens, setLandTokens] = useState<any[]>([]);
    const [landMetadata, setLandMetadata] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const connectWalletAndFetchUser = async () => {
            if (!(window as any).ethereum) {
                setError("กรุณาติดตั้ง MetaMask ก่อนใช้งาน");
                setLoading(false);
                return;
            }

            try {
                // 🔗 เชื่อม MetaMask
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const address = accounts[0];
                setWalletAddress(address);
                console.log("✅ Connected wallet:", address);

                const userInfo = await GetInfoUserByToken();
                if (userInfo.error) {
                    console.error("❌ Error fetching user info:", userInfo.error);
                    setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
                } else {
                    setTokenData(userInfo);
                }

                // จากนั้นดึง Land Token
                const res = await GetLandTitleInfoByWallet();
                console.log("User land tokens:", res.tokens);
                setLandTokens(res.tokens || []);
                

                const metadata = await GetLandMetadataByWallet();
                console.log("User land metadata:", metadata.metadata);
                setLandMetadata(metadata.metadata || []);
            } catch (err) {
                console.error("❌ Error connecting MetaMask or fetching user:", err);
                setError("เกิดข้อผิดพลาดในการเชื่อมต่อ MetaMask");
            } finally {
                setLoading(false);
            }
        };

        connectWalletAndFetchUser();
    }, [navigate]);


    const [selectedLand, setSelectedLand] = useState<string | null>(null);
    const handleSelectLand = (tokenID: string) => {
        setSelectedLand(tokenID);
        console.log("Selected land token:", tokenID);
        // TODO: ส่ง tokenID ไป backend หรือ smart contract ต่อ
    };

    if (loading) return <Loader />;

    return (
        <div className="request-sell-container">
            <Navbar />
            
            {/* Header Section */}
            <div className="main-container">
                <div className="page-header">
                    <h1 className="page-title">
                        จำหน่ายที่ดิน
                    </h1>
                    <p className="page-subtitle">เลือกที่ดินที่ต้องการจำหน่าย</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="error-alert">
                        <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Wallet Connection Card */}
                {walletAddress && (
                    <div className="info-card">
                        <div className="card-header">
                            <div className="card-icon success">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h2 className="card-title">เชื่อมต่อ Wallet แล้ว</h2>
                        </div>
                        <div className="wallet-display">
                            <p className="wallet-label">Wallet Address</p>
                            <p className="wallet-address">{walletAddress}</p>
                        </div>
                    </div>
                )}

                {/* User Info Card */}
                <div className="grid-2">
                    {tokenData ? (
                        <div className="info-card">
                            <div className="card-header">
                                <div className="card-icon info">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </div>
                                <h2 className="card-title">ข้อมูลผู้ใช้</h2>
                            </div>
                            <div className="user-info">
                                <div className="info-item">
                                    <p className="info-label">ชื่อ</p>
                                    <p className="info-value">{tokenData.first_name}</p>
                                </div>
                                <div className="info-item">
                                    <p className="info-label">นามสกุล</p>
                                    <p className="info-value">{tokenData.last_name}</p>
                                </div>
                                <div className="info-item">
                                    <p className="info-label">Wallet Address</p>
                                    <p className="wallet-address">{tokenData.wallet_address}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="info-card">
                            <div className="user-error">
                                <svg className="user-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                                <p className="user-error-title">ไม่พบข้อมูลผู้ใช้</p>
                                <p className="user-error-subtitle">กรุณาลองใหม่อีกครั้ง</p>
                            </div>
                        </div>
                    )}

                    {/* Land Tokens Summary */}
                    <div className="info-card">
                        <div className="card-header">
                            <div className="card-icon land">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <h2 className="card-title">ที่ดินของคุณ</h2>
                        </div>
                        <div className="land-summary">
                            <div className="land-count">
                               {/* Land Tokens Section */}
{landMetadata.length > 0 && (
  <div className="land-tokens-section">
    <h3 className="section-title">เลือกที่ดินที่ต้องการจำหน่าย</h3>
    <div className="land-tokens-container">
      {landMetadata.map((land, index) => (
        <div
          key={index}
          className={`land-token-card ${
            selectedLand === land.tokenID ? "selected" : ""
          }`}
          onClick={() => handleSelectLand(land.tokenID)}
        >
          <div className="land-token-content">
            <div className="token-header">
              <h4 className="token-title">โฉนด #{land.metaFields[0]}</h4>
              {land.buyer === "0x0000000000000000000000000000000000000000" ? (
                <span className="status-badge available">พร้อมจำหน่าย</span>
              ) : (
                <span className="status-badge sold">ขายแล้ว</span>
              )}
            </div>
            <div className="contract-info">
              <p className="contract-label">จังหวัด</p>
              <p className="contract-value">{land.metaFields[8]}</p>
              <p className="contract-label">ราคา</p>
              <p className="contract-value">{land.price}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


                            </div>
                        </div>
                    </div>
                </div>

                {/* Land Tokens Grid */}
                {landTokens.length > 0 && (
                    <div className="land-tokens-section">
                        <h3 className="section-title">เลือกที่ดินที่ต้องการจำหน่าย</h3>
                        <div className="grid-3">
                            {landTokens.map((token, index) => (
                                <div key={index} className="land-token-card">
                                    <div className="land-token-content">
                                        <div className="token-header">
                                            <h4 className="token-title">Token #{token.id || index + 1}</h4>
                                            <span className="status-badge">พร้อมจำหน่าย</span>
                                        </div>
                                        <div className="contract-info">
                                            <p className="contract-label">Contract Address</p>
                                            <p className="contract-address">
                                                {token.contract_address || 'N/A'}
                                            </p>
                                        </div>
                                        <button className="btn btn-primary">
                                            เลือกจำหน่าย
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {landTokens.length === 0 && !loading && (
                    <div className="empty-state">
                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <h3 className="empty-title">ไม่พบที่ดิน</h3>
                        <p className="empty-description">คุณยังไม่มีที่ดินในระบบ</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary"
                        >
                            กลับไปหน้าหลัก
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RequestSell;