import { Link, useNavigate } from "react-router-dom";
import Loader from "../../component/third-patry/Loader";
import { useRef, useState } from "react";
// import { ethers } from "ethers";
import Web3 from "web3";
// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Window {
  ethereum?: any;
}

function RegisLand() {
  const contractAddress = "0x4567346a776d489a3c072f65fa8d411bbb6e5f71"; // เปลี่ยนเป็นของคุณจริง
  const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "registrant",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LandRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "ravang",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "landNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "surveyPage",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "subDistrict",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "number",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "volume",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "page",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "district",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "province",
          "type": "string"
        }
      ],
      "name": "registerLand",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getRecord",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
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
      "inputs": [],
      "name": "getTotalRecords",
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
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "records",
      "outputs": [
        {
          "internalType": "string",
          "name": "ravang",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "landNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "surveyPage",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "subDistrict",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "number",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "volume",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "page",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "district",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "province",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "registrant",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    // setLoading(true);  // เริ่มแสดง Loader

    // setTimeout(() => {
    //   navigate("/main");  // เปลี่ยนหน้า
    // }, 1000);  // ดีเลย์ 2 วินาที

  };

  const ClickReg = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

    if (!window.ethereum) {
      alert("กรุณาติดตั้ง MetaMask ก่อนใช้งาน");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      setLoading(true);

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();

      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const tx = await contract.methods
        .registerLand(
          data.ravang,
          data.landNumber,
          data.surveyPage,
          data.subDistrict,
          data.number,
          data.volume,
          data.page,
          data.district,
          data.province
        )
        .send({ from: accounts[0], gas: "3000000" });

      alert("ลงทะเบียนสำเร็จ! TxHash: " + tx.transactionHash);
      e.currentTarget.reset(); // เคลียร์ฟอร์มหลังส่งสำเร็จ
    } catch (error: any) {
      console.error("Transaction error:", error);

      if (error?.message) {
        alert("เกิดข้อผิดพลาด: " + error.message);
      } else {
        alert("เกิดข้อผิดพลาดที่ไม่รู้จัก");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <div style={{ width: "200px", backgroundColor: "#202C6B", display: "flex", flexDirection: "column", padding: "10px", height: "100vh", boxSizing: "border-box" }}>
        <img src="Logo2.png" alt="logo2myproject" style={{ maxWidth: "100%", height: "auto" }} />
        <button style={{ marginTop: "10px", width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          ตรวจสอบโฉนดที่ดิน
        </button>
        <button style={{ marginTop: "10px", width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          รายการจองคิว
        </button>
        <button style={{ marginTop: "10px", width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          โอนกรรมสิทธิ์
        </button>
        <button onClick={handleClick} style={{ marginTop: "10px", width: "100%", backgroundColor: "#4256D0", color: "white", borderRadius: 8, fontSize: 16, padding: "10px" }}>
          ลงทะเบียนโฉนดที่ดิน
        </button>

      </div>
      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: "20px", overflowY: "auto" }}>
        <h1 style={{ marginBottom: "20px" }}>ลงทะเบียนโฉนดที่ดิน</h1>
        <form name="register_land" onSubmit={ClickReg}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>ตำแหน่งที่ดิน</label>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="ravang" style={{ marginBottom: "4px", fontSize: "14px" }}>ระวาง</label>
                <input name="ravang" id="ravang" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="landNumber" style={{ marginBottom: "4px", fontSize: "14px" }}>เลขที่ดิน</label>
                <input name="landNumber" id="landNumber" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="surveyPage" style={{ marginBottom: "4px", fontSize: "14px" }}>หน้าสำรวจ</label>
                <input name="surveyPage" id="surveyPage" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="subDistrict" style={{ marginBottom: "4px", fontSize: "14px" }}>ตำบล</label>
                <input name="subDistrict" id="subDistrict" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>โฉนดที่ดิน</label>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="number" style={{ marginBottom: "4px", fontSize: "14px" }}>เลขที่</label>
                <input name="number" id="number" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="volume" style={{ marginBottom: "4px", fontSize: "14px" }}>เล่ม</label>
                <input name="volume" id="volume" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="page" style={{ marginBottom: "4px", fontSize: "14px" }}>หน้า</label>
                <input name="page" id="page" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="district" style={{ marginBottom: "4px", fontSize: "14px" }}>อำเภอ</label>
                <input name="district" id="district" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                <label htmlFor="province" style={{ marginBottom: "4px", fontSize: "14px" }}>จังหวัด</label>
                <input name="province" id="province" type="text" style={{ padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #3f51b5", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>


          <button type="submit" style={{ padding: "10px 16px", fontSize: "16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            ลงทะเบียน
          </button>
        </form>
      </div>



      {loading && <Loader />}
    </div>
  );

}
export default RegisLand;