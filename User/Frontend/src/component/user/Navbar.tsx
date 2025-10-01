import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import LogoBlack from "../../assets/LogoLandchainBlack.png";
import "./Navbar.css";
import { GetInfoUserByWalletID } from "../../service/https/bam/bam";
const URLBackendWS = import.meta.env.VITE_URL_Backend_WSS;

interface Notification {
  message: string;
  link?: string;
}

const Navbar = () => {
  const [isLoggedIn] = useState(sessionStorage.getItem("isLogin") === "true");
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
    
    // const ws = new WebSocket(`wss://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io/:8080/ws/notification/${user?.id}`);
    const ws = new WebSocket(`${URLBackendWS}/${user?.id}`);


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
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };



  return (
    <>
      <nav className={`navbar-landchain ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand-section">
            <img
              src={LogoBlack}
              alt="LandChain Logo"
              className="header-logo header-logo-black"
              onClick={scrollToTop}
              style={{ cursor: 'pointer' }}
            />

          </div>

          <div className="navbar-nav-section">
            <ul className="navbar-nav-list">
              <li className="navbar-nav-item">

                <a
                  href="/user"
                  className={`navbar-nav-link ${location.pathname === '/user' ? 'active' : ''}`}
                >
                  หน้าแรก
                </a>
              </li>
              <li className="navbar-nav-item">
                <a
                  href="/user/regisland"
                  className={`navbar-nav-link ${location.pathname === '/user/regisland' ? 'active' : ''}`}
                >
                  นัดหมายกรมที่ดิน
                </a>
              </li>
              <li className="navbar-nav-item">
                <a
                  href="/user/checkverifywallet"
                  className={`navbar-nav-link ${location.pathname === '/user/checkverifywallet' ? 'active' : ''}`}
                >
                  ตรวจสอบการยืนยันกระเป๋าตัง
                </a>
              </li>
              <li className="navbar-nav-item">
                <a
                  href="/user/sellpostmain"
                  className={`navbar-nav-link ${location.pathname === '/user/sellpostmain' ? 'active' : ''}`}
                >
                  ประกาศขายที่ดิน
                </a>
              </li>
              <li className="navbar-nav-item">
                <Link
                  to="/user/userdashboard"
                  className={`navbar-nav-link ${isActiveLink('/user/userdashboard') ? 'active' : ''}`}
                >
                  โปรไฟล์
                </Link>

              </li>
            </ul>

            {/* User Dropdown + Notification */}
            {isLoggedIn && (
              <div className={`user-dropdown ${showDropdown ? 'show' : ''}`}>

                <button
                  className="user-dropdown-toggle"
                  onClick={toggleDropdown}
                  aria-expanded={showDropdown}
                >
                  <FaUser className="user-icon" />

                  <span>บัญชี</span>
                  {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                </button>

                <div className="dropdown-menu-landchain">
                  <a
                    href="/user/manage"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    จัดการข้อมูล
                  </a>

                  <a
                    href="/user/managepost"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    จัดการโพสต์
                  </a>
                  <a
                    href="/user/chat"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    พูดคุย
                  </a>
                  <a
                    href="/user/userregisland"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    ลงทะเบียนโฉนดที่ดิน
                  </a>
                  <a
                    href="/user/transation"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    สถานะธุรกรรม
                  </a>
                  <a
                    href="/user/requestsell"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    คำขอซื้อ/ขายที่ดิน
                  </a>
                  <a
                    href="/user/appointmentstatus"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    สถานะการจองนัดหมาย
                  </a>
                  <a
                    href="/user/landhistory"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    ประวัติโฉนดที่ดิน/ตรวจสอบเจ้าของที่ดิน
                  </a>
                  <a
                    href="/user/state"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    ติดตามสถานะคำร้อง
                  </a>
                  <button
                    className="dropdown-item-landchain logout-btn"
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </button>

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

            <div className="navbar-brand-section">
              <img
                src={LogoBlack}
                alt="LandChain Logo"
                className="header-logo header-logo-black"
                onClick={scrollToTop}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <button className="mobile-close" onClick={toggleMobileMenu}>
              <FaTimes />
            </button>
          </div>

          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <Link
                to="/"
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                  setShowMobileMenu(false);
                  setTimeout(() => {
                    window.location.href = '/user';
                  }, 100);
                }}
              >
                หน้าแรก
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/user/regisland" className="mobile-nav-link">
                นัดหมายกรมที่ดิน
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/user/sellpostmain" className="mobile-nav-link">
                ประกาศขายที่ดิน
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/user/userdashboard" className="mobile-nav-link">
                โปรไฟล์
              </Link>
            </li>

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
                  <Link to="/user/manage" className="mobile-nav-link">
                    จัดการข้อมูล
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/user/regisland" className="mobile-nav-link">
                    ลงทะเบียนโฉนดที่ดิน
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/user/history" className="mobile-nav-link">
                    ประวัติ/สถานะ ธุรกรรม
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/checklandowner" className="mobile-nav-link">
                    ตรวจสอบเจ้าของที่ดิน
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <Link to="/landhistory" className="mobile-nav-link">
                    ประวัติโฉนดที่ดิน
                  </Link>
                </li>
                <li className="mobile-nav-item">
                  <button
                    className="mobile-nav-link"
                    onClick={handleLogout}
                    style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                  >
                    ออกจากระบบ
                  </button>

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
