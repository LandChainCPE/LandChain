import React, { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import './Login.css';  // นำเข้าไฟล์ CSS ที่สร้างขึ้น

const Login = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new Web3Provider(window.ethereum);
      provider.getSigner().getAddress().then((address: string) => {
        setUserAddress(address);
      }).catch(() => setError('Metamask is not connected'));
    } else {
      setError('Please install Metamask');
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
      } catch (err) {
        setError('Connection failed');
      }
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Login to LandChain</h1>
      {userAddress ? (
        <p className="success-text">Connected with {userAddress}</p>
      ) : (
        <>
          <button className="button" onClick={connectWallet}>Connect Metamask</button>
          {error && <p className="error-text">{error}</p>}
        </>
      )}
    </div>
  );
};

export default Login;
