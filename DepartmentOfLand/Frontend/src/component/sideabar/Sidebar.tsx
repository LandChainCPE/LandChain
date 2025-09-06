import React from "react";
import {
  UnorderedListOutlined,
  SearchOutlined,
  SwapOutlined,
  FileProtectOutlined,
  HomeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { label: "หน้าหลัก", icon: <HomeOutlined />, path: "/" },
    { label: "รายการดำเนินการ", icon: <UnorderedListOutlined />, path: "/operations" },
    { label: "ตรวจสอบโฉนดที่ดิน", icon: <SearchOutlined />, path: "/verify" },
    { label: "โอนกรรมสิทธิ์", icon: <SwapOutlined />, path: "/transfer" },
    { label: "ลงทะเบียนโฉนดที่ดิน", icon: <FileProtectOutlined />, path: "/regisland" },
    { label: "การตั้งค่า", icon: <SettingOutlined />, path: "/settings" },
  ];

  return (
    <div className="sidebar h-full bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="logo p-6 border-b border-gray-200">
        <img 
          src="/LogoLandchain.png" 
          alt="LandChain Logo" 
          className="w-full h-auto max-w-[150px] mx-auto"
        />
      </div>

      {/* User Info */}
      <div className="user-info p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="user-avatar w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <HomeOutlined className="text-white text-xl" />
          </div>
          <div className="user-details">
            <h4 className="text-sm font-semibold text-gray-900">เจ้าหน้าที่กรมที่ดิน</h4>
            <p className="text-xs text-gray-600">Department of Land</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navigation flex-1 p-4">
        <div className="nav-section">
          <h5 className="section-title text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
            เมนูหลัก
          </h5>
          <div className="space-y-1">
            {menus.map((menu) => (
              <button
                key={menu.path}
                onClick={() => navigate(menu.path)}
                className={`nav-item w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === menu.path
                    ? "active bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className="nav-icon text-lg">{menu.icon}</span>
                <span className="nav-label truncate">{menu.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer p-6 border-t border-gray-200">
        <div className="footer-info text-center">
          <p className="text-xs text-gray-600">© 2025 กรมที่ดิน</p>
          <p className="text-xs text-gray-500">ระบบบล็อกเชน</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
