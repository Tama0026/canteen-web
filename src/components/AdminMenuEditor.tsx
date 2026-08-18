'use client';

import { useState, useEffect } from 'react';
import { 
  FullMenuDatabase, 
  CycleKey, 
  ShiftKey, 
  MealTypeKey, 
  DayKey, 
  DAY_KEYS, 
  DAY_NAMES, 
  SHIFT_NAMES, 
  MEAL_TYPE_NAMES, 
  MenuItem 
} from '@/types/menu';
import { updateDishAction, importExcelMenuAction, resetMenuToDefaultAction } from '@/app/actions/menu-actions';
import { 
  Lock, 
  KeyRound, 
  Save, 
  Upload, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Sparkles,
  HelpCircle,
  ArrowLeft,
  CloudUpload,
  FileText,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface AdminMenuEditorProps {
  initialMenu: FullMenuDatabase;
}

const DocumentIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size * 1.33} viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H24L36 12V48H0V0Z" fill="#EFECE1" />
    <path d="M24 0V12H36L24 0Z" fill="#D9D4C3" />
    <rect x="6" y="14" width="12" height="1.5" fill="#C5C0AA" />
    <rect x="6" y="20" width="24" height="1.5" fill="#C5C0AA" />
    <rect x="6" y="26" width="24" height="1.5" fill="#C5C0AA" />
    <rect x="6" y="32" width="24" height="1.5" fill="#C5C0AA" />
    <rect x="6" y="38" width="20" height="1.5" fill="#C5C0AA" />
  </svg>
);

