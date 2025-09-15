import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [isLoggedIn] = useState(localStorage.getItem("isLogin") === "true");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowDropdown(false);
  }, [location]);

  const isActiveLink = (path: string) => location.pathname === path;

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    window.location.href = "/";
  };

  return (
    <>
      <nav className={`navbar-landchain ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Brand Section */}
          <div className="navbar-brand-section">
            <Link to="/" className="navbar-brand-text">
              LANDCHAIN
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav-section">
            <ul className="navbar-nav-list">
              <li className="navbar-nav-item">
                <Link 
                  to="/" 
                  className={`navbar-nav-link ${isActiveLink('/') ? 'active' : ''}`}
                >
                  หน้าแรก
                </Link>
              </li>
              <li className="navbar-nav-item">
                <Link 
                  to="/appointment" 
                  className={`navbar-nav-link ${isActiveLink('/appointment') ? 'active' : ''}`}
                >
                  นัดหมายกรมที่ดิน
                </Link>
              </li>
              <li className="navbar-nav-item">
                <Link 
                  to="/news" 
                  className={`navbar-nav-link ${isActiveLink('/news') ? 'active' : ''}`}
                >
                  ข่าวสาร
                </Link>
              </li>
            </ul>

            {/* User Dropdown */}
            {isLoggedIn && (
              <div className={`user-dropdown ${showDropdown ? 'show' : ''}`}>
                <button 
                  className="user-dropdown-toggle" 
                  onClick={toggleDropdown}
                  aria-expanded={showDropdown}
                >
                  <FaUser className="user-icon" />
                  <span>บัญชี</span>
                </button>

                <div className="dropdown-menu-landchain">
                  <Link 
                    to="/user/manage" 
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    จัดการข้อมูล
                  </Link>
                  <Link 
                    to="/user/regisland" 
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    ลงทะเบียนโฉนดที่ดิน
                  </Link>
                  <Link 
                    to="/user/transation" 
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    สถานะธุรกรรม
                  </Link>
                  <Link 
                    to="/user/requestsell" 
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    คำขอซื้อ/ขายที่ดิน
                  </Link>
                  <Link 
                    to="/user/landhistory" 
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    ประวัติโฉนดที่ดิน/ตรวจสอบเจ้าของที่ดิน
                  </Link>
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

          {/* Mobile Toggle Button */}
          <button className="mobile-toggle" onClick={toggleMobileMenu}>
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${showMobileMenu ? 'show' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="navbar-brand-section">
              <span className="navbar-brand-text">LANDCHAIN</span>
            </div>
            <button className="mobile-close" onClick={toggleMobileMenu}>
              <FaTimes />
            </button>
          </div>

          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <Link to="/" className="mobile-nav-link">
                หน้าแรก
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/appointment" className="mobile-nav-link">
                นัดหมายกรมที่ดิน
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/news" className="mobile-nav-link">
                ข่าวสาร
              </Link>
            </li>
          </ul>

          {isLoggedIn && (
            <div className="mobile-user-section">
              <div className="mobile-user-title">บัญชีผู้ใช้</div>
              <ul className="mobile-nav-list">
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
                    style={{border: 'none', background: 'none', width: '100%', textAlign: 'left'}}
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