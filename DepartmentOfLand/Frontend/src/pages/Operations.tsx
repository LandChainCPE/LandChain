import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQueueByDate } from "../service/https/aut/https";
import { Calendar, Clock, User, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";

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
    navigate("/operations");
    const fetchData = async () => {
      setLoading(true);
      const res = await getQueueByDate();
      if (res && res.data) {
        const transformedBookings = res.data.map((booking: any) => ({
          ...booking,
          date_booking: convertToThaiDate(booking.date_booking), // แปลงวันที่
        }));
        setBookings(transformedBookings);
        console.log(res);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAction = (item: any) => {
    // ส่ง object ของรายการทั้งหมดไปเป็น state
    navigate(`/verifyuser`, { state: { booking: item } });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center mb-6">
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
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">รายการทั้งหมด</p>
                  <p className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {bookings.length}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">รอดำเนินการ</p>
                  <p className="text-3xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors duration-300">
                    {bookings.length}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">เสร็จสิ้นวันนี้</p>
                  <p className="text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                    0
                  </p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
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
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">รายการจองคิววันนี้</h3>
                  <p className="text-gray-600 mt-1">Today's Queue Management</p>
                </div>
                <div className="px-4 py-2 bg-blue-100 rounded-full">
                  <span className="text-blue-700 font-semibold text-sm">{bookings.length} รายการ</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      ผู้จอง
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      วันที่จอง
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      เวลา
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      ประเภทการติดต่อ
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
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
                            <div className="text-sm text-gray-500">ลูกค้า</div>
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
                          onClick={() => handleAction(item.id)}
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
