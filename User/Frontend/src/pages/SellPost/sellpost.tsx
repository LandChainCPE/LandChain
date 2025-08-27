import { Link, useNavigate } from "react-router-dom";
import Loader from "../../component/third-patry/Loader";
import Navbar from "../../component/user/NavbarWhite";
import { useEffect, useState } from "react";
import './sellpost.css';
import InputGroup from 'react-bootstrap/InputGroup';
import { Container, Form, Button } from "react-bootstrap";
import { FaSearch } from 'react-icons/fa'; 
import { Modal } from "react-bootstrap";
import Picture from '../../assets/LandPicKorat.jpg'
import { getAllPostData } from "../../service/https/jo/index";

function SellPost() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  type Land = {
    ID: number;
    Name?: string;
    PhoneNumber?: string;
    AdressLandplot?: string;
    Price?: number;
    UpdatedAt?: string;
    // Add other properties if needed
  };

  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllPostData();
      setLands(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="navbar"><Navbar /></div>

      {/* search session */}
      <div className="search-session">
        <Container>
          <Form>
            <InputGroup className='my-3'>
              <Form.Control placeholder='ค้นหาโฉลดที่ดิน' />
              <Button variant="primary">
                <FaSearch style={{ marginRight: '4px', marginBottom: '18%' }} />
              </Button>
            </InputGroup>
          </Form>
        </Container>
      </div>

      <div className="post-button-session">
        <Button className="post-button" onClick={handleOpenModal}> ประกาศขายที่ดิน </Button>
        <hr />
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>ประกาศขายที่ดิน</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* ใส่ฟอร์มหรือเนื้อหาในนี้ */}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ชื่อที่ดิน</Form.Label>
                <Form.Control type="text" placeholder="เช่น ที่ดินแปลงริมคลอง" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>เบอร์มือถือ</Form.Label>
                <Form.Control type="text" placeholder="เช่น 0987654321" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ราคาขาย</Form.Label>
                <Form.Control type="number" placeholder="เช่น 500,000 บาท" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>เลือกที่ดินของคุณ</Form.Label>
                <select className="form-select" aria-label="Default select example">
                  <option selected>เลือกที่ดินที่ต้องการขาย</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
              </Form.Group>

            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              ยกเลิก
            </Button>
            <Button variant="primary">
              ยืนยันประกาศขาย
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <hr />

      {/* แสดง loading หากยังโหลดข้อมูล */}
      {loading && <p style={{ textAlign: 'center' }}>กำลังโหลดข้อมูล...</p>}

      {/* แสดง list ที่ดิน */}
     <div className="land-list" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        padding: '0 16px' 
        }}>
        {lands.map((land) => (
          <div key={land.ID} className="card-session" style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img
              src={Picture}
              alt={land.Name || "รูปที่ดิน"}
              className="card-img-top"
              style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
            />
            <div className="card-body" style={{ padding: '16px' }}>
              <h5 className="card-title">{land.Name || "ไม่มีชื่อที่ดิน"}</h5>
              <p className="card-text">{"ไม่มีรายละเอียด"}</p>
              <p className="card-text"><small className="text-muted">ราคา: {land.Price ? land.Price.toLocaleString() + " บาท" : "-"}</small></p>
              <p className="card-text"><small className="text-muted">อัพเดตล่าสุด: {land.UpdatedAt ? new Date(land.UpdatedAt).toLocaleDateString() : "-"}</small></p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default SellPost;
