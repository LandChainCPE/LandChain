// @ts-ignore
import React, { useEffect, useState } from "react";
// @ts-ignore
import { Badge, Card, Modal, Button, Form, Row, Col } from "react-bootstrap";
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
  DeletedAt?: string;
  Status?: string;
}
// @ts-ignore
interface Metadata {
  TokenID: number;
  MetaFields: string;
  Price: string;
  Buyer: string;
  WalletID: string;
}

// ฟังก์ชันแปลงวันที่เป็น พ.ศ.
function formatThaiDate(dateStr: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

// แปลง MetaFields เป็น object
function parseMetaFields(metaString: string) {
  const fields: Record<string, string> = {};
  if (!metaString) return fields;

  metaString.split(",").forEach((pair) => {
    const [key, value] = pair.split(":").map((s) => s.trim());
    if (key && value) {
      fields[key] = value;
    }
  });

  return fields;
}

const RequestBuyPage = () => {
  const [requests, setRequests] = useState<RequestBuySellType[]>([]);
  const [DeleteData, setDeleteData] = useState<RequestBuySellType[]>([]);
  const [metadataMap, setMetadataMap] = useState<Map<number, Record<string, string>>>(new Map());
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal state รวม
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectData, setSelectedRejectData] = useState<{
    buyerID: number;
    sellerID: number;
    landID: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqRes = await GetAllRequestSellByUserID();
        const delData = await GetAllRequestSellByUserIDAndDelete();
        setRequests(reqRes);
        setDeleteData(delData);

        const tokenIDs = reqRes.map((r: { Landtitle: { TokenID: any; }; }) => r.Landtitle.TokenID);
        const metaRes = await GetMultipleLandMetadataHandler(tokenIDs);

        // สร้าง Map จาก TokenID → parsed MetaFields
        const map = new Map<number, Record<string, string>>();
        metaRes.forEach((m: { TokenID: number; MetaFields: string; }) => map.set(m.TokenID, parseMetaFields(m.MetaFields)));
        setMetadataMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenRejectModal = (buyerID: number, sellerID: number, landID: number) => {
    setSelectedRejectData({ buyerID, sellerID, landID });
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setSelectedRejectData(null);
    setShowRejectModal(false);
  };

  const handleConfirmReject = async () => {
    if (!selectedRejectData) return;
    const { buyerID, sellerID, landID } = selectedRejectData;
    try {
      await DeleteRequestSell(buyerID, sellerID, landID);
      setRequests((prev) =>
        prev.filter(
          (r) => !(r.Buyer.ID === buyerID && r.Seller.ID === sellerID && r.LandID === landID)
        )
      );
      handleCloseRejectModal();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter + Search
  const filterData = (data: RequestBuySellType[]) => {
    return data.filter((item) => {
      const tokenID = item.Landtitle.TokenID.toString();
      const sellerName = `${item.Seller.Firstname} ${item.Seller.Lastname}`;
      const buyerName = item.Buyer.Firstname ?? "";
      const status = item.Status ?? "pending";
      const meta = metadataMap.get(item.Landtitle.TokenID);

      const metaValues = Object.values(meta ?? {}).join(" ").toLowerCase();

      const matchSearch =
        tokenID.includes(searchTerm) ||
        sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metaValues.includes(searchTerm.toLowerCase());

      const matchStatus = filterStatus === "all" ? true : status === filterStatus;

      return matchSearch && matchStatus;
    });
  };

  if (loading) {
    return (
      <div className="request-page">
        <div className="loading-state">
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const renderCard = (item: RequestBuySellType, isDeleted = false) => {
    const meta = metadataMap.get(item.Landtitle.TokenID);
    const status = isDeleted ? "rejected" : item.Status ?? "pending";

    return (
      <div className="request-card-horizontal" key={item.ID}>
        <div className="card-shine"></div>
        
        {/* Status Badge */}
        <div className="status-section">
          <span className={`status-badge ${status}`}>
            {status === "pending" && "⏳ รอการตอบรับ"}
            {status === "rejected" && "❌ ปฏิเสธ"}
          </span>
        </div>

        {/* Land Information */}
        <div className="land-section">
          <div className="land-info-horizontal">
            <div className="token-info">
              <strong>TokenID: {item.Landtitle.TokenID}</strong>
            </div>
            {meta && (
              <div className="land-details-horizontal">
                {/* กลุ่มที่อยู่ */}
                <div className="detail-group location-group">
                  {meta["Province"] && <span><strong>จังหวัด:</strong> {meta["Province"]}</span>}
                  {meta["District"] && <span><strong>อำเภอ:</strong> {meta["District"]}</span>}
                  {meta["Subdistrict"] && <span><strong>ตำบล:</strong> {meta["Subdistrict"]}</span>}
                </div>
                
                {/* กลุ่มขนาดที่ดิน */}
                {(meta["Rai"] || meta["Ngan"] || meta["SqWa"]) && (
                  <div className="detail-group size-group">
                    <span>
                      <strong>ขนาด:</strong> 
                      {meta["Rai"] && `${meta["Rai"]} ไร่ `}
                      {meta["Ngan"] && `${meta["Ngan"]} งาน `}
                      {meta["SqWa"] && `${meta["SqWa"]} ตร.ว.`}
                    </span>
                  </div>
                )}
                
                {/* กลุ่มเอกสาร */}
                <div className="detail-group document-group">
                  {meta["Map"] && <span><strong>แผ่นที่:</strong> {meta["Map"]}</span>}
                  {meta["Deed No"] && <span><strong>เลขที่โฉนด:</strong> {meta["Deed No"]}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Information */}
        <div className="owner-section">
          <div className="owner-info-horizontal">
            <div className="owner-title">เจ้าของ</div>
            <div className="owner-name">{item.Seller.Firstname} {item.Seller.Lastname}</div>
          </div>
        </div>

        {/* Date Information */}
        <div className="date-section">
          <div className="date-info-horizontal">
            <div className="date-item">
              <span className="date-label">วันที่ยื่น:</span>
              <span className="date-value">{formatThaiDate(item.CreatedAt)}</span>
            </div>
            {isDeleted && (
              <div className="date-item">
                <span className="date-label">วันที่ปฏิเสธ:</span>
                <span className="date-value">{formatThaiDate(item.DeletedAt ?? "")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isDeleted && (
          <div className="action-section">
            <Button
              className="btn-modern-small btn-danger"
              onClick={() =>
                handleOpenRejectModal(item.Buyer.ID, item.Seller.ID, item.LandID)
              }
            >
              <span className="btn-content">
                <span>❌</span>
                <span>ยกเลิกขอซื้อ</span>
              </span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="request-page">
      <h2 className="request-title">ประวัติการยื่นซื้อโฉนด</h2>

      <div className="search-filter-section">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              className="form-control-modern"
              type="text"
              placeholder="🔍 ค้นหาโฉนด, เจ้าของ, ผู้ซื้อ, Wallet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              className="form-select-modern"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอการตอบรับ</option>
              <option value="rejected">ปฏิเสธ</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      <div className="request-card-container-horizontal">
        {filterData(requests).length === 0 ? (
          <div className="empty-state-request">
            <div className="empty-icon">📝</div>
            <h3>ยังไม่มีคำขอซื้อ</h3>
            <p>คุณยังไม่มีคำขอซื้อที่ดินในระบบ</p>
          </div>
        ) : (
          filterData(requests).map((item) => renderCard(item))
        )}
      </div>

      <div className="rejected-section">
        <h2 className="request-title mt-4">รายการที่ถูกปฏิเสธ</h2>
        <div className="request-card-container-horizontal">
          {filterData(DeleteData).length === 0 ? (
            <div className="empty-state-request">
              <div className="empty-icon">🚫</div>
              <h3>ยังไม่มีรายการที่ถูกปฏิเสธ</h3>
              <p>ยังไม่มีคำขอซื้อที่ถูกปฏิเสธ</p>
            </div>
          ) : (
            filterData(DeleteData).map((item) => renderCard(item, true))
          )}
        </div>
      </div>

      <Modal show={showRejectModal} onHide={handleCloseRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการยกเลิกคำขอซื้อ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3">
              <span style={{ fontSize: "3rem" }}>⚠️</span>
            </div>
            <h5>คุณต้องการยกเลิกคำขอซื้อโฉนดนี้หรือไม่?</h5>
          </div>
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