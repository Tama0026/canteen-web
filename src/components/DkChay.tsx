'use client';

import React, { useState, useEffect } from 'react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { X, Download, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface Registration {
  id: string;
  name: string;
  isLunch: boolean;
  isDinner: boolean;
}

export default function DkChay() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [idInput, setIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLunch, setIsLunch] = useState(false);
  const [isDinner, setIsDinner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showIdSuggestions, setShowIdSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('canteen_dkchay_registrations');
    if (saved) {
      try {
        setRegistrations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved data');
      }
    }
    const hidIds = localStorage.getItem('canteen_hidden_ids');
    if (hidIds) {
      try { setHiddenIds(JSON.parse(hidIds)); } catch(e) {}
    }
    const hidNames = localStorage.getItem('canteen_hidden_names');
    if (hidNames) {
      try { setHiddenNames(JSON.parse(hidNames)); } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('canteen_dkchay_registrations', JSON.stringify(registrations));
      localStorage.setItem('canteen_hidden_ids', JSON.stringify(hiddenIds));
      localStorage.setItem('canteen_hidden_names', JSON.stringify(hiddenNames));
    }
  }, [registrations, hiddenIds, hiddenNames, isLoaded]);

  const openAddModal = () => {
    setIdInput('');
    setNameInput('');
    setIsLunch(false);
    setIsDinner(false);
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInput || !nameInput || (!isLunch && !isDinner)) return;

    if (editingIndex !== null) {
      const newRegs = [...registrations];
      newRegs[editingIndex] = {
        id: idInput,
        name: nameInput.toUpperCase(),
        isLunch,
        isDinner
      };
      setRegistrations(newRegs);
    } else {
      setRegistrations([
        ...registrations,
        {
          id: idInput,
          name: nameInput.toUpperCase(),
          isLunch,
          isDinner,
        }
      ]);
    }
    
    
    setIdInput('');
    setNameInput('');
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

  const handleDeleteSelected = () => {
    setRegistrations(registrations.filter((_, i) => !selectedIndices.includes(i)));
    setSelectedIndices([]);
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

    
    const lunchBg = 'FFFAc090'; // light orange
    const dinnerBg = 'FF5b9bd5'; // blue
    const headerBg = 'FFFFe699'; // yellow
    
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
    
    worksheet.getColumn('A').width = 3.56;  // 25 pixels
    worksheet.getColumn('B').width = 7.28;  // 51 pixels
    worksheet.getColumn('C').width = 17.85; // 125 pixels
    worksheet.getColumn('D').width = 45.56; // 319 pixels
    worksheet.getColumn('E').width = 50.56; // 354 pixels
    worksheet.getColumn('F').width = 11.42; // 80 pixels
    worksheet.getColumn('G').width = 7.28;  // 51 pixels
    worksheet.getColumn('H').width = 17.85; // 125 pixels
    worksheet.getColumn('I').width = 45.56; // 319 pixels
    worksheet.getColumn('J').width = 50.56; // 354 pixels
    worksheet.getColumn('K').width = 11.42; // 80 pixels

    
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

    
    worksheet.getRow(1).height = 43.5; // 58 pixels
    worksheet.getRow(2).height = 36;   // 48 pixels
    worksheet.getRow(3).height = 22.5; // 30 pixels

    
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


    
    const sortedRegistrations = [...registrations].sort((a, b) => Number(a.id) - Number(b.id));
    const lunchList = sortedRegistrations.filter(r => r.isLunch);
    const dinnerList = sortedRegistrations.filter(r => r.isDinner);
    
    
    const maxRows = Math.max(10, lunchList.length, dinnerList.length);

    for (let i = 0; i < maxRows; i++) {
      const rowIdx = 4 + i;
      const row = worksheet.getRow(rowIdx);
      row.height = 16.5; // 22 pixels
      
      
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
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-full flex flex-col overflow-hidden min-h-[70vh]">
      
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase">
          DANH SÁCH ĐĂNG KÝ CƠM CHAY
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            ADD
          </button>
          {selectedIndices.length === 1 && (
            <button 
              onClick={() => handleStartEdit(selectedIndices[0])}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              EDIT
            </button>
          )}
          {selectedIndices.length > 0 && (
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>
          )}
          <button 
            onClick={handleExport}
            disabled={registrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0">
            {registrations.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400 text-sm">
                Chưa có người đăng ký nào.
              </div>
            ) : (
              <table className="w-full text-sm text-left border-collapse border border-slate-200 dark:border-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-900/50 sticky top-0 shadow-sm z-10">
                  <tr>
                    <th rowSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[10%] text-center">STT</th>
                    <th rowSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[20%] text-center">MÃ SỐ</th>
                    <th rowSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[40%] text-center">HỌ VÀ TÊN</th>
                    <th colSpan={2} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[30%] text-center">BỮA</th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[15%] text-center">TRƯA</th>
                    <th className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-[15%] text-center">CHIỀU</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, idx) => (
                    <tr 
                      key={idx}
                      onClick={() => handleToggleSelect(idx)}
                      className={`cursor-pointer ${selectedIndices.includes(idx) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                    >
                      <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-center">{idx + 1}</td>
                      <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-center">{reg.id}</td>
                      <td className="px-4 py-2 font-medium border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">{reg.name}</td>
                      <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-center">
                        {reg.isLunch && <Check className="w-5 h-5 mx-auto text-emerald-500" strokeWidth={3} />}
                      </td>
                      <td className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-center">
                        {reg.isDinner && <Check className="w-5 h-5 mx-auto text-emerald-500" strokeWidth={3} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                  {showIdSuggestions && Array.from(new Set(registrations.map(r => r.id))).filter(id => id.includes(idInput) && id !== idInput && !hiddenIds.includes(id)).length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl max-h-48 overflow-y-auto z-[60]">
                      {Array.from(new Set(registrations.map(r => r.id)))
                        .filter(id => id.includes(idInput) && id !== idInput && !hiddenIds.includes(id))
                        .sort((a, b) => Number(a) - Number(b))
                        .map(id => (
                        <div key={id} onClick={() => setIdInput(id)} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors flex justify-between items-center group">
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
                  {showNameSuggestions && Array.from(new Set(registrations.map(r => r.name))).filter(name => name.includes(nameInput) && name !== nameInput && !hiddenNames.includes(name)).length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl max-h-48 overflow-y-auto z-[60]">
                      {Array.from(new Set(registrations.map(r => r.name)))
                        .filter(name => name.includes(nameInput) && name !== nameInput && !hiddenNames.includes(name))
                        .sort((a, b) => a.localeCompare(b))
                        .map(name => (
                        <div key={name} onClick={() => setNameInput(name)} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors uppercase flex justify-between items-center group">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 uppercase">BỮA</label>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isLunch}
                        onChange={(e) => setIsLunch(e.target.checked)}
                        className="w-4.5 h-4.5 text-orange-500 focus:ring-orange-500 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase">TRƯA</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isDinner}
                        onChange={(e) => setIsDinner(e.target.checked)}
                        className="w-4.5 h-4.5 text-blue-500 focus:ring-blue-500 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase">CHIỀU</span>
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
                    disabled={!idInput || !nameInput || (!isLunch && !isDinner)}
                    className="flex-[2] py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded-xl font-medium transition-colors shadow-sm"
                  >
                    {editingIndex !== null ? 'LƯU' : 'ADD'}
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
