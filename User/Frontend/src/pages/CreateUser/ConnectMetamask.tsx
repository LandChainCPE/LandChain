import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';  // นำเข้า useNavigate
import Logo from "../../assets/LogoLandChainBLackVertical.png";
import LogoMatamask from "../../assets/LogoMetamask.png";
import Connect from "../../assets/Connect.png";
import { CreateAccount, } from "../../service/https/garfield/http";

// Declare the ethereum property on the Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

const ConnectMetamask = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate(); // ใช้ useNavigate สำหรับการนำทางไปยังหน้า MainPage

  const handleLogin = async () => {
    if (window.ethereum) {
      try {
        // Request MetaMask account connection
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);

          // เก็บที่อยู่กระเป๋าใน localStorage
          localStorage.setItem('walletAddress', address);

          // ดึงข้อมูลผู้ใช้จาก localStorage
          const firstname = localStorage.getItem('firstname');
          const lastname = localStorage.getItem('lastname');
          const phonenumber = localStorage.getItem('phonenumber');
          const email = localStorage.getItem('email');
          const userID = localStorage.getItem('user_id');

          if (firstname && lastname && phonenumber && email) {
            // ส่งข้อมูลไปยัง backend
            const userData = {
              userID,
              firstname,
              lastname,
              phonenumber,
              email,
              metamaskaddress: address,
            };
            console.log("userData:", userData);
            let { response, result } = await CreateAccount(userData);
            console.log("หลัง สร้างผู้ใช้", response);
            console.log("หลัง สร้างผู้ใช้", result);

            if (response.status === 200) {
              localStorage.setItem("token", result.token);
              localStorage.setItem("token_type", result.token_type);
              localStorage.setItem("isLogin", "true");
              localStorage.setItem("firstnameuser", result.FirstNameUser);
              localStorage.setItem("lastnameuser", result.LastNameUser);
              localStorage.setItem("user_id", result.user_id ? result.user_id.toString() : "");
              console.log(localStorage);
            // localStorage.clear();

              navigate("/user/main");
            }
          }
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        alert('การเชื่อมต่อ MetaMask ล้มเหลว');
      }
    } else {
      alert('โปรดติดตั้ง MetaMask เพื่อเชื่อมต่อ');
    }
  };

  const handleCancel = () => {
    // ลบข้อมูลที่เก็บใน localStorage
    localStorage.removeItem('walletAddress');
    setWalletAddress(null);
    console.log('การเชื่อมต่อถูกยกเลิก');

    // รีเฟรชหน้าและนำทางกลับไปยังหน้า MainPage
    navigate('/');  // ไปที่หน้า MainPage

    // รีเฟรชหน้าหลังจากลบข้อมูลจาก localStorage
    window.location.reload();
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="text-center bg-white p-5 shadow-sm rounded" style={{ maxWidth: '750px', width: '100%' }}>
        <h2 className="mb-4" style={{ fontWeight: '600', fontSize: '24px' }}>Login with WalletID</h2>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
          <img src={LogoMatamask} alt="MetaMask Logo" style={{ width: "100%", height: "auto", maxWidth: "200px", marginBottom: '20px' }} />
          <img src={Connect} alt="Connect Icon" style={{ width: "100%", height: "auto", maxWidth: "200px", marginBottom: '20px' }} />
          <img src={Logo} alt="LandChain Logo" style={{ width: "100%", height: "auto", maxWidth: "200px", marginBottom: '20px' }} />
        </div>
        <p className="mb-4" style={{ fontSize: '16px', color: '#555' }}>
          กรุณาเชื่อมต่อกับ Wallet ID ของคุณเพื่อเข้าสู่ระบบ
        </p>

        {/* Button Section */}
        <div className="d-flex justify-content-center">
          <button className="btn btn-warning w-auto" style={{ padding: '12px 70px' }} onClick={handleLogin}>
            อนุญาต
          </button>
        </div>

        {/* Cancel button */}
        <div className="mt-3">
          <button className="btn btn-secondary w-auto" style={{ padding: '12px 70px' }} onClick={handleCancel}>
            ยกเลิก
          </button>
        </div>

        {/* Display wallet address if connected */}
        {walletAddress && (
          <div className="mt-3">
            <p>เชื่อมต่อกับ wallet: {walletAddress}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectMetamask;
