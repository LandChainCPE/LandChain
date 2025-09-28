import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { message } from 'antd';
import "../index.css"
import { SecureLogin } from '../service/https/nonceService';
import { useNavigate } from 'react-router-dom';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleMetaMaskLogin = async () => {
    if (typeof window.ethereum === 'undefined') {
      window.location.href = 'https://metamask.app.link/dapp/' + window.location.host;
      return;
    }
    setLoading(true);
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    if (accounts && accounts.length > 0) {
      console.log("Account", accounts);
      const address = accounts[0];   //  มันคืนมาเป็น  Array  เลยต้องใช้ [0]
      const loginResult = await SecureLogin(address);
      console.log("loginResult" , loginResult);
      sessionStorage.setItem("token", loginResult.token);
      sessionStorage.setItem("token_type", loginResult.token_type);
      sessionStorage.setItem("isLogin", "true");
      navigate("/main");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-0 animate-slideIn p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              เข้าสู่ระบบ
            </h2>
            <p className="text-blue-600 text-sm">
              กรุณาเข้าสู่ระบบด้วย MetaMask
            </p>
          </div>
          <button
            type="button"
            onClick={handleMetaMaskLogin}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3 mb-6"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>กำลังเชื่อมต่อ MetaMask...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#f6851b">
                    <path d="M22.2 1.7l-8.2 6.1 1.5-3.6 6.7-2.5z"/>
                    <path d="M1.8 1.7l8.1 6.2-1.4-3.7L1.8 1.7z"/>
                    <path d="M19 16.6l-2.1 3.2 4.5 1.2 1.3-4.3-3.7-.1z"/>
                    <path d="M1.3 16.7l1.3 4.3 4.5-1.2-2.1-3.2-3.7.1z"/>
                    <path d="M6.8 10.4l-1.3 2 4.5 .1-.1-4.8-3.1 2.7z"/>
                    <path d="M17.2 10.4l-3.1-2.7-.1 4.8 4.5-.1-1.3-2z"/>
                    <path d="M7.1 19.8l2.7-1.3-2.3-1.8-.4 3.1z"/>
                    <path d="M14.2 18.5l2.7 1.3-.4-3.1-2.3 1.8z"/>
                  </svg>
                </div>
                <span>เข้าสู่ระบบด้วย MetaMask</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Background Decoration - Land & Blockchain Theme */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 
              `linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
        {/* Subtle Gradient Overlays */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-blue-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-blue-300/15 to-blue-400/10 rounded-full blur-3xl"></div>
        {/* Land Plot Icons */}
        <div className="absolute top-20 right-20 text-blue-200 opacity-30 animate-fadeIn">
          <div className="w-20 h-20 border-2 border-current rounded-lg p-2">
            <div className="grid grid-cols-3 gap-1 h-full">
              <div className="bg-current opacity-30 rounded-sm"></div>
              <div className="bg-current opacity-50 rounded-sm"></div>
              <div className="bg-current opacity-30 rounded-sm"></div>
              <div className="bg-current opacity-40 rounded-sm"></div>
              <div className="bg-current opacity-30 rounded-sm"></div>
              <div className="bg-current opacity-35 rounded-sm"></div>
            </div>
            <div className="text-xs text-center mt-1">Land Plots</div>
          </div>
        </div>
        {/* Blockchain Icon */}
        <div className="absolute bottom-20 left-20 text-blue-200 opacity-30 animate-fadeIn" style={{animationDelay: '1s'}}>
          <div className="w-20 h-20 border-2 border-current rounded-lg p-2">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 border border-current bg-current opacity-30"></div>
              <div className="w-1 h-0.5 bg-current"></div>
              <div className="w-3 h-3 border border-current bg-current opacity-50"></div>
              <div className="w-1 h-0.5 bg-current"></div>
              <div className="w-3 h-3 border border-current bg-current opacity-30"></div>
            </div>
            <div className="text-xs text-center mt-2">Blockchain</div>
          </div>
        </div>
        {/* Property Document Icon */}
        <div className="absolute top-1/3 left-10 text-blue-200 opacity-25 animate-fadeIn" style={{animationDelay: '2s'}}>
          <div className="w-16 h-20 border-2 border-current rounded-lg p-2 bg-current bg-opacity-10">
            <div className="space-y-1">
              <div className="h-0.5 bg-current opacity-60"></div>
              <div className="h-0.5 bg-current opacity-50 w-3/4"></div>
              <div className="h-0.5 bg-current opacity-60"></div>
              <div className="h-0.5 bg-current opacity-50 w-2/3"></div>
            </div>
            <div className="w-3 h-3 border border-current rounded-full mt-2 ml-auto opacity-40"></div>
            <div className="text-xs text-center mt-1">Title Deed</div>
          </div>
        </div>
        {/* Digital Transaction Icon */}
        <div className="absolute bottom-1/3 right-10 text-blue-200 opacity-25 animate-fadeIn" style={{animationDelay: '3s'}}>
          <div className="w-16 h-16 border-2 border-current rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="w-4 h-4 border border-current rounded-full bg-current opacity-20 flex items-center justify-center text-xs">₿</div>
              <div className="flex-1 mx-1">
                <div className="h-0.5 bg-current opacity-60"></div>
                <div className="h-0.5 bg-current opacity-40 mt-0.5"></div>
              </div>
              <div className="w-4 h-4 border border-current rounded-full bg-current opacity-20 flex items-center justify-center text-xs">🏠</div>
            </div>
            <div className="text-xs text-center mt-1">Transaction</div>
          </div>
        </div>
        {/* Security Shield Icon */}
        <div className="absolute top-2/3 right-1/4 text-blue-200 opacity-20 animate-fadeIn" style={{animationDelay: '4s'}}>
          <div className="w-12 h-16 relative">
            <div className="w-full h-full border-2 border-current rounded-t-full rounded-b-lg bg-current opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-lg">✓</div>
            </div>
            <div className="text-xs text-center mt-1">Secure</div>
          </div>
        </div>
        {/* Floating Data Elements */}
        <div className="absolute top-1/4 right-1/3 text-blue-100 opacity-15 animate-bounce-subtle" style={{animationDelay: '1.5s'}}>
          <div className="text-xs font-mono bg-blue-900/10 rounded p-2">
            <div>Hash: 0x4A7B...</div>
            <div>Block: #1247</div>
            <div>Verified ✓</div>
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 text-blue-100 opacity-15 animate-bounce-subtle" style={{animationDelay: '2.5s'}}>
          <div className="text-xs font-mono bg-blue-900/10 rounded p-2">
            <div>Smart Contract</div>
            <div>Status: Active</div>
            <div>Gas: 21000</div>
          </div>
        </div>
        {/* Network Connection Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-32 left-20 w-64 h-0.5 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent animate-pulse-slow"></div>
          <div className="absolute top-48 right-32 w-48 h-0.5 bg-gradient-to-l from-transparent via-blue-300/20 to-transparent animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-32 w-56 h-0.5 bg-gradient-to-r from-transparent via-blue-300/25 to-transparent animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default Login;