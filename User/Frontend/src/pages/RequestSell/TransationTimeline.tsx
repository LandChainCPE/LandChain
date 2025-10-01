import { useEffect, useState } from "react";
// @ts-ignore
import { GetTransationByUserID, GetInfoUserByToken, UpdateTransactionBuyerAccept, SetSellInfoHandler, DeleteTransactionTodelete, GetSaleInfoHandler, DeleteLandsalepostByLandIDandUserID, BuyLandHandler, DeleteTransactionandAllrequest, DeleteTransactionToscucess , DeleteAllRequestBuyByLandID, LoadUpdateSetsale, LoadTransactionAfterBuy} from "../../service/https/bam/bam";
import './TransactionTimeline.css';
import Navbar from "../../component/user/Navbar";
import { Modal, Button } from "react-bootstrap";
import { ethers } from "ethers";
import smartcontrat from "../../../../Backend/smartcontract/smartcontract.json";
import Swal from "sweetalert2";

function TransactionTimeline() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    // useEffect(() => {
    //     const token = sessionStorage.getItem("token");
    //     const wsUrl = `wss://landchainbackend.purpleglacier-3813f6b3.southeastasia.azurecontainerapps.io/:8080/ws/transactions?token=${token}`;
    //     const socket = new WebSocket(wsUrl);

    //     socket.onopen = () => setConnectionStatus('connected');
    //     socket.onmessage = (event) => {
    //         const data = JSON.parse(event.data);
    //         setTransactions((prev) => {
    //             const updated = [...prev];
    //             const index = updated.findIndex((tx) => tx.ID === data.ID);
    //             if (index >= 0) updated[index] = data;
    //             else updated.push(data);
    //             return updated;
    //         });
    //     };
    //     socket.onclose = () => setConnectionStatus('disconnected');
    //     socket.onerror = () => setConnectionStatus('disconnected');

    //     return () => socket.close();
    // }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const user = await GetInfoUserByToken();
            setUserId(user.id);
            const apiTransactions = await GetTransationByUserID(user.id);
            setTransactions(apiTransactions ?? []);
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
        } finally {
            setLoading(false);
     }
    };

    useEffect(() => {
    fetchTransactions();
}, []);

    const [saleInfos, setSaleInfos] = useState<{ [key: number]: any }>({});

    useEffect(() => {
    if (transactions.length === 0) return;

    const fetchSaleInfos = async () => {
        const infos: { [key: number]: any } = {};
        for (const tx of transactions) {
        try {
            const info = await GetSaleInfoHandler(tx.Landtitle?.TokenID);
            if (info) infos[tx.ID] = info;
        } catch (err) {
            console.error("ไม่สามารถดึง SaleInfo ของ transaction", tx.ID, err);
        }
        }
        setSaleInfos(infos);
        console.log(infos);
    };

    fetchSaleInfos();
    }, [transactions]);




const handleSellerAccept = async (transaction: any) => {
    try {
        await UpdateTransactionBuyerAccept({
            sellerID: transaction.SellerID,
            buyerID: transaction.BuyerID,
            landID: transaction.LandID,
        });

        // อัปเดต state ถ้าสำเร็จ
        setTransactions((prev) =>
            prev.map((tx) =>
                tx.ID === transaction.ID ? { ...tx, BuyerAccepted: true } : tx
            )
        );

    } catch (err: any) {
        if (err.response) {
            if (err.response.status === 403) {
                Swal.fire({
                    icon: "warning",
                    title: "การยืนยันล้มเหลว",
                    text: "คุณไม่ใช่เจ้าของที่ดินนี้",
                    confirmButtonColor: "#e74c3c",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: err.response.data.error || "ไม่ทราบสาเหตุ",
                    confirmButtonColor: "#e74c3c",
                });
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "การเชื่อมต่อล้มเหลว",
                text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
                confirmButtonColor: "#e74c3c",
            });
        }
        console.error("เกิดข้อผิดพลาดในการยืนยันการยอมรับของผู้ขาย", err);
    }
};


