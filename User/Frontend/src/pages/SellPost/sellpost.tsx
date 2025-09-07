import React, { useEffect, useState } from "react";
import { Checkbox, Upload, message, Form, Button, Card, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { MapPin, Check, Phone, User, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetTags, GetAllProvinces, CreateLandPost } from "../../service/https/jib/jib";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider';

type Tag = {
  Tag: string;
  icon: string;
};

type TokenRow = {
  tokenId: number;
  // ดึงเมตาดาทาเพิ่มได้ถ้าต้องการ
  metaFields?: string;
  price?: string;
  buyer?: string;
  owner?: string;
};


const SellPost = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const navigate = useNavigate();
  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<any[]>([]);
  const [rawProvinces, setRawProvinces] = useState<any[]>([]);
  const [image, setImage] = useState<string>("");
  const [form] = Form.useForm();

  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");
  const [inputWallet, setInputWallet] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [error, setError] = useState<string>("");

  // optional: เก็บเมตาดาทาเบื้องต้นของแต่ละ token
  const [rows, setRows] = useState<TokenRow[]>([]);


   const CONTRACT_ADDRESS = "0xf55988edca178d5507454107945a0c96f3af628c";
    const contractABI = [
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "buyLandTitle",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "signer",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "ECDSAInvalidSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256"
			}
		],
		"name": "ECDSAInvalidSignatureLength",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "ECDSAInvalidSignatureS",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
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
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "metaFields",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
		"inputs": [
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "nameHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "setSaleInfo",
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
		"name": "getLandMetadata",
		"outputs": [
			{
				"internalType": "string",
				"name": "metaFields",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "walletID",
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
				"name": "wallet",
				"type": "address"
			}
		],
		"name": "getLandTitleInfoByWallet",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
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
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
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
				"internalType": "bytes32",
				"name": "nameHash",
				"type": "bytes32"
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
		"name": "saleInfos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
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
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "usedNameHash",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

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
    landtitle_id: 1,
	user_id: 1,
  });

  // ======= 2) เตรียม web3 และเชื่อม MetaMask ถ้ามี =======
  useEffect(() => {
    (async () => {
      const provider: any = await detectEthereumProvider();
      if (provider) {
        const w3 = new Web3(provider as any);
        setWeb3(w3);

        // ถ้า MetaMask เคยอนุญาตแล้ว ดึงบัญชีมาโชว์
        try {
          const accounts = await (provider as any).request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch {}
      } else {
        setError("ไม่พบ MetaMask / Ethereum provider");
      }
    })();
  }, []);

    const connectWallet = async () => {
    try {
      setError("");
      const provider: any = await detectEthereumProvider();
      if (!provider) {
        setError("ไม่พบ MetaMask / Ethereum provider");
        return;
      }
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      if (!inputWallet) setInputWallet(accounts[0]); // autofill
    } catch (e: any) {
      setError(e?.message || "เชื่อมต่อกระเป๋าไม่สำเร็จ");
    }
  };

    // ======= 3) ฟังก์ชันอ่านข้อมูลจากสัญญา (read-only, ไม่เสียแก๊ส) =======

const fetchTitles: () => Promise<void> = async (walletAddr?: string) => {
  if (!web3) {
    setError("web3 ยังไม่พร้อม");
    return;
  }
  const wallet = (walletAddr || inputWallet || account || "").trim();
  if (!wallet) {
    setError("กรุณาระบุที่อยู่กระเป๋า (wallet address)");
    return;
  }

  setLoading(true);
  setError("");
  setRows([]);

  try {
    const contract = new web3.eth.Contract(
      contractABI as any,
      CONTRACT_ADDRESS
    );

    // 1) balanceOf – มักคืนค่าเป็น string (จำนวน)
    const balRaw: unknown = await contract.methods.balanceOf(wallet).call();
    const balNum = Number(
      typeof balRaw === "string" || typeof balRaw === "number" ? balRaw : 0
    );
    setBalance(Number.isFinite(balNum) ? balNum : 0);

    // 2) getLandTitleInfoByWallet – มักคืน array ของ tokenId (string[])
    const rawIds: unknown = await contract.methods
      .getLandTitleInfoByWallet(wallet)
      .call();

    const ids: string[] = Array.isArray(rawIds)
      ? (rawIds as unknown[]).map((v) => String(v))
      : [];

    const numericIds: number[] = ids
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n >= 0);

    setTokenIds(numericIds);

    // 3) ดึง metadata แบบขนาน (Promise.all) จะไวกว่า loop await ทีละตัว
    type MetaTuple = [string, string, string, string]; // [metaFields, price, buyer, walletID(owner)]
    const rowsData: TokenRow[] = await Promise.all(
      numericIds.map(async (id) => {
        try {
          const info: unknown = await contract.methods.getLandMetadata(id).call();

          // ป้องกันชนิดไม่ชัดเจนจาก web3: ต้องแน่ใจว่าเป็น array ยาว >= 4
          let metaFields = "";
          let priceWei = "0";
          let buyer = "";
          let owner = "";

          if (Array.isArray(info) && info.length >= 4) {
            const [m, p, b, o] = info as unknown as MetaTuple;
            metaFields = String(m ?? "");
            priceWei = String(p ?? "0");
            buyer = String(b ?? "");
            owner = String(o ?? "");
          } else if (
            typeof info === "object" &&
            info !== null &&
            "0" in (info as any) &&
            "1" in (info as any) &&
            "2" in (info as any) &&
            "3" in (info as any)
          ) {
            // บาง network/provider จะคืนแบบ object ที่เข้าถึงด้วย index ได้
            const obj = info as any;
            metaFields = String(obj[0] ?? "");
            priceWei = String(obj[1] ?? "0");
            buyer = String(obj[2] ?? "");
            owner = String(obj[3] ?? "");
          }

          const priceEth =
            (web3.utils?.fromWei?.(priceWei, "ether") as string) ?? "0";

          return {
            tokenId: id,
            metaFields,
            price: `${priceEth} ETH`,
            buyer,
            owner,
          } as TokenRow;
        } catch {
          return { tokenId: id } as TokenRow;
        }
      })
    );

    setRows(rowsData);
  } catch (e: any) {
    setError(e?.message || "อ่านข้อมูลจากสัญญาไม่สำเร็จ");
  } finally {
    setLoading(false);
  }
};


