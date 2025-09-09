import React, { useState } from "react";
import { ArrowRightLeft, User, FileText, Shield, CheckCircle } from "lucide-react";

function Transfer() {
  const [formData, setFormData] = useState({
    fromAddress: "",
    toAddress: "",
    landTitle: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert("โอนกรรมสิทธิ์สำเร็จ!");
      setLoading(false);
      setFormData({
        fromAddress: "",
        toAddress: "",
        landTitle: "",
        reason: ""
      });
    }, 2000);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <ArrowRightLeft className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">โอนกรรมสิทธิ์ที่ดิน</h1>
              <p className="text-gray-600">Land Ownership Transfer System</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 text-sm font-medium">
                การโอนกรรมสิทธิ์ทุกรายการจะถูกบันทึกบน Blockchain เพื่อความปลอดภัยสูงสุด
              </span>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <FileText className="mr-3" size={24} />
              ข้อมูลการโอนกรรมสิทธิ์
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* From Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Wallet Address ผู้โอน (From)
              </label>
              <input
                type="text"
                name="fromAddress"
                value={formData.fromAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* To Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Wallet Address ผู้รับโอน (To)
              </label>
              <input
                type="text"
                name="toAddress"
                value={formData.toAddress}
                onChange={handleInputChange}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Land Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                เลขที่โฉนดที่ดิน
              </label>
              <input
                type="text"
                name="landTitle"
                value={formData.landTitle}
                onChange={handleInputChange}
                placeholder="เช่น: NS-12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผลในการโอน
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="ระบุเหตุผลในการโอนกรรมสิทธิ์..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-3" size={20} />
                    ยืนยันการโอน
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData({
                  fromAddress: "",
                  toAddress: "",
                  landTitle: "",
                  reason: ""
                })}
                className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg"
              >
                เคลียร์ข้อมูล
              </button>
            </div>
          </form>
        </div>

        {/* Information Panel */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-semibold text-yellow-800 mb-3">ข้อมูลสำคัญ:</h4>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>• การโอนกรรมสิทธิ์จะไม่สามารถยกเลิกได้หลังจากยืนยันแล้ว</li>
            <li>• กรุณาตรวจสอบ Wallet Address ให้ถูกต้องก่อนการโอน</li>
            <li>• ค่าธรรมเนียมการโอนจะถูกคำนวณตาม Gas Price ปัจจุบัน</li>
            <li>• การโอนจะมีผลเมื่อได้รับการยืนยันจากเครือข่าย Blockchain</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Transfer;
