// @ts-ignore
import React, { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Eye, EyeOff } from "lucide-react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);

  const mockWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">การตั้งค่า</h1>
              <p className="text-gray-600">System Settings & Configuration</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <User className="mr-3" size={24} />
                ข้อมูลผู้ใช้งาน
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อผู้ใช้</label>
                  <input
                    type="text"
                    defaultValue="เจ้าหน้าที่กรมที่ดิน"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">แผนก</label>
                  <input
                    type="text"
                    defaultValue="Department of Land"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Wallet Address</label>
                <div className="flex items-center space-x-2">
                  <input
                    type={showWalletAddress ? "text" : "password"}
                    value={mockWalletAddress}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowWalletAddress(!showWalletAddress)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {showWalletAddress ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Bell className="mr-3" size={24} />
                การแจ้งเตือน
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-900">การแจ้งเตือนทั่วไป</h4>
                  <p className="text-sm text-gray-600">รับการแจ้งเตือนเมื่อมีรายการใหม่</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full ${notifications ? 'bg-blue-600' : 'bg-gray-200'} transition-colors`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-900">โหมดมืด</h4>
                  <p className="text-sm text-gray-600">เปลี่ยนธีมเป็นโหมดมืด</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} transition-colors`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Shield className="mr-3" size={24} />
                ความปลอดภัย
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">เปลี่ยนรหัสผ่าน</h4>
                <p className="text-sm text-gray-600">อัปเดตรหัสผ่านสำหรับเข้าสู่ระบบ</p>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">การตรวจสอบสองขั้นตอน</h4>
                <p className="text-sm text-gray-600">เพิ่มความปลอดภัยด้วย 2FA</p>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">ประวัติการเข้าสู่ระบบ</h4>
                <p className="text-sm text-gray-600">ดูประวัติการเข้าสู่ระบบล่าสุด</p>
              </button>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Database className="mr-3" size={24} />
                ข้อมูลระบบ
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">เวอร์ชันระบบ</div>
                  <div className="text-gray-600">v2.1.0</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">เครือข่าย Blockchain</div>
                  <div className="text-gray-600">Ethereum Mainnet</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">สถานะการเชื่อมต่อ</div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600">ออนไลน์</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">อัปเดตล่าสุด</div>
                  <div className="text-gray-600">6 ก.ย. 2568</div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