// ฟังก์ชันเช็ค balance
const checkWalletBalance = async (requiredEth: number): Promise<boolean> => {
  try {
    // ✅ ใช้ Metamask provider
    if (!(window as any).ethereum) {
      Swal.fire({
                      icon: "warning",
                      title: "เกิดข้อผิดพลาดในการปฏิเสธ",
                      text: "กรุณาเชื่อมต่อกระเป๋า Metamask ก่อน",
                      confirmButtonColor: "#e74c3c",
                      });
      return false;
    }

    

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const network = await provider.getNetwork();
    console.log("Connected Network:", network);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // ✅ ดึง balance ของผู้ใช้ (หน่วย wei)
    const balanceWei = await provider.getBalance(address);

    // ✅ แปลง wei → ETH
    const balanceEth = Number(ethers.formatEther(balanceWei));
    console.log("Balance ETH:", balanceEth, "Required ETH:", requiredEth);

    // ✅ ตรวจสอบว่าเงินพอไหม
    return balanceEth >= requiredEth;
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการตรวจสอบยอดเงิน", err);
    Swal.fire({
                      icon: "error",
                      title: "เกิดข้อผิดพลาดในการตรวจสอบยอดเงิน",
                      confirmButtonColor: "#e74c3c",
                      });
    return false;
  }
};



    const openModal = (tx: any) => {
        setSelectedTransaction(tx);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedTransaction(null);
        setShowModal(false);
    };

    const getEthToThbRate = async (): Promise<number> => {
    try {
        const res = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=thb"
        );
        const data = await res.json();
        return data.ethereum.thb;
    } catch (err) {
        return 0;
    }
};


   const confirmAccept = async () => {
    if (!selectedTransaction) return;

    try {
        // ✅ สมมติ Amount ในฐานข้อมูลเป็น "บาท (THB)"
        const thbAmount = Number(selectedTransaction.Amount);

        // ✅ ดึงอัตราแลกเปลี่ยนจริง
        const ethPriceThb = await getEthToThbRate();
        console.log("ETH Price (THB):", ethPriceThb);

        // ✅ คำนวณว่าใช้กี่ ETH
        const requiredEth = thbAmount / ethPriceThb;

        // ✅ เช็คยอดเงินใน wallet
        const hasEnough = await checkWalletBalance(requiredEth);
        if (!hasEnough) {
            Swal.fire({
                      icon: "error",
                      title: "ยอดเงินไม่พอ",
                      confirmButtonColor: "#e74c3c",
                      });
            return;
        }

        // ✅ อัปเดต status การยืนยันของผู้ขาย
        await handleSellerAccept(selectedTransaction);

        closeModal();
    } catch (err) {
        console.error("ยืนยันไม่สำเร็จ", err);
        Swal.fire({
                      icon: "error",
                      title: "เกิดข้อผิดพลาดในการยืนยัน",
                      confirmButtonColor: "#e74c3c",
                      });
        
    }
};


