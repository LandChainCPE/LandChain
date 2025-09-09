import React, { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditOutlined, UserOutlined } from "@ant-design/icons";
import { Col, Row } from "antd";
import './HeaderUserMain.css';  // เพิ่มการอ้างอิงไฟล์ CSS
import Logo from "../../assets/LogoLandchain.png";

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

    const goToVerifyUserToBlockchain = () => {
        setLoading(true);
        localStorage.setItem("isLogin", "true");
        setTimeout(() => {
            navigate("/user/verifyusertoblockchain");
        }, 2000);
    };
    const goToUserDashboard = () => {
        setLoading(true);
        setTimeout(() => {
            navigate("/user/userdashboard");
        }, 2000);
    };

    const goToLogin = () => {
        setLoading(true);
        setTimeout(() => {
            navigate("/login");
        }, 2000);
    };

    const handleLogout = () => {
        // ลบข้อมูลการล็อกอินออกจาก localStorage
        localStorage.removeItem("isLogin");
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("walletAddress");
        setIsLogin(false);

        // ล้างข้อมูลที่เกี่ยวกับ Metamask (ถ้ามี)
        if (window.ethereum) {
            window.ethereum.request({
                method: 'eth_requestAccounts',
                params: [],
            }).then(() => {
                // รีเฟรชหน้าเพื่อรีเซ็ตสถานะ
                window.location.reload();
            }).catch((error: any) => {
                console.error('Error while disconnecting Metamask:', error);
                // รีเฟรชหน้าในกรณีที่เกิดข้อผิดพลาด
                window.location.reload();
            });
        } else {
            // ถ้าไม่มี Metamask ก็รีเฟรชหน้าเลย
            window.location.reload();
        }
        navigate("/", { replace: true });
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
                                variant="primary"
                                onClick={goToVerifyUserToBlockchain}
                                icon={<UserOutlined />}
                            >
                                ลงทะเบียนผู้ใช้ Blockchain
                            </NavButton>
                            
                            <NavButton
                                variant="secondary"
                                onClick={goToUserDashboard}
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
