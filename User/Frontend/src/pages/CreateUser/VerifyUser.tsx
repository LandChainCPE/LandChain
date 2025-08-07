import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';  // ใช้ useNavigate สำหรับการนำทางไปยังหน้าอื่น
import { Button, Form, Alert, Row, Col } from 'react-bootstrap';
import Logo from "../../assets/LogoLandchainBlack.png";

// สมมติว่าข้อมูลของผู้ใช้ถูกเก็บใน localStorage
const VerifyUserWallet: React.FC = () => {
    const [userData, setUserData] = useState<any | null>(null);
    const [officerName, setOfficerName] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'danger' | null>(null);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // ดึงข้อมูลผู้ใช้จาก localStorage หรือ API
        const storedFirstName = localStorage.getItem('firstname');
        const storedLastName = localStorage.getItem('lastname');
        const storedWalletId = localStorage.getItem('walletAddress');

        if (storedFirstName && storedLastName && storedWalletId) {
            setUserData({
                firstname: storedFirstName,
                lastname: storedLastName,
                walletAddress: storedWalletId
            });
        }
    }, []);

    const handleVerify = async () => {
        if (userData && officerName) {
            // ตรวจสอบข้อมูลที่กรอก
            if (officerName === "เจ้าหน้าที่ตรวจสอบ") {  // สมมุติว่าเจ้าหน้าที่ต้องกรอกชื่อเป็น "เจ้าหน้าที่ตรวจสอบ"
                setMessage('การยืนยันสำเร็จ');
                setMessageType('success');
                setIsVerified(true);
            } else {
                setMessage('ชื่อเจ้าหน้าที่ไม่ถูกต้อง กรุณาตรวจสอบ');
                setMessageType('danger');
                setIsVerified(false);
            }
        } else {
            setMessage('กรุณากรอกข้อมูลทั้งหมด');
            setMessageType('danger');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container py-5">
                <div className="text-center bg-white p-4 shadow-sm rounded">
                    <img src={Logo} alt="LandChain Logo" style={{ width: "100%", height: "auto", maxWidth: "500px" }} />

                    <h2 className="mb-4" style={{ fontWeight: '600', fontSize: '24px' }}>ยืนยันผู้ใช้กับ Wallet ID</h2>

                    {/* แสดงข้อมูลผู้ใช้ */}
                    {userData ? (
                        <div className="mb-4">
                            <p><strong>ชื่อผู้ใช้:</strong> {userData.firstname} {userData.lastname}</p>
                            <p><strong>Wallet ID:</strong> {userData.walletAddress}</p>
                        </div>
                    ) : (
                        <p>กำลังโหลดข้อมูลผู้ใช้...</p>
                    )}

                    {/* Alert Message */}
                    {message && (
                        <Alert variant={messageType ?? undefined}>
                            {message}
                        </Alert>
                    )}

                    {/* Form Section สำหรับกรอกชื่อเจ้าหน้าที่ */}
                    <Form>
                        <Row className="mb-3">
                            <Col xs={12} md={6} className="mx-auto">
                                <Form.Group controlId="formOfficerName">
                                    <Form.Label>ชื่อเจ้าหน้าที่</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={officerName}
                                        onChange={(e) => setOfficerName(e.target.value)}
                                        placeholder="กรุณากรอกชื่อเจ้าหน้าที่"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Confirm Button */}
                        <div className="d-flex justify-content-center">
                            <Button variant="warning" className="w-auto" style={{ padding: '12px 70px' }} onClick={handleVerify}>
                                ยืนยัน
                            </Button>
                        </div>
                    </Form>

                    {/* ปุ่มยกเลิก */}
                    <div className="mt-3">
                        <Button variant="secondary" className="w-auto" style={{ padding: '12px 70px' }} onClick={() => navigate('/')}>
                            ยกเลิก
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyUserWallet;
