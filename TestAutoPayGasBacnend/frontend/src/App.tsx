import React, { useState } from "react";
import { ethers } from "ethers";

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [nameHash, setNameHash] = useState("");
  const [status, setStatus] = useState("");

  // ฟังก์ชันที่เชื่อมต่อกับ MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const userAccount = await signer.getAddress();
      console.log("Connected Account: ", userAccount);
    } else {
      alert("Please install MetaMask!");
    }
  };

  // ฟังก์ชันที่ส่งข้อมูลไปยัง Backend
  const handleRegisterOwner = async () => {
    try {
      setStatus("Processing...");
      const response = await fetch("http://localhost:5000/registerOwner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          nameHash,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(`Owner registered! Tx Hash: ${result.txHash}`);
      } else {
        setStatus("Error registering owner.");
      }
    } catch (error) {
      setStatus("Failed to connect to Backend.");
    }
  };

  return (
    <div>
      <button onClick={connectMetaMask}>Connect MetaMask</button>
      <div>
        <input
          type="text"
          placeholder="Wallet Address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name Hash"
          value={nameHash}
          onChange={(e) => setNameHash(e.target.value)}
        />
        <button onClick={handleRegisterOwner}>Register Owner</button>
      </div>
      <p>{status}</p>
    </div>
  );
};

export default App;
