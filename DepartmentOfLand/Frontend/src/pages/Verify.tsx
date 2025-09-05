import { CheckCircle, User, Wallet, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDataUserForVerify, VerifyWalletID } from "../service/https/aut/https";
import Loader from "../component/third-patry/Loader";
import { verifyMessage } from "ethers";

function Verify() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // จำลองข้อมูล bookingID (ใน production จริงจะมาจาก useLocation)
  const location = useLocation();
  const bookingID = location.state?.booking;
  console.log("BookingID", bookingID);

    useEffect(() => {
        const fetchData = async () => {
            let { response, result } = await getDataUserForVerify(bookingID);
            console.log("response", response);
            console.log("result", result);

            if (response && result) {
                setUserData(result);
            }
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };

        fetchData();
    }, [bookingID]);


  // ข้อมูลจำลองสำหรับการแสดงผล
  const userInfo = {
    firstName: "สมชาย",
    lastName: "ใจดี",
    walletID: "0x742d35Cc6cC55c3E6e4A5F5cB6D79C4e8a3F2B1A"
  };
  

  if (loading) {
        return <div>Loading...</div>; // สามารถแสดงข้อความหรือ loading indicator ระหว่างที่กำลังดึงข้อมูล
}

    const handleAction = async (bookingID: any) => {
        let { response, result } = await VerifyWalletID(bookingID);
        console.log("response", response);
        console.log("result", result);

        setTimeout(() => {
            setLoading(true);
        }, 1000);

    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ยืนยันตัวตนผู้ใช้งาน</h1>
          <p className="text-gray-600 text-lg">กรุณาตรวจสอบข้อมูลของคุณก่อนดำเนินการต่อ</p>
        </div>

        {/* Main Verification Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">ข้อมูลผู้ใช้งาน</h2>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8 space-y-6">
              {/* User Information Section */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">ข้อมูลส่วนตัว</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="text-sm font-medium text-gray-500 block mb-1">ชื่อ</label>
                    <p className="text-lg font-semibold text-gray-800">{userData.firstname}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="text-sm font-medium text-gray-500 block mb-1">นามสกุล</label>
                    <p className="text-lg font-semibold text-gray-800">{userData.lastname}</p>
                  </div>
                </div>
              </div>

              {/* Wallet Information Section */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Wallet className="w-6 h-6 text-orange-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">ข้อมูล Wallet</h3>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-500">Wallet ID</label>
                    <div className="flex items-center">
                      {/* MetaMask Logo */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center justify-center mr-2 shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        MetaMask
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-700 break-all">
                    {userData.wallet_id}
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              {bookingID && (
                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">ข้อมูลการจอง</h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="text-sm font-medium text-gray-500 block mb-1">การดำเนินการ</label>
                    <p className="text-lg font-semibold text-green-600">{userData.service_type}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button onClick={() => handleAction(bookingID)} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200">
                  ยืนยันข้อมูล
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-2xl shadow-lg hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 border border-gray-200">
                  แก้ไขข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">ความปลอดภัย</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  ข้อมูลของคุณได้รับการเข้ารหัสและป้องกันด้วยมาตรฐานความปลอดภัยสูงสุด 
                  กรุณาตรวจสอบข้อมูล Wallet ID ให้ถูกต้องก่อนดำเนินการต่อ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && <div className="mt-3"><Loader /></div>}
    </div>
  );
}

export default Verify;