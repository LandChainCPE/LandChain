import React, { useEffect, useState } from "react";
import "./verifyuser.css";
import { GetDataUserVerification } from "../../service/https/garfield/http";
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

import contractABI from "./ContractABI.json";
const contractAddress = "0xb671A410D1ea59631bB8F843B64d30688903CcF1";

/* =======================
   Icon Components (SVG)
   ======================= */
const SafetyCertificateOutlined = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const KeyOutlined = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.4Z" />
    <path d="m6.5 17.5-5-5a1 1 0 0 1 0-1.4l8.5-8.5a1 1 0 0 1 1.4 0l5 5" />
    <path d="m10 16 2 2" />
  </svg>
);
const SwapRightOutlined = ({ className = "" }) => (
  <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
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
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="card-title">{children}</h2>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="card-description">{children}</p>
);
const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="card-content">{children}</div>
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
    <div className="container">
      {/* MetaMask Connection Section */}
      <Card>
        <div className="card-header main-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <CardTitle>
              <div style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <SafetyCertificateOutlined className="icon-lg text-white" />
                ยืนยันผู้ใช้ (User Verification)
              </div>
            </CardTitle>
          </div>
          <CardDescription>ตรวจสอบข้อมูล Wallet และ Digital Signature ที่เซ็นโดยระบบ</CardDescription>

          <div className="chip-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="chip chip-strong">
                🔐 Secure
              </span>
              <span className="chip chip-soft">
                Blockchain Verified
              </span>
            </div>
            <Button
              variant="primary"
              className="button-connect-metamask"
              onClick={connectMetaMask}
            >
              เชื่อมต่อ MetaMask
            </Button>
          </div>

          {wallet && (
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
              <p style={{ color: 'white', margin: 0, fontSize: 14 }}>
                My Wallet Address: {wallet}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Verification Data Cards */}
      <div className="verification-cards">
        {/* Wallet Address Card */}
        <Card>
          <div className="card-header wallet-header">
            <CardTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="MetaMask"
                  style={{ width: 32, height: 32 }}
                />
                Wallet Address
              </div>
            </CardTitle>
            <CardDescription>กระเป๋าเงินดิจิทัลของคุณ</CardDescription>
          </div>
          <CardContent>
            <div className="data-display">
              <code className="wallet-address">{wallet || "ยังไม่ได้เชื่อมต่อ"}</code>
              {wallet && <Copyable text={wallet} />}
            </div>
          </CardContent>
        </Card>

        {/* Digital Signature Card */}
        <Card>
          <div className="card-header signature-header">
            <CardTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <KeyOutlined className="icon-lg text-orange-500" />
                Digital Signature
              </div>
            </CardTitle>
            <CardDescription>ลายเซ็นดิจิทัลจากระบบ</CardDescription>
          </div>
          <CardContent>
            <div className="data-display">
              <code className="signature-text">{signature || "ไม่มีข้อมูล"}</code>
              {signature && <Copyable text={signature} />}
            </div>
          </CardContent>
        </Card>

        {/* Name Hash Card */}
        <Card>
          <div className="card-header hash-header">
            <CardTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SafetyCertificateOutlined className="icon-lg" style={{ color: "#52c41a" }} />
                Name Hash
              </div>
            </CardTitle>
            <CardDescription>แฮชของชื่อผู้ใช้</CardDescription>
          </div>
          <CardContent>
            <div className="data-display">
              <code className="hash-text">{nameHash || "ไม่มีข้อมูล"}</code>
              {nameHash && <Copyable text={nameHash} />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Button Section */}
      <Card className="transaction-card">
        <div className="card-header transaction-header">
          <CardTitle>🚀 ข้อมูลของคุณได้รับการตรวจสอบแล้ว • พร้อมสำหรับการทำธุรกรรมบน Blockchain</CardTitle>
        </div>
        <CardContent>
          <Button
            variant="primary"
            className="btn-transaction w-full"
            onClick={handleRegisterOwner}
          >
            <SwapRightOutlined className="icon mr-1" />
            เริ่มทำธุรกรรม (Transaction)
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyUser;
