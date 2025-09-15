import React, { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, AlertTriangle, FileText, MapPin, Calendar, User, Hash, Zap, Lock, Globe, Sparkles } from 'lucide-react';

// Type definitions
interface LandTitle {
  id: string;
  titleNumber: string;
  landNumber: string;
  subDistrict: string;
  district: string;
  province: string;
  area: string;
  ownerName: string;
  verificationDate: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  documentHash: string;
  accentColor: 'blue' | 'emerald' | 'violet';
}

type AccentColor = 'blue' | 'emerald' | 'violet';

interface AccentClasses {
  blue: string;
  emerald: string;
  violet: string;
}

const LandTitleBlockchainUI: React.FC = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [animateCards, setAnimateCards] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mock verified land titles data
  const verifiedTitles: LandTitle[] = [
    {
      id: 'LT-2024-001',
      titleNumber: 'น.ส.4ก/12345',
      landNumber: '123/45',
      subDistrict: 'เมือง',
      district: 'นครราชสีมา',
      province: 'นครราชสีมา',
      area: '2-1-50 ไร่',
      ownerName: 'นายสมชาย ใจดี',
      verificationDate: '2024-03-15',
      verificationStatus: 'verified',
      documentHash: 'a1b2c3d4e5f6...',
      accentColor: 'blue'
    },
    {
      id: 'LT-2024-002',
      titleNumber: 'น.ส.4ก/67890',
      landNumber: '456/78',
      subDistrict: 'โชคชัย',
      district: 'โชคชัย',
      province: 'นครราชสีมา',
      area: '1-2-75 ไร่',
      ownerName: 'นางสุมาลี รักดี',
      verificationDate: '2024-03-16',
      verificationStatus: 'verified',
      documentHash: 'f6e5d4c3b2a1...',
      accentColor: 'emerald'
    },
    {
      id: 'LT-2024-003',
      titleNumber: 'น.ส.4ก/11223',
      landNumber: '789/10',
      subDistrict: 'ปากช่อง',
      district: 'ปากช่อง',
      province: 'นครราชสีมา',
      area: '3-0-25 ไร่',
      ownerName: 'นายประเสริฐ ดีใจ',
      verificationDate: '2024-03-17',
      verificationStatus: 'verified',
      documentHash: 'x9y8z7w6v5u4...',
      accentColor: 'violet'
    }
  ];

  const getAccentClasses = (color: AccentColor, selected: boolean = false): string => {
    const colors: AccentClasses = {
      blue: selected 
        ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-100' 
        : 'border-gray-100 hover:border-blue-100 hover:shadow-blue-50',
      emerald: selected 
        ? 'border-emerald-200 bg-emerald-50 ring-2 ring-emerald-100' 
        : 'border-gray-100 hover:border-emerald-100 hover:shadow-emerald-50',
      violet: selected 
        ? 'border-violet-200 bg-violet-50 ring-2 ring-violet-100' 
        : 'border-gray-100 hover:border-violet-100 hover:shadow-violet-50'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color: AccentColor): string => {
    const colors: AccentClasses = {
      blue: 'text-blue-600',
      emerald: 'text-emerald-600',
      violet: 'text-violet-600'
    };
    return colors[color] || 'text-blue-600';
  };

  const getBackgroundColor = (color: AccentColor): string => {
    const backgrounds: AccentClasses = {
      blue: 'bg-blue-100',
      emerald: 'bg-emerald-100',
      violet: 'bg-violet-100'
    };
    return backgrounds[color] || backgrounds.blue;
  };

  const getShadowColor = (color: AccentColor): string => {
    const shadows: AccentClasses = {
      blue: '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
      emerald: '0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
      violet: '0 20px 25px -5px rgba(139, 92, 246, 0.1), 0 10px 10px -5px rgba(139, 92, 246, 0.04)'
    };
    return shadows[color] || shadows.blue;
  };

  const handleTitleSelect = (titleId: string): void => {
    setSelectedTitles(prev => 
      prev.includes(titleId) 
        ? prev.filter((id: string) => id !== titleId)
        : [...prev, titleId]
    );
  };

  const handleUploadToBlockchain = async (): Promise<void> => {
    if (selectedTitles.length === 0) {
      setUploadStatus('กรุณาเลือกโฉนดที่ต้องการอัพโหลด');
      return;
    }

    setIsUploading(true);
    setUploadStatus('กำลังอัพโหลดขึ้น Blockchain...');

    // Simulate blockchain upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus(`อัพโหลดสำเร็จ! จำนวน ${selectedTitles.length} โฉนด`);
      setSelectedTitles([]);
      
      // Clear status after 5 seconds
      setTimeout(() => setUploadStatus(''), 5000);
    }, 3000);
  };

  const handleCheckboxChange = (titleId: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    handleTitleSelect(titleId);
  };

  const renderStatusIcon = (): JSX.Element => {
    if (uploadStatus.includes('สำเร็จ')) {
      return <CheckCircle className="h-5 w-5 animate-bounce" />;
    } else if (uploadStatus.includes('กรุณา')) {
      return <AlertTriangle className="h-5 w-5" />;
    } else {
      return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>;
    }
  };

  const getStatusClasses = (): string => {
    if (uploadStatus.includes('สำเร็จ')) {
      return 'bg-green-50 border-green-200 text-green-800 shadow-lg shadow-green-100';
    } else if (uploadStatus.includes('กรุณา')) {
      return 'bg-amber-50 border-amber-200 text-amber-800 shadow-lg shadow-amber-100';
    } else {
      return 'bg-blue-50 border-blue-200 text-blue-800 shadow-lg shadow-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ระบบโฉนดดิจิทัล</h1>
                <p className="text-sm text-gray-500 font-medium">Land Title Blockchain System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Alert */}
        {uploadStatus && (
          <div className={`mb-8 p-4 rounded-2xl border transition-all duration-500 transform ${
            getStatusClasses()
          } ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center space-x-3">
              {renderStatusIcon()}
              <span className="font-semibold">{uploadStatus}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content - Verified Titles */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <FileText className="h-7 w-7 text-gray-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">โฉนดที่ดินที่ผ่านการตรวจสอบ</h2>
                      <p className="text-gray-500 mt-1">Verified Land Titles from กรมที่ดิน</p>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-white px-4 py-2 rounded-full">
                    <span className="font-bold">{verifiedTitles.length} รายการ</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {verifiedTitles.map((title: LandTitle, index: number) => (
                  <div 
                    key={title.id}
                    className={`group relative rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                      getAccentClasses(title.accentColor, selectedTitles.includes(title.id))
                    } hover:shadow-xl ${
                      animateCards 
                        ? 'translate-y-0 opacity-100' 
                        : 'translate-y-8 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: `${index * 100}ms`,
                      boxShadow: selectedTitles.includes(title.id) 
                        ? getShadowColor(title.accentColor)
                        : undefined
                    }}
                    onClick={() => handleTitleSelect(title.id)}
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center space-x-4">
                          <div className={`relative ${selectedTitles.includes(title.id) ? 'scale-110' : ''} transition-transform duration-200`}>
                            <input
                              type="checkbox"
                              checked={selectedTitles.includes(title.id)}
                              onChange={handleCheckboxChange(title.id)}
                              className="h-5 w-5 text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-gray-500 focus:ring-2 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              โฉนดเลขที่ {title.titleNumber}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <div className="bg-green-100 px-3 py-1 rounded-full flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 text-sm font-semibold">Verified</span>
                              </div>
                              <div className="bg-gray-100 px-3 py-1 rounded-full">
                                <span className="text-gray-600 text-sm font-medium">{title.id}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getBackgroundColor(title.accentColor)}`}>
                            <Sparkles className={`h-6 w-6 ${getIconColor(title.accentColor)}`} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                              <Hash className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-gray-500 mb-1">เลขที่ดิน</div>
                              <div className="font-semibold text-lg text-gray-900">{title.landNumber}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                              <MapPin className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-gray-500 mb-1">ที่อยู่</div>
                              <div className="font-semibold text-gray-900">
                                ต.{title.subDistrict} อ.{title.district}
                              </div>
                              <div className="font-semibold text-gray-900">จ.{title.province}</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-gray-500 mb-1">เจ้าของ</div>
                              <div className="font-semibold text-lg text-gray-900">{title.ownerName}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                              <Calendar className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-gray-500 mb-1">วันที่ตรวจสอบ</div>
                              <div className="font-semibold text-gray-900">{title.verificationDate}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">พื้นที่</div>
                            <div className="font-bold text-2xl text-gray-900">{title.area}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Document Hash</div>
                            <div className="font-mono text-gray-700 text-sm bg-white px-3 py-2 rounded-lg border border-gray-200">
                              {title.documentHash}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Upload Actions */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 sticky top-24">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Blockchain Upload</h3>
                <p className="text-gray-500 text-sm">ปลอดภัยด้วยเทคโนโลยี Web3</p>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">โฉนดที่เลือก</span>
                    <div className="bg-gray-900 text-white px-4 py-2 rounded-full">
                      <span className="font-bold text-lg">{selectedTitles.length}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">สถานะเครือข่าย</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium text-sm">Ethereum Mainnet</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium text-sm">Smart Contract: Active</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium text-sm">กรมที่ดิน API: Connected</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUploadToBlockchain}
                disabled={isUploading || selectedTitles.length === 0}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  isUploading || selectedTitles.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-100'
                    : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl border-2 border-gray-900 transform hover:scale-105 active:scale-95'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังอัพโหลด...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>อัพโหลดขึ้น Blockchain</span>
                    </>
                  )}
                </div>
              </button>

              <div className="mt-6 text-center space-y-2">
                <p className="text-gray-500 text-sm">
                  ⚡ การอัพโหลดจะใช้เวลาประมาณ 2-3 นาที
                </p>
                <p className="text-gray-400 text-xs">
                  🔒 ข้อมูลจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandTitleBlockchainUI;