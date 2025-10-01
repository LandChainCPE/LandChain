import { 
  CheckCircle, 
  MapPin, 
  Shield, 
  FileText, 
  Clock, 
  AlertCircle, 
  X, 
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Hash,
  Map,
  Ruler,
  CheckSquare,
  XCircle,
  Home
} from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../component/third-patry/Loader";
import { getAllLandData, VerifyLandTitle } from "../service/https/aut/https";
import { useNavigate } from "react-router-dom";

function VerifyLand() {
  const [landData, setLandData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<string>("");
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { response, result } = await getAllLandData();
      if (response && result && Array.isArray(result.data)) {
        console.log("result", result)
        // Map backend data to UI format
        const requests = result.data;
        setLandData({ requests });
      } else {
        setLandData({ requests: [] });
      }
      setLoading(false);
    };
    fetchData();
  }, []);



  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "approved": return "bg-green-100 text-green-700 border-green-200";
      case "reviewing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "รอการตรวจสอบ";
      case "approved": return "อนุมัติแล้ว";
      case "reviewing": return "กำลังตรวจสอบ";
      case "rejected": return "ไม่อนุมัติ";
      default: return status;
    }
  };

  const filteredRequests = landData?.requests?.filter((request: any) => {
    // Search by owner, province, district, subdistrict, title_deed_number
    const matchesStatus = filterStatus === "all" || (request.status_verify ? "approved" : "pending") === filterStatus;
    const matchesSearch =
      `${request.firstname} ${request.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.title_deed_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.province || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.district || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.subdistrict || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const handleAction = (action: string, land: any) => {
    setSelectedLand(land);
    setConfirmAction(action);
    setShowConfirmModal(true);
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
        processVerification();
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

  const processVerification = async () => {
    setLoading(true);
    console.log("Click", selectedLand.idlandtitle);
    let { response, result } = await VerifyLandTitle(selectedLand.idlandtitle);  //ส่ง LandID ไป  ทำการเซ็นข้อมูล  ลง  LandVerification  ปรับ landtitle สถานะ Verify เป็น True
    console.log(response, result)
    if(response.status === 200){
      window.location.reload();
      setShowConfirmModal(false);
      setLoading(false);
    }
    else{
      alert("เกิดข้อผิดพลาดในการยืนยันโฉนดที่ดิน กรุณาลองใหม่อีกครั้ง");
      setShowConfirmModal(false);
      setLoading(false);
    }
    
  };

  const toggleCardExpansion = (requestId: number) => {
    setExpandedCard(expandedCard === requestId ? null : requestId);
  };

  if (loading && !landData) {
    return <Loader />;
  }

  return (
    <>
      {loading && <Loader />}

      {/* Header Section (like Operations) */}
      <div className="mb-12 mt-8 animate-fadeIn px-6 lg:px-50">
        <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-6">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="ml-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                ตรวจสอบโฉนดที่ดิน
              </h1>
              <p className="text-gray-600 text-lg font-medium">Land Title Verification</p>
            </div>
          </div>
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search Only */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อเจ้าของ, เลขโฉนด, หรือสถานที่..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-all duration-200 text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Land Verification Requests */}
        <div className="space-y-3">
          {filteredRequests.map((request: any) => (
            <div key={request.idlandtitle} className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Enhanced Card Header */}
              <div 
                className="bg-white px-6 py-4 cursor-pointer border-b border-blue-100 hover:bg-blue-50/50 transition-colors duration-200" 
                onClick={() => toggleCardExpansion(request.idlandtitle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <b>{`${request.title_deed_number}`}</b>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          {request.rai} ไร่ {request.ngan} งาน {request.square_wa} ตร.วา
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{request.firstname} {request.lastname}</span>
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        <span>{request.subdistrict}, {request.district}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(request.status_verify ? "approved" : "pending")}`}>
                      {getStatusText(request.status_verify ? "approved" : "pending")}
                    </span>
                    <button
                      className="group flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span className="text-sm font-medium">{expandedCard === request.idlandtitle ? 'ย่อข้อมูล' : 'ดูรายละเอียด'}</span>
                      <span className={`text-lg transform transition-transform duration-300 group-hover:translate-y-0.5 ${expandedCard === request.idlandtitle ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCard === request.idlandtitle && (
                <div className="p-8 bg-blue-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* เจ้าของและ Wallet */}
                    <div className="bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-4 flex items-center text-lg">
                        <User className="w-5 h-5 mr-2" />
                        ข้อมูลเจ้าของ
                      </h4>
                      <div className="space-y-4">
                        <div className="text-base">
                          <span className="text-blue-700 font-medium">ชื่อ:</span>
                          <span className="ml-2 font-bold text-blue-900 text-lg">{request.firstname} {request.lastname}</span>
                        </div>
                        <div className="text-base">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-700 font-medium">Wallet Address:</span>
                          </div>
                          <div className="font-mono text-sm bg-blue-100 p-3 rounded border break-all font-bold text-blue-900 w-full min-w-[300px] max-w-full overflow-x-auto">
                            {request.metamaskaddress}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลโฉนด */}
                    <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 rounded-xl p-6 border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-4 flex items-center text-lg">
                        <FileText className="w-5 h-5 mr-2" />
                        รายละเอียดโฉนด
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div>
                          <span className="text-indigo-700">เลขโฉนด:</span>
                          <div className="font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded mt-1 text-lg">{request.title_deed_number}</div>
                        </div>
                        <div>
                          <span className="text-indigo-700">เลขที่ดิน:</span>
                          <div className="font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded mt-1 text-lg">{request.land_number}</div>
                        </div>
                        <div>
                          <span className="text-indigo-700">ระวาง:</span>
                          <div className="font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded mt-1 text-lg">{request.survey_number}</div>
                        </div>
                        <div>
                          <span className="text-indigo-700">หน้าสำรวจ:</span>
                          <div className="font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded mt-1 text-lg">{request.survey_page}</div>
                        </div>
                        <div>
                          <span className="text-indigo-700">เล่ม:</span>
                          <div className="font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded mt-1 text-lg">{request.volume}</div>
                        </div>
                        <div>
                          <span className="text-indigo-700">หน้า:</span>
                          <div className="font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded mt-1 text-lg">{request.page}</div>
                        </div>
                      </div>
                      {/* ขนาดที่ดิน */}
                      <div className="mt-6 pt-4 border-t border-indigo-200">
                        <h5 className="text-indigo-800 font-medium text-base mb-3 flex items-center">
                          <Ruler className="w-4 h-4 mr-2" />
                          ขนาดพื้นที่
                        </h5>
                        <div className="flex space-x-4">
                          <div className="bg-indigo-100 px-4 py-2 rounded text-center flex-1">
                            <div className="text-indigo-700 text-base">ไร่</div>
                            <div className="font-bold text-indigo-900 text-lg">{request.rai}</div>
                          </div>
                          <div className="bg-indigo-100 px-4 py-2 rounded text-center flex-1">
                            <div className="text-indigo-700 text-base">งาน</div>
                            <div className="font-bold text-indigo-900 text-lg">{request.ngan}</div>
                          </div>
                          <div className="bg-indigo-100 px-4 py-2 rounded text-center flex-1">
                            <div className="text-indigo-700 text-base">ตร.วา</div>
                            <div className="font-bold text-indigo-900 text-lg">{request.square_wa}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ที่ตั้งและการดำเนินการ */}
                    <div className="space-y-6">
                      {/* ที่ตั้ง */}
                      <div className="bg-gradient-to-br from-green-100 via-teal-100 to-green-200 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-4 flex items-center text-lg">
                          <MapPin className="w-5 h-5 mr-2" />
                          ที่ตั้ง
                        </h4>
                        <div className="space-y-2 text-base">
                          <div>
                            <span className="text-green-700">ตำบล:</span>
                            <span className="ml-2 font-bold text-green-900 text-lg">{request.subdistrict}</span>
                          </div>
                          <div>
                            <span className="text-green-700">อำเภอ:</span>
                            <span className="ml-2 font-bold text-green-900 text-lg">{request.district}</span>
                          </div>
                          <div>
                            <span className="text-green-700">จังหวัด:</span>
                            <span className="ml-2 font-bold text-green-900 text-lg">{request.province}</span>
                          </div>
                        </div>
                      </div>

                      {/* การดำเนินการ */}
                      {!request.status_verify && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-5 h-5 text-gray-600" />
                              <span className="font-semibold text-gray-900 text-lg">การดำเนินการ</span>
                            </div>
                            <button
                              onClick={() => handleAction("verify", request)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-semibold transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md text-base"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>ยืนยัน</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่พบรายการตรวจสอบโฉนด</h3>
            <p className="text-gray-600">ไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {/* Modal removed - content now displayed inline */}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedLand && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                  <AlertCircle className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">ยืนยันการดำเนินการ</h3>
                  <p className="text-gray-500 text-sm mt-1">Confirm Land Title Verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 mb-6 text-lg">
                คุณต้องการยืนยันความถูกต้องของโฉนดที่ดินนี้หรือไม่?
              </p>
              {/* Land Info Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-3">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-green-900 text-lg">โฉนดที่ดิน</span>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-xl font-bold text-green-900">
                    เลขที่ {selectedLand.title_deed_number} - {selectedLand.firstname} {selectedLand.lastname}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedLand.subdistrict} • {selectedLand.district} • {selectedLand.province}
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>คำเตือน:</strong> การยืนยันนี้จะเป็นการรับรองความถูกต้องของข้อมูลโฉนดที่ดิน กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg"
              >
                ยกเลิก
              </button>
              <div className="flex-1 relative">
                <button
                  onMouseDown={handleConfirmHold}
                  onTouchStart={handleConfirmHold}
                  disabled={isHolding && holdProgress >= 100}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden disabled:opacity-75 shadow-lg"
                >
                  <div
                    className="absolute inset-0 bg-green-800 transition-all duration-75 ease-out"
                    style={{ width: `${holdProgress}%` }}
                  ></div>
                  <span className="relative z-10">
                    {isHolding ?
                      (holdProgress >= 100 ? 'กำลังดำเนินการ...' : `กดค้าง... ${Math.round(holdProgress)}%`)
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

export default VerifyLand;