const ToastNotification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const interval = 30;
    const step = (100 / duration) * interval;
    
    const timerId = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(timerId);
          onClose();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerId);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[100] overflow-hidden rounded-xl border bg-white dark:bg-slate-900 shadow-2xl min-w-[280px] transition-all duration-300 animate-in slide-in-from-top-4 slide-in-from-right-4 fade-in ${
      type === 'success' ? 'border-emerald-500 shadow-emerald-500/20' : 'border-red-500 shadow-red-500/20'
    }`}>
      <div className="p-4 flex items-center gap-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        )}
        <span className={`font-bold text-sm ${type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {message}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
        <div 
          className={`h-full transition-all duration-75 ease-linear ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default function AdminMenuEditor({ initialMenu }: AdminMenuEditorProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [menuData, setMenuData] = useState<FullMenuDatabase>(initialMenu);
  const [selectedCycle, setSelectedCycle] = useState<CycleKey>('cycle_1_3');
  const [selectedShift, setSelectedShift] = useState<ShiftKey>('morning');
  const [selectedMealType, setSelectedMealType] = useState<MealTypeKey>('regular');
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.trim() === '123456' || pinCode.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mã PIN không chính xác! (Mặc định: 123456)');
    }
  };

  const handleInputChange = (day: DayKey, field: keyof MenuItem, value: string) => {
    setMenuData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[selectedCycle][selectedShift][selectedMealType][day]) {
        next[selectedCycle][selectedShift][selectedMealType][day] = {
          mainDish1: '',
          mainDish2: '',
          sideDish: '',
          soup: '',
          dessert: '',
        };
      }
      next[selectedCycle][selectedShift][selectedMealType][day][field] = value;
      return next;
    });
  };

  const handleSaveDay = async (day: DayKey) => {
    setIsSaving(true);
    setStatusMessage(null);
    const item = menuData[selectedCycle][selectedShift][selectedMealType][day];
    const res = await updateDishAction(selectedCycle, selectedShift, selectedMealType, day, item);
    setIsSaving(false);
    setStatusMessage({
      type: res.success ? 'success' : 'error',
      text: res.success ? 'Lưu thành công' : 'Lưu thất bại',
    });
  };

  const handleSaveAllCurrent = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      for (const day of DAY_KEYS) {
        const item = menuData[selectedCycle][selectedShift][selectedMealType][day];
        await updateDishAction(selectedCycle, selectedShift, selectedMealType, day, item);
      }
      setIsSaving(false);
      setStatusMessage({
        type: 'success',
        text: 'Lưu thành công',
      });
    } catch (err: any) {
      setIsSaving(false);
      setStatusMessage({ type: 'error', text: 'Lưu thất bại' });
    }
  };

  const handleExcelUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setStatusMessage(null);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    const formData = new FormData();
    formData.append('excelFile', uploadFile);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const res = await importExcelMenuAction(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        if (res.success) {
          setStatusMessage({ type: 'success', text: 'Cập nhật thành công' });
          if (res.data) {
            setMenuData(res.data);
          }
          setTimeout(() => {
            setUploadFile(null);
            setUploadProgress(0);
            setShowUploadModal(false);
          }, 1000);
        } else {
          setStatusMessage({ type: 'error', text: 'Cập nhật không thành công' });
        }
      }, 300);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setStatusMessage({ type: 'error', text: 'Cập nhật không thành công' });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  const handleResetToDefault = async () => {
    if (!confirm('Bạn có chắc chắn muốn làm trống toàn bộ thực đơn?')) {
      return;
    }
    setIsSaving(true);
    setStatusMessage(null);
    const res = await resetMenuToDefaultAction();
    setIsSaving(false);
    if (res.success) {
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 p-10 sm:p-12 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Quản Trị Nhà Ăn
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Vui lòng nhập mã PIN bảo mật để chỉnh sửa thực đơn hoặc upload file Excel
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="password"
                placeholder="Nhập mã PIN (Mặc định: 123456)"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-center text-sm font-mono tracking-widest focus:outline-none focus:border-slate-400 transition-all"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            {authError && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{authError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold transition-all cursor-pointer"
          >
            Mở Khóa Quản Trị
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thực đơn</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Thực đơn</span>
            </Link>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            Bảng Quản Trị Thực Đơn Nhà Ăn
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm shadow-emerald-900/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục gốc</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-red-900/20"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {statusMessage && (
        <ToastNotification 
          message={statusMessage.text}
          type={statusMessage.type}
          onClose={() => setStatusMessage(null)}
        />
      )}

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cập Nhật Nhanh Bằng File Excel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn file Excel có 2 sheet <code className="font-bold text-slate-900 dark:text-white">TUẦN 1 - 3</code> và <code className="font-bold text-slate-900 dark:text-white">TUẦN 2 - 4</code> để tự động ghi đè thực đơn vào Database
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Choose File Excel</span>
          </button>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <style>{`
            @keyframes modalPop {
              0% { opacity: 0; transform: scale(0.95); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes fillAnimation {
              from { width: 0%; }
              to { width: 100%; }
            }
            .animate-modal-pop {
              animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-fill-bar {
              animation: fillAnimation 1s ease-out forwards;
            }
          `}</style>
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => {
              if (!isUploading) {
                setShowUploadModal(false);
                setUploadFile(null);
              }
            }} 
          />
          
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-6 sm:p-8 flex flex-col space-y-4 animate-modal-pop">
            
            <div className="flex justify-between items-center -mt-2 -mr-2 -ml-2 mb-2">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase ml-4">Upload Menu</h2>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }
                }}
                disabled={isUploading}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`block w-full rounded-md border-2 border-dashed ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'} py-12 px-6 text-center cursor-pointer transition-colors`}
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />
              <CloudUpload className="w-12 h-12 text-blue-600 dark:text-blue-500 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click or drag file here</p>
            </label>

            {uploadFile && (
              <div style={{
                border: '1px dashed #d9d9d9',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff'
              }}>
                <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
                  <DocumentIcon size={44} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span 
                    style={{ 
                      color: '#0958d9', 
                      fontSize: '13px', 
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={uploadFile.name}
                  >
                    {uploadFile.name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px' }}>
                    {formatFileSize(uploadFile.size)}
                  </span>
                  
                  <div style={{ height: '4px', backgroundColor: '#52c41a', borderRadius: '2px', width: '100%' }} className="animate-fill-bar" />
                </div>
                
                <div 
                  style={{ marginLeft: '16px', display: 'flex', alignItems: 'center' }} 
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#52c41a] shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {uploadFile && (
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setUploadFile(null);
                    setShowUploadModal(false);
                  }}
                  disabled={isUploading}
                  className="px-6 py-2 rounded-lg bg-[#ff4d4f] hover:bg-[#ff7875] text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm"
                >
                  HỦY
                </button>
                <button
                  type="button"
                  onClick={handleExcelUpload}
                  disabled={isUploading}
                  className="px-6 py-2 rounded-lg bg-[#52c41a] hover:bg-[#73d13d] text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center min-w-[90px]"
                >
                  {isUploading ? 'Đang cập nhật...' : 'CẬP NHẬT'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              1. Chu Kỳ Tuần:
            </label>
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedCycle('cycle_1_3')}
                className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  selectedCycle === 'cycle_1_3'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900'
                }`}
              >
                TUẦN 1 - 3
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('cycle_2_4')}
                className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  selectedCycle === 'cycle_2_4'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900'
                }`}
              >
                TUẦN 2 - 4
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              2. Ca Ăn:
            </label>
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedShift('morning')}
                className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  selectedShift === 'morning'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Ca Sáng
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift('afternoon')}
                className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  selectedShift === 'afternoon'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Ca Chiều
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              3. Loại Món:
            </label>
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedMealType('regular')}
                className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  selectedMealType === 'regular'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Món Mặn
              </button>
              <button
                type="button"
                onClick={() => setSelectedMealType('vegetarian')}
                className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  selectedMealType === 'vegetarian'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Món Chay
              </button>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Mẹo nhập món xen kẽ theo tuần:</strong> Nếu món ăn đổi theo tuần (ví dụ Tuần 1: Thịt ram, Tuần 3: Thịt chiên), bạn chỉ cần nhập dấu gạch chéo <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">Thịt ram/Chiên</code>. Hệ thống sẽ tự động tách món theo tuần!
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Chỉnh sửa:</span>
            </h4>

            <button
              type="button"
              onClick={handleSaveAllCurrent}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAY_KEYS.map((day) => {
              const currentItem = menuData[selectedCycle]?.[selectedShift]?.[selectedMealType]?.[day] || {
                mainDish1: '',
                mainDish2: '',
                sideDish: '',
                soup: '',
                dessert: '',
              };

              return (
                <div
                  key={day}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {DAY_NAMES[day].vi}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveDay(day)}
                      disabled={isSaving}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                    >
                      Lưu
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Món chính 1
                      </label>
                      <input
                        type="text"
                        value={currentItem.mainDish1 || ''}
                        onChange={(e) => handleInputChange(day, 'mainDish1', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Món chính 2
                      </label>
                      <input
                        type="text"
                        value={currentItem.mainDish2 || ''}
                        onChange={(e) => handleInputChange(day, 'mainDish2', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Món xào / Rau
                      </label>
                      <input
                        type="text"
                        value={currentItem.sideDish || ''}
                        onChange={(e) => handleInputChange(day, 'sideDish', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Món canh
                      </label>
                      <input
                        type="text"
                        value={currentItem.soup || ''}
                        onChange={(e) => handleInputChange(day, 'soup', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Tráng miệng
                      </label>
                      <input
                        type="text"
                        value={currentItem.dessert || ''}
                        onChange={(e) => handleInputChange(day, 'dessert', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
