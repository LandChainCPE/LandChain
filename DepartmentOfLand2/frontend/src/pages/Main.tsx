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
    <div className="d-flex" style={{ height: "100vh", backgroundColor: "#f5f6fa" }}>
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <div className="bg-white rounded-3 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="m-0" style={{ color: "#2c3e50" }}>
              <i className="bi bi-calendar-check me-2"></i>
              รายการดำเนินการ
            </h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary">
                <i className="bi bi-filter me-1"></i>กรอง
              </button>
              <button className="btn btn-outline-secondary">
                <i className="bi bi-download me-1"></i>ดาวน์โหลด
              </button>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">กำลังโหลด...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="text-secondary">ชื่อผู้จอง</th>
                    <th scope="col" className="text-secondary">วันที่จอง</th>
                    <th scope="col" className="text-secondary">เวลา</th>
                    <th scope="col" className="text-secondary">สาขา</th>
                    <th scope="col" className="text-secondary">การดำเนินงาน</th>
                    <th scope="col" className="text-center text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-medium">{item.user_name}</td>
                      <td>{item.date_booking}</td>
                      <td>
                        <span className="badge px-3 py-2" 
                              style={{
                                backgroundColor: '#8B5CF6', // สีม่วงเข้ม
                                color: 'white',
                                fontWeight: '500',
                                fontSize: '0.9rem'
                              }}>
                          {item.time_slot}
                        </span>
                      </td>
                      <td>{item.branch_name}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                          {item.typeofservice.service}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-primary btn-sm px-3"
                          onClick={() => handleAction(item.id)}
                        >
                          <i className="bi bi-arrow-right-circle me-1"></i>
                          ดำเนินการ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserMain;
