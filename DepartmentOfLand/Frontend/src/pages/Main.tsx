import { User, FileText, Shield, CheckCircle, Building2, Search, ListChecks, Users, FileCheck2 } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../component/third-patry/Loader";

// Mock data, replace with real API call
const fetchDashboardData = async () => {
  // ตัวอย่างข้อมูล mock
  return {
    totalUsers: 128,
    totalLandVerifications: 54,
    totalRequests: 32,
    totalOnChain: 21,
    recentActivities: [
      { type: "register", user: "สมชาย ใจดี", time: "09:10", detail: "ลงทะเบียนผู้ใช้ใหม่", status: "success" },
      { type: "verify", user: "สมหญิง สายใจ", time: "09:15", detail: "ตรวจสอบโฉนด #7543031", status: "processing" },
      { type: "onchain", user: "สมปอง ทองดี", time: "09:20", detail: "นำโฉนดขึ้น Blockchain", status: "completed" },
      { type: "register", user: "John Doe", time: "09:25", detail: "ลงทะเบียนผู้ใช้ใหม่", status: "success" },
      { type: "verify", user: "สมศรี ดีใจ", time: "09:30", detail: "ตรวจสอบโฉนด #7543045", status: "pending" },
    ],
  };
};

function MainDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const dashboard = await fetchDashboardData();
      setData(dashboard);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return <Loader />;
  }

  return (
    <>
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-xl mb-8 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              {/* <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold text-white">กรมที่ดิน</h1>
                <p className="text-blue-100 text-lg font-medium">LandChain Dashboard</p>
                <p className="text-blue-200 text-sm">ระบบจัดการโฉนดที่ดินดิจิทัล</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right text-white">
                <div className="text-sm text-blue-200">วันที่</div>
                <div className="text-lg font-semibold">{new Date().toLocaleDateString('th-TH')}</div>
              </div>
              {/* <div className="flex items-center space-x-3 bg-white bg-opacity-20 text-white px-6 py-3 rounded-full border border-white border-opacity-30 backdrop-blur-sm">
                <Shield className="w-5 h-5" />
                <span style={{color: "black"}}className="font-medium">ระบบปลอดภัย</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-bl-full opacity-10"></div>
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{data.totalUsers}</div>
                <div className="text-gray-600 font-medium">ผู้ใช้ทั้งหมด</div>
                <div className="text-blue-600 text-sm font-medium">+12% จากเดือนที่แล้ว</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-bl-full opacity-10"></div>
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileCheck2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{data.totalLandVerifications}</div>
                <div className="text-gray-600 font-medium">ตรวจสอบโฉนด</div>
                <div className="text-green-600 text-sm font-medium">+8% จากเดือนที่แล้ว</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-bl-full opacity-10"></div>
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <ListChecks className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{data.totalRequests}</div>
                <div className="text-gray-600 font-medium">คำขอรอดำเนินการ</div>
                <div className="text-amber-600 text-sm font-medium">รอการอนุมัติ</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-bl-full opacity-10"></div>
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{data.totalOnChain}</div>
                <div className="text-gray-600 font-medium">นำขึ้น Blockchain</div>
                <div className="text-purple-600 text-sm font-medium">เสร็จสมบูรณ์</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activities */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div> */}
                <div>
                  <h2 className="text-xl font-bold text-white">กิจกรรมล่าสุด</h2>
                  <p className="text-slate-200 text-sm">Recent System Activities</p>
                </div>
              </div>
              <div className="text-slate-200 text-sm">
                อัพเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {data.recentActivities.map((activity: any, idx: number) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                        activity.type === "register" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                        activity.type === "verify" ? "bg-gradient-to-br from-green-500 to-green-600" :
                        "bg-gradient-to-br from-purple-500 to-purple-600"
                      }`}>
                        {activity.type === "register" && <User className="w-6 h-6 text-white" />}
                        {activity.type === "verify" && <Search className="w-6 h-6 text-white" />}
                        {activity.type === "onchain" && <CheckCircle className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                          {activity.user}
                        </div>
                        <div className="text-gray-600 text-sm mb-1">{activity.detail}</div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === "success" ? "bg-green-100 text-green-700" :
                          activity.status === "processing" ? "bg-blue-100 text-blue-700" :
                          activity.status === "completed" ? "bg-purple-100 text-purple-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {activity.status === "success" && "สำเร็จ"}
                          {activity.status === "processing" && "กำลังดำเนินการ"}
                          {activity.status === "completed" && "เสร็จสมบูรณ์"}
                          {activity.status === "pending" && "รอดำเนินการ"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">
                        {activity.time}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">เมื่อสักครู่</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-6 text-center">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                ดูกิจกรรมทั้งหมด
              </button>
            </div>
          </div>
        </div>

        {/* Additional System Info */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">ระบบความปลอดภัย</h3>
                <p className="text-blue-700 text-sm mb-3">
                  ระบบของเราใช้เทคโนโลยี Blockchain เพื่อรับประกันความปลอดภัยและความโปร่งใสของข้อมูลโฉนดที่ดิน
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-blue-700">เชื่อมต่อ Blockchain</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-blue-700">ระบบเข้ารหัส SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">สถานะระบบ</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Server Status:</span>
                  <span className="text-green-600 font-medium text-sm">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Database:</span>
                  <span className="text-green-600 font-medium text-sm">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Blockchain:</span>
                  <span className="text-green-600 font-medium text-sm">Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainDashboard;
