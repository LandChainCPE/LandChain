import React, { useState } from "react";
import { CheckOwner } from "../../service/https/bam/bam"; // import service ใหม่
import "./CheckLandowner.css";

interface CheckOwnerResult {
  message: string;
  isOwner: boolean;
}

function CheckLandowner() {
  const [wallet, setWallet] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [result, setResult] = useState<CheckOwnerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckOwner = async () => {
    // Reset result & error
    setResult(null);
    setError(null);

    // Validate inputs
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!wallet || !tokenId) {
      setError("กรุณากรอก Wallet และ Token ID ให้ครบ");
      return;
    }
    if (!walletRegex.test(wallet)) {
      setError("รูปแบบ Wallet ไม่ถูกต้อง");
      return;
    }
    if (!/^\d+$/.test(tokenId)) {
      setError("Token ID ต้องเป็นตัวเลขเท่านั้น");
      return;
    }

    setLoading(true);

    try {
      const data = await CheckOwner(tokenId, wallet);
      if ("error" in data) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการตรวจสอบเจ้าของที่ดิน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-landowner-container">
      <div className="check-landowner-card">
        <div className="check-landowner-body">
          <div className="check-landowner-header">
            <div className="check-landowner-icon">
              🔍
            </div>
            <h4 className="check-landowner-title">ตรวจสอบเจ้าของที่ดิน</h4>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleCheckOwner(); }}>
            <div className="form-group-landowner">
              <label className="form-label-landowner">
                <span className="label-icon-landowner">👤</span>
                Wallet Address
              </label>
              <div className="input-group-landowner">
                <input
                  type="text"
                  className="form-control-landowner"
                  placeholder="ใส่ wallet address ที่ต้องการตรวจสอบ เช่น 0x.."
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                />
                <div className="input-highlight-landowner"></div>
              </div>
            </div>

            <div className="form-group-landowner">
              <label className="form-label-landowner">
                <span className="label-icon-landowner">🔑</span>
                Token ID
              </label>
              <div className="input-group-landowner">
                <input
                  type="text"
                  className="form-control-landowner"
                  placeholder="ใส่ token ที่ต้องการตรวจสอบ เช่น 0"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                />
                <div className="input-highlight-landowner"></div>
              </div>
            </div>

            <button 
              type="submit"
              className="btn-landowner" 
              disabled={loading}
            >
              <div className="btn-content-landowner">
                {loading ? (
                  <>
                    <div className="loading-spinner-landowner"></div>
                    <span>กำลังตรวจสอบ...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon-landowner">🔍</span>
                    <span>ตรวจสอบ</span>
                  </>
                )}
              </div>
              <div className="btn-ripple-landowner"></div>
            </button>
          </form>

          {error && (
            <div className="alert-landowner">
              <div className="alert-icon-landowner">⚠️</div>
              <div className="alert-content-landowner">
                <div className="alert-title-landowner">เกิดข้อผิดพลาด</div>
                <div className="alert-message-landowner">{error}</div>
              </div>
            </div>
          )}

          {result && (
            <div className="result-card-landowner">
              <div className="result-header-landowner">
                <div className="result-header-content-landowner">
                  <div className="result-status-icon-landowner">
                    {result.isOwner ? "✅" : "❌"}
                  </div>
                  <div className="result-header-text-landowner">
                    <h4 className="result-title-landowner">
                      ผลการตรวจสอบ
                    </h4>
                    <p className="result-subtitle-landowner">
                      สถานะการเป็นเจ้าของ
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="result-body-landowner">
                <div className="info-grid-landowner">
                  <div className="info-item-landowner">
                    <div className="info-icon-landowner info-icon-message">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M8 10H16M8 14H13M6 19L3 16V4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V15C21 15.5523 20.5523 16 20 16H7L6 19Z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="info-content-landowner">
                      <div className="info-label-landowner">ข้อความ</div>
                      <div className="info-value-landowner">{result.message}</div>
                    </div>
                  </div>

                  <div className="info-item-landowner">
                    <div className="info-icon-landowner info-icon-owner">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                              fill="currentColor"/>
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" 
                              fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="info-content-landowner">
                      <div className="info-label-landowner">สถานะความเป็นเจ้าของ</div>
                      <div className={`owner-status-landowner ${result.isOwner ? 'is-owner' : 'not-owner'}`}>
                        <span className="status-icon-landowner">
                          {result.isOwner ? "✓" : "✗"}
                        </span>
                        <span>{result.isOwner ? "เป็นเจ้าของ" : "ไม่เป็นเจ้าของ"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckLandowner;