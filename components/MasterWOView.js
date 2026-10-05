'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Wrench, 
  Zap, 
  FileUp, 
  AlertCircle,
  HelpCircle,
  User,
  Phone,
  Ruler
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function MasterWOView({ 
  masterList = [], 
  onRefresh, 
  onSelectForAudit 
}) {
  const [activeSubTab, setActiveSubTab] = useState('ALL'); // 'ALL' | 'PSB' | 'GANGGUAN'
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadTargetPekerjaan, setUploadTargetPekerjaan] = useState('AUTO'); // 'AUTO' | 'PSB' | 'GANGGUAN'
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual form state
  const [manualForm, setManualForm] = useState({
    nomor_wo: '',
    pekerjaan: 'PSB',
    nama_pelanggan: '',
    nomor_telepon: '',
    nama_teknisi: '',
    panjang_kabel: '',
    alamat: '',
  });

  const fileInputRef = useRef(null);

  // Filtered master list
  const filteredList = useMemo(() => {
    return masterList.filter((item) => {
      const matchSearch =
        (item.nomor_wo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nama_pelanggan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nama_teknisi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nomor_telepon || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchPekerjaan = activeSubTab === 'ALL' || item.pekerjaan === activeSubTab;
      return matchSearch && matchPekerjaan;
    });
  }, [masterList, searchTerm, activeSubTab]);

  // Statistics
  const stats = useMemo(() => {
    const total = masterList.length;
    const psb = masterList.filter((i) => i.pekerjaan === 'PSB').length;
    const gangguan = masterList.filter((i) => i.pekerjaan === 'GANGGUAN').length;
    const audited = masterList.filter((i) => i.is_audited).length;
    const pending = total - audited;
    return { total, psb, gangguan, audited, pending };
  }, [masterList]);

  // Download Sample Template for Excel / CSV
  const handleDownloadTemplate = (type = 'xlsx') => {
    const sampleData = [
      {
        'Nomor WO': 'WO-100801',
        'Pekerjaan': 'PSB',
        'Nama Pelanggan': 'Budi Santoso',
        'Nomor Telepon': '081234567890',
        'Nama Teknisi': 'Tim Bravo',
        'Panjang Kabel': '120',
        'Alamat': 'Jl. Yos Sudarso No. 10, Tarakan',
      },
      {
        'Nomor WO': 'WO-100802',
        'Pekerjaan': 'PSB',
        'Nama Pelanggan': 'IYAY',
        'Nomor Telepon': '081361271787',
        'Nama Teknisi': 'Ahmad & Tim Borneo',
        'Panjang Kabel': '135',
        'Alamat': 'Jl. Kusuma Bangsa, Tarakan',
      },
      {
        'Nomor WO': 'WO-200901',
        'Pekerjaan': 'GANGGUAN',
        'Nama Pelanggan': 'Ibu Nurhayati',
        'Nomor Telepon': '085244556677',
        'Nama Teknisi': 'Agus Saputra',
        'Panjang Kabel': '85',
        'Alamat': 'Jl. Mulawarman RT 05, Tarakan',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master_WO');

    XLSX.writeFile(workbook, `Template_Master_WO_Tarakan.${type}`);
  };

  // Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadStatus(null);

      const formData = new FormData();
      formData.append('file', file);
      if (uploadTargetPekerjaan !== 'AUTO') {
        formData.append('default_pekerjaan', uploadTargetPekerjaan);
      }

      const res = await fetch('/api/master-wo/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengunggah berkas spreadsheet');
      }

      setUploadStatus({
        type: 'success',
        message: json.message || `Berhasil mengimpor ${json.count} data Master WO!`,
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat memproses data',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete single master WO
  const handleDelete = async (id, nomorWo) => {
    if (!window.confirm(`Hapus data Master WO ${nomorWo}?`)) return;

    try {
      const res = await fetch(`/api/master-wo/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (onRefresh) onRefresh();
      } else {
        alert(json.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  // Clear all master data
  const handleClearAll = async () => {
    const target = activeSubTab === 'ALL' ? 'Semua' : activeSubTab;
    if (!window.confirm(`PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data Master WO (${target})?`)) {
      return;
    }

    try {
      const url = activeSubTab === 'ALL' ? '/api/master-wo' : `/api/master-wo?pekerjaan=${activeSubTab}`;
      const res = await fetch(url, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (onRefresh) onRefresh();
      } else {
        alert(json.error || 'Gagal mengosongkan');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  // Submit manual single WO
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.nomor_wo.trim()) {
      alert('Nomor WO wajib diisi');
      return;
    }

    try {
      const res = await fetch('/api/master-wo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualForm),
      });
      const json = await res.json();
      if (json.success) {
        setShowManualModal(false);
        setManualForm({
          nomor_wo: '',
          pekerjaan: 'PSB',
          nama_pelanggan: '',
          nomor_telepon: '',
          nama_teknisi: '',
          panjang_kabel: '',
          alamat: '',
        });
        if (onRefresh) onRefresh();
      } else {
        alert(json.error || 'Gagal menyimpan');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Pengisian Otomatis Form Uji Petik
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Upload & Master Data WO (PSB & Gangguan)
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Unggah file Excel/CSV daftar tiket PSB atau Gangguan. Saat teknisi/auditor memasukkan nomor WO di menu formulir, <strong>semua data panjang kabel, nama pelanggan, nomor telepon, dan nama teknisi akan terisi otomatis</strong>!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleDownloadTemplate('xlsx')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh Template Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah WO Manual</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Master WO
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Semua Tiket Terdaftar</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm bg-blue-50/20">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Data PSB
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {stats.psb}
          </div>
          <div className="text-[11px] text-blue-500 mt-0.5">Pasang Baru</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Data Gangguan
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {stats.gangguan}
          </div>
          <div className="text-[11px] text-amber-500 mt-0.5">Tiket Perbaikan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Sudah Uji Petik
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {stats.audited}
          </div>
          <div className="text-[11px] text-emerald-500 mt-0.5">Tervalidasi</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Belum Uji Petik
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {stats.pending}
          </div>
          <div className="text-[11px] text-rose-500 mt-0.5">Menunggu Di-audit</div>
        </div>
      </div>

      {/* UPLOAD BOX SECTION */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-6 sm:p-8 mb-8 shadow-sm hover:border-indigo-400 transition-all bg-indigo-50/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <FileUp className="w-7 h-7" />
          </div>
          
          <h3 className="font-extrabold text-lg text-slate-800">
            Unggah Berkas Spreadsheet (Excel / CSV)
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
            Mendukung format <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>. Sistem otomatis membaca kolom: Nomor WO, Pekerjaan (PSB/Gangguan), Nama Pelanggan, No Telepon, Nama Teknisi, dan Panjang Kabel.
          </p>

          {/* Target Pekerjaan Option */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-xs font-bold text-slate-600">Kategori Data:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadTargetPekerjaan('AUTO')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  uploadTargetPekerjaan === 'AUTO' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                Otomatis dari Kolom
              </button>
              <button
                type="button"
                onClick={() => setUploadTargetPekerjaan('PSB')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  uploadTargetPekerjaan === 'PSB' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                Khusus Data PSB
              </button>
              <button
                type="button"
                onClick={() => setUploadTargetPekerjaan('GANGGUAN')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  uploadTargetPekerjaan === 'GANGGUAN' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600'
                }`}
              >
                Khusus Gangguan
              </button>
            </div>
          </div>

          {/* Upload Button */}
          <div className="mt-5">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
              id="master-file-upload"
            />
            <label
              htmlFor="master-file-upload"
              className={`cursor-pointer inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang Mengimpor Data...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Pilih Berkas Excel / CSV</span>
                </>
              )}
            </label>
          </div>

          {/* Upload Status Notification */}
          {uploadStatus && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto ${
              uploadStatus.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{uploadStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* FILTER & TABS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Sub-tabs: Semua, PSB, Gangguan */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({masterList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('PSB')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'PSB'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Data PSB ({stats.psb})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('GANGGUAN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'GANGGUAN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Data Gangguan ({stats.gangguan})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari Nomor WO, Pelanggan, atau Teknisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs text-slate-800"
            />
          </div>

          {filteredList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              title="Kosongkan data pada kategori ini"
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* DATA TABLE */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-800">
            Belum Ada Data Master Workorder
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {searchTerm || activeSubTab !== 'ALL'
              ? 'Tidak ada data WO yang cocok dengan pencarian atau filter saat ini.'
              : 'Silakan unggah file Excel/CSV atau klik "Tambah WO Manual" di atas.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nomor WO</th>
                  <th className="py-3.5 px-4">Pekerjaan</th>
                  <th className="py-3.5 px-4">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Nomor Telepon</th>
                  <th className="py-3.5 px-4">Teknisi</th>
                  <th className="py-3.5 px-4">Tarikan</th>
                  <th className="py-3.5 px-4 text-center">Status Audit</th>
                  <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        {item.nomor_wo}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        item.pekerjaan === 'PSB'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.pekerjaan === 'PSB' ? <Sparkles className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                        <span>{item.pekerjaan}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.nama_pelanggan}</div>
                      {item.alamat && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.alamat}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600">{item.nomor_telepon || '-'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{item.nama_teknisi || '-'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{item.panjang_kabel} meter</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.is_audited ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sudah Di-uji</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Belum Di-uji</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Shortcut to Input Form with this WO auto-selected */}
                        <button
                          type="button"
                          onClick={() => onSelectForAudit(item)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Input Form Uji Petik</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.nomor_wo)}
                          title="Hapus master WO ini"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* MODAL MANUAL INPUT WO */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">
                Tambah Master Workorder Manual
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nomor Workorder (WO) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: WO-109283"
                  value={manualForm.nomor_wo}
                  onChange={(e) => setManualForm({ ...manualForm, nomor_wo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Jenis Pekerjaan
                </label>
                <select
                  value={manualForm.pekerjaan}
                  onChange={(e) => setManualForm({ ...manualForm, pekerjaan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50"
                >
                  <option value="PSB">PSB (Pasang Baru)</option>
                  <option value="GANGGUAN">GANGGUAN (Perbaikan)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: IYAY"
                    value={manualForm.nama_pelanggan}
                    onChange={(e) => setManualForm({ ...manualForm, nama_pelanggan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    placeholder="081361271787"
                    value={manualForm.nomor_telepon}
                    onChange={(e) => setManualForm({ ...manualForm, nomor_telepon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Teknisi
                  </label>
                  <input
                    type="text"
                    placeholder="Nama teknisi / regu"
                    value={manualForm.nama_teknisi}
                    onChange={(e) => setManualForm({ ...manualForm, nama_teknisi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Panjang Tarikan (meter)
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    value={manualForm.panjang_kabel}
                    onChange={(e) => setManualForm({ ...manualForm, panjang_kabel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Alamat Pelanggan
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat rumah / titik tiang..."
                  value={manualForm.alamat}
                  onChange={(e) => setManualForm({ ...manualForm, alamat: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  Simpan Master WO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
