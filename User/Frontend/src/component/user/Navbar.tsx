import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaUser, 
  FaHome, 
  FaCalendarAlt, 
  FaNewspaper, 
  FaCog, 
  FaLandmark, 
  FaHistory, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown
} from "react-icons/fa";
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn] = useState(localStorage.getItem("isLogin") === "true");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // กันไม่ให้ event bubble ไปปิด dropdown
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    closeMenu();
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="brand-logo">
            <FaLandmark />
          </div>
          <span className="brand-name">LANDCHAIN</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link" onClick={closeMenu}>
                <FaHome />
                <span>หน้าแรก</span>
              </Link>
            </li>
            <li>
              <Link to="/appointment" className="nav-link" onClick={closeMenu}>
                <FaCalendarAlt />
                <span>นัดหมายกรมที่ดิน</span>
              </Link>
            </li>
            <li>
              <Link to="/news" className="nav-link" onClick={closeMenu}>
                <FaNewspaper />
                <span>ข่าวสาร</span>
              </Link>
            </li>
          </ul>

          {/* User Menu */}
          {isLoggedIn && (
            <div className="user-dropdown">
              <button
                className="user-btn"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-label="เมนูผู้ใช้"
              >
                <div className="user-icon">
                  <FaUser />
                </div>
                <FaChevronDown className={`chevron ${isDropdownOpen ? "open" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/user/manage" className="dropdown-link" onClick={closeMenu}>
                    <FaCog />
                    <span>จัดการข้อมูล</span>
                  </Link>
                  <Link to="/user/regisland" className="dropdown-link" onClick={closeMenu}>
                    <FaLandmark />
                    <span>ลงทะเบียนโฉนดที่ดิน</span>
                  </Link>
                  <Link to="/user/history" className="dropdown-link" onClick={closeMenu}>
                    <FaHistory />
                    <span>ประวัติ/สถานะ ธุรกรรม</span>
                  </Link>
                  <hr className="dropdown-divider" />
                  <Link to="/logout" className="dropdown-link logout" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>ออกจากระบบ</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {!isLoggedIn && (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="btn-register">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={toggleMenu}
          aria-label="เปิด/ปิดเมนู"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
