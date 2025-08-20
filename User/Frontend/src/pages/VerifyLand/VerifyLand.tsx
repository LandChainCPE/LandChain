import React, { useState } from "react";
import { Shield, User, CreditCard, MapPin, Home, Ruler, FileText, CheckCircle } from "lucide-react";
import './VerifyLand.css'; // นำเข้าไฟล์ CSS ที่คุณสร้าง

const VerifyLand: React.FC = () => {
  const [officerName, setOfficerName] = useState("");
  const [officerID, setOfficerID] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [landDetails] = useState({
    landOwner: "John Doe",
    landDeedNo: "1234567890",
    landLocation: "Chiang Mai",
    landSize: "100 Rai",
  });

  const handleVerify = async () => {
    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="container">
      <div className="wrapper">

        {/* Main Card */}
        <div className="mainCard">
          {/* Card Header */}
          <div className="cardHeader">
            <h2 className="cardTitle">
              <FileText size={28} />
              ยืนยันข้อมูลที่ดิน
            </h2>
          </div>

          {/* Card Body */}
          <div className="cardBody">
            {/* Land Information Section */}
            <div className="section">
              <h3 className="sectionTitle">
                <Home size={24} />
                ข้อมูลที่ดิน
              </h3>
              <div className="landInfoSimple">
                <div className="infoRow">
                  <span className="infoLabelSimple">
                    <User size={16} />
                    เจ้าของที่ดิน:
                  </span>
                  <span className="infoValueSimple">{landDetails.landOwner}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabelSimple">
                    <FileText size={16} />
                    เลขที่โฉนด:
                  </span>
                  <span className="infoValueSimple">{landDetails.landDeedNo}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabelSimple">
                    <MapPin size={16} />
                    ที่ตั้ง:
                  </span>
                  <span className="infoValueSimple">{landDetails.landLocation}</span>
                </div>
                <div className="infoRow">
                  <span className="infoLabelSimple">
                    <Ruler size={16} />
                    ขนาดที่ดิน:
                  </span>
                  <span className="infoValueSimple">{landDetails.landSize}</span>
                </div>
              </div>
            </div>

            {/* Officer Information Section */}
            <div className="section">
              <h3 className="sectionTitle">
                <Shield size={24} />
                ข้อมูลเจ้าหน้าที่
              </h3>

              <div className="formGrid">
                <div className="inputGroup">
                  <label className="label">
                    <User size={18} />
                    ชื่อเจ้าหน้าที่
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="input"
                    placeholder="กรุณากรอกชื่อเจ้าหน้าที่"
                  />
                </div>

                <div className="inputGroup">
                  <label className="label">
                    <CreditCard size={18} />
                    หมายเลขบัตรประจำตัวเจ้าหน้าที่
                  </label>
                  <input
                    type="text"
                    value={officerID}
                    onChange={(e) => setOfficerID(e.target.value)}
                    className="input"
                    placeholder="กรุณากรอกหมายเลขบัตรประจำตัว"
                  />
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <div className="buttonContainer">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="verifyButton"
              >
                {isVerifying ? (
                  <>
                    <div className="loadingSpinner"></div>
                    กำลังยืนยันข้อมูล...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    ยืนยันข้อมูลที่ดิน
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <div className="successAlert">
            <CheckCircle size={24} />
            ยืนยันข้อมูลเรียบร้อยแล้ว!
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLand;
