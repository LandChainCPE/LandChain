import { useEffect, useState } from "react";
import { GetTransationByUserID, GetInfoUserByToken, UpdateTransactionBuyerAccept } from "../../service/https/bam/bam";
import './TransactionTimeline.css';
import Navbar from "../../component/user/Navbar";
import { Modal, Button } from "react-bootstrap";

function TransactionTimeline() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [userId, setUserId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const wsUrl = `ws://localhost:8080/ws/transactions?token=${token}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => setConnectionStatus('connected');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setTransactions((prev) => {
                const updated = [...prev];
                const index = updated.findIndex((tx) => tx.ID === data.ID);
                if (index >= 0) updated[index] = data;
                else updated.push(data);
                return updated;
            });
        };
        socket.onclose = () => setConnectionStatus('disconnected');
        socket.onerror = () => setConnectionStatus('disconnected');

        return () => socket.close();
    }, []);

    useEffect(() => {
        async function fetchTransactions() {
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
        }
        fetchTransactions();
    }, []);

    const handleSellerAccept = async (transaction: any) => {
        try {
            await UpdateTransactionBuyerAccept({
                sellerID: transaction.SellerID,
                buyerID: transaction.BuyerID,
                landID: transaction.LandID
            });
            
            setTransactions((prev) =>
                prev.map((tx) =>
                    tx.ID === transaction.ID ? { ...tx, SellerAccepted: true } : tx
                )
            );
        } catch (err) {
            console.error("เกิดข้อผิดพลาดในการยืนยันการยอมรับของผู้ขาย", err);
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

    const confirmAccept = async () => {
        if (selectedTransaction) {
            await handleSellerAccept(selectedTransaction);
            closeModal();
        }
    };

    const getTransactionProgress = (tx: any) => {
        const steps = [tx.BuyerAccepted, tx.SellerAccepted, tx.MoneyChecked, tx.LandDepartmentApproved];
        const completed = steps.filter(Boolean).length;
        return { completed, total: 4, percentage: (completed / 4) * 100 };
    };

    const isTransactionCompleted = (tx: any) => {
        return [tx.BuyerAccepted, tx.SellerAccepted, tx.MoneyChecked, tx.LandDepartmentApproved].every(Boolean);
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
                        <span className={`status-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
                            {isCompleted ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
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
                                { label: 'ยืนยันผู้ซื้อ', status: tx.BuyerAccepted },
                                { label: 'ยืนยันผู้ขาย', status: tx.SellerAccepted },
                                { label: 'ตรวจสอบเงิน', status: tx.MoneyChecked },
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
                    {userType === 'buyer' && !tx.SellerAccepted && (
                        <div className="card-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={() => openModal(tx)}
                            >
                                ยืนยันการยอมรับของผู้ขาย
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
                        <h1>Transaction Timeline</h1>
                    </div>
                </div>

                {/* Buyer Transactions */}
                <section className="transaction-section">
                    <div className="section-header">
                        <h2>รายการที่คุณเป็นผู้ซื้อ</h2>
                        <span className="transaction-count">({buyerTransactions.length} รายการ)</span>
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
                        <h2>รายการที่คุณเป็นผู้ขาย</h2>
                        <span className="transaction-count">({sellerTransactions.length} รายการ)</span>
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
                        <p>คุณต้องการยืนยันการยอมรับของผู้ขาย สำหรับ Transaction #{selectedTransaction?.ID} หรือไม่?</p>
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
            </div>
        </div>
    );
}

export default TransactionTimeline;