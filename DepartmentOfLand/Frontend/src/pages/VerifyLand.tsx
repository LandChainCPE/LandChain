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
  const [expandedWallets, setExpandedWallets] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());


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
    processVerification();

  };

  const processVerification = async () => {
    setLoading(true);
    console.log("Click", selectedLand.idlandtitle);
    let { response, result } = await VerifyLandTitle(selectedLand.idlandtitle);
    console.log(response, result)
    if(response.status === 200){
      setShowConfirmModal(false);
      setLoading(false);
    }
    
  };

  const toggleWalletExpansion = (requestId: number) => {
    setExpandedWallets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const truncateWallet = (wallet: string, maxLength: number = 20) => {
    if (wallet.length <= maxLength) return wallet;
    return `${wallet.slice(0, 10)}...${wallet.slice(-6)}`;
  };

  const toggleSection = (section: string, requestId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  if (loading && !landData) {
    return <Loader />;
  }

  return (
    <>
      {loading && <Loader />}

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 shadow-xl mb-8 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Home className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">ตรวจสอบโฉนดที่ดิน</h1>
                <p className="text-green-100 text-lg font-medium">Land Title Verification System</p>
                <p className="text-green-200 text-sm">ระบบตรวจสอบความถูกต้องของโฉนดที่ดิน</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right text-white">
                <div className="text-sm text-green-200">วันที่</div>
                <div className="text-lg font-semibold">{new Date().toLocaleDateString('th-TH')}</div>
              </div>
              <div className="flex items-center space-x-3 bg-white bg-opacity-20 text-white px-6 py-3 rounded-full border border-white border-opacity-30 backdrop-blur-sm">
                <Shield className="w-5 h-5" />
                <span className="font-medium">ระบบปลอดภัย</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{landData?.totalRequests}</div>
                <div className="text-gray-600 font-medium">คำขอทั้งหมด</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{landData?.pendingRequests}</div>
                <div className="text-gray-600 font-medium">รอดำเนินการ</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{landData?.approvedRequests}</div>
                <div className="text-gray-600 font-medium">อนุมัติแล้ว</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{landData?.rejectedRequests}</div>
                <div className="text-gray-600 font-medium">ไม่อนุมัติ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อเจ้าของ, รหัสโฉนด, หรือสถานที่..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="pending">รอการตรวจสอบ</option>
                  <option value="reviewing">กำลังตรวจสอบ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                </select>
              </div>
            </div>
            
            <div className="text-gray-600">
              แสดง {filteredRequests.length} จาก {landData?.totalRequests} รายการ
            </div>
          </div>
        </div>

        {/* Land Verification Requests */}
        <div className="space-y-3">
          {filteredRequests.map((request: any) => (
            <div key={request.idlandtitle} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Compact Header with All Key Info */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4 text-white">
                        <span className="font-bold">#{request.title_deed_number}</span>
                        <span className="text-slate-200">•</span>
                        <span className="font-medium">{request.firstname} {request.lastname}</span>
                        <span className="text-slate-200">•</span>
                        <span className="text-slate-300 text-sm">{request.subdistrict}, {request.district}</span>
                        <span className="text-slate-200">•</span>
                        <span className="text-slate-300 text-sm">{request.rai}-{request.ngan}-{request.square_wa}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status_verify ? "approved" : "pending")}`}>
                      {getStatusText(request.status_verify ? "approved" : "pending")}
                    </span>
                    <button
                      onClick={() => toggleSection('', request.id)}
                      className="text-white hover:text-slate-200 text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>{expandedCards.has(request.id) ? 'ย่อ' : 'ดูรายละเอียด'}</span>
                      <span className="text-lg">{expandedCards.has(request.id) ? '▲' : '▼'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCards.has(request.id) && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* เจ้าของและ Wallet */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
                        <User className="w-4 h-4 mr-2" />
                        ข้อมูลเจ้าของ
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-blue-700 font-medium">ชื่อ:</span>
                          <span className="ml-2 font-bold text-blue-900">{request.firstname} {request.lastname}</span>
                        </div>
                        <div className="text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-blue-700 font-medium">Wallet Address:</span>
                            <button
                              onClick={() => toggleWalletExpansion(request.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs transition-colors"
                            >
                              {expandedWallets.has(request.id) ? 'ย่อ' : 'ขยาย'}
                            </button>
                          </div>
                          <div className="font-mono text-xs bg-blue-100 p-2 rounded border break-all font-bold text-blue-900">
                            {expandedWallets.has(request.id) 
                              ? request.metamaskaddress 
                              : truncateWallet(request.metamaskaddress)
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลโฉนด */}
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center text-sm">
                        <FileText className="w-4 h-4 mr-2" />
                        รายละเอียดโฉนด
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-green-700">เลขโฉนด:</span>
                          <div className="font-bold text-green-900 bg-green-100 px-1 py-0.5 rounded mt-0.5">{request.title_deed_number}</div>
                        </div>
                        <div>
                          <span className="text-green-700">เลขที่ดิน:</span>
                          <div className="font-bold text-green-900 bg-green-100 px-1 py-0.5 rounded mt-0.5">{request.land_number}</div>
                        </div>
                        <div>
                          <span className="text-green-700">ระวาง:</span>
                          <div className="font-bold text-green-900 bg-green-100 px-1 py-0.5 rounded mt-0.5">{request.survey_number}</div>
                        </div>
                        <div>
                          <span className="text-green-700">หน้าสำรวจ:</span>
                          <div className="font-bold text-green-900 bg-green-100 px-1 py-0.5 rounded mt-0.5">{request.survey_page}</div>
                        </div>
                        <div>
                          <span className="text-green-700">เล่ม:</span>
                          <div className="font-bold text-green-900 bg-green-100 px-1 py-0.5 rounded mt-0.5">{request.volume}</div>
                        </div>
                        <div>
                          <span className="text-green-700">หน้า:</span>
                          <div className="font-bold text-green-900 bg-green-100 px-1 py-0.5 rounded mt-0.5">{request.page}</div>
                        </div>
                      </div>
                      
                      {/* ขนาดที่ดิน */}
                      <div className="mt-3 pt-2 border-t border-green-200">
                        <h5 className="text-green-800 font-medium text-xs mb-2 flex items-center">
                          <Ruler className="w-3 h-3 mr-1" />
                          ขนาดพื้นที่
                        </h5>
                        <div className="flex space-x-2">
                          <div className="bg-green-100 px-2 py-1 rounded text-center flex-1">
                            <div className="text-green-700 text-xs">ไร่</div>
                            <div className="font-bold text-green-900">{request.rai}</div>
                          </div>
                          <div className="bg-green-100 px-2 py-1 rounded text-center flex-1">
                            <div className="text-green-700 text-xs">งาน</div>
                            <div className="font-bold text-green-900">{request.ngan}</div>
                          </div>
                          <div className="bg-green-100 px-2 py-1 rounded text-center flex-1">
                            <div className="text-green-700 text-xs">ตร.วา</div>
                            <div className="font-bold text-green-900">{request.square_wa}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ที่ตั้งและการดำเนินการ */}
                    <div className="space-y-4">
                      {/* ที่ตั้ง */}
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          ที่ตั้ง
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-indigo-700">ตำบล:</span>
                            <span className="ml-2 font-bold text-indigo-900">{request.subdistrict}</span>
                          </div>
                          <div>
                            <span className="text-indigo-700">อำเภอ:</span>
                            <span className="ml-2 font-bold text-indigo-900">{request.district}</span>
                          </div>
                          <div>
                            <span className="text-indigo-700">จังหวัด:</span>
                            <span className="ml-2 font-bold text-indigo-900">{request.province}</span>
                          </div>
                        </div>
                      </div>

                      {/* การดำเนินการ */}
                      {!request.status_verify && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-gray-600" />
                              <span className="font-semibold text-gray-900 text-sm">การดำเนินการ</span>
                            </div>
                            <button
                              onClick={() => handleAction("verify", request)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium transition-colors flex items-center space-x-1 shadow-sm hover:shadow-md text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">ยืนยันการดำเนินการ</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                คุณต้องการยืนยันความถูกต้องของโฉนดที่ดินนี้หรือไม่?
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Home className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-900">โฉนดที่ดิน</span>
                </div>
                <div className="text-lg font-bold text-green-900 ml-7">
                  เลขที่ {selectedLand.title_deed_number} - {selectedLand.firstname} {selectedLand.lastname}
                </div>
                <div className="text-sm text-green-700 ml-7 mt-1">
                  {selectedLand.subdistrict} • {selectedLand.district} • {selectedLand.province}
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>คำเตือน:</strong> การยืนยันนี้จะเป็นการรับรองความถูกต้องของข้อมูลโฉนดที่ดิน กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <div className="flex-1 relative">
                <button  //ปุ่มยืนยัน โมเดล สุดท้าย
                  onMouseDown={handleConfirmHold}
                  onTouchStart={handleConfirmHold}
                  disabled={isHolding && holdProgress >= 100}
                  className="w-full py-3 rounded-lg font-semibold transition-all relative overflow-hidden disabled:opacity-75 bg-green-600 hover:bg-green-700 text-white"
                >
                  <div
                    className="absolute inset-0 transition-all duration-75 ease-out bg-green-800"
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
