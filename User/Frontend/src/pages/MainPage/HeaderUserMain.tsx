// MainPage.tsx
import { AuditOutlined, UserOutlined } from "@ant-design/icons";
import { Col, Row, Steps } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, type JSX } from "react";
import Logo from "../../assets/LogoLandchain.png";
import './HeaderUserMain.css';  // เพิ่มการอ้างอิงไฟล์ CSS

// Styled button components with TypeScript
const NavButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'logout';
}> = ({ children, onClick, icon, variant = 'primary' }) => {
    return (
        <button
            className={`nav-button ${variant}`}
            onClick={onClick}
        >
            {icon}
            {children}
        </button>
    );
};

const MainPage = (): JSX.Element => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        const loginStatus = localStorage.getItem("isLogin");
        if (loginStatus === "true") {
            setIsLogin(true);
        }
    }, []);

    const goToRegisland = () => {
        setLoading(true);
        localStorage.setItem("isLogin", "true");
        setTimeout(() => {
            navigate("/user/regisland");
        }, 2000);
    };

    const goToLogin = () => {
        setLoading(true);
        setTimeout(() => {
            navigate("/login");
        }, 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem("isLogin");
        setIsLogin(false);
        navigate("/login");
    };

    return (

        <div className="header-container">
            {/* Header */}
            <Row justify="space-between" align="middle" className="navbar">
                <Col>
                    <img src={Logo} alt="LandChain Logo" />
                </Col>

                <Col style={{ textAlign: "right", display: 'flex', alignItems: 'center' }}>
                    <NavButton variant="secondary">
                        หน้าแรก
                    </NavButton>

                    <NavButton
                        variant="primary"
                        onClick={goToRegisland}
                        icon={<AuditOutlined />}
                    >
                        ลงทะเบียนโฉนดที่ดิน
                    </NavButton>

                    <NavButton variant="secondary">
                        ข่าวสาร
                    </NavButton>

                    {isLogin ? (
                        <>
                            <NavButton
                                variant="secondary"
                                icon={<UserOutlined />}
                            >
                                โปรไฟล์
                            </NavButton>

                            <NavButton
                                variant="logout"
                                onClick={handleLogout}
                            >
                                ออกจากระบบ
                            </NavButton>
                        </>
                    ) : (
                        <NavButton
                            variant="primary"
                            onClick={goToLogin}
                            icon={<UserOutlined />}
                        >
                            เข้าสู่ระบบ
                        </NavButton>
                    )}
                </Col>
            </Row>


        </div>

    );
};

export default MainPage;