const [processingTxId, setProcessingTxId] = useState<number | null>(null);
const handleSetsaleinfo = async (transaction: any) => {
  try {
    const tokenId = transaction.Landtitle?.TokenID;
    const priceTHB = transaction.Amount; // THB
    const buyer = transaction.Buyer?.Metamaskaddress;

    // if (!tokenId || !buyer || !priceTHB) {
    //    Swal.fire({
    //                   icon: "error",
    //                   title: "ไม่พบ Token ID, buyer หรือราคาขาย",
    //                   confirmButtonColor: "#e74c3c",
    //                   });
    //   console.log(tokenId, buyer, priceTHB);
    //   return;
    // }

    setProcessingTxId(transaction.ID);

    // เรียก backend เพื่อเซ็นข้อมูลขาย
    const res = await SetSellInfoHandler(tokenId, priceTHB, buyer);
    console.log("TokenID:", tokenId);
    const { signature, wei } = res;

    console.log("Signature from backend:", signature);
        console.log("Wei from backend:", wei);
    if (!tokenId) {
      Swal.fire({
                      icon: "error",
                      title: "เซ็นต์ข้อมูลล้มเหลว",
                      text: "โปรดกดอัพเดทข้อมูล",
                      confirmButtonColor: "#e74c3c",
                      });
      setProcessingTxId(null);
      return;
    }

    console.log("=== Debug Sale Info ===");
    console.log("TokenID:", tokenId);
    console.log("Buyer:", buyer);
    console.log("Price (THB):", priceTHB);
    console.log("Wei to send:", wei); // ✅ แสดงค่า wei
    console.log("Signature:", signature);
    console.log("=======================");

    if (!(window as any).ethereum) {
      Swal.fire({
                      icon: "warning",
                      title: "กรุณาติดตั้งและเชื่อมต่อ",
                      confirmButtonColor: "#e74c3c",
                      });
      setProcessingTxId(null);
      return;
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contractABI = smartcontrat;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const valueWei = ethers.parseUnits(wei, "wei");

    // เรียก contract function setSaleInfo
    const tx = await contract.setSaleInfo(tokenId, valueWei, buyer, signature);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    Swal.fire({
                      icon: "success",
                      title: "ร่างสัญญาสำเร็จ!",
                      confirmButtonColor: "#00fa4fff",
                      });
  } catch (err: any) {
    console.error("เกิดข้อผิดพลาดในการโอนโฉนด", err);
    Swal.fire({
                      icon: "error",
                      title: "เกิดข้อผิดพลาด!",
                      text : "เกิดข้อผิดพลาด: " + (err?.message ?? err),
                      confirmButtonColor: "#e74c3c",
                      });
  } finally {
    setProcessingTxId(null);
  }
};




const [showDeleteModal, setShowDeleteModal] = useState(false);


const handleOpenDeleteModal = (transactionId: number) => {
  setSelectedTransaction(transactionId);
  setShowDeleteModal(true);
};

const handleCloseDeleteModal = () => {
  setShowDeleteModal(false);
  setSelectedTransaction(null);
};

const handleConfirmDelete = async () => {
  if (!selectedTransaction) return;
  try {
    await DeleteTransactionTodelete(selectedTransaction);

    setTransactions((prev) => prev.filter((tx) => tx.ID !== selectedTransaction));

    Swal.fire({
                      icon: "success",
                      title: "ลบธุรกรรมเรียบร้อยแล้ว",
                      confirmButtonColor: "#00fa4fff",
                      });
  } catch (err) {
    console.error("ลบธุรกรรมไม่สำเร็จ", err);
    Swal.fire({
                      icon: "error",
                      title: "เกิดข้อผิดพลาดในการลบธุรกรรม!",
                      confirmButtonColor: "#e74c3c",
                      });
  } finally {
    handleCloseDeleteModal();
  }
};

const handleLoadSets = async (transactionId: number) => {
  try {
    // เรียก backend เพื่อโหลดข้อมูลการขาย
    const saleData = await LoadUpdateSetsale(transactionId);

    // ถ้ามีข้อมูลให้เซ็ต state
    if (saleData) {
      setSaleInfos((prev) => ({
        ...prev,
        [transactionId]: saleData,
      }));
    }

    // fetch transactions ใหม่ล่าสุด
    await fetchTransactions(); // <-- เพิ่มตรงนี้

    console.log("โหลดข้อมูลการขายสำเร็จ:", saleData);

    // แสดง success alert
    Swal.fire({
      icon: "success",
      title: "โหลดข้อมูลการขายสำเร็จ",
      confirmButtonColor: "#00fa4fff",
    });
  } catch (err) {
    console.error("โหลดข้อมูลการขายไม่สำเร็จ", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการโหลดข้อมูลการขาย",
      confirmButtonColor: "#e74c3c",
    });
  }
};



const [showSaleModal, setShowSaleModal] = useState(false);

// เปิด Modal
// @ts-ignore
const [saleInfo, setSaleInfo] = useState<any | null>(null);
// @ts-ignore
const [loadingSaleInfo, setLoadingSaleInfo] = useState(false);

// เปิด Modal ร่างสัญญา
const openSaleModal = async (tx: any) => {
    setSelectedTransaction(tx); 
    setShowSaleModal(true);

    try {
        setLoadingSaleInfo(true);
        // ดึงข้อมูลร่างสัญญาจาก backend
        const info = await GetSaleInfoHandler(tx.Landtitle?.TokenID);
        setSaleInfo(info); // เก็บ state
    } catch (err) {
        console.error("ดึงข้อมูลร่างสัญญาไม่สำเร็จ", err);
        setSaleInfo(null);
    } finally {
        setLoadingSaleInfo(false);
    }
};

