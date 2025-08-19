const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
const port = 5000;

// ใช้ CORS middleware
app.use(cors({
    origin: "http://localhost:5173", // กำหนดให้อนุญาตเฉพาะการเชื่อมต่อจาก frontend ที่รันอยู่ที่ localhost:5173
    methods: ["GET", "POST"], // กำหนดวิธีการ HTTP ที่อนุญาต
    allowedHeaders: ["Content-Type"], // กำหนด header ที่อนุญาต
}));

app.use(express.json());

// Private key ของเจ้าของ Smart Contract (ควรเก็บใน Environment Variables)
const ownerPrivateKey = "51ccf108316f260195ad9f30725ceda2d75f8ab648f955f2267f8d51eba9d2d6";  // ควรเก็บในที่ปลอดภัย

// ตั้งค่าการเชื่อมต่อกับ Holsky Testnet
const provider = new ethers.JsonRpcProvider("https://ethereum-holsky-rpc.publicnode.com");
const wallet = new ethers.Wallet(ownerPrivateKey, provider);

// ที่อยู่ Smart Contract และ ABI ของ Smart Contract
const contractAddress = "0xebA6520104f7ba6540a9461D8F715d7F67e441db"; // ระบุ Smart Contract Address ของคุณ
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
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
    }
]; // ระบุ ABI ของ Smart Contract

// สร้างอินสแตนซ์ของ Smart Contract
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// ฟังก์ชันในการ registerOwner
app.post("/registerOwner", async (req, res) => {
    const { walletAddress, nameHash } = req.body;

    try {
        const tx = await contract.registerOwner(walletAddress, nameHash);  // ส่งธุรกรรมไปยัง smart contract
        console.log("Transaction Hash:", tx.hash);

        // รอให้ธุรกรรมเสร็จสมบูรณ์
        await tx.wait();

        // ส่งข้อมูลกลับไปที่ Frontend
        res.json({ txHash: tx.hash });
    } catch (err) {
        console.error("Error registering owner:", err);
        res.status(500).send("Failed to register owner");
    }
});

// ฟังก์ชันให้ Backend รัน
app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