//     const connectMetaMask = async () => {
//         if (web3 && contract) {
//             const accounts = await web3.eth.requestAccounts();
//             setAccounts(accounts);
//             setWalletAddress(accounts[0]);
//         }
//     };

// const handleRegisterOwner = async () => {
//     if (!web3 || !contract || !walletAddress1 || !nameHash) {
//         alert('Please connect MetaMask and fill in all required fields');
//         return;
//     }

//     try {
//         await contract.methods.registerOwner(walletAddress1, nameHash).send({ from: walletAddress });
//         alert('Owner registration successful!');
//         setTransactionStatus('Success');
//     } catch (error) {
//         if (error instanceof Error) {
//             console.error(error.message);
//         } else {
//             console.error(String(error));
//         }
//     } 
// }; 

// const handleMintLandNFT = async () => {
//     if (!web3 || !contract || !walletAddress2 || !landTitleHash) {
//         alert('Please connect MetaMask and fill in all required fields');
//         return;
//     }

//     try {
//         await contract.methods.mintLandTitleNFT(walletAddress2, landTitleHash).send({ from: walletAddress });
//         alert('NFT minting successful!');
//         setTransactionStatus('Success');
//     } catch (error) {
//         if (error instanceof Error) {
//             console.error(error.message);
//         } else {
//             console.error(String(error));
//         }
//     }
// }; 


// const getOwnerInfo = async () => {
//     if (!web3 || !contract || !walletAddress3) {
//         alert('Please connect MetaMask');
//         return;
//     }

//     try {
//         const ownerInfo = await contract.methods.getOwnerInfo(walletAddress3).call();
//         alert(`Owner Info: ${ownerInfo}`);
//     } catch (error) {
//           if (error instanceof Error) {
//             console.error(error.message);
//           } else {
//             console.error(String(error));
//           }
//         }
//     };

// const getLandTitleInfoByWallet = async () => {
//     if (!web3 || !contract || !walletAddress4) {
//         alert("Please connect MetaMask");
//         return;
//     }

//     try {
//         // ดึงข้อมูลโทเค็นทั้งหมดที่เป็นของ wallet
//         const landTitleInfo = await contract.methods.getLandTitleInfoByWallet(walletAddress4).call();
        
//         // ตรวจสอบว่า wallet มีโทเค็นหรือไม่
//         if (landTitleInfo.length === 0) {
//             alert("This wallet has no land titles.");
//             return;
//         }

//         let resultMessage = "Land Title Info:\n";
//         for (let i = 0; i < landTitleInfo.length; i++) {
//             const tokenId = landTitleInfo[i];
//             const metaData = await contract.methods.getLandMetadata(tokenId).call();
//             const ownershipHistory = await contract.methods.getOwnershipHistory(tokenId).call();

//             // แสดงข้อมูลของแต่ละโทเค็น
//             resultMessage += `
//                 Token ID: ${tokenId}
//                 Metadata: ${metaData.metaFields}
//                 Price: ${metaData.price} ETH
//                 Buyer: ${metaData.buyer}
//                 Ownership History: ${ownershipHistory.join(" -> ")}
//             `;
//         }

