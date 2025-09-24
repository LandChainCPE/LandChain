import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import "../index.css"

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormValues>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormValues>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormValues> = {};

    if (!formData.username) {
      newErrors.username = 'กรุณาใส่ชื่อผู้ใช้งาน';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณาใส่รหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleMetaMaskLogin = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        message.error('กรุณาติดตั้ง MetaMask ก่อนใช้งาน');
        return;
      }

      setLoading(true);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log('Connected MetaMask account:', account);
        
        // TODO: Verify wallet address with your backend
        // You can add signature verification here
        
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('walletAddress', account);
        localStorage.setItem('loginMethod', 'metamask');
        
        message.success(`เข้าสู่ระบบสำเร็จด้วย MetaMask`);
        navigate('/main');
      }
    } catch (error: any) {
      console.error('MetaMask login error:', error);
      if (error.code === 4001) {
        message.error('การเชื่อมต่อ MetaMask ถูกยกเลิก');
      } else {
        message.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MetaMask');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with your actual login service
      console.log('Login values:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, just set login status and navigate
      localStorage.setItem('isLogin', 'true');
      message.success('เข้าสู่ระบบสำเร็จ');
      navigate('/main');
    } catch (error) {
      message.error('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Login Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-0 animate-slideIn p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              เข้าสู่ระบบ
            </h2>
            <p className="text-blue-600 text-sm">
              กรุณาใส่ข้อมูลผู้ใช้งานเพื่อเข้าสู่ระบบ
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-blue-900 font-semibold text-base mb-2">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserOutlined className="text-blue-500 text-lg" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  className={`w-full h-14 pl-12 pr-4 rounded-xl border-2 shadow-sm text-base focus:outline-none transition-colors duration-200 ${
                    errors.username 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-blue-200 hover:border-blue-400 focus:border-blue-500 bg-white'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-blue-900 font-semibold text-base mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockOutlined className="text-blue-500 text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="กรอกรหัสผ่าน"
                  className={`w-full h-14 pl-12 pr-12 rounded-xl border-2 shadow-sm text-base focus:outline-none transition-colors duration-200 ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-blue-200 hover:border-blue-400 focus:border-blue-500 bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <LoginOutlined className="text-lg" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-blue-100"></div>
            <div className="px-4 text-blue-600 text-sm">หรือ</div>
            <div className="flex-1 border-t border-blue-100"></div>
          </div>

          {/* MetaMask Login Button */}
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

          {/* Footer Links */}
          <div className="text-center space-y-3 pt-6 border-t border-blue-100 mt-8">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors hover:underline">
              ลืมรหัสผ่าน?
            </button>
          </div>
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