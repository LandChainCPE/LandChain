import React, { useState, useEffect } from "react";
import { 
  User, 
  Home, 
  Calendar, 
  Newspaper, 
  Settings, 
  Landmark, 
  Clock, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import './Navbar.css'; // Import CSS file

const Navbar = () => {
  // States
  const [isLoggedIn] = useState(localStorage.getItem("isLogin") === "true");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isMenuOpen]);

  // Event handlers
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsDropdownOpen(false); // Close dropdown when opening mobile menu
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    closeMenu();
    // Add your logout logic here
    console.log("User logged out");
  };

  // Navigation items
  const navItems = [
    { path: "/", label: "หน้าแรก", icon: Home, active: true },
    { path: "/appointment", label: "นัดหมายกรมที่ดิน", icon: Calendar },
    { path: "/news", label: "ข่าวสาร", icon: Newspaper }
  ];

  // User menu items
  const userMenuItems = [
    { path: "/user/manage", label: "จัดการข้อมูล", icon: Settings },
    { path: "/user/regisland", label: "ลงทะเบียนโฉนดที่ดิน", icon: Landmark },
    { path: "/user/history", label: "ประวัติ/สถานะ ธุรกรรม", icon: Clock }
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Brand */}
        <a href="/" className="nav-brand" onClick={closeMenu}>
          <div className="brand-logo">
            <Landmark size={24} />
          </div>
          <span className="brand-name">LANDCHAIN</span>
        </a>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          <ul className="nav-list">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index} className="nav-item">
                  <a 
                    href={item.path} 
                    className={`nav-link ${item.active ? "active" : ""}`}
                    onClick={closeMenu}
                  >
                    <IconComponent size={16} />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
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
                  <User size={18} />
                </div>
                <span>สมชาย ใจดี</span>
                <ChevronDown 
                  size={14} 
                  className={`chevron ${isDropdownOpen ? "open" : ""}`} 
                />
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu" role="menu">
                  {userMenuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <a 
                        key={index}
                        href={item.path} 
                        className="dropdown-link"
                        onClick={closeMenu}
                        role="menuitem"
                      >
                        <IconComponent size={16} />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                  <hr className="dropdown-divider" />
                  <a 
                    href="/logout" 
                    className="dropdown-link logout" 
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>ออกจากระบบ</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Authentication Buttons */}
          {!isLoggedIn && (
            <div className="auth-buttons">
              <a href="/login" className="btn-login">
                เข้าสู่ระบบ
              </a>
              <a href="/register" className="btn-register">
                สมัครสมาชิก
              </a>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={closeMenu} />
          <div className="mobile-menu" role="dialog" aria-modal="true">
            {/* Mobile Header */}
            <div className="mobile-header">
              {isLoggedIn ? (
                <div className="mobile-user">
                  <div className="user-icon">
                    <User size={18} />
                  </div>
                  <span>สมชาย ใจดี</span>
                </div>
              ) : (
                <div className="mobile-auth">
                  <a href="/login" className="btn-login" onClick={closeMenu}>
                    เข้าสู่ระบบ
                  </a>
                  <a href="/register" className="btn-register" onClick={closeMenu}>
                    สมัครสมาชิก
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="mobile-nav">
              {/* Main Navigation Links */}
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a 
                    key={index}
                    href={item.path} 
                    className="mobile-link" 
                    onClick={closeMenu}
                  >
                    <IconComponent size={20} />
                    <span>{item.label}</span>
                  </a>
                );
              })}

              {/* User Menu Links (if logged in) */}
              {isLoggedIn && (
                <>
                  <hr className="mobile-divider" />
                  {userMenuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <a 
                        key={index}
                        href={item.path} 
                        className="mobile-link" 
                        onClick={closeMenu}
                      >
                        <IconComponent size={20} />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                  <hr className="mobile-divider" />
                  <a 
                    href="/logout" 
                    className="mobile-link logout" 
                    onClick={handleLogout}
                  >
                    <LogOut size={20} />
                    <span>ออกจากระบบ</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;