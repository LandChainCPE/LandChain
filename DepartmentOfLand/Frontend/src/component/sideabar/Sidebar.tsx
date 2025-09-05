import React from "react";
import {
  CalendarOutlined,   // รายการจองคิว
  FileSearchOutlined, // ตรวจสอบโฉนดที่ดิน
  SwapOutlined,       // โอนกรรมสิทธิ์
  FileAddOutlined,    // ลงทะเบียนโฉนดที่ดิน
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
  { label: "รายการดำเนินการ",       icon: <CalendarOutlined />,   path: "/operations"   },
  { label: "ตรวจสอบโฉนดที่ดิน",   icon: <FileSearchOutlined />, path: "/teams"       },
  { label: "โอนกรรมสิทธิ์",        icon: <SwapOutlined />,      path: "/payments"    },
  { label: "ลงทะเบียนโฉนดที่ดิน", icon: <FileAddOutlined />,   path: "/attendance"  },
];

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/LogoLandchain.png" alt="Logo" style={{width: "85%"}}/>
      </div>

      <div className="menu">
        {menus.map((menu) => (
          <button
            key={menu.path}
            onClick={() => navigate(menu.path)}
            className={location.pathname === menu.path ? "menu-btn active" : "menu-btn"}
          >
            {menu.icon} {menu.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
