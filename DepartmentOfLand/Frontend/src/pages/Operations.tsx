import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQueueByDate } from "../service/https/aut/https";
import { Calendar, Clock, User, ChevronRight, AlertCircle,  } from "lucide-react";

function UserMain() {
  const navigate = useNavigate();
  //@ts-ignore
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default: today in yyyy-mm-dd
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  // ฟังก์ชันแปลงวันที่จากปี ค.ศ. เป็นปี พ.ศ.
  //@ts-ignore
  const convertToThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    const day = date.getDate();
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const month = monthNames[date.getMonth()];
    return `${day} ${month} ${thaiYear}`;
  };

  useEffect(() => {
    navigate("/operations");
    const fetchData = async () => {
      setLoading(true);
      let { response, result } = await getQueueByDate(); // ไม่ส่ง selectedDate
      console.log("response", response);
      console.log("result", result);
      if (response.status === 200 && result) {
        // ฟิลเตอร์ข้อมูลตามวันที่ที่เลือก
        const filtered = result.filter((booking: any) => {
          // date_booking อาจเป็น ISO string เช่น "2029-08-06T00:00:00Z"
          const bookingDate = new Date(booking.date_booking);
          const bookingDateStr = bookingDate.toISOString().slice(0, 10); // yyyy-mm-dd
          return bookingDateStr === selectedDate;
        });
        const transformedBookings = filtered.map((booking: any) => ({
          ...booking,
          date_booking: convertToThaiDate(booking.date_booking), // แปลงวันที่
        }));
        setBookings(transformedBookings);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedDate]);

  const handleAction = (item: any) => {
    // ส่ง object ของรายการทั้งหมดไปเป็น state
    console.log(item.id);
    navigate(`/verifyuser`, { state: { booking: item.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="ml-4">
            <div className="text-xl font-semibold text-gray-800 mb-1">กำลังโหลดข้อมูล</div>
            <div className="text-sm text-gray-500">กรุณารอสักครู่...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200/40 via-blue-100/30 to-indigo-200/40 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 px-2 sm:px-4 lg:px-0">
        {/* Header Section + Date Filter */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  รายการจองคิว
                </h1>
                <p className="text-gray-600 text-lg font-medium">Appointment Queue Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-0 sm:ml-8">
              <label htmlFor="date-filter" className="text-gray-700 font-semibold mr-2">เลือกวันที่:</label>
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold bg-white shadow-sm"
                style={{ minWidth: 140 }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center animate-fadeIn">
            <div className="relative mb-6">
              <AlertCircle className="w-20 h-20 text-gray-300 mx-auto" />
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gray-100 animate-ping opacity-20"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">ไม่มีรายการจองคิว</h3>
            <p className="text-gray-500 text-lg">ยังไม่มีรายการจองคิวสำหรับวันนี้</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
            {/* ...existing code... */}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-lg font-extrabold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300">
                      ผู้จอง
                    </th>
                    <th className="px-8 py-5 text-left text-lg font-extrabold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300">
                      วันที่จอง
                    </th>
                    <th className="px-8 py-5 text-left text-lg font-extrabold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300">
                      เวลา
                    </th>
                    <th className="px-8 py-5 text-left text-lg font-extrabold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300">
                      ประเภทการติดต่อ
                    </th>
                    <th className="px-8 py-5 text-right text-lg font-extrabold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {bookings.map((item, index) => (
                    <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="ml-4">
                            <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                              {item.firstname} {item.lastname}
                            </div>
                            {/* ลบคำว่า ลูกค้า */}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-300">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.date_booking}</div>
                            <div className="text-xs text-gray-500">วันที่นัดหมาย</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-amber-200 transition-colors duration-300">
                            <Clock className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.time_slot}</div>
                            <div className="text-xs text-gray-500">เวลานัดหมาย</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                          {item.service_type}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAction(item)}
                          className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <span>ดำเนินการ</span>
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserMain;
