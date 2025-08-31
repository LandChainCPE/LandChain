import React, { useEffect, useState } from "react";
import { Checkbox, Upload, message, Form, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { MapPin, Check, Phone, User, DollarSign } from "lucide-react";
import { GetTags, GetAllProvinces, CreateLandPost } from "../../service/https/jib/jib";
import Web3 from "web3";
//import LandABI from "../../../src/abi/DigitalLandTitle.json";

export const AddressABI = [
 [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "landTitleHash",
				"type": "string"
			}
		],
		"name": "LandMinted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "landTitleHash",
				"type": "string"
			}
		],
		"name": "mintLandTitleNFT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "nameHash",
				"type": "string"
			}
		],
		"name": "OwnerRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "nameHash",
				"type": "string"
			}
		],
		"name": "registerOwner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getLandTitleHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			}
		],
		"name": "getLandTitleInfoByWallet",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			}
		],
		"name": "getOwnerInfo",
		"outputs": [
			{
				"internalType": "string",
				"name": "nameHash",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getOwnershipHistory",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "owners",
		"outputs": [
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "nameHash",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "ownershipHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
];
const contractAddress = "0xf55988edca178d5507454107945a0c96f3af628c";

type Tag = {
  Tag: string;
  icon: string;
};

type Land = { id: string; owner: string; };

const SellPost = () => {
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<any[]>([]);
  const [rawProvinces, setRawProvinces] = useState<any[]>([]);
  const [image, setImage] = useState<string>("");
  const [lands, setLands] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [form] = Form.useForm();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    name: "",
    price: "",
    tag: [] as string[],
    image: "",
    province: "",
    district: "",
    subdistrict: "",
  });

  // Init Web3
  const initWeb3 = async () => {
    if ((window as any).ethereum) {
      const web3Instance = new Web3((window as any).ethereum);
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3Instance.eth.getAccounts();
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      const landContract = new web3Instance.eth.Contract(AddressABI as any, contractAddress);
      setContract(landContract);
    } else {
      setError("ไม่พบ Metamask");
    }
  };

  useEffect(() => {
    initWeb3();
  }, []);

  // โหลดโฉนดจาก blockchain
    const getLandTitleInfoByWallet = async () => {
        if (!web3 || !contract || !walletAddress4) {
            alert('Please connect MetaMask');
            return;
        }

        try {
            const landTitleInfo = await contract.methods.getLandTitleInfoByWallet(walletAddress4).call();
            alert(`Land Title Info: ${landTitleInfo}`);
        } catch (error) {
            console.error('Error fetching land title info:', error);
            alert('Error: ' + error.message);
        }
    };


  // ฟังก์ชันอัปโหลดรูป
  const handleUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น");
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);

    return Upload.LIST_IGNORE;
  };

  // โหลดจังหวัด
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await GetAllProvinces();
        const data = res.data || res;
        setRawProvinces(data);
        setProvinceOptions(data.map((p: any) => ({
          label: p.name_th,
          value: p.name_th,
        })));
      } catch (error) {
        console.error('โหลดจังหวัดล้มเหลว:', error);
      }
    };
    loadProvinces();
  }, []);

  // โหลดแท็ก
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await GetTags();
        setTags(tagsData);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePost = async () => {
    try {
      const postData = { ...formData };
      const response = await CreateLandPost(postData);

      if (response?.success) {
        message.success("ประกาศขายที่ดินของคุณได้รับการโพสต์เรียบร้อยแล้ว");
        setIsModalVisible(true);
      } else {
        message.error("เกิดข้อผิดพลาดในการโพสต์ที่ดิน");
      }
    } catch (error) {
      message.error("ไม่สามารถโพสต์ที่ดินได้ กรุณาลองใหม่");
      console.error("Error creating land post:", error);
    }
  };

  // แก้ handleTagChange
  const handleTagChange = (value: string) => {
    setFormData(prevState => {
      const newTags = prevState.tag.includes(value)
        ? prevState.tag.filter(tag => tag !== value)
        : [...prevState.tag, value];
      return { ...prevState, tag: newTags };
    });
  };

  // ฟังก์ชันเลือกจังหวัด-อำเภอ-ตำบล
  const handleProvinceChange = (provinceName: string) => {
    form.setFieldsValue({ province: provinceName, district: undefined, subdistrict: undefined });

    const selectedProvince = rawProvinces.find(p => p.name_th === provinceName);
    if (selectedProvince?.District) {
      setDistrictOptions(selectedProvince.District.map((d: any) => ({ label: d.name_th, value: d.name_th })));
    }
    setSubdistrictOptions([]);
    setFormData(prev => ({ ...prev, province: provinceName, district: "", subdistrict: "" }));
  };

  const handleDistrictChange = (districtName: string) => {
    form.setFieldsValue({ district: districtName, subdistrict: undefined });
    const selectedProvince = rawProvinces.find(p => p.name_th === formData.province);
    const selectedDistrict = selectedProvince?.District?.find((d: any) => d.name_th === districtName);
    if (Array.isArray(selectedDistrict?.Subdistrict)) {
      setSubdistrictOptions(selectedDistrict.Subdistrict.map((s: any) => ({ label: s.name_th, value: s.name_th })));
    }
    setFormData(prev => ({ ...prev, district: districtName, subdistrict: "" }));
  };

  const handleSubdistrictChange = (subdistrictName: string) => {
    form.setFieldsValue({ subdistrict: subdistrictName });
    setFormData(prev => ({ ...prev, subdistrict: subdistrictName }));
  };

  const steps = [
    { number: 1, title: "เลือกโฉนดที่ดิน", icon: "📋" },
    { number: 2, title: "กรอกข้อมูลส่วนตัว", icon: "👤" },
    { number: 3, title: "รายละเอียดที่ดิน", icon: "🏞️" },
    { number: 4, title: "ตำแหน่งที่ตั้ง", icon: "📍" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #cce7ff, #ffffff, #d9f5d0)" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#ffffff", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "1.5rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#4a4a4a", display: "flex", alignItems: "center", gap: "1rem" }}>
            🏡 ประกาศขายที่ดิน
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          {steps.map((step, index) => (
            <div key={step.number} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", color: currentStep >= step.number ? "#007bff" : "#a0a0a0" }}>
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem",
                    backgroundColor: currentStep >= step.number ? "#e0f7ff" : "#f0f0f0",
                    color: currentStep >= step.number ? "#007bff" : "#a0a0a0",
                    border: currentStep >= step.number ? "2px solid #007bff" : "2px solid #f0f0f0"
                  }}
                >
                  {step.icon}
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: "5rem",
                    height: "2px",
                    margin: "0 1rem",
                    backgroundColor: currentStep > step.number ? "#007bff" : "#e0e0e0"
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          {/* Main Content */}
          <div style={{ gridColumn: "span 2" }}>
            {/* Step 1: Land Selection */}
            {currentStep === 1 && (
              <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
                
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  📋 ตรวจสอบโฉนดที่ดินของคุณ
                </h2>
                <p style={{ color: "#616161", marginBottom: "1.5rem" }}>
                  เลือกโฉนดที่ดินที่คุณต้องการประกาศขายจากรายการด้านล่างนี้:</p>

      {/* แสดงรายการโฉนดที่ดินจาก blockchain */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {lands.map((land, index) => (
          <li
            key={index}
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
              backgroundColor: selectedLandId === land.id ? "#b2dfdb" : "#fff",
            }}
            onClick={() => setSelectedLandId(land.id)}
          >
            โฉนดหมายเลข: {land.id} | เจ้าของ: {land.owner}
          </li>
        ))}
      </ul>


                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{
                      padding: "0.75rem 2rem",
                      backgroundColor: "#007bff",
                      color: "#ffffff",
                      borderRadius: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Continue from Step 2: Personal Information */}
      {currentStep === 2 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            👤 ข้อมูลส่วนตัว
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>ชื่อ</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกชื่อ"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>นามสกุล</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>เบอร์โทรศัพท์</label>
              <div style={{ position: "relative" }}>
                <Phone style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#e0e0e0",
                color: "#616161",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#007bff",
                color: "#ffffff",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
      {currentStep === 3 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            🏞️ รายละเอียดที่ดิน
          </h2>

        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem", display: "block" }}>
            รูปที่ดิน
          </label>
          <Upload
            beforeUpload={handleUpload}
            listType="picture"
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>อัปโหลดรูปภาพ</Button>
          </Upload>

          {image && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <img
                src={image}
                alt="Preview"
                style={{ maxWidth: "100%", borderRadius: "1rem", maxHeight: "300px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>ชื่อที่ดิน</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกชื่อที่ดิน"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>ราคา (บาท)</label>
              <div style={{ position: "relative" }}>
                <DollarSign style={{ position: "absolute", left: "1rem", top: "1rem", width: "1.25rem", height: "1.25rem", color: "#9e9e9e" }} />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "1rem",
                    fontSize: "1rem",
                    color: "#616161",
                    outline: "none",
                    transition: "border 0.3s",
                  }}
                  placeholder="กรอกราคา"
                />
              </div>
            </div>

            <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>คุณสมบัติที่ดิน</label>
            <Checkbox.Group
              value={formData.tag}
              onChange={(checkedValues) =>
                setFormData({ ...formData, tag: checkedValues })
              }
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem",
              }}
            >
              {tags.map((tag) => (
                <Checkbox
                  key={tag.Tag}
                  value={tag.Tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1rem",
                    borderRadius: "1rem",
                  }}
                >
                  <span style={{ fontSize: "1.25rem", marginRight: "0.75rem" }}>
                    {tag.icon}
                  </span>
                  <span style={{ fontWeight: "600" }}>{tag.Tag}</span>
                </Checkbox>
              ))}
            </Checkbox.Group>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(2)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#e0e0e0",
                color: "#616161",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#007bff",
                color: "#ffffff",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Location */}
      {currentStep === 4 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            📍 ตำแหน่งที่ตั้ง
          </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>จังหวัด</label>

            <select
                name="province"
                value={formData.province}
                onChange={(e) => handleProvinceChange(e.target.value)} // ส่งชื่อจังหวัด
              >
                <option value="">เลือกจังหวัด</option>
                {provinceOptions.map((province) => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>อำเภอ</label>
              <select
                name="district"
                value={formData.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!formData.province}
              >
                <option value="">เลือกอำเภอ</option>
                {districtOptions.map((district) => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>ตำบล</label>
              <select
                name="subdistrict"
                value={formData.subdistrict}
                onChange={(e) => handleSubdistrictChange(e.target.value)}
                disabled={!formData.district}
              >
                <option value="">เลือกตำบล</option>
                {subdistrictOptions.map((subdistrict) => (
                  <option key={subdistrict.value} value={subdistrict.value}>
                    {subdistrict.label}
                  </option>
                ))}
              </select>
          </div>
        </div>

          <div style={{ marginTop: "1.5rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#616161", marginBottom: "0.5rem" }}>แผนที่ตำแหน่ง</label>
            <div
              style={{
                backgroundColor: "#f0f0f0",
                borderRadius: "1rem",
                height: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MapPin style={{ width: "3rem", height: "3rem", color: "#9e9e9e" }} />
              <p style={{ color: "#616161", textAlign: "center" }}>คลิกเพื่อเลือกตำแหน่งบนแผนที่</p>
            </div>
          </div> 

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => setCurrentStep(3)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#e0e0e0",
                color: "#616161",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handlePost}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#28a745",
                color: "#ffffff",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              โพสต์ประกาศ
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isModalVisible && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "4rem",
                height: "4rem",
                backgroundColor: "#28a745",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                marginBottom: "1rem",
              }}
            >
              <Check style={{ color: "#ffffff", width: "2rem", height: "2rem" }} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#4a4a4a", marginBottom: "1rem" }}>
              สำเร็จ!
            </h3>
            <p style={{ color: "#616161", marginBottom: "1.5rem" }}>ประกาศขายที่ดินของคุณได้รับการโพสต์เรียบร้อยแล้ว</p>
            <button
              onClick={() => setIsModalVisible(false)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#007bff",
                color: "#ffffff",
                borderRadius: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellPost;
