import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers';
// import { Signer } from '@ethersproject/abstract-signer';

// ใส่ ABI ของ Smart Contract ที่นี่
// เลือกเฉพาะฟังก์ชันที่ต้องการใช้: registerOwner และ getOwnerInfo
const contractABI = [
  "function registerOwner(address wallet, string memory nameHash, bytes memory signature) external",
  "function getOwnerInfo(address wallet) external view returns (string memory nameHash)",
];

// ที่อยู่ของ Smart Contract ที่คุณ Deploy บน testnet (HolSky)
const contractAddress = "0x2e08e6B5791B7F03328E98C12e2f3A3c3b0F4f6c"; // แก้ไขเป็นที่อยู่จริงของคุณ
const trustedSignerAddress = "0xd0Ce2A84c5cD85e377A14Bb46C77a612be1572af";

function App() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [nameHash, setNameHash] = useState('');
  const [signature, setSignature] = useState('');
  const [status, setStatus] = useState('');
  const [ownerInfoResult, setOwnerInfoResult] = useState('');

  // ฟังก์ชันเชื่อมต่อกับ MetaMask
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);

        setProvider(provider);
        setSigner(signer);
        setContract(contractInstance);
        setUserAddress(address);
        setStatus(`เชื่อมต่อสำเร็จ! ที่อยู่: ${address}`);

        // กำหนดค่า nameHash และ signature โดยตรงเพื่อการทดสอบ
        const backendUserName = "testuser";
        const salt = "random_salt_from_database"; // เกลือสุ่มจาก DB
        const messageToSign = address + keccak256(toUtf8Bytes(backendUserName + salt)).slice(2);
        
        // สร้าง hash ที่ Backend จะเซ็น
        const messageHash = keccak256(toUtf8Bytes(messageToSign));
        
        // จำลอง Private Key ของ Backend เพื่อเซ็น (ไม่ควรเก็บ Private Key ไว้ใน Frontend)
        const signingKey = new ethers.utils.SigningKey("0x8555fd08b389ae4280a9b856fa10da42ad2153e62475f8fedd54ccc16d9cd9db");
        const signature = signingKey.signDigest(messageHash);
        
        const ethSignature = ethers.utils.joinSignature(signature);

        setNameHash(keccak256(toUtf8Bytes(backendUserName + salt)));
        setSignature(ethSignature);
        
        setStatus(`เชื่อมต่อสำเร็จ! ที่อยู่: ${address}. ข้อมูลสำหรับการทำธุรกรรมพร้อมแล้ว!`);

      } else {
        setStatus("โปรดติดตั้ง MetaMask!");
      }
    } catch (error) {
      console.error(error);
      setStatus("เกิดข้อผิดพลาดในการเชื่อมต่อ.");
    }
  };

  // ฟังก์ชันเรียก Smart Contract: registerOwner
  const registerOwner = async () => {
    if (!contract || !userAddress || !nameHash || !signature) {
      setStatus("โปรดเชื่อมต่อ Wallet.");
      return;
    }

    setStatus("กำลังส่งธุรกรรม... โปรดยืนยันใน MetaMask");
    try {
      const tx = await contract.registerOwner(userAddress, nameHash, signature);
      setStatus(`ธุรกรรมถูกส่งแล้ว! Hash: ${tx.hash}`);
      await tx.wait();
      setStatus(`การลงทะเบียนสำเร็จ! Hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setStatus("การทำธุรกรรมล้มเหลว. ตรวจสอบคอนโซลสำหรับรายละเอียด.");
    }
  };

  // ฟังก์ชันเรียก Smart Contract: getOwnerInfo
  const getOwnerInfo = async () => {
    if (!contract || !userAddress) {
      setStatus("โปรดเชื่อมต่อ Wallet.");
      return;
    }

    try {
      setStatus("กำลังดึงข้อมูล...");
      const result = await contract.getOwnerInfo(userAddress);
      setOwnerInfoResult(result);
      setStatus("ดึงข้อมูลสำเร็จ.");
    } catch (error) {
      console.error(error);
      setStatus("ดึงข้อมูลล้มเหลว. อาจยังไม่ได้ลงทะเบียน.");
      setOwnerInfoResult("");
    }
  };

  useEffect(() => {
    // ตรวจสอบสถานะการเชื่อมต่อเมื่อโหลดหน้า
    if (window.ethereum) {
      connectWallet();
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Digital Land Title DApp</h1>
      <p>เชื่อมต่อกับ HolSky Testnet เพื่อทดสอบฟังก์ชัน `registerOwner` และ `getOwnerInfo`</p>
      
      <button onClick={connectWallet} disabled={!!userAddress}>
        {userAddress ? 'เชื่อมต่อแล้ว' : 'เชื่อมต่อ Wallet'}
      </button>

      {userAddress && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>ที่อยู่ Wallet:</strong> {userAddress}</p>
          <p><strong>สถานะ:</strong> {status}</p>

          <h2>ขั้นตอน: ลงทะเบียน Wallet ด้วยลายเซ็น</h2>
          <p>เมื่อเชื่อมต่อ Wallet แล้ว ข้อมูลสำหรับทำธุรกรรมจะถูกเตรียมไว้ให้โดยอัตโนมัติ<br/>โปรดกดปุ่มด้านล่างเพื่อส่งข้อมูลพร้อมลายเซ็นไปที่ Smart Contract</p>
          <p><strong>Hash ชื่อผู้ใช้:</strong> {nameHash}</p>
          <p><strong>ลายเซ็นที่สร้าง:</strong> {signature}</p>

          <button onClick={registerOwner} disabled={!signature}>
            ลงทะเบียน
          </button>
          
          <h2>ตรวจสอบข้อมูลที่บันทึก</h2>
          <p>เรียกดูข้อมูลที่ลงทะเบียนไว้จาก Smart Contract</p>
          <button onClick={getOwnerInfo} disabled={!userAddress}>
            ดึงข้อมูลเจ้าของ
          </button>
          {ownerInfoResult && <p><strong>Name Hash ที่บันทึก:</strong> {ownerInfoResult}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
