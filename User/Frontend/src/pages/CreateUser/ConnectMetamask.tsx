import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/LogoLandChainBLackVertical.png";
import LogoMatamask from "../../assets/LogoMetamask.png";
import Connect from "../../assets/Connect.png";
import { secureRegis } from '../../service/https/nonceService';
import './ConnectMetamask.css';


// Declare the ethereum property on the Window interface

const ConnectMetamask = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate();
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
            // localStorage.setItem('walletAddress', loginResult.wallet_address);
            // localStorage.setItem('user_id', loginResult.user_id ? loginResult.user_id.toString() : '');
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
    localStorage.removeItem('walletAddress');
    setWalletAddress(null);
    console.log('การเชื่อมต่อถูกยกเลิก');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="connect-metamask-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      <div className="glass-card">
        <div className="card-glow"></div>
        <div className="card-body">
          <h2 className="header-title">Login with WalletID</h2>

          <div className="logo-section">
            <div className="logo-item">
              <img src={LogoMatamask} alt="MetaMask Logo" />
            </div>
            <div className="logo-item">
              <img src={Connect} alt="Connect Icon" />
            </div>
            <div className="logo-item">
              <img src={Logo} alt="LandChain Logo" />
            </div>
          </div>

          <p className="description">
            กรุณาเชื่อมต่อกับ Wallet ID ของคุณเพื่อเข้าสู่ระบบ
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <p className="error-text">{errorMessage}</p>
            </div>
          )}

          {/* Button Section */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Cancel button */}
            <button className="btn-cancel" onClick={handleCancel}>
              ยกเลิก
            </button>

            {/* Connect Button */}
            <button
              className="btn-connect"
              onClick={connectMetamaskRegis}
              disabled={loading}
            >
              {loading ? (
                <div className="btn-content">
                  <div className="spinner"></div>
                  <span>กำลังเชื่อมต่อ...</span>
                </div>
              ) : (
                <span>อนุญาต</span>
              )}
            </button>
          </div>

          {/* Display wallet address if connected */}
          {walletAddress && (
            <div className="wallet-display">
              <p>เชื่อมต่อกับ wallet:</p>
              <p className="wallet-address">{walletAddress}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectMetamask;
