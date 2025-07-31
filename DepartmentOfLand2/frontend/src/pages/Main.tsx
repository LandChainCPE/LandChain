import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/sideabar/Sidebar";
import { getQueueByDate } from "../service/https/aut/https";

function UserMain() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ฟังก์ชันแปลงวันที่จากปี ค.ศ. เป็นปี พ.ศ.
  const convertToThaiDate = (dateString: string) => {
    const date = new Date(dateString);

    // คำนวณปี พ.ศ.
    const thaiYear = date.getFullYear() + 543;

    // ดึงวันและเดือน
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มต้นที่ 0
    return `${day}-${month}-${thaiYear}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getQueueByDate();
      if (res && res.data) {
        const transformedBookings = res.data.map((booking: any) => ({
          ...booking,
          date_booking: convertToThaiDate(booking.date_booking), // แปลงวันที่
        }));
        setBookings(transformedBookings);
        console.log(res.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAction = (id: number) => {
    console.log("ดำเนินการกับการจอง:", id);
    // ตัวอย่าง navigate ไปหน้าแก้ไขหรือดำเนินการอื่นๆ
    // navigate(`/edit-booking/${id}`);
  };

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="mb-4">📅 รายการจองคิว</h2>

        {loading ? (
          <div className="alert alert-info">กำลังโหลดข้อมูล...</div>
        ) : (
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ชื่อผู้จอง</th>
                <th>วันที่จอง</th>
                <th>เวลา</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((item, index) => (
                <tr key={index}>
                  <td>{item.user_name}</td>
                  <td>{item.date_booking}</td>
                  <td>{item.time_slot}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleAction(item.id)}
                    >
                      ดำเนินการ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserMain;
