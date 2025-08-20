import React, { useState } from 'react';
import { Upload, MapPin, FileText, Save, Camera } from 'lucide-react';
import './UserRegisLand.css'; // นำเข้าไฟล์ CSS

const UserRegisLand: React.FC = () => {
  const [landName, setLandName] = useState('');
  const [landSize, setLandSize] = useState('');
  const [landLocation, setLandLocation] = useState('');
  const [landDeed, setLandDeed] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('landName', landName);
    formData.append('landSize', landSize);
    formData.append('landLocation', landLocation);
    formData.append('landDeed', landDeed);
    formData.append('notes', notes);
    if (image) {
      formData.append('image', image);
    }

    console.log('Form Submitted:', formData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
    }, 1000);
  };

  return (
    <div className="container">
      <div className="wrapper">
        {/* Main Form Card */}
        <div className="card">
          {/* Card Header */}
          <div className="cardHeader">
            <h2 className="cardTitle">
              <MapPin size={24} />
              เพิ่มข้อมูลที่ดิน
            </h2>
          </div>

          {/* Form Content */}
          <div className="formContent">
            <div className="grid">
              {/* Land Name */}
              <div className="inputGroup">
                <label className="label">
                  <FileText size={16} />
                  ชื่อที่ดิน
                </label>
                <input
                  type="text"
                  value={landName}
                  onChange={(e) => setLandName(e.target.value)}
                  className="input"
                  placeholder="กรุณาระบุชื่อที่ดิน"
                  onFocus={(e) => Object.assign(e.target.style, { borderColor: '#2196f3', background: 'white', boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)' })}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'rgba(249, 250, 251, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Land Size */}
              <div className="inputGroup">
                <label className="label">
                  ขนาดที่ดิน
                </label>
                <input
                  type="text"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  className="input"
                  placeholder="เช่น 1 ไร่ 2 งาน 50 ตารางวา"
                  onFocus={(e) => Object.assign(e.target.style, { borderColor: '#2196f3', background: 'white', boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)' })}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'rgba(249, 250, 251, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Land Location */}
              <div className="inputGroup">
                <label className="label">
                  <MapPin size={16} />
                  ตำแหน่งที่ดิน
                </label>
                <input
                  type="text"
                  value={landLocation}
                  onChange={(e) => setLandLocation(e.target.value)}
                  className="input"
                  placeholder="ที่อยู่หรือตำแหน่งของที่ดิน"
                  onFocus={(e) => Object.assign(e.target.style, { borderColor: '#2196f3', background: 'white', boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)' })}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'rgba(249, 250, 251, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Land Deed */}
              <div className="inputGroup">
                <label className="label">
                  เลขที่โฉนดที่ดิน
                </label>
                <input
                  type="text"
                  value={landDeed}
                  onChange={(e) => setLandDeed(e.target.value)}
                  className="input"
                  placeholder="หมายเลขโฉนดที่ดิน"
                  onFocus={(e) => Object.assign(e.target.style, { borderColor: '#2196f3', background: 'white', boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)' })}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'rgba(249, 250, 251, 0.5)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="inputGroup">
              <label className="label">
                หมายเหตุ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="textarea"
                placeholder="รายละเอียดเพิ่มเติม หรือข้อมูลสำคัญอื่นๆ"
                onFocus={(e) => {
                  e.target.style.borderColor = '#2196f3';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = 'rgba(249, 250, 251, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Image Upload */}
            <div className="inputGroup">
              <label className="label">
                <Camera size={16} />
                รูปภาพที่ดิน
              </label>
              <label
                className="uploadArea"
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, { borderColor: '#2196f3', background: 'rgba(33, 150, 243, 0.05)' })}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = 'rgba(249, 250, 251, 0.5)';
                }}
              >
                <Upload size={32} color="#94a3b8" />
                <p className="uploadText">
                  <span style={{ fontWeight: '600' }}>คลิกเพื่ออัพโหลด</span> หรือลากไฟล์มาวาง
                </p>
                <p className="uploadSubtext">PNG, JPG, JPEG (MAX. 10MB)</p>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="imagePreview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="previewImage"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="footer">
            <button
              type="button"
              className="cancelButton"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="submitButton"
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  Object.assign(e.currentTarget.style, { transform: 'scale(1.02)', boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)' });
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
                }
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegisLand;
