'use client';

import React, { useState, useEffect } from 'react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  X, 
  Download, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Leaf,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { 
  getDkChayAction, 
  upsertDkChayAction, 
  deleteDkChayAction, 
  saveDkChayAction 
} from '@/app/actions/dkchay-actions';
import { getDkChaySessionDate } from '@/lib/menu-helpers';

interface Registration {
  id: string;
  name: string;
  isLunch: boolean;
  isDinner: boolean;
}

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
    <div className={`fixed top-4 right-4 z-50 flex flex-col overflow-hidden rounded-xl shadow-xl border ${
      type === 'success' ? 'bg-white dark:bg-slate-900 border-emerald-500' : 'bg-white dark:bg-slate-900 border-rose-500'
    } min-w-[280px]`}>
      <div className="flex items-center gap-2 p-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        )}
        <span className="text-xs font-bold text-slate-900 dark:text-white flex-1">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
        <div 
          className={`h-full transition-all duration-75 ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default function DkChay() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idInput, setIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLunch, setIsLunch] = useState(false);
  const [isDinner, setIsDinner] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showIdSuggestions, setShowIdSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);
  const [regHistory, setRegHistory] = useState<{id: string, name: string}[]>([]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const dbRegistrations = await getDkChayAction();
      setRegistrations(dbRegistrations || []);
    } catch (e) {
      console.error('Lỗi tải dữ liệu đăng ký chay:', e);
    } finally {
      setIsRefreshing(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();

    const hidIds = localStorage.getItem('canteen_hidden_ids');
    if (hidIds) {
      try { setHiddenIds(JSON.parse(hidIds)); } catch(e) {}
    }
    const hidNames = localStorage.getItem('canteen_hidden_names');
    if (hidNames) {
      try { setHiddenNames(JSON.parse(hidNames)); } catch(e) {}
    }
    const historyStr = localStorage.getItem('canteen_reg_history');
    if (historyStr) {
      try { setRegHistory(JSON.parse(historyStr)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('canteen_hidden_ids', JSON.stringify(hiddenIds));
      localStorage.setItem('canteen_hidden_names', JSON.stringify(hiddenNames));
    }
  }, [hiddenIds, hiddenNames, isLoaded]);

  const openAddModal = () => {
    setIdInput('');
    setNameInput('');
    setIsLunch(false);
    setIsDinner(false);
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInput || !nameInput || (!isLunch && !isDinner)) return;

    const newReg = {
      id: idInput.trim(),
      name: nameInput.toUpperCase().trim(),
      isLunch,
      isDinner
    };

    if (editingIndex !== null) {
      const oldReg = registrations[editingIndex];
      if (
        oldReg.id === newReg.id &&
        oldReg.name === newReg.name &&
        oldReg.isLunch === newReg.isLunch &&
        oldReg.isDinner === newReg.isDinner
      ) {
        setStatusMessage({ type: 'error', text: 'Cần có thông tin thay đổi' });
        setIsModalOpen(false);
        setEditingIndex(null);
        return;
      }
    } else {
      const existingIndex = registrations.findIndex(r => r.id === newReg.id);
      if (existingIndex >= 0) {
        setStatusMessage({ type: 'error', text: 'Mã số nhân viên này đã đăng ký hôm nay' });
        return;
      }
    }

    const res = await upsertDkChayAction(newReg);
    if (res.success) {

      if (typeof window !== 'undefined') {
        const historyStr = localStorage.getItem('canteen_reg_history');
        let history = [];
        if (historyStr) {
          try { history = JSON.parse(historyStr); } catch(e) {}
        }
        const existingIdx = history.findIndex((h: any) => h.id === newReg.id);
        if (existingIdx >= 0) {
          history[existingIdx].name = newReg.name;
        } else {
          history.push({ id: newReg.id, name: newReg.name });
        }
        localStorage.setItem('canteen_reg_history', JSON.stringify(history));
        setRegHistory(history);
      }
      setStatusMessage({ type: 'success', text: editingIndex !== null ? 'Sửa thành công' : 'Đăng ký thành công' });
      await loadData();
    } else {
      setStatusMessage({ type: 'error', text: 'Lỗi khi lưu dữ liệu' });
    }
    
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleStartEdit = (index: number) => {
    const reg = registrations[index];
    setIdInput(reg.id);
    setNameInput(reg.name);
    setIsLunch(reg.isLunch);
    setIsDinner(reg.isDinner);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedIndices.length > 0) {
      const idsToDelete = selectedIndices.map(i => registrations[i]?.id).filter(Boolean);
      const res = await deleteDkChayAction(idsToDelete);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Xóa thành công' });
        setSelectedIndices([]);
        await loadData();
      } else {
        setStatusMessage({ type: 'error', text: 'Xóa không thành công' });
      }
    }
  };

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIndices(registrations.map((_, i) => i));
    } else {
      setSelectedIndices([]);
    }
  };

  const handleToggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleRemove = (index: number) => {
    setRegistrations(registrations.filter((_, i) => i !== index));
    setSelectedIndices(selectedIndices.filter(i => i !== index));
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DANH SÁCH CHAY', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    
    const lunchBg = 'FFFAc090'; 
    const dinnerBg = 'FF5b9bd5'; 
    const headerBg = 'FFFFe699'; 
    
    const lunchTitleFont: Partial<ExcelJS.Font> = { name: 'Times New Roman', size: 24, bold: true };
    const dinnerTitleFont: Partial<ExcelJS.Font> = { name: 'Times New Roman', size: 24, bold: true };
    const dateFont: Partial<ExcelJS.Font> = { name: 'Times New Roman', size: 24, bold: true };
    const headerFont: Partial<ExcelJS.Font> = { name: 'Times New Roman', size: 13, bold: true };
    const dataFontStt: Partial<ExcelJS.Font> = { name: 'Times New Roman', size: 13 };
    const dataFont: Partial<ExcelJS.Font> = { name: 'Times New Roman', size: 15 };

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    worksheet.getColumn('A').width = 3.56;  
    worksheet.getColumn('B').width = 7.28;  
    worksheet.getColumn('C').width = 17.85; 
    worksheet.getColumn('D').width = 45.56; 
    worksheet.getColumn('E').width = 50.56; 
    worksheet.getColumn('F').width = 11.42; 
    worksheet.getColumn('G').width = 7.28;  
    worksheet.getColumn('H').width = 17.85; 
    worksheet.getColumn('I').width = 45.56; 
    worksheet.getColumn('J').width = 50.56; 
    worksheet.getColumn('K').width = 11.42; 

    
    worksheet.mergeCells('B1:E1');
    worksheet.mergeCells('B2:E2');
    worksheet.mergeCells('G1:J1');
    worksheet.mergeCells('G2:J2');

    const cellB1 = worksheet.getCell('B1');
    cellB1.value = 'DANH SÁCH CÔNG NHÂN ĂN CHAY TRƯA';
    cellB1.font = lunchTitleFont;
    cellB1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lunchBg } };
    cellB1.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellB2 = worksheet.getCell('B2');
    cellB2.value = { formula: 'TODAY()', result: new Date() };
    cellB2.numFmt = 'm/d/yyyy';
    cellB2.font = dateFont;
    cellB2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lunchBg } };
    cellB2.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellG1 = worksheet.getCell('G1');
    cellG1.value = 'DANH SÁCH CÔNG NHÂN ĂN CHAY CHIỀU';
    cellG1.font = dinnerTitleFont;
    cellG1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: dinnerBg } };
    cellG1.alignment = { horizontal: 'center', vertical: 'middle' };

    const cellG2 = worksheet.getCell('G2');
    cellG2.value = { formula: 'TODAY()', result: new Date() };
    cellG2.numFmt = 'm/d/yyyy';
    cellG2.font = dateFont;
    cellG2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: dinnerBg } };
    cellG2.alignment = { horizontal: 'center', vertical: 'middle' };

    
    worksheet.getRow(1).height = 43.5; 
    worksheet.getRow(2).height = 36;   
    worksheet.getRow(3).height = 22.5; 

    
    const headers = [
      { cell: 'B3', val: 'STT' },
      { cell: 'C3', val: 'Mã Số' },
      { cell: 'D3', val: 'HỌ VÀ TÊN' },
      { cell: 'E3', val: 'BỘ PHẬN' },
      { cell: 'G3', val: 'STT' },
      { cell: 'H3', val: 'Mã Số' },
      { cell: 'I3', val: 'HỌ VÀ TÊN' },
      { cell: 'J3', val: 'BỘ PHẬN' }
    ];

    headers.forEach(h => {
      const cell = worksheet.getCell(h.cell);
      cell.value = h.val;
      cell.font = headerFont;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
      cell.border = borderStyle;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });


    
    const sortedRegistrations = [...registrations].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    const lunchList = sortedRegistrations.filter(r => r.isLunch);
    const dinnerList = sortedRegistrations.filter(r => r.isDinner);
    
    
    const maxRows = Math.max(10, lunchList.length, dinnerList.length);

    for (let i = 0; i < maxRows; i++) {
      const rowIdx = 4 + i;
      const row = worksheet.getRow(rowIdx);
      row.height = 16.5; 
      
      
      worksheet.getCell(`B${rowIdx}`).value = lunchList[i] ? i + 1 : '';
      worksheet.getCell(`C${rowIdx}`).value = lunchList[i] ? lunchList[i].id : '';
      worksheet.getCell(`D${rowIdx}`).value = lunchList[i] ? lunchList[i].name : '';
      worksheet.getCell(`E${rowIdx}`).value = lunchList[i] ? 'PRODUCTION PLANNING DEPT 1' : '';

      ['B', 'C', 'D', 'E'].forEach(col => {
        const c = worksheet.getCell(`${col}${rowIdx}`);
        c.font = col === 'B' ? dataFontStt : dataFont;
        c.border = borderStyle;
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      
      worksheet.getCell(`G${rowIdx}`).value = dinnerList[i] ? i + 1 : '';
      worksheet.getCell(`H${rowIdx}`).value = dinnerList[i] ? dinnerList[i].id : '';
      worksheet.getCell(`I${rowIdx}`).value = dinnerList[i] ? dinnerList[i].name : '';
      worksheet.getCell(`J${rowIdx}`).value = dinnerList[i] ? 'PRODUCTION PLANNING DEPT 1' : '';

      ['G', 'H', 'I', 'J'].forEach(col => {
        const c = worksheet.getCell(`${col}${rowIdx}`);
        c.font = col === 'G' ? dataFontStt : dataFont;
        c.border = borderStyle;
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const fileName = `Danh sách đăng kí cơm chay ${mm}.${yyyy}.xlsx`;
    
    saveAs(new Blob([buffer]), fileName);
  };

  const allIdsSet = new Set(registrations.map(r => r.id));
  regHistory.forEach(h => allIdsSet.add(h.id));
  const suggestedIds = Array.from(allIdsSet).filter(id => id.includes(idInput) && id !== idInput && !hiddenIds.includes(id)).sort((a, b) => Number(a) - Number(b));

  const allNamesSet = new Set(registrations.map(r => r.name));
  regHistory.forEach(h => allNamesSet.add(h.name));
  const suggestedNames = Array.from(allNamesSet).filter(name => name.includes(nameInput) && name !== nameInput && !hiddenNames.includes(name)).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6 sm:space-y-8 w-full relative">
      {statusMessage && (
        <ToastNotification 
          message={statusMessage.text} 
          type={statusMessage.type} 
          onClose={() => setStatusMessage(null)} 
        />
      )}
      
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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <span>Danh Sách Đăng Ký Cơm Chay</span>
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Áp dụng: {getDkChaySessionDate().displayDate}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shadow-blue-900/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm mới</span>
          </button>
          {selectedIndices.length === 1 && (
            <button 
              onClick={() => handleStartEdit(selectedIndices[0])}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shadow-amber-900/20"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          )}
          {selectedIndices.length > 0 && (
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shadow-red-900/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          )}
          <button 
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm shadow-sky-900/20"
            title="Tải lại danh sách đăng ký mới nhất từ server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={registrations.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Tổng số đăng ký
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {registrations.length}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">người</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Suất ăn ca sáng
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {registrations.filter(r => r.isLunch).length}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">suất</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Suất ăn ca chiều
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {registrations.filter(r => r.isDinner).length}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">suất</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-full flex flex-col overflow-hidden min-h-[50vh]">
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-sm text-left border-collapse border border-slate-200 dark:border-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-900/50 sticky top-0 shadow-sm z-10">
              <tr>
                <th rowSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[10%] text-center">STT</th>
                <th rowSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[20%] text-center">MÃ SỐ</th>
                <th rowSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[40%] text-center">HỌ VÀ TÊN</th>
                <th colSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[30%] text-center">CA ĂN</th>
              </tr>
              <tr>
                <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[15%] text-center uppercase">CA SÁNG</th>
                <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[15%] text-center uppercase">CA CHIỀU</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs sm:text-sm font-medium">
                    Chưa có ai đăng ký cơm chay hôm nay. Bấm nút <strong className="text-slate-700 dark:text-slate-300">"Thêm mới"</strong> ở góc trên bên phải để đăng ký.
                  </td>
                </tr>
              ) : (
                registrations.map((reg, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => handleToggleSelect(idx)}
                    className={`cursor-pointer ${selectedIndices.includes(idx) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                  >
                    <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-center">{idx + 1}</td>
                    <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-center">{reg.id}</td>
                    <td className="px-4 py-2 font-medium border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-center">{reg.name}</td>
                    <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-center">
                      {reg.isLunch && <Check className="w-5 h-5 mx-auto text-emerald-500" strokeWidth={3} />}
                    </td>
                    <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-center">
                      {reg.isDinner && <Check className="w-5 h-5 mx-auto text-emerald-500" strokeWidth={3} />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white uppercase">
                {editingIndex !== null ? 'SỬA THÔNG TIN' : 'THÊM NGƯỜI ĐĂNG KÝ'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-visible">
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 uppercase">MÃ SỐ</label>
                  <input 
                    type="text" 
                    value={idInput}
                    onFocus={() => setShowIdSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowIdSuggestions(false), 200)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[0-9]*$/.test(val)) {
                        setIdInput(val);
                      }
                    }}
                    className="uppercase w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    required
                  />
                  {showIdSuggestions && suggestedIds.length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl max-h-48 overflow-y-auto z-[60]">
                      {suggestedIds.map(id => (
                        <div key={id} onClick={() => { setIdInput(id); const found = registrations.find(r => r.id === id) || regHistory.find(h => h.id === id); if (found) setNameInput(found.name); }} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors flex justify-between items-center group">
                          <span>{id}</span>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setHiddenIds(prev => [...prev, id]); 
                              
                              const inputEl = e.currentTarget.closest('.relative')?.querySelector('input');
                              if (inputEl) inputEl.focus();
                            }} 
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa gợi ý này"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 uppercase">HỌ VÀ TÊN</label>
                  <input 
                    type="text" 
                    value={nameInput}
                    onFocus={() => setShowNameSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (!/[0-9]/.test(val)) {
                        setNameInput(val);
                      }
                    }}
                    className="uppercase w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    required
                  />
                  {showNameSuggestions && suggestedNames.length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl max-h-48 overflow-y-auto z-[60]">
                      {suggestedNames.map(name => (
                        <div key={name} onClick={() => { setNameInput(name); const found = registrations.find(r => r.name === name) || regHistory.find(h => h.name === name); if (found && !idInput) setIdInput(found.id); }} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors uppercase flex justify-between items-center group">
                          <span>{name}</span>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setHiddenNames(prev => [...prev, name]); 
                              const inputEl = e.currentTarget.closest('.relative')?.querySelector('input');
                              if (inputEl) inputEl.focus();
                            }} 
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa gợi ý này"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 uppercase">CHỌN CA ĂN</label>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isLunch}
                        onChange={(e) => setIsLunch(e.target.checked)}
                        className="w-4.5 h-4.5 text-orange-500 focus:ring-orange-500 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase">CA SÁNG</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isDinner}
                        onChange={(e) => setIsDinner(e.target.checked)}
                        className="w-4.5 h-4.5 text-indigo-500 focus:ring-indigo-500 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase">CA CHIỀU</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors uppercase"
                  >
                    HỦY
                  </button>
                  <button 
                    type="submit"
                    disabled={!idInput || !nameInput || (!isLunch && !isDinner) || (editingIndex !== null && registrations[editingIndex] && registrations[editingIndex].id === idInput && registrations[editingIndex].name === nameInput.toUpperCase() && registrations[editingIndex].isLunch === isLunch && registrations[editingIndex].isDinner === isDinner)}
                    className="flex-[2] py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded-xl font-medium transition-colors shadow-sm"
                  >
                    {editingIndex !== null ? 'LƯU' : 'THÊM'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                XÁC NHẬN XÓA
              </h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Bạn có chắc muốn xóa <span className="font-bold text-slate-900 dark:text-white">{selectedIndices.map(i => registrations[i]?.name).filter(Boolean).join(', ')}</span>?
              </p>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  HỦY
                </button>
                <button 
                  onClick={() => {
                    handleDeleteSelected();
                    setIsDeleteModalOpen(false);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-500/20"
                >
                  XÓA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
