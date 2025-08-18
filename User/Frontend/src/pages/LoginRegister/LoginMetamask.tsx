import React, { useState } from 'react';
import './LoginMetamask.css'; // นำเข้าไฟล์ CSS ที่สร้างขึ้นมา
import Logo from '../../assets/LogoLandchain.png';
import { LoginWallet, LogoutWallet } from '../../service/https/garfield/http';

const LoginMetamask = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
          setWalletAddress(address);

          // เรียกใช้ service LoginWallet
          const { result } = await LoginWallet(address);
          if (result.success && result.exists) {
            window.location.href = '/dashboard';
          } else {
            setErrorMessage('Wallet not registered. Please sign up first.');
          }
        } else {
          setErrorMessage('No accounts found. Please unlock MetaMask.');
        }

      } catch (error: any) {
        console.error('Error connecting to MetaMask:', error);
        if (error.code === 4001) {
          setErrorMessage('Connection rejected by user.');
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
  // ฟังก์ชัน disconnect wallet
  const disconnectWallet = () => {
    LogoutWallet();
    setWalletAddress(null);
    setErrorMessage('');
  };

  const handleRegisterClick = () => {
    window.location.href = '/creataccount';
  };

  return (
    
      <div className="card">
        {/* Header */}
        <div className="header">
          <img src={Logo} alt="Logo" style={{ width: '350px' }} />
          <p className="headerSubtitle">Connect your wallet to continue</p>
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

          {/* Connected Wallet Display */}
          {walletAddress && (
            <div className="connectedWallet">
              <div className="walletInfo">
                <div className="walletLeft">
                  <div className="walletIcon">
                    👛
                  </div>
                  <div>
                    <p className="walletLabel">Wallet Connected</p>
                    <p className="walletAddress">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="disconnect-btn"
                >
                  Disconnect
                </button>
              </div>
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
    
  );
};

export default LoginMetamask;
