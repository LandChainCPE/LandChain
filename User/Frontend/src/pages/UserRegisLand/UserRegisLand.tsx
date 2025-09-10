import React, { useEffect, useState } from "react";
import { Upload, MapPin, Save, Camera } from "lucide-react";
import "./UserRegisLand.css";
import { RegisterLand } from "../../service/https/garfield/http";
import { GetAllProvinces, GetDistrict, GetSubdistrict, } from "../../service/https/garfield/http";

type ProvinceDTO = { ID: number; name_th: string; name_en?: string };
type DistrictDTO = { ID: number; name_th: string; province_id: number; name_en?: string };
type SubdistrictDTO = { ID: number; name_th: string; district_id: number; name_en?: string };

const UserRegisLand: React.FC = () => {
  const [formData, setFormData] = useState({
    survey_number: "",
    land_number: "",
    survey_page: "",
    title_deed_number: "",
    volume: "",
    page: "",
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
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   console.log(`Selected ${name}:`, value);
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   // ตรวจสอบว่า province_id ถูกเลือกหรือไม่
  //   if (name === "province_id") {
  //     console.log("Selected province_id:", value);  // แสดงค่า province_id ที่เลือก
  //   }
  // };

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
      const userid = localStorage.getItem("user_id");
      const payload = {
        ...formData,
        province_id: formData.province_id,
        district_id: formData.district_id,
        subdistrict_id: formData.subdistrict_id,
        userid: userid,
      };
      console.log("payload", payload);

      const { response, result } = await RegisterLand(payload/*, image || undefined*/);
      console.log(response);
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
      survey_number: "",
      land_number: "",
      survey_page: "",
      title_deed_number: "",
      volume: "",
      page: "",
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
        const data = await GetAllProvinces(ctrl.signal);
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
    
    console.log("province_id (ID):", pidNum);

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

        console.log("Received districts data:", data);

        const list: DistrictDTO[] = Array.isArray(data) ? data : data?.result ?? [];
        setDistricts(list);

        console.log("Districts after setting:", list);
        
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  if (name === "province_id") {
    console.log("Selected province_id (value):", value, typeof value); // ควรเป็นเลข string เช่น "1"
  }
  setFormData((prev) => ({ ...prev, [name]: value }));
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
                <label className="label">ระวาง</label>
                <input
                  type="text"
                  name="survey_number"
                  value={formData.survey_number}
                  onChange={handleChange}
                  className="input"
                  placeholder="ระวาง"
                />
              </div>

              <div className="inputGroup">
                <label className="label">เลขที่ดิน</label>
                <input
                  type="text"
                  name="land_number"
                  value={formData.land_number}
                  onChange={handleChange}
                  className="input"
                  placeholder="เลขที่ดิน"
                />
              </div>

              <div className="inputGroup">
                <label className="label">หน้าสำรวจ</label>
                <input
                  type="text"
                  name="survey_page"
                  value={formData.survey_page}
                  onChange={handleChange}
                  className="input"
                  placeholder="หน้าสำรวจ"
                />
              </div>

              <div className="inputGroup">
                <label className="label">เลขที่โฉนด</label>
                <input
                  type="text"
                  name="title_deed_number"
                  value={formData.title_deed_number}
                  onChange={handleChange}
                  className="input"
                  placeholder="เลขที่โฉนด"
                />
              </div>

              <div className="inputGroup">
                <label className="label">เล่ม</label>
                <input
                  type="text"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  className="input"
                  placeholder="เล่ม"
                />
              </div>

              <div className="inputGroup">
                <label className="label">หน้า</label>
                <input
                  type="text"
                  name="page"
                  value={formData.page}
                  onChange={handleChange}
                  className="input"
                  placeholder="หน้า"
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
                    <option key={p.ID} value={String(p.ID)}> {/* ใช้ province.ID แทนชื่อจังหวัด */}
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
                    <option key={d.ID} value={String(d.ID)}>
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
                    <option key={s.ID} value={String(s.ID)}>
                      {s.name_th}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            {/* <div className="inputGroup">
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
            </div> */}
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
