import React, { useState } from 'react';
import { Upload, MapPin, FileText, Save, Camera } from 'lucide-react';
import './UserRegisLand.css';
import { RegisterLand } from '../../service/https/garfield/http'; // ปรับ path ตามจริง

const UserRegisLand: React.FC = () => {
  const [formData, setFormData] = useState({
    house_number: '',
    village_no: '',
    soi: '',
    road: '',
    rai: '',
    ngan: '',
    square_wa: '',
    land_province_id: '',
    land_district_id: '',
    land_subdistrict_id: '',
    status_id: '',
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic input handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image change
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

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { result } = await RegisterLand(formData, image || undefined);
      console.log(result);

      if (result && result.message) {
        alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
        handleCancel(); // รีเซ็ตฟอร์มหลังบันทึก
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleCancel = () => {
    setFormData({
      house_number: '',
      village_no: '',
      soi: '',
      road: '',
      rai: '',
      ngan: '',
      square_wa: '',
      land_province_id: '',
      land_district_id: '',
      land_subdistrict_id: '',
      status_id: '',
    });
    setImage(null);
    setImagePreview('');
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div className="card">
          {/* Header */}
          <div className="cardHeader">
            <h2 className="cardTitle">
              <MapPin size={24} />
              เพิ่มข้อมูลที่ดิน
            </h2>
          </div>

          {/* Form Content */}
          <div className="formContent">
            <div className="grid">
              <div className="inputGroup">
                <label className="label">บ้านเลขที่</label>
                <input
                  type="text"
                  name="house_number"
                  value={formData.house_number}
                  onChange={handleChange}
                  className="input"
                  placeholder="บ้านเลขที่"
                />
              </div>

              <div className="inputGroup">
                <label className="label">หมู่ที่</label>
                <input
                  type="text"
                  name="village_no"
                  value={formData.village_no}
                  onChange={handleChange}
                  className="input"
                  placeholder="หมู่ที่"
                />
              </div>

              <div className="inputGroup">
                <label className="label">ซอย</label>
                <input
                  type="text"
                  name="soi"
                  value={formData.soi}
                  onChange={handleChange}
                  className="input"
                  placeholder="ซอย"
                />
              </div>

              <div className="inputGroup">
                <label className="label">ถนน</label>
                <input
                  type="text"
                  name="road"
                  value={formData.road}
                  onChange={handleChange}
                  className="input"
                  placeholder="ถนน"
                />
              </div>

              <div className="inputGroup">
                <label className="label">ไร่</label>
                <input
                  type="number"
                  name="rai"
                  value={formData.rai}
                  onChange={handleChange}
                  className="input"
                  placeholder="จำนวนไร่"
                />
              </div>

              <div className="inputGroup">
                <label className="label">งาน</label>
                <input
                  type="number"
                  name="ngan"
                  value={formData.ngan}
                  onChange={handleChange}
                  className="input"
                  placeholder="จำนวนงาน"
                />
              </div>

              <div className="inputGroup">
                <label className="label">ตารางวา</label>
                <input
                  type="number"
                  name="square_wa"
                  value={formData.square_wa}
                  onChange={handleChange}
                  className="input"
                  placeholder="จำนวนตารางวา"
                />
              </div>

              <div className="inputGroup">
                <label className="label">จังหวัด</label>
                <select
                  name="land_province_id"
                  value={formData.land_province_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  <option value="1">กรุงเทพมหานคร</option>
                  <option value="2">เชียงใหม่</option>
                  <option value="3">ขอนแก่น</option>
                </select>
              </div>

              <div className="inputGroup">
                <label className="label">อำเภอ</label>
                <select
                  name="land_district_id"
                  value={formData.land_district_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">-- เลือกอำเภอ --</option>
                  <option value="1">เมือง</option>
                  <option value="2">บางเขน</option>
                </select>
              </div>

              <div className="inputGroup">
                <label className="label">ตำบล</label>
                <select
                  name="land_subdistrict_id"
                  value={formData.land_subdistrict_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">-- เลือกตำบล --</option>
                  <option value="1">สุเทพ</option>
                  <option value="2">ในเมือง</option>
                </select>
              </div>

              <div className="inputGroup">
                <label className="label">สถานะ</label>
                <select
                  name="status_id"
                  value={formData.status_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">-- เลือกสถานะ --</option>
                  <option value="1">ว่าง</option>
                  <option value="2">ขายแล้ว</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="inputGroup">
              <label className="label">
                <Camera size={16} /> รูปภาพที่ดิน
              </label>
              <label className="uploadArea">
                <Upload size={32} color="#94a3b8" />
                <p className="uploadText">
                  <span style={{ fontWeight: 600 }}>คลิกเพื่ออัพโหลด</span> หรือลากไฟล์มาวาง
                </p>
                <p className="uploadSubtext">PNG, JPG, JPEG (MAX. 10MB)</p>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>

              {imagePreview && (
                <div className="imagePreview">
                  <img src={imagePreview} alt="Preview" className="previewImage" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="footer">
            <button
              type="button"
              className="cancelButton"
              onClick={handleCancel}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="submitButton"
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
