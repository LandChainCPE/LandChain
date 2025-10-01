import { User, FileText, CheckCircle, Building2, Search, Users, FileCheck2 } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../component/third-patry/Loader";
import { GetCountDataDashboardOnchain } from "../service/https/aut/https";

// Fetch real dashboard data from API
const fetchDashboardData = async () => {
  try {
    const response = await GetCountDataDashboardOnchain();
    console.log("Dashboard API response:", response);
    
    if (response && response.result) {
      const {
        verified_users_count,
        verified_landtitles_count,
        land_verification_onchain_count,
        user_verification_onchain_count
      } = response.result;

      return {
        totalUsers: verified_users_count,
        totalLandVerifications: verified_landtitles_count,
        totalOnChain: land_verification_onchain_count + user_verification_onchain_count,
        recentActivities: [
          { type: "register", user: "สมชาย ใจดี", time: "09:10", detail: "ลงทะเบียนผู้ใช้ใหม่", status: "success" },
          { type: "verify", user: "สมหญิง สายใจ", time: "09:15", detail: "ตรวจสอบโฉนด #7543031", status: "processing" },
          { type: "onchain", user: "สมปอง ทองดี", time: "09:20", detail: "นำโฉนดขึ้น Blockchain", status: "completed" },
          { type: "register", user: "John Doe", time: "09:25", detail: "ลงทะเบียนผู้ใช้ใหม่", status: "success" },
          { type: "verify", user: "สมศรี ดีใจ", time: "09:30", detail: "ตรวจสอบโฉนด #7543045", status: "pending" },
        ],
      };
    }
    
    // Fallback to mock data if API fails
    return {
      totalUsers: 0,
      totalLandVerifications: 0,
      totalRequests: 0,
      totalOnChain: 0,
      recentActivities: [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return empty data on error
    return {
      totalUsers: 0,
      totalLandVerifications: 0,
      totalRequests: 0,
      totalOnChain: 0,
      recentActivities: [],
    };
  }
};

function MainDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const dashboard = await fetchDashboardData();
      setData(dashboard);
      // const list = await fetchDashboardlist();
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading || !data) {
    return <Loader />;
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-200/40 via-blue-100/30 to-indigo-200/40 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Login-inspired Background Elements (Lighter Version) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Blockchain Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 
              `linear-gradient(to right, rgba(59,130,246,0.3) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(59,130,246,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Blockchain Square Clusters (Lighter) */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Cluster 1 */}
          <div className="absolute top-24 left-16 flex flex-col space-y-2 animate-fadeIn opacity-20" style={{animationDelay:'0.2s'}}>
            <div className="flex space-x-2">
              <span className="block w-4 h-4 bg-white/15 border border-blue-300/20 rounded-sm backdrop-blur-sm animate-pulse"></span>
              <span className="block w-4 h-4 bg-blue-400/15 border border-white/15 rounded-sm animate-pulse" style={{animationDelay:'0.4s'}}></span>
              <span className="block w-4 h-4 bg-white/10 border border-blue-300/15 rounded-sm animate-pulse" style={{animationDelay:'0.8s'}}></span>
            </div>
            <div className="flex space-x-2">
              <span className="block w-4 h-4 bg-gradient-to-br from-white/20 to-blue-300/15 border border-white/20 rounded-sm animate-pulse" style={{animationDelay:'0.6s'}}></span>
              <span className="block w-4 h-4 bg-white/8 border border-blue-200/15 rounded-sm animate-pulse" style={{animationDelay:'1s'}}></span>
              <span className="block w-4 h-4 bg-blue-300/12 border border-white/15 rounded-sm animate-pulse" style={{animationDelay:'1.2s'}}></span>
            </div>
          </div>
          
          {/* Cluster 2 */}
          <div className="absolute bottom-28 right-24 grid grid-cols-4 gap-2 animate-fadeIn opacity-15" style={{animationDelay:'0.5s'}}>
            {Array.from({length:8}).map((_,i)=>(
              <span key={i} className="w-3 h-3 rounded-sm border backdrop-blur-sm animate-pulse"
                style={{
                  animationDelay: `${(i%4)*0.25}s`,
                  background: i%3===0 ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.10)',
                  borderColor: 'rgba(59,130,246,0.15)'
                }}
              />
            ))}
          </div>
          
          {/* Cluster 3 diagonal chain */}
          <div className="absolute top-1/3 right-1/3 flex flex-col space-y-3 animate-fadeIn opacity-12" style={{animationDelay:'0.8s'}}>
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className="flex space-x-3" style={{transform:`translateX(${i*6}px)`}}>
                <span className="w-3 h-3 rounded-sm border border-blue-300/15 bg-white/10 animate-pulse" style={{animationDelay:`${i*0.2}s`}}></span>
                <span className="w-3 h-3 rounded-sm border border-blue-300/20 bg-blue-400/12 animate-pulse" style={{animationDelay:`${i*0.2+0.1}s`}}></span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Connecting Lines (Lighter) */}
        <div className="absolute top-1/4 left-1/5 w-72 h-px bg-gradient-to-r from-transparent via-blue-300/25 to-transparent animate-pulse opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-px bg-gradient-to-l from-transparent via-blue-400/20 to-transparent animate-pulse opacity-30" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-px bg-gradient-to-r from-transparent via-blue-300/15 to-transparent animate-pulse opacity-25" style={{animationDelay: '2s'}}></div>
        
        {/* Blockchain Nodes (Lighter) */}
        <div className="absolute top-32 right-40 opacity-25">
          <div className="w-6 h-6 bg-blue-500/15 rounded-full border-2 border-blue-300/20 animate-pulse"></div>
          <div className="absolute -top-1 -left-1 w-8 h-8 border border-blue-300/10 rounded-full animate-ping"></div>
        </div>
        <div className="absolute bottom-40 left-40 opacity-20">
          <div className="w-5 h-5 bg-white/10 rounded-full border-2 border-blue-400/25 animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute -top-1 -left-1 w-7 h-7 border border-blue-300/15 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="absolute top-1/2 left-16 opacity-18">
          <div className="w-7 h-7 bg-blue-600/12 rounded-full border-2 border-blue-300/18 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -top-1 -left-1 w-9 h-9 border border-blue-300/12 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Connection Line */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 opacity-20">
          <div className="flex items-center space-x-4 text-blue-400/25 animate-fadeIn" style={{animationDelay: '1s'}}>
            <div className="w-2 h-2 rounded-full bg-blue-400/20"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400/20 to-blue-300/15"></div>
            <div className="w-2 h-2 rounded-full bg-blue-300/20"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-300/15 to-blue-200/20"></div>
            <div className="w-2 h-2 rounded-full bg-blue-200/25"></div>
          </div>
        </div>
        
        {/* Large Background Shapes (Much Lighter) */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-blue-600/3 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-300/4 to-blue-400/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/3 to-blue-700/4 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-2 sm:px-4 lg:px-0">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="ml-3 sm:ml-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  กรมที่ดิน Dashboard
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">LandChain Blockchain Management System</p>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="ml-3 sm:ml-5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider truncate">ลงทะเบียนผู้ใช้ไปแล้ว</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {data.totalUsers}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1 hidden sm:block">ตรวจสอบข้อมูลผู้ใช้ทั้งหมด</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <FileCheck2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="ml-3 sm:ml-5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider truncate">ตรวจสอบโฉนดไปแล้ว</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                    {data.totalLandVerifications}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1 hidden sm:block">รายการที่ตรวจสอบแล้ว</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="ml-3 sm:ml-5 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider truncate">นำขึ้น Blockchain</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                    {data.totalOnChain}
                  </p>
                  <p className="text-xs text-purple-600 font-medium mt-1 hidden sm:block">เสร็จสมบูรณ์</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* กรมที่ดิน ระบบ LandChain */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">กรมที่ดิน ระบบ LandChain</h3>
          <p className="text-gray-600 text-base">ระบบบริหารจัดการ Blockchain สำหรับกรมที่ดิน</p>
          <p className="text-blue-700 mt-4">ยินดีต้อนรับสู่แดชบอร์ด</p>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
