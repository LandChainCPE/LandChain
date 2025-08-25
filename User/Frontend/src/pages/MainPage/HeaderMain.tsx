// Header.tsx
import { Button, Col, Row } from "antd";
import Logo from "../../assets/LogoLandchain.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { JSX } from "react";
import "./HeaderMain.css"; // Assuming you have a CSS file for styling

const NavButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'logout';
}> = ({ children, onClick, icon, variant = 'secondary' }) => {
  return (
    <button className="nav-button" onClick={onClick}>
      {icon}
      {children}
    </button>
  );
};

const Header = (): JSX.Element => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        const loginStatus = localStorage.getItem("isLogin");
        if (loginStatus === "true") {
            setIsLogin(true);
        }
    }, []);

    const goToRegisland = () => {
        navigate("/user/regisland");
    };

    const goToLogin = () => {
        navigate("/login");
    };

    return (
        <div className="header-container">            
            <Row justify="space-between" align="middle" className="navbar">
                <Col> 
                    <img 
                        src={Logo} 
                        alt="LandChain Logo" 
                    /> 
                </Col> 
                
                <Col className="navbar-col">
                    <NavButton>หน้าแรก</NavButton>
                    <NavButton onClick={goToRegisland}>ลงทะเบียนโฉนดที่ดิน</NavButton>
                    <NavButton>ข่าวสาร</NavButton>
                    <NavButton onClick={goToLogin}>เข้าสู่ระบบ</NavButton>
                </Col> 
            </Row>
        </div>
    );
};

export default Header;
