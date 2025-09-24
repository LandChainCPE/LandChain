import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenerateKey = () => {
  const [name, setName] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const handleTogglePrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // ดึงชื่อที่เก็บใน LocalStorage
    const storedName = sessionStorage.getItem('firstname');

    if (storedName && storedName === name) {
      console.log('Name submitted:', name);
      // Call function to generate keys
      generateKeyPair();
    } else {
      alert('ชื่อไม่ตรงกับที่บันทึกไว้ในระบบ');
    }
  };

  // ฟังก์ชันการสร้าง Public Key และ Private Key
  const generateKeyPair = async () => {
    try {
      const crypto = window.crypto;

      // สร้าง Key Pair ด้วย Web Crypto API (ใช้ P-256)
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDSA",            // ชนิดการเข้ารหัส
          namedCurve: "P-256",      // กำหนดให้ใช้ P-256
        },
        true,                       // สามารถใช้ key ได้ทั้งการเข้ารหัสและการถอดรหัส
        ["sign", "verify"]         // ใช้ key สำหรับ sign และ verify
      );

      // Extract public key และ private key
      const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey); // Public Key
      const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey); // Private Key

      // แปลง ArrayBuffer ให้เป็น Base64 เพื่อเก็บง่าย
      const publicKeyBase64 = arrayBufferToBase64(publicKey);
      const privateKeyBase64 = arrayBufferToBase64(privateKey);

      console.log('Public Key:', publicKeyBase64);
      console.log('Private Key:', privateKeyBase64);

      // เซ็ตค่าลงใน state
      setPublicKey(publicKeyBase64);
      setPrivateKey(privateKeyBase64);

      // เรียกฟังก์ชันดาวน์โหลดไฟล์
      downloadKeys(publicKeyBase64, privateKeyBase64);

    } catch (err) {
      console.error('Error generating key pair:', err);
    }
  };

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary);
  };

  // ฟังก์ชันดาวน์โหลดไฟล์
  const downloadKeys = (publicKey: string, privateKey: string) => {
    // สร้าง JSON Object ที่มี Public Key และ Private Key
    const keyData = JSON.stringify({
      publicKey: publicKey,
      privateKey: privateKey,
    });

    // สร้าง Blob จากข้อมูล JSON
    const blob = new Blob([keyData], { type: 'application/json' });

    // สร้าง URL สำหรับดาวน์โหลด
    const url = URL.createObjectURL(blob);

    // สร้างลิงก์ดาวน์โหลด
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keypair.json';  // ชื่อไฟล์ที่จะดาวน์โหลด
    document.body.appendChild(a);
    a.click();  // คลิกเพื่อนำไฟล์ไปดาวน์โหลด
    document.body.removeChild(a);

    // รีเฟรช URL หลังจากการดาวน์โหลด
    URL.revokeObjectURL(url);
  };

  const displayPublicKey = (key: string | null) => {
    if (key) {
      return key.slice(0, 30); // ดึงแค่ 15 ตัวแรก
    }
    return '';
  };

  const displayPrivateKey = (key: string | null) => {
    if (key) {
      return key.slice(0, 30); // ดึงแค่ 30 ตัวแรก
    }
    return '';
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-5 shadow-sm rounded" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-4">Generate Key</h2>
        <p className="text-center mb-4">คุณต้องการใช้ Key ต่อไปนี้ไหม</p>
        
        {/* Public Key Display */}
        <div className="mb-4">
          <p><strong>Public Key: </strong>{displayPublicKey(publicKey)}</p>
        </div>

        {/* Private Key Display */}
        <div className="mb-4">
          <p>
            <strong>Private Key: </strong>
            {showPrivateKey ? displayPrivateKey(privateKey) : '***********************'}
            <button type="button" onClick={handleTogglePrivateKey} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
              {showPrivateKey ? 'ซ่อน' : 'แสดง'}
            </button>
          </p>
        </div>

        {/* Name Input */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">กรุณากรอกชื่อ เพื่อยืนยันการใช้ Key</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-control"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-warning w-100">ยืนยัน</button>
        </form>
      </div>
    </div>
  );
};

export default GenerateKey;
