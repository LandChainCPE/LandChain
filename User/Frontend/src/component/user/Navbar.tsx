import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import LogoBlack from "../../assets/LogoLandchainBlack.png";
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
          {/* Brand Section */}
          <div className="navbar-brand-section">
            <img
              src={LogoBlack}
              alt="LandChain Logo"
              className="header-logo header-logo-black"
              onClick={scrollToTop}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Desktop Navigation */}
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
                  <a
                    href="/user/manage"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    จัดการข้อมูล
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
                    href="/user/landhistory"
                    className="dropdown-item-landchain"
                    onClick={() => setShowDropdown(false)}
                  >
                    ประวัติโฉนดที่ดิน/ตรวจสอบเจ้าของที่ดิน
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
              <span
                className="navbar-brand-text"
                onClick={scrollToTop}
                style={{ cursor: 'pointer' }}
              >
                LANDCHAIN
              </span>
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