import React, { useEffect, useMemo, useState } from "react";
import { GetAllPetition, UpdatePetitionStatus, GetAllStates } from "../service/https/jib/jib";
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, ChevronDown } from "lucide-react";

type State = {
  ID: any;
  id: number;
  name: string;
  color?: string;
};
type Petition = {
  ID: number;
  first_name: string;
  last_name: string;
  topic: string;
  description: string;
  date: string;
  State?: State | null;
};


const StatePetition: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  // @ts-ignore
  const [states, setStates] = useState<State[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<{ [id: number]: boolean }>({});
  // เก็บ options สถานะจาก statesResult
  const [stateOptions, setStateOptions] = useState<State[]>([]);

  // สถิติ
  const stats = useMemo(() => {
    let total = petitions.length;
    let pending = petitions.filter(p => p.State?.name === "รอตรวจสอบ").length;
    let processing = petitions.filter(p => p.State?.name === "กำลังดำเนินการ").length;
    let approved = petitions.filter(p => p.State?.name === "เสร็จสิ้น").length;
    return { total, pending, processing, approved };
  }, [petitions]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        let { result } = await GetAllPetition();
        let { result: statesResult } = await GetAllStates();
        setPetitions(result);
        if (Array.isArray(statesResult)) {
          setStates(statesResult);
          setStateOptions(statesResult);
        } else {
          setStates([]);
          setStateOptions([]);
        }
      } catch (e) {
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Icon สถานะ
  const getStatusIcon = (name?: string) => {
    switch (name) {
      case "รอตรวจสอบ": return <Clock className="w-5 h-5 text-amber-500" />;
      case "เสร็จสิ้น": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "กำลังดำเนินการ": return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // เปลี่ยนสถานะ
  const handleChangeStatus = async (petition: Petition, state: State) => {
    console.log("petition", petition);
    console.log("state", state);
    try {
      setLoading(true);
      await UpdatePetitionStatus(petition.ID.toString(), state.ID);
      let newState = state.name === "อนุมัติแล้ว" ? { ...state, name: "เสร็จสิ้น" } : state;
      setPetitions(prev => prev.map(p => p.ID === petition.ID ? { ...p, State: newState } : p));
    } catch (err: any) {
      setError("อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setLoading(false);
      setDropdownOpen(prev => ({ ...prev, [petition.ID]: false }));
    }
  };

  // แปลงวันที่
  const formatDate = (date: string) => {
    if (!date) return "ไม่ระบุวันที่";
    const d = new Date(date);
    const thaiYear = d.getFullYear() + 543;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${thaiYear}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center mb-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">ตรวจสอบคำร้อง</h1>
              <p className="text-gray-600 text-lg font-medium">Petition Management System</p>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">คำร้องทั้งหมด</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20"></div>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-7 h-7 text-amber-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">รอตรวจสอบ</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full opacity-20"></div>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="w-7 h-7 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">กำลังดำเนินการ</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.processing}</p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20"></div>
            </div>
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">เสร็จสิ้น</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.approved}</p>
                </div>
              </div>
              <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
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
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center animate-fadeIn">
            <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{error}</h3>
            <p className="text-gray-500 text-lg">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          </div>
        ) : petitions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center animate-fadeIn">
            <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">ไม่มีข้อมูลคำร้อง</h3>
            <p className="text-gray-500 text-lg">ยังไม่มีรายการคำร้อง</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {petitions.map((item) => (
              <div key={item.ID} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                          #{item.ID}
                        </span>
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">{item.topic}</h3>
                          <p className="text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ผู้ยื่นคำร้อง</p>
                            <p className="font-semibold text-gray-900">{item.first_name} {item.last_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">วันที่ยื่น</p>
                            <p className="font-semibold text-gray-900">{formatDate(item.date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            {getStatusIcon(item.State?.name)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">สถานะปัจจุบัน</p>
                            <p className="font-semibold text-gray-900">{item.State?.name || "ไม่ระบุสถานะ"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          className="inline-flex justify-center w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          onClick={() => setDropdownOpen(prev => ({ ...prev, [item.ID]: !prev[item.ID] }))}
                        >
                          <span className="truncate">{item.State?.name || "เลือกสถานะ"}</span>
                          <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-200 ${dropdownOpen[item.ID] ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen[item.ID] && (
                          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 animate-fadeIn">
                            <div className="py-2">
                              {stateOptions.map((state) => (
                                <button
                                  key={state.ID}
                                  className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 flex items-center ${
                                    item.State?.name === state.name 
                                      ? "bg-blue-100 text-blue-700 font-medium" 
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                  onClick={() => handleChangeStatus(item, state)}
                                >
                                  <div className="flex items-center">
                                    {getStatusIcon(state.name)}
                                    <span className="ml-2">{state.name}</span>
                                  </div>
                                  {item.State?.name === state.name && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${item.State?.name === "รอตรวจสอบ" ? "bg-amber-500" : "bg-gray-300"}`}></div>
                          <div className={`w-3 h-3 rounded-full ${item.State?.name === "กำลังดำเนินการ" ? "bg-blue-500" : "bg-gray-300"}`}></div>
                          <div className={`w-3 h-3 rounded-full ${item.State?.name === "เสร็จสิ้น" ? "bg-green-500" : "bg-gray-300"}`}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatePetition;