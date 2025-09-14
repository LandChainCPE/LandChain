import React, { useState } from 'react';
import './LoginMetamask.css'; // นำเข้าไฟล์ CSS ที่สร้างขึ้นมา
import Logo from '../../assets/LogoLandchain.png';
import { LoginWallet } from '../../service/https/garfield/http';
import { secureLogin } from '../../service/https/nonceService';
import { useNavigate } from 'react-router-dom';

const LoginMetamask = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ฟังก์ชันเชื่อมต่อ Metamask
  const connectMetamask = async () => {
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
          console.log("Wallet", address);
          setWalletAddress(address);

          // ใช้ secure login with nonce protection
          const loginResult = await secureLogin(address);
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


  const handleRegisterClick = () => {
    navigate('/createaccount');
  };

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className="header">
          <img src={Logo} alt="Logo" style={{ width: '350px' }} />
          <p className="headerSubtitle" style={{ fontFamily: 'Kanit' }}>เชื่อม Metamask เพื่อดำเนินการต่อ</p>
        </div>

        {/* Content */}
        <div className="content">
          {/* Error Message */}
          {errorMessage && (
            <div className="errorAlert">
              <span className="errorIcon">⚠️</span>
              <p className="errorText">{errorMessage}</p>
            </div>
          )}

          {/* Connect Button */}
          {!walletAddress && (
            <button
              onClick={connectMetamask}
              disabled={loading}
              className={`connectButton ${loading ? 'connectButtonDisabled' : ''}`}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Login with MetaMask</span>
                </>
              )}
            </button>
          )}

          {/* Divider */}
          <div className="divider">
            <div className="dividerLine"></div>
            <span className="dividerText">or</span>
            <div className="dividerLine"></div>
          </div>

          {/* Register Link */}
          <div className="registerSection">
            <p className="registerText">Don't have an account?</p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleRegisterClick();
              }}
              className="registerLink"
            >
              Create Account →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p className="bottomText">
            New to MetaMask?{' '}
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="bottomLink"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginMetamask;
