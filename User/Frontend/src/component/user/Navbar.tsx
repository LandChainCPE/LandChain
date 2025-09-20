import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUser, FaBars, FaTimes, FaBell } from "react-icons/fa";
import "./Navbar.css";
import { GetInfoUserByWalletID } from "../../service/https/bam/bam";

interface Notification {
  message: string;
  link?: string;
}

const Navbar = () => {
  const [isLoggedIn] = useState(localStorage.getItem("isLogin") === "true");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const location = useLocation();
  const [user, setUser] = useState<any | null>(null); 

  
  useEffect(() => {
  async function fetchUser() {
    try {
      const userInfo = await GetInfoUserByWalletID();
      console.log("userInfo", userInfo);
      setUser(userInfo);
      
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }
  fetchUser();
}, []);

  // Connect WebSocket สำหรับ notification
  useEffect(() => {

    if (!isLoggedIn || !user?.id) return;
    const ws = new WebSocket(`ws://192.168.1.173:8080/ws/notification/${user?.id}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications(prev => [data, ...prev]);
      } catch (err) {
        console.error("Notification parse error:", err);
      }
    };

    ws.onclose = () => console.log("Notification WebSocket closed");
    ws.onerror = (err) => console.error("Notification WebSocket error:", err);

    return () => ws.close();
  }, [isLoggedIn]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) setShowDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ปิด mobile menu บน route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowDropdown(false);
  }, [location]);

  const isActiveLink = (path: string) => location.pathname === path;

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userID");
    window.location.href = "/";
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <>
      <nav className={`navbar-landchain ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand-section">
            <Link to="/user" className="navbar-brand-text">LANDCHAIN</Link>
          </div>

          <div className="navbar-nav-section">
            <ul className="navbar-nav-list">
              <li className="navbar-nav-item">
                <Link to="/user" className={`navbar-nav-link ${isActiveLink('/user') ? 'active' : ''}`}>หน้าแรก</Link>
              </li>
              <li className="navbar-nav-item">
                <Link to="/user/regisland" className={`navbar-nav-link ${isActiveLink('/user/regisland') ? 'active' : ''}`}>นัดหมายกรมที่ดิน</Link>
              </li>
              <li className="navbar-nav-item">
                <Link to="/news" className={`navbar-nav-link ${isActiveLink('/news') ? 'active' : ''}`}>โปรไฟล์</Link>
              </li>
            </ul>

            {/* User Dropdown + Notification */}
            {isLoggedIn && (
              <div className={`user-dropdown ${showDropdown ? 'show' : ''}`}>
                <button className="user-dropdown-toggle" onClick={toggleDropdown}>
                  <FaUser />
                  <span>บัญชี</span>
                  {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                </button>

                <div className="dropdown-menu-landchain">
                  {notifications.length > 0 && (
                    <div className="notifications-list">
                      <div className="notifications-header">
                        แจ้งเตือน
                        <button onClick={clearNotifications} className="mark-read-btn">อ่านแล้ว</button>
                      </div>
                      {notifications.map((n, idx) => (
                        <div key={idx} className="notification-item">{n.message}</div>
                      ))}
                    </div>
                  )}
                  <a href="/user/manage" className="dropdown-item-landchain" onClick={() => setShowDropdown(false)}>จัดการข้อมูล</a>
                  <a href="/user/chat" className="dropdown-item-landchain" onClick={() => setShowDropdown(false)}>พูดคุย</a>
                  <a href="/user/userregisland" className="dropdown-item-landchain" onClick={() => setShowDropdown(false)}>ลงทะเบียนโฉนดที่ดิน</a>
                  <a href="/user/transation" className="dropdown-item-landchain" onClick={() => setShowDropdown(false)}>สถานะธุรกรรม</a>
                  <a href="/user/requestsell" className="dropdown-item-landchain" onClick={() => setShowDropdown(false)}>คำขอซื้อ/ขายที่ดิน</a>
                  <a href="/user/landhistory" className="dropdown-item-landchain" onClick={() => setShowDropdown(false)}>ประวัติโฉนดที่ดิน/ตรวจสอบเจ้าของที่ดิน</a>
                  <button className="dropdown-item-landchain logout-btn" onClick={handleLogout}>ออกจากระบบ</button>
                </div>
              </div>
            )}
          </div>

          <button className="mobile-toggle" onClick={toggleMobileMenu}><FaBars /></button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${showMobileMenu ? 'show' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <span className="navbar-brand-text">LANDCHAIN</span>
            <button className="mobile-close" onClick={toggleMobileMenu}><FaTimes /></button>
          </div>

          <ul className="mobile-nav-list">
            <li className="mobile-nav-item"><Link to="/" className="mobile-nav-link">หน้าแรก</Link></li>
            <li className="mobile-nav-item"><Link to="/appointment" className="mobile-nav-link">นัดหมายกรมที่ดิน</Link></li>
            <li className="mobile-nav-item"><Link to="/news" className="mobile-nav-link">ข่าวสาร</Link></li>
          </ul>

          {isLoggedIn && (
            <div className="mobile-user-section">
              <div className="mobile-user-title">บัญชีผู้ใช้</div>
              <ul className="mobile-nav-list">
                <li className="mobile-nav-item"><Link to="/user/Chat" className="mobile-nav-link">จัดการข้อมูล</Link></li>
                <li className="mobile-nav-item"><Link to="/user/Chat" className="mobile-nav-link">พูดคุย</Link></li>
                <li className="mobile-nav-item"><Link to="/user/regisland" className="mobile-nav-link">ลงทะเบียนโฉนดที่ดิน</Link></li>
                <li className="mobile-nav-item"><Link to="/user/history" className="mobile-nav-link">ประวัติ/สถานะ ธุรกรรม</Link></li>
                <li className="mobile-nav-item"><Link to="/checklandowner" className="mobile-nav-link">ตรวจสอบเจ้าของที่ดิน</Link></li>
                <li className="mobile-nav-item"><Link to="/landhistory" className="mobile-nav-link">ประวัติโฉนดที่ดิน</Link></li>
                <li className="mobile-nav-item">
                  <button onClick={handleLogout} className="mobile-nav-link" style={{border:'none',background:'none',width:'100%',textAlign:'left'}}>ออกจากระบบ</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
