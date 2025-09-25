import "./UserRegisLand.css";
import React, { useEffect, useState } from "react";
import { MapPin, Save } from "lucide-react";
import { RegisterLand } from "../../service/https/garfield/http";
import { GetAllProvinces, GetDistrict, GetSubdistrict, } from "../../service/https/garfield/http";
import { useNavigate } from "react-router-dom";


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

  // geo lists
  const [provinces, setProvinces] = useState<ProvinceDTO[]>([]);
  const [districts, setDistricts] = useState<DistrictDTO[]>([]);
  const [subdistricts, setSubdistricts] = useState<SubdistrictDTO[]>([]);

  // loading flags
  const [loadingP, setLoadingP] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingS, setLoadingS] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // ดึง user_id จาก wallet
    const fetchUserId = async () => {
      try {
        // import ให้ถูกต้องตามที่ใช้จริง
        const wallet = sessionStorage.getItem("wallet") || "";
        const { user_id } = await import("../../service/https/bam/bam").then(mod => mod.GetUserIDByWalletAddress(wallet));
        if (typeof user_id === "number") {
          setCurrentUserId(user_id);
        }
      } catch (error) {
        console.error("Error calling GetUserIDByWalletAddress:", error);
      }
    };
    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // ใช้ user_id ที่ได้จากฟังก์ชั่น
      const userid = currentUserId;
      if (!userid) {
        alert("ไม่พบ user_id กรุณา login ใหม่");
        setIsSubmitting(false);
        return;
      }
      const payload = {
        ...formData,
        province_id: formData.province_id,
        district_id: formData.district_id,
        subdistrict_id: formData.subdistrict_id,
        userid: String(userid), // ✅ แปลงเป็น string
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
    setDistricts([]);
    setSubdistricts([]);
    navigate("/user/userdashboard");
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
    <div className="user-regis-land-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">ลงทะเบียนที่ดิน</span>
          </h1>
          <p className="hero-subtitle">
            เพิ่มข้อมูลที่ดินของคุณเข้าสู่ระบบเพื่อให้เจ้าหน้าที่กรมที่ดินตรวจสอบ
          </p>
        </div>
      </div>

      <div className="main-container">

        {/* Main Form Card */}
        <div className="glass-card">
          <div className="card-glow"></div>
          {/* Header */}
          <div className="cardHeader">
            <h2 className="cardTitle">
              <MapPin size={24} />
              เพิ่มข้อมูลที่ดิน
            </h2>
          </div>

          {/* Form Content */}
          <div className="formContent">
            {/* Land Document Section */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📋</div>
                <div className="section-title">
                  <h3>ข้อมูลเอกสารที่ดิน</h3>
                  <p>กรุณากรอกข้อมูลจากเอกสารสิทธิ์ที่ดิน</p>
                </div>
              </div>
              <div className="grid">
                <div className="inputGroup">
                  <label className="label">
                    <span className="label-icon">�</span>
                    ระวาง
                  </label>
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
                  <label className="label">
                    <span className="label-icon">🆔</span>
                    เลขที่ดิน
                  </label>
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
                  <label className="label">
                    <span className="label-icon">📄</span>
                    หน้าสำรวจ
                  </label>
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
                  <label className="label">
                    <span className="label-icon">📜</span>
                    เลขที่โฉนด
                  </label>
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
                  <label className="label">
                    <span className="label-icon">📚</span>
                    เล่ม
                  </label>
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
                  <label className="label">
                    <span className="label-icon">📃</span>
                    หน้า
                  </label>
                  <input
                    type="text"
                    name="page"
                    value={formData.page}
                    onChange={handleChange}
                    className="input"
                    placeholder="หน้า"
                  />
                </div>
              </div>
            </div>

            {/* Land Area Section */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📐</div>
                <div className="section-title">
                  <h3>ขนาดพื้นที่</h3>
                  <p>ระบุขนาดพื้นที่ของที่ดิน</p>
                </div>
              </div>
              <div className="grid area-grid">
                <div className="inputGroup">
                  <label className="label">
                    <span className="label-icon">🌾</span>
                    ไร่
                  </label>
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
                  <label className="label">
                    <span className="label-icon">🌿</span>
                    งาน
                  </label>
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
                  <label className="label">
                    <span className="label-icon">📏</span>
                    ตารางวา
                  </label>
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
              </div>
            </div>

            {/* Location Section */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📍</div>
                <div className="section-title">
                  <h3>ที่ตั้งที่ดิน</h3>
                  <p>เลือกจังหวัด อำเภอ และตำบล</p>
                </div>
              </div>
              <div className="grid location-grid">
                {/* จังหวัด */}
                <div className="inputGroup">
                  <label className="label">
                    <span className="label-icon">🏙️</span>
                    จังหวัด
                  </label>
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
                      <option key={p.ID} value={String(p.ID)}>
                        {p.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                {/* อำเภอ */}
                <div className="inputGroup">
                  <label className="label">
                    <span className="label-icon">🏘️</span>
                    อำเภอ
                  </label>
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
                  <label className="label">
                    <span className="label-icon">🏡</span>
                    ตำบล
                  </label>
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
    </div>
  );
};

export default UserRegisLand;
