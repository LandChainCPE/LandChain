import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import {
    Button,
    TextField,
    Box,
    Typography,
    Container,
    Card,
    CardContent,
    CardHeader,
    Snackbar,
    Alert,
    Grid,
    Paper,
    Chip
} from '@mui/material';
import {
    Person,
    Home,
    Info,
    SwapHoriz,
    History
} from '@mui/icons-material';

interface NotificationState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

const App = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [accounts, setAccounts] = useState<string[]>([]);
    const [contract, setContract] = useState<any>(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const [walletAddress1, setWalletAddress1] = useState('');
    const [walletAddress2, setWalletAddress2] = useState('');
    const [walletAddress3, setWalletAddress3] = useState('');
    const [walletAddress4, setWalletAddress4] = useState('');
    const [walletAddress5, setWalletAddress5] = useState('');

    const [nameHash, setNameHash] = useState('');
    const [landTitleHash, setLandTitleHash] = useState('');
    const [tokenId, setTokenId] = useState<number | string>('');

    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'info'
    });

    const [loading, setLoading] = useState<string>('');

    const contractAddress = '0xc598E0e0C193eA1D5229Ec77E5974f5cAC7e0555';
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
    ];

    const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    useEffect(() => {
        const initWeb3 = async () => {
            try {
                const provider = await detectEthereumProvider();

                if (provider) {
                    const web3Instance = new Web3(provider);
                    setWeb3(web3Instance);

                    // Request accounts
                    const accounts = await web3Instance.eth.requestAccounts();
                    setAccounts(accounts);
                    setWalletAddress(accounts[0]);
                    setIsConnected(true);

                    const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
                    setContract(contractInstance);

                    showNotification('เชื่อมต่อ MetaMask สำเร็จ!', 'success');
                } else {
                    showNotification('กรุณาติดตั้ง MetaMask!', 'error');
                }
            } catch (error) {
                showNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ MetaMask', 'error');
            }
        };

        initWeb3();
    }, []);

    const connectMetaMask = async () => {
        if (web3 && contract) {
            try {
                const accounts = await web3.eth.requestAccounts();
                setAccounts(accounts);
                setWalletAddress(accounts[0]);
                setIsConnected(true);
                showNotification('เชื่อมต่อ MetaMask สำเร็จ!', 'success');
            } catch (error) {
                showNotification('การเชื่อมต่อ MetaMask ล้มเหลว', 'error');
            }
        }
    };

    const handleRegisterOwner = async () => {
        if (!web3 || !contract || !walletAddress1 || !nameHash) {
            showNotification('กรุณาเชื่อมต่อ MetaMask และกรอกข้อมูลให้ครบถ้วน', 'warning');
            return;
        }

        setLoading('registerOwner');
        try {
            await contract.methods.registerOwner(walletAddress1, nameHash).send({ from: walletAddress });
            showNotification('ลงทะเบียนเจ้าของสำเร็จ!', 'success');
            setWalletAddress1('');
            setNameHash('');
        } catch (error: any) {
            console.error('Error registering owner:', error);
            showNotification(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        } finally {
            setLoading('');
        }
    };

    const handleMintLandNFT = async () => {
        if (!web3 || !contract || !walletAddress2 || !landTitleHash) {
            showNotification('กรุณาเชื่อมต่อ MetaMask และกรอกข้อมูลให้ครบถ้วน', 'warning');
            return;
        }

        setLoading('mintNFT');
        try {
            await contract.methods.mintLandTitleNFT(walletAddress2, landTitleHash).send({ from: walletAddress });
            showNotification('สร้าง NFT โฉนดที่ดินสำเร็จ!', 'success');
            setWalletAddress2('');
            setLandTitleHash('');
        } catch (error: any) {
            console.error('Error minting NFT:', error);
            showNotification(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        } finally {
            setLoading('');
        }
    };

    const getOwnerInfo = async () => {
        if (!web3 || !contract || !walletAddress3) {
            showNotification('กรุณาเชื่อมต่อ MetaMask และกรอกที่อยู่ Wallet', 'warning');
            return;
        }

        setLoading('getOwnerInfo');
        try {
            const ownerInfo = await contract.methods.getOwnerInfo(walletAddress3).call();
            showNotification(`ข้อมูลเจ้าของ: ${ownerInfo || 'ไม่พบข้อมูล'}`, 'info');
        } catch (error: any) {
            console.error('Error fetching owner info:', error);
            showNotification(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        } finally {
            setLoading('');
        }
    };

    const getLandTitleInfoByWallet = async () => {
        if (!web3 || !contract || !walletAddress4) {
            showNotification('กรุณาเชื่อมต่อ MetaMask และกรอกที่อยู่ Wallet', 'warning');
            return;
        }

        setLoading('getLandTitleInfo');
        try {
            const landTitleInfo = await contract.methods.getLandTitleInfoByWallet(walletAddress4).call();
            showNotification(`ข้อมูลโฉนดที่ดิน: ${landTitleInfo || 'ไม่พบข้อมูล'}`, 'info');
        } catch (error: any) {
            console.error('Error fetching land title info:', error);
            showNotification(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        } finally {
            setLoading('');
        }
    };

    const transferOwnership = async () => {
        if (!web3 || !contract || !walletAddress5 || !tokenId) {
            showNotification('กรุณาเชื่อมต่อ MetaMask และกรอกข้อมูลให้ครบถ้วน', 'warning');
            return;
        }

        setLoading('transferOwnership');
        try {
            await contract.methods.transferOwnership(walletAddress5, tokenId).send({ from: walletAddress });
            showNotification('โอนกรรมสิทธิ์สำเร็จ!', 'success');
            setWalletAddress5('');
            setTokenId('');
        } catch (error: any) {
            console.error('Error transferring ownership:', error);
            showNotification(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        } finally {
            setLoading('');
        }
    };

    const getOwnershipHistory = async () => {
        if (!web3 || !contract || !tokenId) {
            showNotification('กรุณาเชื่อมต่อ MetaMask และกรอก Token ID', 'warning');
            return;
        }

        setLoading('getOwnershipHistory');
        try {
            const history = await contract.methods.getOwnershipHistory(tokenId).call();
            const historyText = Array.isArray(history) ? history.join(', ') : history;
            showNotification(`ประวัติกรรมสิทธิ์: ${historyText || 'ไม่พบข้อมูล'}`, 'info');
        } catch (error: any) {
            console.error('Error fetching ownership history:', error);
            showNotification(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        } finally {
            setLoading('');
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Paper elevation={6} sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        textAlign: 'center',
                        py: 4
                    }}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            🏠 ระบบลงทะเบียนโฉนดที่ดิน
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Land Title Registration System
                        </Typography>
                    </Box>
                </Paper>

                {/* Wallet Connection */}
                <Card elevation={4} sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box sx={{
                                    backgroundColor: '#2196F3',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.2rem'
                                }}>
                                    💼
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        สถานะการเชื่อมต่อ
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={1} flexWrap="wrap">
                                        <Chip
                                            label={isConnected ? "เชื่อมต่อแล้ว" : "ยังไม่เชื่อมต่อ"}
                                            color={isConnected ? "success" : "error"}
                                            size="small"
                                        />
                                        {walletAddress && (
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    backgroundColor: '#f5f5f5',
                                                    padding: '4px 8px',
                                                    borderRadius: 1,
                                                    border: '1px solid #e0e0e0',
                                                    wordBreak: 'break-all'
                                                }}
                                            >
                                                {walletAddress}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={connectMetaMask}
                                disabled={isConnected}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                💼 {isConnected ? "เชื่อมต่อแล้ว" : "เชื่อมต่อ MetaMask"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    {/* Register Owner */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<Person color="primary" />}
                                title="ลงทะเบียนเจ้าของ"
                                subheader="Register Owner"
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                                <TextField
                                    label="Wallet Address"
                                    value={walletAddress1}
                                    onChange={(e) => setWalletAddress1(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder="0x..."
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Name Hash"
                                    value={nameHash}
                                    onChange={(e) => setNameHash(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder="Enter name hash"
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleRegisterOwner}
                                    fullWidth
                                    disabled={loading === 'registerOwner'}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading === 'registerOwner' ? 'กำลังดำเนินการ...' : 'ลงทะเบียนเจ้าของ'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Mint Land Title NFT */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<Home color="success" />}
                                title="สร้าง NFT โฉนดที่ดิน"
                                subheader="Mint Land Title NFT"
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                                <TextField
                                    label="Wallet Address"
                                    value={walletAddress2}
                                    onChange={(e) => setWalletAddress2(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder="0x..."
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Land Title Hash"
                                    value={landTitleHash}
                                    onChange={(e) => setLandTitleHash(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder="Enter land title hash"
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleMintLandNFT}
                                    fullWidth
                                    disabled={loading === 'mintNFT'}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading === 'mintNFT' ? 'กำลังดำเนินการ...' : 'สร้าง NFT โฉนดที่ดิน'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Get Owner Info */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<Info color="info" />}
                                title="ดูข้อมูลเจ้าของ"
                                subheader="Get Owner Info"
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                                <TextField
                                    label="Wallet Address"
                                    value={walletAddress3}
                                    onChange={(e) => setWalletAddress3(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder="0x..."
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    color="info"
                                    onClick={getOwnerInfo}
                                    fullWidth
                                    disabled={loading === 'getOwnerInfo'}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading === 'getOwnerInfo' ? 'กำลังค้นหา...' : 'ดูข้อมูลเจ้าของ'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Get Land Title Info */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<Info color="warning" />}
                                title="ดูข้อมูลโฉนดที่ดิน"
                                subheader="Get Land Title Info"
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                                <TextField
                                    label="Wallet Address"
                                    value={walletAddress4}
                                    onChange={(e) => setWalletAddress4(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder="0x..."
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={getLandTitleInfoByWallet}
                                    fullWidth
                                    disabled={loading === 'getLandTitleInfo'}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading === 'getLandTitleInfo' ? 'กำลังค้นหา...' : 'ดูข้อมูลโฉนดที่ดิน'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Transfer Ownership */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<SwapHoriz color="error" />}
                                title="โอนกรรมสิทธิ์"
                                subheader="Transfer Ownership"
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                                <TextField
                                    label="Wallet Address (ผู้รับโอน)"
                                    value={walletAddress5}
                                    onChange={(e) => setWalletAddress5(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    placeholder="0x..."
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Token ID"
                                    value={tokenId}
                                    onChange={(e) => setTokenId(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    type="number"
                                    placeholder="Enter token ID"
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={transferOwnership}
                                    fullWidth
                                    disabled={loading === 'transferOwnership'}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading === 'transferOwnership' ? 'กำลังโอน...' : 'โอนกรรมสิทธิ์'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Get Ownership History */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardHeader
                                avatar={<History sx={{ color: '#9c27b0' }} />}
                                title="ประวัติกรรมสิทธิ์"
                                subheader="Ownership History"
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                                <TextField
                                    label="Token ID"
                                    value={tokenId}
                                    onChange={(e) => setTokenId(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    type="number"
                                    placeholder="Enter token ID"
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={getOwnershipHistory}
                                    fullWidth
                                    disabled={loading === 'getOwnershipHistory'}
                                    sx={{
                                        backgroundColor: '#9c27b0',
                                        '&:hover': { backgroundColor: '#7b1fa2' },
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loading === 'getOwnershipHistory' ? 'กำลังค้นหา...' : 'ดูประวัติกรรมสิทธิ์'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Footer */}
                <Box mt={6} textAlign="center">
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                            🔗 Contract Address: {contractAddress}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mt={1}>
                            Built with ❤️ using React, Web3, and Material-UI
                        </Typography>
                    </Paper>
                </Box>

                {/* Notification Snackbar */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        variant="filled"
                        sx={{
                            borderRadius: 2,
                            minWidth: '300px',
                            fontSize: '0.95rem'
                        }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default App;