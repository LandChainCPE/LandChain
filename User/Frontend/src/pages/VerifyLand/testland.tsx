// ฟังก์ชันแปลงข้อมูลจาก backend ให้ตรงกับ frontend
const mapLandTitle = (raw: any): LandTitle => ({
    id: raw.ID,
    created_at: raw.CreatedAt,
    updated_at: raw.UpdatedAt,
    title_no: raw.title_deed_number,
    province: raw.Province?.Name ?? "",
    district: raw.District?.name_th ?? "",
    subdistrict: raw.Subdistrict?.name_th ?? "",
    land_code: raw.survey_number,
    area_rai: raw.rai,
    area_ngan: raw.ngan,
    area_wa: raw.square_wa,
    owner_id: raw.user_id,
    status: raw.Status_verify ? "Verified" : "Unverified",
    process_status: raw.Status_verify ? "Verified" : "Unverified",
});
import React, { useEffect, useState } from "react";
import { GetLandtitlesByUser } from "../../service/https/garfield/https";

interface LandTitle {
    id: number;
    created_at?: string;
    updated_at?: string;
    status?: string;
    title_no?: string;
    province?: string;
    district?: string;
    subdistrict?: string;
    land_code?: string;
    area_rai?: string;
    area_ngan?: string;
    area_wa?: string;
    owner_id?: number;
    process_status?: string;
    // เพิ่มฟิลด์อื่น ๆ ตามที่ต้องการ
}

const Testland: React.FC = () => {
    const [landTitles, setLandTitles] = useState<LandTitle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userId = sessionStorage.getItem("user_id");
        const token = sessionStorage.getItem("token");

        if (userId && token) {
            const fetchLandTitles = async () => {
                try {
                    // debug header
                    // @ts-ignore
                    const { getAuthHeaders } = await import("../../service/https/garfield/https");
                    console.log("Auth headers:", getAuthHeaders());
                    const { result } = await GetLandtitlesByUser(userId);
                    setLandTitles(Array.isArray(result) ? result.map(mapLandTitle) : []);
                } catch (err) {
                    setError("ไม่สามารถดึงข้อมูลได้");
                } finally {
                    setLoading(false);
                }
            };
            fetchLandTitles();
        } else {
            setError("ไม่พบข้อมูลผู้ใช้งานหรือไม่ได้ล็อกอิน");
            setLoading(false);
        }
    }, []);

    if (loading) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // handle กรณี landTitles ไม่ใช่ array (เช่น error 401)
    if (!Array.isArray(landTitles)) {
        return <div style={{ color: 'red' }}>ไม่สามารถดึงข้อมูลที่ดินได้ หรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้</div>;
    }

    return (
        <div>
            <h1>Land Titles</h1>
            <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Title No</th>
                        <th>Province</th>
                        <th>District</th>
                        <th>Land Code</th>
                        <th>Area (Rai)</th>
                        <th>Area (Ngan)</th>
                        <th>Area (Wa)</th>
                        <th>Owner ID</th>
                        <th>Status</th>
                        <th>Process Status</th>
                    </tr>
                </thead>
                <tbody>
                    {landTitles.map((landTitle: any, idx: number) => (
                        <tr key={landTitle.id ?? idx}>
                            <td>{landTitle.id}</td>
                            <td>{landTitle.created_at}</td>
                            <td>{landTitle.updated_at}</td>
                            <td>{landTitle.title_no}</td>
                            <td>{landTitle.province}</td>
                            <td>{landTitle.district}</td>
                            <td>{landTitle.land_code}</td>
                            <td>{landTitle.area_rai}</td>
                            <td>{landTitle.area_ngan}</td>
                            <td>{landTitle.area_wa}</td>
                            <td>{landTitle.owner_id}</td>
                            <td>{landTitle.status}</td>
                            <td>{landTitle.process_status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Testland;
