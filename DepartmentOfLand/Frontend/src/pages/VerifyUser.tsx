//@ts-ignore
import { CheckCircle, User, Shield, FileText, Clock, AlertCircle, Building2, X, Wallet, Copy, Check, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDataUserForVerify, VerifyWalletID } from "../service/https/aut/https";
import Loader from "../component/third-patry/Loader";

function Verify() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();
  const bookingID = location.state?.booking;

  useEffect(() => {
    const fetchData = async () => {
      let { response, result } = await getDataUserForVerify(bookingID);
      if (response && result) {
        setUserData(result);
      }
      setLoading(false);
    };
    fetchData();
  }, [bookingID]);

  const handleAction = async () => {
    setShowConfirmPopup(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleConfirmHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    let progress = 0;
    let intervalRef: NodeJS.Timeout;

    intervalRef = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(intervalRef);
        processVerification(bookingID);
      }
    }, 20);

    const resetOnRelease = () => {
      clearInterval(intervalRef);
      if (progress < 100) {
        setIsHolding(false);
        setHoldProgress(0);
      }
      document.removeEventListener('mouseup', resetOnRelease);
      document.removeEventListener('touchend', resetOnRelease);
    };

    document.addEventListener('mouseup', resetOnRelease);
    document.addEventListener('touchend', resetOnRelease);
  };

  const processVerification = async (bookingID: any) => {
    setLoading(true);
    setShowConfirmPopup(false);
    let { response, result } = await VerifyWalletID(bookingID);  //ส่ง Booking ไปให้ระบบทำการเซ็น ข้อมูล  ชื่อผู้ใช้  เก็บเข้า  Userverification
    console.log("response", response);
    console.log("result", result);
    setLoading(false);
    setIsHolding(false);
    setHoldProgress(0);

    // ถ้าสำเร็จให้ navigate ไปที่ "/operations"
    if (response && response.status === 200) {
      navigate("/operations");
    } else if (result && result.error) {
      window.alert(`เกิดข้อผิดพลาด: ${result.error}`);
    }
  };

  if (loading || !userData) {
    return <Loader />;
  }

  return (
    <>
      {loading && <Loader />}

  {/* Simple Header (like Operations) */}
  <div className="mb-16 mt-12 animate-fadeIn px-6 lg:px-24">
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
                ยืนยันตัวตนผู้ใช้
              </h1>
              <p className="text-gray-600 text-lg font-medium">Digital Identity Verification System</p>
            </div>
          </div>
        </div>
      </div>

  <div className="px-4 lg:px-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - User Information */}
              <div className="space-y-6">
                
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">ชื่อ - นามสกุล</span>
                        <span className="text-xl font-bold text-gray-900">
                          {userData.firstname} {userData.lastname}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">ประเภทบริการ</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {userData.service_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MetaMask Wallet */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-xl mr-3 overflow-hidden bg-white shadow-lg">
                      {/* MetaMask Logo */}
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ymr3UNKopfI0NmUY95Dr-0589vG-91KuAA&s"
                        alt="MetaMask Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">MetaMask Wallet</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 text-sm font-medium">Connected</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 font-medium">Wallet Address</span>
                      <button 
                        onClick={() => copyToClipboard(userData.wallet_id)}
                        className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-sm">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border truncate">
                      {userData.wallet_id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Verification Actions */}
              <div className="space-y-6">
                
                {/* Status Card */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">สถานะการยืนยัน</h3>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">สถานะปัจจุบัน</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          รอการยืนยัน
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">ดำเนินการยืนยัน</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => handleAction()}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="mr-3" size={24} />
                      <span className="text-lg">
                        {loading ? 'กำลังยืนยัน...' : 'ยืนยันข้อมูล'}
                      </span>
                    </button>

                    <button
                      className="w-full bg-white border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() => navigate("/operations")}
                    >
                      <span className="text-lg">ยกเลิก</span>
                    </button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>หมายเหตุ:</strong> การยืนยันตัวตนนี้จะไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mr-4">
                  <AlertCircle className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">ยืนยันการดำเนินการ</h3>
                  <p className="text-gray-500 text-sm mt-1">Confirm Verification Process</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 mb-6 text-lg">
                คุณต้องการยืนยันตัวตนด้วยข้อมูลดังต่อไปนี้หรือไม่?
              </p>
              
              {/* User Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-blue-900 text-lg">ข้อมูลผู้ใช้งาน</span>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-xl font-bold text-blue-900">
                    {userData.firstname} {userData.lastname}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {/* {userData.service_type} */}ยืนยันผู้ใช้
                  </div>
                </div>
              </div>

              {/* Wallet Info Card */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-xl mr-3 overflow-hidden bg-white shadow-lg">
                    {/* MetaMask Logo */}
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ymr3UNKopfI0NmUY95Dr-0589vG-91KuAA&s"
                      alt="MetaMask Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-orange-900 text-lg">MetaMask Wallet</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 text-sm">Connected</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-sm font-mono text-orange-900 truncate">
                    {userData.wallet_id}
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <strong>คำเตือนสำคัญ:</strong> การยืนยันนี้ไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้องอย่างละเอียด
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg"
              >
                ยกเลิก
              </button>
              <div className="flex-1 relative">
                <button
                  onMouseDown={handleConfirmHold}
                  onTouchStart={handleConfirmHold}
                  disabled={isHolding && holdProgress >= 100}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden disabled:opacity-75 shadow-lg"
                >
                  <div
                    className="absolute inset-0 bg-red-800 transition-all duration-75 ease-out"
                    style={{ width: `${holdProgress}%` }}
                  ></div>
                  <span className="relative z-10">
                    {isHolding ?
                      (holdProgress >= 100 ? 'กำลังยืนยัน...' : `กดค้าง ${Math.round(holdProgress)}%`)
                      : 'กดค้างเพื่อยืนยัน'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Verify;
