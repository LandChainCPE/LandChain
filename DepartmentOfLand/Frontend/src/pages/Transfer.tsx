// @ts-ignore
import React, { useEffect, useState } from "react";
import { ArrowRightLeft, User, FileText, CheckCircle, Clock, MapPin, X, AlertCircle } from "lucide-react";
import { getTransactionLand, DepartmentOfLandVerifyTransaction } from "../service/https/aut/https";

interface LandTransfer {
  id: number;
  transaction_id: number;
  seller: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
  };
  buyer: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
  };
  landNumber: string;
  price: number;
  area: string;
  location: string;
  description: string;
  transactionType: "sale" | "transfer" | "inheritance";
  status: "pending" | "approved" | "rejected";
  dateCreated: string;
  documents: string[];
}

function Transfer() {
  const [transfers, setTransfers] = useState<LandTransfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedTransfer, setSelectedTransfer] = useState<LandTransfer | null>(null);

  const convertToThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${thaiYear}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case "sale": return "ซื้อขาย";
      case "transfer": return "โอนให้";
      case "inheritance": return "มรดก";
      default: return "อื่นๆ";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "รอดำเนินการ";
      case "approved": return "อนุมัติแล้ว";
      case "rejected": return "ยกเลิกแล้ว";
      default: return "ไม่ทราบสถานะ";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getTransactionLand();
        console.log("Res", response);
        // response.result.data is array of backend objects
        const mapped = (response?.result?.data || []).map((item: any, idx: number) => ({
          id: idx + 1,
          transaction_id: item.transaction_id,
          seller: {
            firstname: item.seller_firstname,
            lastname: item.seller_lastname,
            phone: item.seller_phonenumber,
            email: item.seller_email
          },
          buyer: {
            firstname: item.buyer_firstname,
            lastname: item.buyer_lastname,
            phone: item.buyer_phonenumber,
            email: item.buyer_email
          },
          landNumber: item.land_number,
          price: item.price,
          area: `${item.land_rai || 0} ไร่ ${item.land_ngan || 0} งาน ${item.land_square_wa || 0} ตร.ว.`,
          location: `ตำบล${item.subdistrict} อำเภอ${item.district} จังหวัด${item.province}`,
          description: `
            ระวาง: ${item.land_survey_number || ''}
            เลขที่ดิน: ${item.land_number || ''}
            หน้าสำรวจ: ${item.land_survey_page || ''}
            เลขที่โฉนด: ${item.land_title_deed_number || ''}
            เล่ม: ${item.land_volume || ''}
            หน้า: ${item.land_page || ''}
            ตำบล: ${item.subdistrict || ''}
            อำเภอ: ${item.district || ''}
            จังหวัด: ${item.province || ''}
            ขนาดที่ดิน: ${item.land_rai || 0} ไร่ ${item.land_ngan || 0} งาน ${item.land_square_wa || 0} ตร.วา
          `.replace(/\n +/g, '\n'),
          transactionType: "sale", // สามารถปรับ logic ตาม backend
          status: "pending", // สามารถปรับ logic ตาม backend
          dateCreated: new Date().toISOString().slice(0,10), // ไม่มี field ใน backend
          documents: ["โฉนดที่ดิน"]
        }));
        setTransfers(mapped);
      } catch (e) {
        setTransfers([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleApprove = async (transferId: number) => {
    setShowConfirmModal(true);
    const found = transfers.find(t => t.transaction_id === transferId);
    setSelectedTransfer(found || null);
  };

  const handleConfirmApprove = async () => {
    if (!selectedTransfer) return;
    console.log(selectedTransfer.transaction_id);
    const { response, result } = await DepartmentOfLandVerifyTransaction(selectedTransfer.transaction_id);   ///ทำการอัพเดตต Transaction นั้นเป็น VerifyDepaertmentTrue  และ TypeTransaction เป็น กรมที่ดินตรวจสอบรับรู้แล้ว
    if(response.status === 200){
      console.log(result);
      window.location.reload();
    } else {
      alert("เกิดข้อผิดพลาดในการอนุมัติ กรุณาลองใหม่อีกครั้ง");
      setShowConfirmModal(false);
    }
  };

  const handleReject = (transferId: number) => {
    setTransfers(prev => 
      prev.map(transfer => 
        transfer.id === transferId 
          ? { ...transfer, status: "rejected" as const }
          : transfer
      )
    );
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
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowRightLeft className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="ml-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                รายการซื้อขายที่ดิน
              </h1>
              <p className="text-gray-600 text-lg font-medium">Land Transfer Management System</p>
            </div>
          </div>
          
        </div>

        {/* Main Content */}
        {transfers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center animate-fadeIn">
            <div className="relative mb-6">
              <ArrowRightLeft className="w-20 h-20 text-gray-300 mx-auto" />
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gray-100 animate-ping opacity-20"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">ไม่มีรายการซื้อขายที่ดิน</h3>
            <p className="text-gray-500 text-lg">ยังไม่มีรายการซื้อขายที่ดินในระบบ</p>
          </div>
        ) : (
          <div className="space-y-6">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 animate-fadeIn">
                {/* Transfer Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                        <ArrowRightLeft className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{transfer.landNumber}</h3>
                        <p className="text-gray-600 text-sm">{getTransactionTypeText(transfer.transactionType)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(transfer.status)}`}>
                        {getStatusText(transfer.status)}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ฿{formatPrice(transfer.price)}
                        </div>
                        <div className="text-xs text-gray-500">{convertToThaiDate(transfer.dateCreated)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer Details */}
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Seller & Buyer Info */}
                    <div className="space-y-6">
                      {/* Seller */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">ผู้ขาย</h4>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium">
                            {transfer.seller.firstname} {transfer.seller.lastname}
                          </p>
                          <p className="text-gray-600 text-sm">โทร: {transfer.seller.phone}</p>
                          <p className="text-gray-600 text-sm">อีเมล: {transfer.seller.email}</p>
                        </div>
                      </div>

                      {/* Buyer */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">ผู้ซื้อ</h4>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium">
                            {transfer.buyer.firstname} {transfer.buyer.lastname}
                          </p>
                          <p className="text-gray-600 text-sm">โทร: {transfer.buyer.phone}</p>
                          <p className="text-gray-600 text-sm">อีเมล: {transfer.buyer.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Land Info */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">ข้อมูลที่ดิน</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">พื้นที่</p>
                            <p className="font-medium text-gray-900">{transfer.area}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ที่อยู่</p>
                            <p className="font-medium text-gray-900">{transfer.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">รายละเอียด</p>
                            <p className="font-medium text-gray-900 text-sm">{transfer.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">เอกสารประกอบ</h4>
                        </div>
                        <div className="space-y-2">
                          {transfer.documents.map((doc, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span className="text-sm text-gray-700">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {transfer.status === 'pending' && (
                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        onClick={() => handleReject(transfer.id)}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>ยกเลิก</span>
                      </button>
                      <button
                        onClick={() => handleApprove(transfer.transaction_id)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>อนุมัติ</span>
                      </button>
                    </div>
                  )}
  {/* Confirmation Modal */}
  {showConfirmModal && selectedTransfer && (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">ยืนยันการอนุมัติ</h3>
              <p className="text-gray-500 text-sm mt-1">Confirm Land Transfer Approval</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfirmModal(false)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-8">
          <p className="text-gray-700 mb-6 text-lg">
            คุณต้องการอนุมัติรายการซื้อขายที่ดินนี้หรือไม่?
          </p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-4">
            <div className="flex items-center mb-4">
              <ArrowRightLeft className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-bold text-green-900 text-lg">รายการซื้อขายที่ดิน</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xl font-bold text-green-900">
                {selectedTransfer.landNumber} - {selectedTransfer.seller.firstname} {selectedTransfer.seller.lastname} → {selectedTransfer.buyer.firstname} {selectedTransfer.buyer.lastname}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedTransfer.location}
              </div>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>คำเตือน:</strong> การอนุมัติรายการนี้จะดำเนินการเปลี่ยนสถานะในระบบ กรุณาตรวจสอบข้อมูลให้ถูกต้อง
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
          <button
            onClick={handleConfirmApprove}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
          >
            ยืนยันอนุมัติ
          </button>
        </div>
      </div>
    </div>
  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Transfer;