// ปิด Modal
const closeSaleModal = () => {
  setSelectedTransaction(null);
  setShowSaleModal(false);
};

const [loadingMetamask, setLoadingMetamask] = useState(false);

const confirmDraftSale = async () => {
  if (!selectedTransaction) return;
  try {
    setLoadingMetamask(true); // เริ่ม animation

    // เรียก handleSetsaleinfo (ซึ่งจะเรียก Metamask)
    await handleSetsaleinfo(selectedTransaction);

    closeSaleModal();
  } catch (err) {
    console.error(err);
     Swal.fire({
                      icon: "error",
                      title: "เกิดข้อผิดพลาดในการร่างสัญญา!",
                      confirmButtonColor: "#e74c3c",
                      });
    
  } finally {
    setLoadingMetamask(false); // จบ animation
  }
};

interface EthTransaction {
  toAddress: string;
  amountWei: string;
  tokenId: string;
  transactionId: number;
}

const [ethTransaction, setEthTransaction] = useState<EthTransaction | null>(null);
const [showETHModal, setShowETHModal] = useState(false);
const [loadingETH, setLoadingETH] = useState(false);

const openETHModal = (toAddress: string, amountWei: string, tokenId: string, transactionId: number) => {
  setEthTransaction({ 
    toAddress,
    amountWei,
    tokenId,
    transactionId
  });
  setShowETHModal(true);
};


interface SaleInfoType {
    tokenId: string;
    price: string; 
    buyer?: string;
}

 const confirmBuyLand = async (
  tokenId: string,
  transactionId: number,

) => {
  setLoadingETH(true);
  try {
    if (!(window as any).ethereum) throw new Error("กรุณาติดตั้งและเชื่อมต่อ Metamask");

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const fromAddress = await signer.getAddress();
    console.log("ส่งจากบัญชี:", fromAddress);

    // ดึง sale info
    // @ts-ignore
    const saleArray: SaleInfoType[] = Object.values(saleInfos);
    const txInfo = Object.values(saleInfos).find(
  (sale: any) => sale.tokenId.toString() === tokenId.toString()
);

    if (!txInfo) {
    console.error("saleInfos:", saleInfos);
    console.error("tokenId:", tokenId);
    throw new Error("ไม่พบข้อมูลการโอน ETH สำหรับ token นี้");
    }

    // ตรวจสอบยอดเงิน
    const balance = await provider.getBalance(fromAddress); // balance เป็น bigint
    const priceWei = ethers.parseUnits(txInfo.price, "wei"); // bigint เช่น
    if (balance < priceWei) throw new Error("ยอดเงินในกระเป๋าไม่เพียงพอ");


    
    console.log("transaction:", transactionId);
    // เรียก contract
    const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, smartcontrat, signer);

    // ส่ง ETH พร้อมซื้อโฉนด
    const tx = await contract.buyLandTitle(tokenId, { value: priceWei });
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("Transaction confirmed:", tx.hash);

    // ลบ transaction และ sale info
    
    await LoadTransactionAfterBuy(transactionId);
    await DeleteTransactionToscucess(transactionId);
    await DeleteAllRequestBuyByLandID(tokenId);
    await DeleteLandsalepostByLandIDandUserID(tokenId);


    await fetchTransactions();
    setShowETHModal(false);
    setEthTransaction(null);
    Swal.fire({
      icon: "success",
      title: "ซื้อขายสำเร็จและลบ request เรียบร้อย",
      confirmButtonColor: "#00fa4fff",
    });

    
    // return { ethTx: tx.hash};
  } catch (err: any) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: err?.message ?? err,
      confirmButtonColor: "#e74c3c",
    });
    throw err;
  } finally {
    setLoadingETH(false);
  }
};



