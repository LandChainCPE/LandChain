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

// (Removed MetaMaskLogo inline SVG component – now using official PNG in /public)

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
  <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
  <div className="absolute inset-0">
        {/* Blockchain Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 
              `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Floating Blockchain Elements (legacy) removed; replaced with animated square clusters */}

        {/* Blockchain Square Clusters */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Cluster 1 */}
          <div className="absolute top-24 left-16 flex flex-col space-y-2 animate-fadeIn" style={{animationDelay:'0.2s'}}>
            <div className="flex space-x-2">
              <span className="block w-6 h-6 bg-white/25 border border-white/40 rounded-sm backdrop-blur-sm animate-blockFloat"></span>
              <span className="block w-6 h-6 bg-blue-400/30 border border-white/30 rounded-sm animate-blockFloat" style={{animationDelay:'0.4s'}}></span>
              <span className="block w-6 h-6 bg-white/20 border border-white/25 rounded-sm animate-blockFloat" style={{animationDelay:'0.8s'}}></span>
            </div>
            <div className="flex space-x-2">
              <span className="block w-6 h-6 bg-gradient-to-br from-white/40 to-blue-300/30 border border-white/40 rounded-sm animate-blockFloat" style={{animationDelay:'0.6s'}}></span>
              <span className="block w-6 h-6 bg-white/15 border border-blue-200/30 rounded-sm animate-blockFloat" style={{animationDelay:'1s'}}></span>
              <span className="block w-6 h-6 bg-blue-300/25 border border-white/30 rounded-sm animate-blockFloat" style={{animationDelay:'1.2s'}}></span>
            </div>
          </div>
          {/* Cluster 2 */}
          <div className="absolute bottom-28 right-24 grid grid-cols-4 gap-2 animate-fadeIn" style={{animationDelay:'0.5s'}}>
            {Array.from({length:8}).map((_,i)=>(
              <span key={i} className="w-5 h-5 rounded-sm border backdrop-blur-sm animate-blockFloat"
                style={{
                  animationDelay: `${(i%4)*0.25}s`,
                  background: i%3===0 ? 'rgba(255,255,255,0.18)' : 'rgba(59,130,246,0.20)',
                  borderColor: 'rgba(255,255,255,0.35)'
                }}
              />
            ))}
          </div>
          {/* Cluster 3 diagonal chain */}
          <div className="absolute top-1/3 right-1/3 flex flex-col space-y-3 animate-fadeIn" style={{animationDelay:'0.8s'}}>
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="flex space-x-3" style={{transform:`translateX(${i*8}px)`}}>
                <span className="w-4 h-4 rounded-sm border border-white/30 bg-white/20 animate-blockFloat" style={{animationDelay:`${i*0.2}s`}}></span>
                <span className="w-4 h-4 rounded-sm border border-blue-300/40 bg-blue-400/25 animate-blockFloat" style={{animationDelay:`${i*0.2+0.1}s`}}></span>
              </div>
            ))}
          </div>
          {/* Cluster 4 ring */}
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 animate-rotateSlow opacity-30">
            <div className="relative w-full h-full">
              {Array.from({length:12}).map((_,i)=>{
                const angle = (i/12)*Math.PI*2;
                const x = Math.cos(angle)*70 + 80; // center shift
                const y = Math.sin(angle)*70 + 80;
                return (
                  <span key={i} className="absolute w-4 h-4 rounded-sm border border-white/40 bg-blue-300/30 animate-blockFloat"
                    style={{left:x, top:y, animationDelay:`${i*0.15}s`}}></span>
                );
              })}
            </div>
          </div>
        </div>
        
  {/* Connecting Lines (updated accent) */}
  <div className="absolute top-1/4 left-1/5 w-72 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
  <div className="absolute top-1/2 right-1/4 w-60 h-px bg-gradient-to-l from-transparent via-blue-300/40 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
  <div className="absolute bottom-1/3 left-1/3 w-64 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Blockchain Nodes */}
        <div className="absolute top-32 right-40">
          <div className="w-8 h-8 bg-blue-500/30 rounded-full border-2 border-white/40 animate-pulse"></div>
          <div className="absolute -top-1 -left-1 w-10 h-10 border border-blue-300/20 rounded-full animate-ping"></div>
        </div>
        <div className="absolute bottom-40 left-40">
          <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-blue-400/50 animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute -top-1 -left-1 w-8 h-8 border border-white/30 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="absolute top-1/2 left-16">
          <div className="w-10 h-10 bg-blue-600/25 rounded-full border-2 border-white/35 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -top-1 -left-1 w-12 h-12 border border-blue-300/25 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Digital Elements */}
        {/* <div className="absolute top-16 right-16 text-white/40 font-mono text-xs animate-fadeIn">
          <div className="bg-blue-900/40 backdrop-blur-sm rounded p-2 border border-white/20">
            <div>0x1A2B3C4D...</div>
            <div>Block #12847</div>
            <div>✓ Verified</div>
          </div>
        </div> */}
        
        {/* <div className="absolute bottom-24 right-32 text-white/40 font-mono text-xs animate-fadeIn" style={{animationDelay: '2s'}}>
          <div className="bg-blue-800/40 backdrop-blur-sm rounded p-2 border border-white/20">
            <div>Smart Contract</div>
            <div>Gas: 21,000</div>
            <div>Status: Active</div>
          </div>
        </div> */}
        
        {/* MetaMask Theme Elements */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 text-white/25 animate-fadeIn" style={{animationDelay: '1s'}}>
            <div className="w-3 h-3 rounded-full bg-orange-400/40"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-400/40 to-blue-400/40"></div>
            <div className="w-3 h-3 rounded-full bg-blue-400/40"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400/40 to-white/40"></div>
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
          </div>
        </div>
        
        {/* Large Background Shapes */}
  <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-blue-600/5 rounded-full blur-3xl"></div>
  <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-white/5 to-blue-300/10 rounded-full blur-3xl"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/5 to-blue-700/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        {/* Combined Official Login Card */}
        <div className="w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 animate-slideIn p-8 md:p-12">
          {/* Official Header Section */}
          <div className="text-center mb-10">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
              <img
                src="/Logo1.png"
                alt="ตราสัญลักษณ์ LandChain"
                className="h-20 w-20 object-contain drop-shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                style={{width: "800px"}}
              />
            </div>
            
            {/* Header Text */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-2">
                  Department of Land Login
                </h1>
                {/* <p className="text-blue-600 font-medium">
                  LandChain Blockchain Portal
                </p> */}
              </div>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
              
              <div className="space-y-3">
                <p className="text-base md:text-lg text-blue-700 leading-relaxed max-w-2xl mx-auto font-medium">
                  ระบบตรวจสอบและยืนยันข้อมูลที่ดินบนเทคโนโลยีบล็อกเชน
                </p>
              </div>
            </div>
          </div>
          
          {/* Login Button */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleMetaMaskLogin}
              disabled={loading}
              aria-label="เข้าสู่ระบบด้วย MetaMask อย่างปลอดภัย"
              className="group w-full h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-4 focus:outline-none focus:ring-4 focus:ring-orange-300/50 active:scale-[0.98]"
              style={{borderRadius: '15px'}}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span className="font-medium whitespace-nowrap">กำลังเชื่อมต่อ MetaMask...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center" aria-label="MetaMask Official Logo">
                    <img
                      src="/MetamaskWalletLogo.png"
                      alt="MetaMask Wallet Logo"
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain select-none"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  <span className="font-medium tracking-wide group-hover:tracking-wider transition-all whitespace-nowrap text-xl">
                    Login with MetaMask
                  </span>
                </>
              )}
            </button>
            
            {/* คำแนะนำใต้ปุ่ม */}
            <p className="text-sm md:text-base text-red-600 leading-relaxed text-center mt-4 font-medium">
              กรุณายืนยันตัวตนผ่านกระเป๋าดิจิทัล MetaMask เพื่อเข้าใช้งานระบบ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;