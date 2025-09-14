import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';  // นำเข้า useNavigate
import Logo from "../../assets/LogoLandChainBLackVertical.png";
import LogoMatamask from "../../assets/LogoMetamask.png";
import Connect from "../../assets/Connect.png";
import { secureRegis } from '../../service/https/nonceService';


// Declare the ethereum property on the Window interface

const ConnectMetamask = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate(); // ใช้ useNavigate สำหรับการนำทางไปยังหน้า MainPage

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const connectMetamaskRegis = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        setErrorMessage('');

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          const address = accounts[0];
          console.log("Wallet address from MetaMask:", address);
          setWalletAddress(address);

          // ใช้ secure login with nonce protection
          const loginResult = await secureRegis(address);
          console.log("Secure login successful:", loginResult);

          if (loginResult.wallet_address) {
            // login สำเร็จ
            localStorage.setItem('isLogin', 'true');
            localStorage.setItem('walletAddress', loginResult.wallet_address);
            localStorage.setItem('user_id', loginResult.user_id ? loginResult.user_id.toString() : '');
            if (loginResult.token) {
              localStorage.setItem('token', loginResult.token);
              localStorage.setItem('token_type', loginResult.token_type)
            } else {
              localStorage.removeItem('token');
            }


            navigate('/user', { replace: true });
          } else {
            // wallet ยังไม่ได้สมัคร หรือ login ไม่สำเร็จ
            setErrorMessage('Login failed. Please try again or sign up first.');

            // simulate disconnect
            setWalletAddress(null);
            localStorage.removeItem('isLogin');
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('user_id');
            localStorage.removeItem('token');
          }
        }
      } catch (error: any) {
        console.error('Error during secure login:', error);
        if (error.code === 4001) {
          setErrorMessage('Connection rejected by user.');
        } else if (error.message?.includes('User not found')) {
          setErrorMessage('Wallet not registered. Please sign up first.');
        } else if (error.message?.includes('Invalid signature')) {
          setErrorMessage('Signature verification failed. Please try again.');
        } else if (error.message?.includes('Invalid or expired nonce')) {
          setErrorMessage('Session expired. Please try again.');
        } else {
          setErrorMessage('Error connecting to MetaMask. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage('MetaMask not installed. Please install MetaMask to continue.');
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
          <button className="btn btn-warning w-auto" style={{ padding: '12px 70px' }} onClick={connectMetamaskRegis}>
            อนุญาต5555
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
