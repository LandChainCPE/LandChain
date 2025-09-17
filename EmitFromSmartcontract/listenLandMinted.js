
// Example: Listen to LandMinted event from LandTitleNFT.sol
// Requires: ethers.js (npm install ethers) และ dotenv (npm install dotenv)

require('dotenv').config();
const { ethers } = require("ethers");


// 1. กำหนด ABI ในไฟล์นี้โดยตรง (object array)
const abi = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "metaFields", "type": "string" }
    ],
    "name": "LandMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "nameHash", "type": "bytes32" }
    ],
    "name": "OwnerRegistered",
    "type": "event"
  }
];
const contractAddress = process.env.CONTRACT_ADDRESS;
const rpcUrl = process.env.RPC_URL;

// 2. RPC Provider
const provider = new ethers.JsonRpcProvider(rpcUrl);

// 3. สร้าง Contract Instance
const contract = new ethers.Contract(contractAddress, abi, provider);

// 4. Listen LandMinted Event
contract.on("LandMinted", (tokenId, owner, metaFields, event) => {
  console.log("--- LandMinted Event ---");
  console.log("tokenId:", tokenId.toString());
  console.log("owner:", owner);
  console.log("metaFields:", metaFields);
  // TODO: อัพเดต Database ที่นี่ (เช่น เรียก API ไป backend)
  // ตัวอย่าง: axios.post('/api/updateLand', { tokenId, owner, metaFields })
});

// 5. Listen OwnerRegistered Event
contract.on("OwnerRegistered", (wallet, nameHash, event) => {
  console.log("--- OwnerRegistered Event ---");
  console.log("wallet:", wallet);
  console.log("nameHash:", nameHash);
  // TODO: อัพเดต Database ที่นี่ (เช่น เรียก API ไป backend)
  // ตัวอย่าง: axios.post('/api/registerOwner', { wallet, nameHash })
});

console.log("Listening for LandMinted and OwnerRegistered events...");