//         alert(resultMessage);
//     } catch (error) {
//         if (error instanceof Error) {
//             console.error("Error:", error.message);
//         } else {
//             console.error("Unknown error:", error);
//         }
//     }
// };


// const transferOwnership = async () => {
//     if (!web3 || !contract || !walletAddress5 || !tokenId) {
//         alert('Please connect MetaMask and fill in all required fields');
//         return;
//     }

//     try {
//         await contract.methods.transferOwnership(walletAddress5, tokenId).send({ from: walletAddress });
//         alert('Ownership transfer successful');
//         setTransactionStatus('Success');
//     } catch (error) {
//           if (error instanceof Error) {
//             console.error(error.message);
//           } else {
//             console.error(String(error));
//           }
//         }
//     };

//     const getOwnershipHistory = async () => {
//         if (!web3 || !contract || !tokenId) {
//             alert('Please connect MetaMask and fill in all required fields');
//             return;
//         }

//         try {
//             const history = await contract.methods.getOwnershipHistory(tokenId).call();
//             alert(`Ownership History: ${history}`);
//         } catch (error) {
//           if (error instanceof Error) {
//             console.error(error.message);
//           } else {
//             console.error(String(error));
//           }
//         }
//     };

//     const handleCheckLandTitles = async () => {
//   if (!web3 || !contract || !walletAddress4) {
//     alert("Please connect MetaMask and enter a wallet address");
//     return;
//   }

//   try {
//     setLoading(true);
//     const landTitleInfo: string[] = await contract.methods
//       .getLandTitleInfoByWallet(walletAddress4)
//       .call();
//     setLandTitles(landTitleInfo);
//   } catch (error) {
//     console.error(error);
//     alert("เกิดข้อผิดพลาดในการดึงข้อมูลโฉนด");
//   } finally {
//     setLoading(false);
//   }
// };


  // ฟังก์ชันอัปโหลดรูป
const handleUpload = (file: File) => {
    const imagePath = URL.createObjectURL(file); // แปลงเป็น URL string
    setFormData(prev => ({
        ...prev,
        image: imagePath // ✅ image เป็น string
    }));
    return false; // ถ้าใช้กับ Ant Design Upload
};

  // โหลดจังหวัด
 // ✅ 2) โหลดจังหวัด: value = id (ไม่ใช่ชื่อ)
