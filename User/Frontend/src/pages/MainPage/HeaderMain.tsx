// HeaderMain.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Home, FileText, Newspaper, Menu, X } from "lucide-react";
import LogoBlack from "../../assets/LogoLandchainBlack.png";
import type { JSX } from "react";
import "./HeaderMain.css";

const HeaderMain = (): JSX.Element => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const goToRegisland = () => {
        navigate("/user/regisland");
        setIsMobileMenuOpen(false);
    };

    const goToLogin = () => {
        navigate("/login");
        setIsMobileMenuOpen(false);
    };

    const goToRegister = () => {
        navigate("/register");
        setIsMobileMenuOpen(false);
    };

    const goToHome = () => {
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const scrollToTop = () => {
        window.scrollTo({
        top: 0,
        behavior: 'smooth'
        });
    };

    return (
        <>
            <header className={`header-main ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    {/* Brand Section */}
                    <div className="header-brand-section">
                        <img
                            src={LogoBlack}
                            alt="LandChain Logo"
                            className="header-logo header-logo-black"
                            onClick={scrollToTop}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="header-nav-section">
                        <ul className="header-nav-list">
                            <li className="header-nav-item">
                                <a href="/" className="header-nav-link" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
                                    <Home size={18} />
                                    หน้าแรก
                                </a>
                            </li>
                        </ul>

                        {/* Auth Buttons */}
                        <div className="header-auth-section">
                            <button className="header-login-btn" onClick={goToLogin}>
                                <LogIn size={18} className="auth-icon" />
                                เข้าสู่ระบบ
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Toggle */}
                    <button className="mobile-toggle" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
                <div className="mobile-menu-content">
                    <div className="mobile-menu-header">
                        <div className="header-brand-section">
                            <img
                                src={LogoBlack}
                                alt="LandChain Logo"
                                className="mobile-logo"
                                onClick={goToHome}
                                style={{ cursor: 'pointer' }}
                            />
                            <span className="header-brand-text">LANDCHAIN</span>
                        </div>
                        <button className="mobile-close" onClick={toggleMobileMenu}>
                            <X size={24} />
                        </button>
                    </div>

                    <ul className="mobile-nav-list">
                        <li className="mobile-nav-item">
                            <a href="/" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); goToHome(); }}>
                                <Home size={18} />
                                หน้าแรก
                            </a>
                        </li>
                        <li className="mobile-nav-item">
                            <a
                                href="/user/regisland"
                                className="mobile-nav-link"
                                onClick={(e) => { e.preventDefault(); goToRegisland(); }}
                            >
                                <FileText size={18} />
                                ลงทะเบียนโฉนด
                            </a>
                        </li>
                        <li className="mobile-nav-item">
                            <a href="/news" className="mobile-nav-link">
                                <Newspaper size={18} />
                                ข่าวสาร
                            </a>
                        </li>
                    </ul>

                    <div className="mobile-auth-section">
                        <button className="mobile-login-btn" onClick={goToLogin}>
                            <LogIn size={18} />
                            เข้าสู่ระบบ
                        </button>
                        <button className="mobile-register-btn" onClick={goToRegister}>
                            <UserPlus size={18} />
                            สมัครสมาชิก
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HeaderMain;