const openETHModalForTransaction = (tx: any) => {
    console.log(tx?.Buyer?.Metamaskaddress,tx.Amount,tx.Landtitle?.TokenID )
//   if (!tx?.Buyer?.Metamaskaddress || !tx.Amount || !tx.Landtitle?.TokenID) {
//     alert("ข้อมูลไม่ครบสำหรับโอน ETH");
//     return;
//   }

  // แปลง Amount ให้เป็น string (เผื่อเป็น number)
  const amountWeiStr = tx.Amount.toString();

  openETHModal(
    tx.Buyer.Metamaskaddress, // ผู้รับ ETH
    amountWeiStr,              // จำนวน ETH (wei) เป็น string
    tx.Landtitle.TokenID,       // Token ID
    tx.ID  
  );
};

    const getTransactionProgress = (tx: any) => {
        const steps = [tx.BuyerAccepted, tx.SellerAccepted, tx.LandDepartmentApproved];
        const completed = steps.filter(Boolean).length;
        return { completed, total: 3, percentage: (completed / 3) * 100 };
    };

    const isTransactionCompleted = (tx: any) => {
        return [tx.BuyerAccepted, tx.SellerAccepted, tx.LandDepartmentApproved].every(Boolean);
    };

    const formatDate = (dateString: string) => {
        return dateString ? new Date(dateString).toLocaleString('th-TH') : '-';
    };

    const formatAmount = (amount: number) => {
        return amount ? new Intl.NumberFormat('th-TH').format(amount) : '-';
    };

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="content-wrapper">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>กำลังโหลดข้อมูลธุรกรรม...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="content-wrapper">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h2>เกิดข้อผิดพลาด</h2>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            ลองใหม่
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    
    const buyerTransactions = transactions.filter(tx => tx.BuyerID === userId);
    const sellerTransactions = transactions.filter(tx => tx.SellerID === userId);

    const renderTransactionCard = (tx: any, userType: 'buyer' | 'seller') => {
        const progress = getTransactionProgress(tx);
        const isCompleted = isTransactionCompleted(tx);

        return (
            <div key={tx.ID} className="transaction-card">
                {/* Header Section */}
                <div className="card-header">
                    <div className="transaction-info">
                        <h3>Transaction #{tx.ID}</h3>
                        <div className="amount">
                            <span className="currency">฿</span>
                            <span className="value">{formatAmount(tx.Amount)}</span>
                        </div>
                    </div>
                    <div className="transaction-status">
                        <span className={`badge ${isCompleted ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            {isCompleted ? 'รอดำเนินการชำระ' : 'กำลังดำเนินการ'}
                        </span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="card-body">
                    <div className="details-grid">
                        <div className="detail-item">
                            <label>ผู้ซื้อ</label>
                            <span>{tx.Buyer?.Firstname ?? 'ไม่ระบุ'}</span>
                        </div>
                        <div className="detail-item">
                            <label>ผู้ขาย</label>
                            <span>{tx.Seller?.Firstname ?? 'ไม่ระบุ'}</span>
                        </div>
                        <div className="detail-item">
                            <label>อีเมลผู้ซื้อ</label>
                            <span>{tx.Buyer?.Email ?? '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Token ID</label>
                            <span>{tx.Landtitle?.TokenID ?? '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label>ประเภทธุรกรรม</label>
                            <span>{tx.Typetransaction?.StatusNameTh ?? '-'}</span>
                        </div>
                        <div className="detail-item">
                            <label>วันที่สร้าง</label>
                            <span>{formatDate(tx.CreatedAt)}</span>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="progress-section">
                        <div className="progress-header">
                            <span>ความคืบหน้า</span>
                            <span className="progress-count">{progress.completed}/{progress.total}</span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${progress.percentage}%` }}
                            ></div>
                        </div>
                        
                        <div className="steps-container">
                            {[
                                { label: 'ยืนยันผู้ขาย', status: tx.SellerAccepted },
                                { label: 'ยืนยันผู้ซื้อ', status: tx.BuyerAccepted },
                                { label: 'อนุมัติกรมที่ดิน', status: tx.LandDepartmentApproved },

                            ].map((step, index) => (
                                <div key={index} className={`step-item ${step.status ? 'completed' : 'pending'}`}>
                                    <div className="step-indicator">
                                        {step.status ? '✓' : index + 1}
                                    </div>
                                    <span className="step-label">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Section */}
                    {userType === "buyer" && !tx.BuyerAccepted && (
                        <div className="card-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={() => openModal(tx)}
                            >
                                ยืนยันการยอมรับของผู้ซื้อ
                            </button>
                        </div>
                    )}

                    {userType === "buyer" && tx.TypetransactionID === 4 && (
                        <div className="card-actions">
                            {tx.BuyerAccepted && tx.SellerAccepted && tx.LandDepartmentApproved ? (
                            <button 
                                className="btn btn-success"
                                onClick={() => openETHModalForTransaction(tx)} 
                                disabled={processingTxId === tx.ID || loadingETH}
                            >
                                {processingTxId === tx.ID || loadingETH ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    กำลังโอน ETH...
                                </>
                                ) : (
                                "ดำเนินการโอน ETH"
                                )}
                            </button>
                            ) : (
                            <span className="text-warning fw-bold">
                                ⏳ กำลังดำเนินการร่างสัญญา
                            </span>
                            )}
                        </div>
                        )}


                    {userType === "buyer" && !tx.BuyerAccepted && (
                        <div className="card-actions">
                            <button 
                            className="btn btn-danger"
                            onClick={() => handleOpenDeleteModal(tx.ID)}
                            disabled={processingTxId === tx.ID} // disable ขณะทำรายการ
                            >
                            {processingTxId === tx.ID ? (
                                <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                กำลังปฏิเสธ...
                                </>
                            ) : (
                                "ปฏิเสธ"
                            )}
                            </button>
                        </div>
                        )}


                        {userType === "seller" && tx.BuyerAccepted && tx.SellerAccepted && tx.LandDepartmentApproved && (
                            <div className="card-actions">
                                {saleInfos[tx.ID] && saleInfos[tx.ID].price !== "0" ? (
                                    <span className="text-success fw-bold">✅ ร่างสัญญาเรียบร้อยแล้ว</span>
                                    ) : (
                                    <button 
                                        className="btn btn-warning"
                                        onClick={() => openSaleModal(tx)}
                                        disabled={processingTxId === tx.ID || loadingMetamask}
                                    >
                                        {processingTxId === tx.ID || loadingMetamask ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            กำลังร่างสัญญาโอนโฉนด...
                                        </>
                                        ) : (
                                        "ร่างสัญญาโอนโฉนด"
                                        )}
                                    </button>
                                    )}
                            </div>
                            )}

                            {userType === "buyer" && tx.BuyerAccepted && tx.SellerAccepted && tx.LandDepartmentApproved && tx.TypetransactionID != 4 && (
                                <div className="card-actions">
                                    <button 
                                    className="btn btn-warning"
                                    onClick={() => handleLoadSets(tx.ID)}
                                    disabled={processingTxId === tx.ID || loadingMetamask}
                                    >
                                    {processingTxId === tx.ID || loadingMetamask ? (
                                        <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        กำลังอัพเดทข้อมูลการขายโฉนด
                                        </>
                                    ) : (
                                        "อัพเดทข้อมูลการขายโฉนด"
                                    )}
                                    </button>
                                </div>
                                )}





                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <Navbar />
            <div className="content-wrapper">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1>ระบบจัดการธุรกรรมโฉนด</h1>

                    </div>
                </div>

                {/* Buyer Transactions */}
                <section className="transaction-section">
                    <div className="section-header">
                        <h2>📈 รายการที่คุณเป็นผู้ซื้อ</h2>
                        <span className="transaction-count">{buyerTransactions.length} รายการ</span>
                    </div>
                    <div className="transaction-list">
                        {buyerTransactions.length > 0 ? (
                            buyerTransactions.map(tx => renderTransactionCard(tx, 'buyer'))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📄</div>
                                <p>ไม่มีรายการธุรกรรมที่คุณเป็นผู้ซื้อ</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Seller Transactions */}
                <section className="transaction-section">
                    <div className="section-header">
                        <h2>📊 รายการที่คุณเป็นผู้ขาย</h2>
                        <span className="transaction-count">{sellerTransactions.length} รายการ</span>
                    </div>
                    <div className="transaction-list">
                        {sellerTransactions.length > 0 ? (
                            sellerTransactions.map(tx => renderTransactionCard(tx, 'seller'))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📄</div>
                                <p>ไม่มีรายการธุรกรรมที่คุณเป็นผู้ขาย</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Modals */}
                {/* Confirmation Modal */}
                <Modal 
                    show={showModal} 
                    onHide={closeModal}
                    centered
                    className="confirmation-modal"
                >
                    <Modal.Header>
                        <Modal.Title>ยืนยันการดำเนินการ</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>คุณต้องการยืนยันการยอมรับของผู้ซายหรือไม่?</p>
                        <div className="transaction-summary">
                            <div className="summary-item">
                                <span>จำนวนเงิน:</span>
                                <span>฿{formatAmount(selectedTransaction?.Amount)}</span>
                            </div>
                            <div className="summary-item">
                                <span>ผู้ขาย:</span>
                                <span>{selectedTransaction?.Seller?.Firstname}</span>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={closeModal}>
                            ยกเลิก
                        </Button>
                        <Button variant="primary" onClick={confirmAccept}>
                            ยืนยัน
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Sale Modal */}
                <Modal show={showSaleModal} onHide={closeSaleModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>ยืนยันการร่างสัญญาโอนโฉนด</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>คุณกำลังจะร่างสัญญาโอนโฉนดสำหรับธุรกรรมนี้</p>
                        <div className="transaction-summary">
                            <div className="summary-item">
                                <span>Token ID:</span>
                                <span>{selectedTransaction?.Landtitle?.TokenID}</span>
                            </div>
                            <div className="summary-item">
                                <span>ผู้ซื้อ:</span>
                                <span>{selectedTransaction?.Buyer?.Firstname}</span>
                            </div>
                            <div className="summary-item">
                                <span>จำนวนเงิน:</span>
                                <span>฿{formatAmount(selectedTransaction?.Amount)}</span>
                            </div>
                        </div>
                        <p className="text-danger mt-2">
                            ⚠️ การร่างสัญญาจะไม่สามารถแก้ไขได้ กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeSaleModal}>ยกเลิก</Button>
                        <Button 
                            variant="primary" 
                            onClick={confirmDraftSale}
                            disabled={loadingMetamask}
                        >
                            {loadingMetamask ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    กำลังเชื่อมต่อ Metamask...
                                </>
                            ) : (
                                "ยืนยันร่างสัญญา"
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Delete Modal */}
                <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>ยืนยันการยกเลิกการทำธุรกรรม</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>คุณแน่ใจหรือไม่ว่าต้องการลบธุรกรรมนี้? การลบจะไม่สามารถกู้คืนได้</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>
                            ยกเลิก
                        </Button>
                        <Button variant="danger" onClick={handleConfirmDelete}>
                            ลบธุรกรรม
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* ETH Transfer Modal */}
                <Modal show={showETHModal} onHide={() => setShowETHModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>ยืนยันการโอน ETH</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {ethTransaction ? (
                            <div>
                                <p style={{ wordBreak: "break-word" }}>คุณกำลังจะโอน ETH ดังนี้:</p>
                                <div className="transaction-summary" style={{ wordBreak: "break-word" }}>
                                    <div className="summary-item" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        <span>ผู้ส่ง (คุณ):</span>
                                        <span style={{ maxWidth: "220px", overflowWrap: "break-word", wordBreak: "break-all" }}>
                                            {ethTransaction.toAddress}
                                        </span>
                                    </div>
                                    {/* <div className="summary-item">
                                        <span>Token ID:</span>
                                        <span>{ethTransaction.tokenId || "-"}</span>
                                    </div> */}
                                </div>
                                <p className="text-danger mt-2" style={{ wordBreak: "break-word" }}>
                                    ⚠️ การโอน ETH จะไม่สามารถย้อนกลับได้ กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                                </p>
                            </div>
                        ) : (
                            <p>กำลังเตรียมข้อมูล...</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowETHModal(false)}
                            disabled={loadingETH}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => confirmBuyLand(ethTransaction?.tokenId ?? "", ethTransaction?.transactionId ?? 0)}
                            disabled={loadingETH}
                        >
                            {loadingETH ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    กำลังโอน ETH...
                                </>
                            ) : (
                                "ยืนยันโอน ETH"
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default TransactionTimeline;