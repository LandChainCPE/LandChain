import { CheckCircle, User, Shield, FileText, Clock, AlertCircle, Building2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDataUserForVerify, VerifyWalletID } from "../service/https/aut/https";
import Loader from "../component/third-patry/Loader";

function Verify() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);

  const location = useLocation();
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

  const handleAction = async (bookingID: any) => {
    setShowConfirmPopup(true);
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
    let { response, result } = await VerifyWalletID(bookingID);
    console.log("response", response);
    console.log("result", result);
    setLoading(false);
    setIsHolding(false);
    setHoldProgress(0);

    // เพิ่มแจ้งเตือนสถานะที่ได้จาก backend
    if (result && result.status) {
      window.alert(`สถานะล่าสุด: ${result.status}\n${result.message || ""}`);
      // หรือจะใช้ toast/notification component แทน window.alert ก็ได้
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">กรมที่ดิน</h1>
                <p className="text-sm text-gray-500">ระบบยืนยันตัวตนดิจิทัล</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">ระบบปลอดภัย</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Information Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">ข้อมูลผู้ใช้งาน</h3>
                  <p className="text-blue-100 text-sm mt-1">User Information</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">ข้อมูลส่วนตัว</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ชื่อ:</span>
                      <span className="font-medium text-gray-900">{userData.firstname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">นามสกุล:</span>
                      <span className="font-medium text-gray-900">{userData.lastname}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Wallet Address</h4>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                      MetaMask
                    </span>
                    <span className="text-green-600 text-xs font-medium">● Connected</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 break-all bg-white p-2 rounded border font-mono">
                    {userData.wallet_id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {/* Page Title */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">ยืนยันตัวตนผู้ใช้งาน</h2>
                    <p className="text-gray-600">Digital Identity Verification System</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Booking ID</div>
                    <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                      #{bookingID}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Details */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <CheckCircle className="mr-3" size={24} />
                    รายละเอียดการยืนยัน
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="text-blue-700 text-sm font-medium block mb-2">ประเภทบริการ</label>
                      <div className="text-lg font-bold text-blue-900">{userData.service_type}</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <label className="text-amber-700 text-sm font-medium block mb-2">สถานะปัจจุบัน</label>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-amber-600 mr-2" />
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          รอการยืนยัน
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleAction(bookingID)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <CheckCircle className="mr-3" size={20} />
                      {loading ? 'กำลังยืนยัน...' : 'ยืนยันข้อมูล'}
                    </button>

                    <button className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg">
                      แก้ไขข้อมูล
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Shield className="mr-3" size={24} />
                    ความปลอดภัยและการรักษาความลับ
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">การเข้ารหัสข้อมูล</h4>
                        <p className="text-sm text-gray-600">ข้อมูลทั้งหมดได้รับการเข้ารหัสด้วยมาตรฐาน AES-256</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">การตรวจสอบ Blockchain</h4>
                        <p className="text-sm text-gray-600">Wallet Address จะถูกตรวจสอบผ่านเครือข่าย Ethereum</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>คำแนะนำ:</strong> กรุณาตรวจสอบข้อมูล Wallet Address ให้ถูกต้องก่อนดำเนินการยืนยัน
                        เนื่องจากข้อมูลที่ยืนยันแล้วจะไม่สามารถแก้ไขได้
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">ยืนยันการดำเนินการ</h3>
              </div>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                คุณต้องการยืนยันตัวตนด้วยข้อมูลดังต่อไปนี้หรือไม่?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-900">ชื่อ-นามสกุล</span>
                </div>
                <div className="text-lg font-bold text-blue-900 ml-7">
                  {userData.firstname} {userData.lastname}
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="font-semibold text-orange-900">Wallet ID</span>
                </div>
                <div className="text-lg font-mono font-bold text-orange-900 break-all ml-7">
                  {userData.wallet_id}
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>คำเตือน:</strong> การยืนยันนี้ไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <div className="flex-1 relative">
                <button
                  onMouseDown={handleConfirmHold}
                  onTouchStart={handleConfirmHold}
                  disabled={isHolding && holdProgress >= 100}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all relative overflow-hidden disabled:opacity-75"
                >
                  <div
                    className="absolute inset-0 bg-red-800 transition-all duration-75 ease-out"
                    style={{ width: `${holdProgress}%` }}
                  ></div>
                  <span className="relative z-10">
                    {isHolding ?
                      (holdProgress >= 100 ? 'กำลังยืนยัน...' : `กดค้าง... ${Math.round(holdProgress)}%`)
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
