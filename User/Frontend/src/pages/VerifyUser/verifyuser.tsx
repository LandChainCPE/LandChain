import "./verifyuser.css";
import React, { useEffect, useState } from "react";
import { GetDataUserVerification } from "../../service/https/garfield/http";
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Container } from "react-bootstrap";

import contractABI from "./ContractABI.json";
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

/* =======================
   Icon Components (SVG)
   ======================= */
const SafetyCertificateOutlined = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CopyIcon = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

/* =======================
   Lightweight Primitives
   ======================= */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`card ${className}`}>{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn ${variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : variant === "danger" ? "btn-danger" : "btn-ghost"} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

function VerifyUser() {
  const [wallet, setWallet] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [nameHash, setNameHash] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const userid = localStorage.getItem("user_id");   ///แก้  
      console.log();
      if (!userid) return;
      const { response, result } = await GetDataUserVerification(userid);
      if (response && result) {
        console.log(response);
        console.log(result);
        setWallet(result.wallet);
        setSignature(result.signature);
        setNameHash(result.nameHash);
      }
    };
    fetchData();
  }, []);

  const copy = async (text?: string) => {
    if (!text) return alert("ไม่มีข้อมูลให้คัดลอก");
    try {
      await navigator.clipboard.writeText(text);
      alert("คัดลอกเรียบร้อย");
    } catch (e) {
      alert("คัดลอกไม่สำเร็จ");
    }
  };

  const connectMetaMask = async () => {
    const provider: any = await detectEthereumProvider();
    if (provider) {
      const web3 = new Web3(provider);
      try {
        const accounts = await web3.eth.requestAccounts();
        if (accounts && accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          alert("ไม่พบบัญชีใน MetaMask");
        }
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ MetaMask");
      }
    } else {
      alert("กรุณาติดตั้ง MetaMask");
    }
  };

  const handleRegisterOwner = async () => {
    try {
      const provider: any = await detectEthereumProvider();
      if (!provider) {
        alert("กรุณาติดตั้ง MetaMask");
        return;
      }
      const web3 = new Web3(provider);
      const contractInstance = new web3.eth.Contract(
        contractABI as any,
        contractAddress
      );
      await contractInstance.methods.registerOwner(wallet, nameHash, signature).send({ from: wallet });
      alert('Owner registration successful!');
    } catch (error: any) {
      console.error('Error registering owner:', error);
      alert('Error: ' + (error?.message || error));
    }
  };

  const Copyable = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
      <Button
        variant="ghost"
        className="btn-xs"
        onClick={() => {
          copy(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 900);
        }}
      >
        <CopyIcon className="icon-sm mr-1" />
        {copied ? "คัดลอกแล้ว" : "คัดลอก"}
      </Button>
    );
  };

  return (
    <div className="verify-user-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      <div className="hero-section-bg">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🔐 Blockchain Verification</span>
            </div>
            <h1 className="hero-title">
              <span className="toblockchain-text">ยืนยันตัวตนบน Blockchain</span>
            </h1>
            <p className="hero-subtitle">
              ตรวจสอบข้อมูล Wallet และ Digital Signature ที่เซ็นโดยระบบ
              <br />
            </p>
          </div>
        </div>
      </div>

      <Container className="main-container">
        {/* Connection Section */}
        <div className="connection-section">
          <Card className="glass-card connection-card">
            <div className="connection-card-body">
              <div className="connection-header">
                <div className="connection-icon">
                  <SafetyCertificateOutlined className="icon-xxl" />
                </div>
                <h3>เชื่อมต่อ MetaMask</h3>
                <p>เชื่อมต่อกระเป๋าเงินดิจิทัลเพื่อเริ่มกระบวนการยืนยันตัวตน</p>
              </div>

              <div className="connection-actions">
                <Button
                  className="btn-modern"
                  onClick={connectMetaMask}
                >
                  <div className="btn-content">
                    <span className="btn-icon">🦊</span>
                    <span>เชื่อมต่อ MetaMask</span>
                    <div className="btn-arrow">→</div>
                  </div>
                  <div className="btn-ripple"></div>
                </Button>
              </div>

              {wallet && (
                <div className="wallet-display-section">
                  <div className="alert-modern success">
                    <div className="alert-icon">✅</div>
                    <div className="alert-content">
                      <div className="alert-title">เชื่อมต่อสำเร็จ</div>
                      <div className="alert-message">Wallet: {wallet}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Verification Data Cards */}
        <div className="verification-section">
          <div className="verification-header">
            <div className="verification-badge">
              <span className="badge-icon">🔐</span>
              <span>ข้อมูลการยืนยัน</span>
            </div>
            <h2 className="verification-title">
              <span className="gradient-text">รายละเอียดการตรวจสอบ</span>
            </h2>
            <p className="verification-subtitle">
              ข้อมูลที่ใช้ในการยืนยันตัวตนบน Blockchain
            </p>
          </div>

          <div className="verification-cards">
            {/* Wallet Address Card */}
            <div className="verification-card-modern">
              <div className="card-shine"></div>
              <div className="card-header-modern wallet">
                <div className="header-content">
                  <div className="status-indicator">🦊</div>
                  <div className="header-text">
                    <h4 className="card-title-modern">Wallet Address</h4>
                    <p className="card-subtitle-modern">กระเป๋าเงินดิจิทัล</p>
                  </div>
                </div>
              </div>
              <div className="card-body-modern">
                <div className="data-display">
                  <div className="data-content">
                    <code className="data-text">{wallet || "ยังไม่ได้เชื่อมต่อ"}</code>
                    {wallet && <Copyable text={wallet} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Signature Card */}
            <div className="verification-card-modern">
              <div className="card-shine"></div>
              <div className="card-header-modern signature">
                <div className="header-content">
                  <div className="status-indicator">🔑</div>
                  <div className="header-text">
                    <h4 className="card-title-modern">Digital Signature</h4>
                    <p className="card-subtitle-modern">ลายเซ็นดิจิทัล</p>
                  </div>
                </div>
              </div>
              <div className="card-body-modern">
                <div className="data-display">
                  <div className="data-content">
                    <code className="data-text signature">{signature || "ไม่มีข้อมูล"}</code>
                    {signature && <Copyable text={signature} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Name Hash Card */}
            <div className="verification-card-modern">
              <div className="card-shine"></div>
              <div className="card-header-modern hash">
                <div className="header-content">
                  <div className="status-indicator">🏷️</div>
                  <div className="header-text">
                    <h4 className="card-title-modern">Name Hash</h4>
                    <p className="card-subtitle-modern">แฮชของชื่อผู้ใช้</p>
                  </div>
                </div>
              </div>
              <div className="card-body-modern">
                <div className="data-display">
                  <div className="data-content">
                    <code className="data-text hash">{nameHash || "ไม่มีข้อมูล"}</code>
                    {nameHash && <Copyable text={nameHash} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Section */}
        {wallet && signature && nameHash && (
          <div className="transaction-section">
            <Card className="glass-card transaction-card">
              <div className="transaction-card-body">
                <div className="transaction-header">
                  <div className="transaction-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 3 4 7l4 4M4 7h16m-4 10 4-4-4-4M20 17H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3>พร้อมทำธุรกรรม</h3>
                  <p>ข้อมูลของคุณได้รับการตรวจสอบแล้ว พร้อมสำหรับการทำธุรกรรมบน Blockchain</p>
                </div>

                <div className="transaction-actions">
                  <Button
                    className="btn-modern transaction-btn"
                    onClick={handleRegisterOwner}
                  >
                    <div className="btn-content">
                      <span className="btn-icon">🚀</span>
                      <span>เริ่มทำธุรกรรม (Transaction)</span>
                      <div className="btn-arrow">→</div>
                    </div>
                    <div className="btn-ripple"></div>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!wallet && (
          <div className="empty-state">
            <div className="empty-icon">🦊</div>
            <h3 className="empty-title">เชื่อมต่อ MetaMask</h3>
            <p className="empty-message">
              กรุณาเชื่อมต่อ MetaMask เพื่อเริ่มกระบวนการยืนยันตัวตน
            </p>
            <Button className="btn-secondary-modern" onClick={connectMetaMask}>
              เชื่อมต่อตอนนี้
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default VerifyUser;
