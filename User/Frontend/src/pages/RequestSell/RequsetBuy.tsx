import React, { useEffect, useState } from "react";
import { Badge, Card, Modal, Button } from "react-bootstrap"; // ✅ ใช้ Modal จาก react-bootstrap
import CardContent from "@mui/material/CardContent";
import "./RequsetBuy.css";
import {
  GetAllRequestSellByUserID,
  GetMultipleLandMetadataHandler,
  DeleteRequestSell,
  GetAllRequestSellByUserIDAndDelete,
} from "../../service/https/bam/bam";

interface RequestBuySellType {
  ID: number;
  Buyer: any;
  Seller: any;
  Landtitle: { TokenID: number; title: string };
  LandID: number;
  CreatedAt: string;
}

interface Metadata {
  TokenID: number;
  MetaFields: string;
  Price: string;
  Buyer: string;
  WalletID: string;
}

const RequestBuyPage = () => {
  const [requests, setRequests] = useState<RequestBuySellType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const [DeleteData, setDeleteData] = useState<[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqRes = await GetAllRequestSellByUserID();
        const delData = await GetAllRequestSellByUserIDAndDelete();
        setRequests(reqRes);
        setDeleteData(delData);
        console.log(delData)
        const tokenIDs = reqRes.map(
          (r: RequestBuySellType) => r.Landtitle.TokenID
        );
        const metaRes = await GetMultipleLandMetadataHandler(tokenIDs);
        setMetadata(metaRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // state สำหรับ modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectUserID, setSelectedRejectUserID] = useState<number | null>(null);
  const [selectedLand, setSelectedLand] = useState<number | null>(null);
  const [selectedSellerID, setSelectedSellerID] = useState<number | null>(null);

  const handleOpenRejectModal = (buyerID: number, sellerID: number, landID: number) => {
  setSelectedRejectUserID(buyerID);
  setSelectedSellerID(sellerID);
  setSelectedLand(landID);
  setShowRejectModal(true);
};

  const handleCloseRejectModal = () => {
    setSelectedRejectUserID(null);
    setSelectedLand(null);
    setShowRejectModal(false);
  };

  const handleConfirmReject = async () => {
  if (!selectedRejectUserID || !selectedSellerID || !selectedLand) return;
  try {
    await DeleteRequestSell(selectedRejectUserID, selectedSellerID, selectedLand); // ✅ ส่งครบ 3 ตัว
    console.log(selectedRejectUserID,selectedSellerID,selectedLand );
    setRequests((prev) =>
      prev.filter(
        (r) => !(r.Buyer.ID === selectedRejectUserID && r.Seller.ID === selectedSellerID && r.LandID === selectedLand)
      )
    );
    handleCloseRejectModal();
  } catch (err) {
    console.error(err);
  }
};

  const renderStatus = (status?: string) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">รอการตอบรับ</Badge>;
      case "approved":
        return <Badge bg="success">อนุมัติ</Badge>;
      case "rejected":
        return <Badge bg="danger">ปฏิเสธ</Badge>;
      default:
        return <Badge bg="secondary">ไม่ทราบสถานะ</Badge>;
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="request-page">
      <h2 className="request-title">ประวัติการยื่นซื้อโฉนด</h2>

      {requests.length === 0 ? (
        <p>ยังไม่มีคำขอซื้อ</p>
      ) : (
        requests.map((item) => {
          const meta = metadata.find((m) => m.TokenID === item.Landtitle.TokenID);
          return (
            <Card key={item.ID} className="mb-3">
              <CardContent className="request-card d-flex justify-content-between align-items-center">
                <div className="land-info">
                  <p><strong>โฉนด: {item.Landtitle.TokenID}</strong></p>
                  {meta && <p>รายละเอียด: {meta.MetaFields}</p>}
                </div>
                <div className="owner-info">
                  <p>เจ้าของ: {item.Seller.Firstname} {item.Seller.Lastname}</p>
                </div>
                <div className="request-info text-end">
                  <p>วันที่ยื่น: {new Date(item.CreatedAt).toLocaleDateString("th-TH")}</p>
                  {meta && <p>Buyer: {meta.Buyer}</p>}
                  {meta && <p>Wallet ID: {meta.WalletID}</p>}
                </div>
              </CardContent>
              <Button
                variant="danger"
                onClick={() => handleOpenRejectModal(item.Buyer.ID, item.Seller.ID, item.LandID)}
              >
                ยกเลิกขอซื้อ
              </Button>
            </Card>
          );
        })
      )}

      <h2 className="request-title">รายการที่ถูกปฏิเสธ</h2>

      {DeleteData.length === 0 ? (
  <p>ยังไม่มีรายการที่ถูกปฏิเสธ</p>
) : (
  DeleteData.map((item: any) => {
    const tokenID = item?.Landtitle?.TokenID;
    const meta = tokenID ? metadata?.find((m) => m.TokenID === tokenID) : null;

    const createdAt = item?.CreatedAt ? new Date(item.CreatedAt) : null;
    const deletedAt = item?.DeletedAt ? new Date(item.DeletedAt) : null;

    return (
      <Card key={item.ID} className="mb-3" bg="light">
        <CardContent className="request-card d-flex justify-content-between align-items-center">
          <div className="land-info">
            <p><strong>โฉนด: {tokenID ?? "ไม่พบข้อมูล"}</strong></p>
            {meta?.MetaFields && <p>รายละเอียด: {meta.MetaFields}</p>}
          </div>

          <div className="owner-info">
            <p>
              เจ้าของ: {item?.Seller?.Firstname ?? "-"} {item?.Seller?.Lastname ?? "-"}
            </p>
          </div>

          <div className="request-info text-end">
            <p>
              วันที่ยื่น: {createdAt ? createdAt.toLocaleDateString("th-TH") + " " + createdAt.toLocaleTimeString("th-TH") : "-"}
            </p>
            <p>
              วันที่ถูกปฏิเสธ: {deletedAt ? deletedAt.toLocaleDateString("th-TH") + " " + deletedAt.toLocaleTimeString("th-TH") : "-"}
            </p>
            {meta?.Buyer && <p>Buyer: {meta.Buyer}</p>}
            {meta?.WalletID && <p>Wallet ID: {meta.WalletID}</p>}
          </div>
        </CardContent>
      </Card>
    );
  })
)}



      {/* Modal แบบ react-bootstrap */}
      <Modal show={showRejectModal} onHide={handleCloseRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการปฏิเสธคำขอซื้อ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอซื้อ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRejectModal}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={handleConfirmReject}>
            ยืนยัน
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RequestBuyPage;