useEffect(() => {
  const loadProvinces = async () => {
    try {
      const res = await GetAllProvinces();
      const data = res.data || res;
      setRawProvinces(data);
      setProvinceOptions(
        data.map((p: any) => ({
          label: p.name_th,
          value: String(p.id), // <-- ใช้ id เป็นค่า
        }))
      );
    } catch (error) {
      console.error("โหลดจังหวัดล้มเหลว:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	setLoading(true);

	if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
	  message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
	  setLoading(false);
	  return;
	}
  const userId = localStorage.getItem("id");
	try {
// ✅ 1) สร้าง payload ให้ส่งเป็นเลข id จริง
const payload = {
  first_name: formData.firstName,
  last_name: formData.lastName,
  phone_number: formData.phoneNumber,
  name: formData.name,
  image: formData.image,            // ควรเป็น URL จริง (ไม่ใช่ blob:)
  price: parseFloat(formData.price),

  province_id: Number(formData.province),
  district_id: Number(formData.district),
  subdistrict_id: Number(formData.subdistrict),

  tag_id: Number(formData.tag?.[0] || 0), // ถ้า tag เลือกตัวแรก ส่งเป็นเลข id
  landtitle_id: Number(formData.landtitle_id),
  user_id: Number(formData.user_id),
};


	  await CreateLandPost(payload);
	  
	  message.success("✅ โพสต์ขายที่ดินสำเร็จ!");
	  setCurrentStep(2);

	  setTimeout(() => {
		navigate("/user/sellpostmain");
	  }, 2000);
	} catch (error) {
	  message.error("❌ เกิดข้อผิดพลาด: " + (error || "ไม่ทราบสาเหตุ"));
	} finally {
	  setLoading(false);
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
// ✅ 3) ฟังก์ชันเลือกจังหวัด-อำเภอ-ตำบล (ทำงานด้วย id ทั้งหมด)
const handleProvinceChange = (provinceId: string) => {
  form.setFieldsValue({ province: provinceId, district: undefined, subdistrict: undefined });

  const p = rawProvinces.find((x: any) => String(x.id) === String(provinceId));
  const newDistrictOptions =
    (p?.District || []).map((d: any) => ({ label: d.name_th, value: String(d.id) })) || [];

  setDistrictOptions(newDistrictOptions);
  setSubdistrictOptions([]);
  setFormData((prev) => ({ ...prev, province: provinceId, district: "", subdistrict: "" }));
};

const handleDistrictChange = (districtId: string) => {
  form.setFieldsValue({ district: districtId, subdistrict: undefined });

  const p = rawProvinces.find((x: any) => String(x.id) === String(formData.province));
  const d = p?.District?.find((x: any) => String(x.id) === String(districtId));
  const newSubdistrictOptions =
    (d?.Subdistrict || []).map((s: any) => ({ label: s.name_th, value: String(s.id) })) || [];

  setSubdistrictOptions(newSubdistrictOptions);
  setFormData((prev) => ({ ...prev, district: districtId, subdistrict: "" }));
};

const handleSubdistrictChange = (subdistrictId: string) => {
  form.setFieldsValue({ subdistrict: subdistrictId });
  setFormData((prev) => ({ ...prev, subdistrict: subdistrictId }));
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

    <div className="p-4 max-w-xl mx-auto space-y-4 border rounded-xl">
      <h2 className="text-xl font-bold">ตรวจจำนวนโฉนด (LandTitle NFTs) ของกระเป๋า</h2>

      <div className="space-y-2">
        <div className="text-sm">
          สถานะ: {web3 ? "พร้อมใช้งาน" : "ยังไม่พร้อม"} | บัญชีที่เชื่อม:{" "}
          {account || "-"}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded bg-black text-white"
            onClick={connectWallet}
          >
            เชื่อมต่อ MetaMask
          </button>
          <button
            className="px-3 py-2 rounded border"
            onClick={() => fetchTitles(account)}
            disabled={!account || loading}
            title="ใช้กระเป๋าที่เชื่อมอยู่"
          >
            ใช้กระเป๋าที่เชื่อม
          </button>
        </div>

        <label className="block text-sm font-medium">Wallet Address อื่น (ถ้ามี):</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="0x..."
          value={inputWallet}
          onChange={(e) => setInputWallet(e.target.value)}
        />

        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() => fetchTitles()}
          disabled={loading}
        >
          {loading ? "กำลังดึงข้อมูล..." : "ดึงข้อมูล"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <div>ผลรวมจาก <code>balanceOf</code>: <b>{balance}</b> รายการ</div>
        <div>ผลรวมจาก <code>getLandTitleInfoByWallet</code>: <b>{tokenIds.length}</b> รายการ</div>
      </div>

      {rows.length > 0 && (
        <div className="mt-3">
          <h3 className="font-semibold">รายการ tokenId</h3>
          <ul className="list-disc pl-6">
            {rows.map((r) => (
              <li key={r.tokenId}>
                <b>#{r.tokenId}</b>
                {r.owner ? ` | owner: ${r.owner}` : ""}
                {r.price ? ` | price: ${r.price}` : ""}
                {r.metaFields ? ` | desc: ${r.metaFields.slice(0, 80)}...` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500">
        * การเรียกอ่าน (view) ไม่เสียแก๊ส แต่ต้องแน่ใจว่าเชื่อมกับเครือข่ายเดียวกับที่สัญญาถูก deploy
      </p>
    </div>

    {/*<div style={{ margin: "1rem 0" }}>
      <button
        onClick={handleCheckLandTitles}
        style={{
          backgroundColor: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          padding: "0.75rem 1.5rem",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        🔍 ตรวจสอบจำนวนโฉนดที่ดิน
      </button>

      {loading && <p>กำลังโหลดข้อมูล...</p>}

      {landTitles.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <p>คุณมีโฉนดทั้งหมด: {landTitles.length} ใบ</p>
          <ul>
            {landTitles.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>*/}


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

{formData.image && (
  <div style={{ marginTop: "1rem", textAlign: "center" }}>
    <img src={formData.image} alt="Preview" style={{ maxWidth: "100%", borderRadius: "1rem", maxHeight: 300, objectFit: "cover" }}/>
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
    <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#616161", marginBottom: "0.5rem" }}>
      จังหวัด
    </label>
    <select
      name="province"
      value={formData.province}
      onChange={(e) => handleProvinceChange(e.target.value)} // ส่งเป็น id
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
    <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#616161", marginBottom: "0.5rem" }}>
      อำเภอ
    </label>
    <select
      name="district"
      value={formData.district}
      onChange={(e) => handleDistrictChange(e.target.value)} // ส่งเป็น id
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
    <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#616161", marginBottom: "0.5rem" }}>
      ตำบล
    </label>
    <select
      name="subdistrict"
      value={formData.subdistrict}
      onChange={(e) => handleSubdistrictChange(e.target.value)} // ส่งเป็น id
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


          {/* <div style={{ marginTop: "1.5rem" }}>
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
          </div>  */}

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
              onClick={handleSubmit}
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
