import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/sideabar/Sidebar";
import { getQueueByDate } from "../service/https/aut/https";

function UserMain() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getQueueByDate();
      if (res && res.data) {
        setBookings(res.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEdit = (id: number) => {
    console.log("Edit booking:", id);
    // ตัวอย่าง navigate ไปหน้าแก้ไข
    // navigate(`/edit-booking/${id}`);
  };

  const handleDelete = (id: number) => {
    console.log("Delete booking:", id);
    // เรียก API ลบ
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
                      onClick={() => handleEdit(item.id)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      ลบ
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
