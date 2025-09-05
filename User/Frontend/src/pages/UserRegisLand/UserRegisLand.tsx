import React, { useEffect, useState } from "react";
import { Upload, MapPin, Save, Camera } from "lucide-react";
import "./UserRegisLand.css";
import { RegisterLand } from "../../service/https/garfield/http";
import { GetProvinces, GetDistrict, GetSubdistrict, } from "../../service/https/garfield/http";

type ProvinceDTO = { id: number; name_th: string; name_en?: string };
type DistrictDTO = { id: number; name_th: string; province_id: number; name_en?: string };
type SubdistrictDTO = { id: number; name_th: string; district_id: number; name_en?: string };

const UserRegisLand: React.FC = () => {
  const [formData, setFormData] = useState({
    deed_number: "",
    village_no: "",
    soi: "",
    road: "",
    rai: "",
    ngan: "",
    square_wa: "",
    province_id: "",
    district_id: "",
    subdistrict_id: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // geo lists
  const [provinces, setProvinces] = useState<ProvinceDTO[]>([]);
  const [districts, setDistricts] = useState<DistrictDTO[]>([]);
  const [subdistricts, setSubdistricts] = useState<SubdistrictDTO[]>([]);

  // loading flags
  const [loadingP, setLoadingP] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingS, setLoadingS] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----- handlers -----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // ถ้าต้องการบังคับเป็นตัวเลขตอนส่ง ให้แปลงก่อน (แบ็กเอนด์บางที่รับ string ก็ได้)
      const payload = {
        ...formData,
        province_id: formData.province_id,
        district_id: formData.district_id,
        subdistrict_id: formData.subdistrict_id,
      };

      const { result } = await RegisterLand(payload, image || undefined);
      console.log(result);

      if (result && (result.message || result.success)) {
        alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
        handleCancel();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      deed_number: "",
      village_no: "",
      soi: "",
      road: "",
      rai: "",
      ngan: "",
      square_wa: "",
      province_id: "",
      district_id: "",
      subdistrict_id: "",
    });
    setImage(null);
    setImagePreview("");
    setDistricts([]);
    setSubdistricts([]);
  };

  // ----- effects: load cascading geo -----

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoadingP(true);
      try {
        const data = await GetProvinces(ctrl.signal);
        // เผื่อ backend บางตัวส่ง { result: [] } มา
        const list: ProvinceDTO[] = Array.isArray(data) ? data : data?.result ?? [];
        setProvinces(list);
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoadingP(false);
      }
    })();
    return () => ctrl.abort();
  }, []);


  // when province changes -> load districts & reset district/subdistrict
  useEffect(() => {
    const pidStr = formData.province_id;
    const ctrl = new AbortController();

    const pidNum = Number(pidStr);
    if (!Number.isFinite(pidNum) || pidNum <= 0) {
      setDistricts([]);
      setSubdistricts([]);
      setFormData((p) => ({ ...p, district_id: "", subdistrict_id: "" }));
      return;
    }

    (async () => {
      setLoadingD(true);
      try {
        const data = await GetDistrict(pidNum, ctrl.signal);
        const list: DistrictDTO[] = Array.isArray(data) ? data : data?.result ?? [];
        setDistricts(list);
        setSubdistricts([]);
        setFormData((p) => ({ ...p, district_id: "", subdistrict_id: "" }));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoadingD(false);
      }
    })();

    return () => ctrl.abort();
  }, [formData.province_id]);


  // when district changes -> load subdistricts & reset subdistrict
  useEffect(() => {
    const didStr = formData.district_id;
    const ctrl = new AbortController();

    const didNum = Number(didStr);
    if (!Number.isFinite(didNum) || didNum <= 0) {
      setSubdistricts([]);
      setFormData((p) => ({ ...p, subdistrict_id: "" }));
      return;
    }

    (async () => {
      setLoadingS(true);
      try {
        const data = await GetSubdistrict(didNum, ctrl.signal);
        const list: SubdistrictDTO[] = Array.isArray(data) ? data : data?.result ?? [];
        setSubdistricts(list);
        setFormData((p) => ({ ...p, subdistrict_id: "" }));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoadingS(false);
      }
    })();

    return () => ctrl.abort();
  }, [formData.district_id]);

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
                <label className="label">เลขโฉนด</label>
                <input
                  type="text"
                  name="deed_number"
                  value={formData.deed_number}
                  onChange={handleChange}
                  className="input"
                  placeholder="เลขโฉนด"
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
                  min={0}
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
                  min={0}
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
                  min={0}
                />
              </div>

              {/* จังหวัด */}
              <div className="inputGroup">
                <label className="label">จังหวัด</label>
                <select
                  name="province_id"
                  value={formData.province_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">
                    {loadingP ? "กำลังโหลด..." : "-- เลือกจังหวัด --"}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_th}
                    </option>
                  ))}
                </select>
              </div>

              {/* อำเภอ */}
              <div className="inputGroup">
                <label className="label">อำเภอ</label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  className="input"
                  disabled={!formData.province_id || loadingD}
                >
                  <option value="">
                    {loadingD ? "กำลังโหลด..." : "-- เลือกอำเภอ --"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name_th}
                    </option>
                  ))}
                </select>
              </div>

              {/* ตำบล */}
              <div className="inputGroup">
                <label className="label">ตำบล</label>
                <select
                  name="subdistrict_id"
                  value={formData.subdistrict_id}
                  onChange={handleChange}
                  className="input"
                  disabled={!formData.district_id || loadingS}
                >
                  <option value="">
                    {loadingS ? "กำลังโหลด..." : "-- เลือกตำบล --"}
                  </option>
                  {subdistricts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_th}
                    </option>
                  ))}
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
                  <span style={{ fontWeight: 600 }}>คลิกเพื่ออัพโหลด</span>{" "}
                  หรือลากไฟล์มาวาง
                </p>
                <p className="uploadSubtext">PNG, JPG, JPEG (MAX. 10MB)</p>
                <input
                  type="file"
                  style={{ display: "none" }}
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
            <button type="button" className="cancelButton" onClick={handleCancel}>
              ยกเลิก
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="submitButton">
              <Save size={16} />
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegisLand;
