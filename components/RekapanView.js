'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Wrench, 
  FileSpreadsheet,
  AlertCircle,
  PlusCircle,
  Camera,
  Layers,
  BarChart3
} from 'lucide-react';
import { CHECKLIST_ITEMS } from '@/lib/checklistItems';

export default function RekapanView({ 
  items = [], 
  onRefresh, 
  onSelectDetail, 
  onSelectPrint, 
  onDelete, 
  onSwitchToForm 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPekerjaan, setFilterPekerjaan] = useState('ALL');
  const [filterHasil, setFilterHasil] = useState('ALL');

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        (item.nomor_wo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nama_pelanggan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nama_teknisi || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchPekerjaan = filterPekerjaan === 'ALL' || item.pekerjaan === filterPekerjaan;
      const matchHasil = filterHasil === 'ALL' || item.hasil_audit === filterHasil;

      return matchSearch && matchPekerjaan && matchHasil;
    });
  }, [items, searchTerm, filterPekerjaan, filterHasil]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const psb = items.filter((i) => i.pekerjaan === 'PSB').length;
    const gangguan = items.filter((i) => i.pekerjaan === 'GANGGUAN').length;
    const lolos = items.filter((i) => i.hasil_audit === 'Lolos').length;
    const perbaikan = items.filter((i) => i.hasil_audit === 'Perlu Perbaikan').length;
    return { total, psb, gangguan, lolos, perbaikan };
  }, [items]);

  // Export to CSV for Excel
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }

    const headers = [
      'ID',
      'Waktu Audit',
      'Pekerjaan',
      'Nomor WO',
      'Nama Pelanggan',
      'Nama Teknisi',
      'Panjang Kabel',
      'ODP Status',
      'ODP Foto',
      'Label DC Status',
      'Label DC Foto',
      'S-Clamp Status',
      'S-Clamp Foto',
      'Stoper Status',
      'Stoper Foto',
      'Clamp Pelanggan Status',
      'Clamp Pelanggan Foto',
      'IKR Status',
      'IKR Foto',
      'Dropcore Baru Status',
      'Dropcore Baru Foto',
      'Hasil Audit',
      'Catatan Evaluator'
    ];

    const rows = filteredItems.map((item) => [
      item.id,
      `"${item.timestamp || ''}"`,
      `"${item.pekerjaan || ''}"`,
      `"${item.nomor_wo || ''}"`,
      `"${(item.nama_pelanggan || '').replace(/"/g, '""')}"`,
      `"${(item.nama_teknisi || '').replace(/"/g, '""')}"`,
      `"${item.panjang_kabel || ''}"`,
      `"${item.odp_status || ''}"`,
      `"${item.odp_foto || ''}"`,
      `"${item.label_dc_status || ''}"`,
      `"${item.label_dc_foto || ''}"`,
      `"${item.sclamp_status || ''}"`,
      `"${item.sclamp_foto || ''}"`,
      `"${item.stoper_status || ''}"`,
      `"${item.stoper_foto || ''}"`,
      `"${item.clamp_pelanggan_status || ''}"`,
      `"${item.clamp_pelanggan_foto || ''}"`,
      `"${item.ikr_status || ''}"`,
      `"${item.ikr_foto || ''}"`,
      `"${item.dropcore_baru_status || ''}"`,
      `"${item.dropcore_baru_foto || ''}"`,
      `"${item.hasil_audit || ''}"`,
      `"${(item.catatan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekapan_Uji_Petik_Tarakan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold uppercase tracking-wider mb-2 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-red-500" /> Database & Laporan Lapangan
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Rekapan Data Uji Petik
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Semua riwayat hasil uji petik teknisi tersimpan rapi dalam database dengan verifikasi 7 bukti foto instalasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export ke Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToForm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Data Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Uji Petik
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Semua Pekerjaan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm bg-blue-50/20">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Pasang Baru (PSB)
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {stats.psb}
          </div>
          <div className="text-[11px] text-blue-500 mt-0.5">Instalasi Baru</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Gangguan
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {stats.gangguan}
          </div>
          <div className="text-[11px] text-amber-500 mt-0.5">Maintenance/Tiket</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Lolos Uji Petik
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {stats.lolos}
          </div>
          <div className="text-[11px] text-emerald-500 mt-0.5">Sesuai SOP</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Perlu Perbaikan
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {stats.perbaikan}
          </div>
          <div className="text-[11px] text-rose-500 mt-0.5">Temuan Lapangan</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan Nomor WO, Nama Pelanggan, atau Teknisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm text-slate-800"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Pekerjaan Filter */}
          <select
            value={filterPekerjaan}
            onChange={(e) => setFilterPekerjaan(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="ALL">Semua Pekerjaan</option>
            <option value="PSB">Hanya PSB</option>
            <option value="GANGGUAN">Hanya Gangguan</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterHasil}
            onChange={(e) => setFilterHasil(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="ALL">Semua Status Hasil</option>
            <option value="Lolos">Lolos</option>
            <option value="Perlu Perbaikan">Perlu Perbaikan</option>
            <option value="Tidak Lolos">Tidak Lolos</option>
          </select>
        </div>

      </div>

      {/* Main Table / Card List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-800">
            Belum Ada Data Uji Petik
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {searchTerm || filterPekerjaan !== 'ALL' || filterHasil !== 'ALL'
              ? 'Tidak ada data yang sesuai dengan kriteria pencarian dan filter Anda.'
              : 'Silakan isi formulir uji petik di tab "Input Form" untuk merekam data pekerjaan teknisi.'}
          </p>
          <button
            onClick={onSwitchToForm}
            className="mt-5 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Input Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Waktu & Tanggal</th>
                  <th className="py-3.5 px-4">Pekerjaan</th>
                  <th className="py-3.5 px-4">Nomor WO</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Teknisi</th>
                  <th className="py-3.5 px-4">Tarikan</th>
                  <th className="py-3.5 px-4 text-center">Bukti Foto</th>
                  <th className="py-3.5 px-4 text-center">Hasil</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredItems.map((item, index) => {
                  // Count photos in this item
                  const photoCount = CHECKLIST_ITEMS.filter((ci) => Boolean(item[ci.fotoField])).length;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 whitespace-nowrap">
                          {item.timestamp}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          item.pekerjaan === 'PSB'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.pekerjaan === 'PSB' ? (
                            <Sparkles className="w-3 h-3" />
                          ) : (
                            <Wrench className="w-3 h-3" />
                          )}
                          <span>{item.pekerjaan}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {item.nomor_wo}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">
                          {item.nama_pelanggan}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-700">
                          {item.nama_teknisi}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-600">
                          {item.panjang_kabel}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          photoCount === 7
                            ? 'bg-emerald-100 text-emerald-700'
                            : photoCount > 0
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          <Camera className="w-3 h-3" />
                          <span>{photoCount}/7 Foto</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          item.hasil_audit === 'Lolos'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.hasil_audit === 'Perlu Perbaikan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.hasil_audit}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectDetail(item)}
                            title="Lihat Detail & Foto"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectPrint(item)}
                            title="Cetak Berita Acara"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDelete(item.id)}
                            title="Hapus Data"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const photoCount = CHECKLIST_ITEMS.filter((ci) => Boolean(item[ci.fotoField])).length;

              return (
                <div key={item.id} className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase mb-1 ${
                        item.pekerjaan === 'PSB'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.pekerjaan === 'PSB' ? <Sparkles className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                        <span>{item.pekerjaan}</span>
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {item.nomor_wo}
                      </h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      item.hasil_audit === 'Lolos'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.hasil_audit === 'Perlu Perbaikan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.hasil_audit}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-400">Pelanggan:</span>{' '}
                      <span className="font-bold text-slate-800">{item.nama_pelanggan}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Teknisi:</span>{' '}
                      <span>{item.nama_teknisi}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span>Tarikan: <strong>{item.panjang_kabel}</strong></span>
                      <span>Foto: <strong>{photoCount}/7</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectDetail(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>

                      <button
                        onClick={() => onSelectPrint(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak</span>
                      </button>

                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
