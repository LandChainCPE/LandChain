import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Button, Space, Tag, message, Modal } from "antd";
import { SafetyCertificateOutlined, CopyOutlined, SwapRightOutlined, KeyOutlined } from "@ant-design/icons";
import "./MainPage.css";
import { GetDataUserVerification, } from "../../service/https/garfield/http";
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

import contractABI from "./ContractABI.json";
const contractAddress = "0xb671A410D1ea59631bB8F843B64d30688903CcF1";

const { Text, Title, Paragraph } = Typography;

function VerifyUser() {
  const [wallet, setWallet] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [nameHash, setNameHash] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const userid = localStorage.getItem("user_id");   ///แก้  
      console.log();
      if (!userid) return;
      const { response, result } = await GetDataUserVerification(userid);
      if (response && result) {
        console.log(response);
        console.log(result);
        setWallet(result.wallet);
        setSignature(result.signature);
        setNameHash(result.nameHash);
      }
    };
    fetchData();
  }, []);


  const [modalOpen, setModalOpen] = useState(false);

  const copy = async (text?: string) => {
    if (!text) return message.warning("ไม่มีข้อมูลให้คัดลอก");
    try {
      await navigator.clipboard.writeText(text);
      message.success("คัดลอกเรียบร้อย");
    } catch (e) {
      message.error("คัดลอกไม่สำเร็จ");
    }
  };

  const connectMetaMask = async () => {
    const provider: any = await detectEthereumProvider();
    if (provider) {
      const web3 = new Web3(provider);
      try {
        const accounts = await web3.eth.requestAccounts();
        if (accounts && accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          message.error("ไม่พบบัญชีใน MetaMask");
        }
      } catch (error) {
        message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ MetaMask");
      }
    } else {
      message.error("กรุณาติดตั้ง MetaMask");
    }
  };

  const handleRegisterOwner = async () => {
    try {
      const provider: any = await detectEthereumProvider();
      if (!provider) {
        message.error("กรุณาติดตั้ง MetaMask");
        return;
      }
      const web3 = new Web3(provider);
      const contractInstance = new web3.eth.Contract(
        contractABI as any,
        contractAddress
      );
      await contractInstance.methods.registerOwner(wallet, nameHash, signature).send({ from: wallet });
      alert('Owner registration successful!');
    } catch (error: any) {
      console.error('Error registering owner:', error);
      alert('Error: ' + (error?.message || error));
    }
  };

  return (
    <div className="main-container" style={{ minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <Button type="primary" onClick={connectMetaMask} style={{ fontFamily: "Kanit", fontSize: 18 }}>
          เชื่อมต่อ MetaMask
        </Button>
        <span style={{ marginLeft: 24, fontFamily: "Kanit", fontSize: 18 }}>
          My Wallet Address: {wallet}
        </span>
      </div>
      <div style={{ background: "#364049", padding: 40, minHeight: "100vh" }}>
        <Row justify="center">
          <Col span={20}>
            {/* Header Section */}
            <Card 
              style={{ 
                borderRadius: 16, 
                marginBottom: 24,
                background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                border: "none"
              }}
            >
              <Row align="middle" justify="center" style={{ textAlign: "center" }}>
                <Col>
                  <Space direction="vertical" size="middle">
                    <div style={{ fontSize: 64, color: "white" }}>
                      <SafetyCertificateOutlined />
                    </div>
                    <Title level={1} style={{ margin: 0, color: "white", fontFamily: "Kanit" }}>
                      ยืนยันผู้ใช้ (User Verification)
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Kanit", fontSize: 18 }}>
                      ตรวจสอบข้อมูล Wallet และ Digital Signature ที่เซ็นโดยระบบ
                    </Text>
                    <Tag color="green" style={{ fontFamily: "Kanit", fontSize: 14, padding: "4px 12px" }}>
                      🔐 Secure • Blockchain Verified
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Row gutter={[24, 24]}>
              {/* 1. Metamask Wallet Section */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <Space size="middle">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                        alt="MetaMask" 
                        style={{ width: 48, height: 48 }}
                      />
                      <Text style={{ fontFamily: "Kanit", fontSize: 22, fontWeight: 600 }}>Metamask Wallet Address</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ 
                    borderRadius: 16, 
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    minHeight: 300
                  }}
                >
                  <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div 
                      style={{ 
                        background: "#1890ff",
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "center"
                      }}
                    >
                      <Text style={{ color: "white", fontFamily: "Kanit", fontSize: 18 }}>
                        กระเป๋าเงินดิจิทัลของคุณ
                      </Text>
                    </div>
                    
                    <Paragraph 
                      style={{ 
                        wordBreak: "break-all", 
                        fontFamily: "monospace", 
                        fontSize: 16,
                        background: "#e6f7ff",
                        padding: 16,
                        borderRadius: 8,
                        border: "2px solid #91d5ff",
                        textAlign: "center",
                        margin: 0
                      }}
                    >
                      {wallet}
                    </Paragraph>
                    
                  </Space>
                </Card>
              </Col>

              {/* 2. Digital Signature Section */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <Space size="middle">
                      <KeyOutlined style={{ fontSize: 48, color: "#fa8c16" }} />
                      <Text style={{ fontFamily: "Kanit", fontSize: 22, fontWeight: 600 }}>Digital Signature</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ 
                    borderRadius: 16, 
                    background: "linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%)",
                    minHeight: 300
                  }}
                >
                  <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div 
                      style={{ 
                        background: "#fa8c16",
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "center"
                      }}
                    >
                      <Text style={{ color: "white", fontFamily: "Kanit", fontSize: 18 }}>
                        ลายเซ็นดิจิทัลจากระบบ
                      </Text>
                    </div>
                    
                    <Paragraph 
                      style={{ 
                        wordBreak: "break-all", 
                        fontFamily: "monospace", 
                        fontSize: 14,
                        background: "#ffecc7",
                        padding: 16,
                        borderRadius: 8,
                        border: "2px solid #ffec8c",
                        maxHeight: 120,
                        overflow: "auto",
                        textAlign: "center",
                        margin: 0
                      }}
                    >
                      {signature}
                    </Paragraph>
                  </Space>
                </Card>
              </Col>

              {/* 3. Name Hash Section */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <Space size="middle">
                      <SafetyCertificateOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                      <Text style={{ fontFamily: "Kanit", fontSize: 22, fontWeight: 600 }}>Name Hash</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ 
                    borderRadius: 16, 
                    background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
                    minHeight: 300
                  }}
                >
                  <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div 
                      style={{ 
                        background: "#52c41a",
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "center"
                      }}
                    >
                      <Text style={{ color: "white", fontFamily: "Kanit", fontSize: 18 }}>
                        แฮชของชื่อผู้ใช้
                      </Text>
                    </div>
                    
                    <Paragraph 
                      style={{ 
                        wordBreak: "break-all", 
                        fontFamily: "monospace", 
                        fontSize: 16,
                        background: "#f0f9ff",
                        padding: 16,
                        borderRadius: 8,
                        border: "2px solid #b7eb8f",
                        textAlign: "center",
                        margin: 0
                      }}
                    >
                      {nameHash}
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Transaction Button Section */}
            <Row justify="center" style={{ marginTop: 40 }}>
              <Col span={24}>
                <Card 
                  style={{ 
                    borderRadius: 20, 
                    background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                    border: "none",
                    textAlign: "center",
                    padding: "20px 0"
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <Title level={2} style={{ color: "white", fontFamily: "Kanit", margin: 0 }}>
                      🚀 พร้อมทำธุรกรรมแล้วหรือยัง?
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Kanit", fontSize: 18 }}>
                      ข้อมูลของคุณได้รับการตรวจสอบแล้ว • พร้อมสำหรับการทำธุรกรรมบน Blockchain
                    </Text>
                    <div>
                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<SwapRightOutlined />} 
                        onClick={handleRegisterOwner}
                        style={{ 
                          fontFamily: "Kanit", 
                          fontSize: 20,
                          height: 60,
                          padding: "0 40px",
                          background: "#1890ff",
                          border: "3px solid white",
                          borderRadius: 30,
                          boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
                        }}
                      >
                        เริ่มทำธุรกรรม (Transaction)
                      </Button>
                    </div>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Kanit", fontSize: 14 }}>
                      ✅ ปลอดภัย • เข้ารหัส • ตรวจสอบได้
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default VerifyUser;
