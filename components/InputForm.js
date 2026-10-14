'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  Ruler, 
  Send, 
  RotateCcw, 
  ZoomIn, 
  Sparkles, 
  Wrench, 
  Check, 
  AlertCircle,
  HelpCircle,
  Zap,
  Search,
  ChevronDown
} from 'lucide-react';
import { CHECKLIST_ITEMS } from '@/lib/checklistItems';
import { compressImage } from '@/lib/compressImage';

function formatIndonesianDateTime(date = new Date()) {
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const d = date.getDate();
  const m = bulan[date.getMonth()];
  const y = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${d} ${m} ${y} ${hours}:${minutes} WITA`;
}

export default function InputForm({ 
  onSuccessSubmit, 
  onSwitchToRekapan, 
  onSwitchToMasterWO,
  prefilledWO = null 
}) {
  // Timestamp automatically sets to current date, month, year, hour, minute
  const [timestamp, setTimestamp] = useState('');
  const [pekerjaan, setPekerjaan] = useState('PSB'); // 'PSB' or 'GANGGUAN'
  const [nomorWo, setNomorWo] = useState('');
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [namaTeknisi, setNamaTeknisi] = useState('');
  const [panjangKabel, setPanjangKabel] = useState('');
  const [catatan, setCatatan] = useState('');
  const [hasilAudit, setHasilAudit] = useState('Lolos');

  // Master WO & Auto-fill state
  const [masterList, setMasterList] = useState([]);
  const [autoFilledFromWO, setAutoFilledFromWO] = useState(null);
  const [showWODropdown, setShowWODropdown] = useState(false);
  const [showWOPickerModal, setShowWOPickerModal] = useState(false);
  const [woSearchQuery, setWoSearchQuery] = useState('');

  // Checklist state
  const [checklist, setChecklist] = useState(() => {
    const initial = {};
    CHECKLIST_ITEMS.forEach((item) => {
      initial[item.id] = {
        status: 'Sesuai',
        foto: '',
      };
    });
    return initial;
  });

  // UI state
  const [uploadingItemId, setUploadingItemId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // Fetch Master WO list for autocomplete
  useEffect(() => {
    setTimestamp(formatIndonesianDateTime(new Date()));
    fetchMasterList();
  }, []);

  const fetchMasterList = async () => {
    try {
      const res = await fetch('/api/master-wo');
      const json = await res.json();
      if (json.success) {
        setMasterList(json.data || []);
      }
    } catch (e) {
      console.error('Failed to load master WO list:', e);
    }
  };

  // If prefilledWO was provided by parent
  useEffect(() => {
    if (prefilledWO) {
      applyMasterWO(prefilledWO);
    }
  }, [prefilledWO]);

  // Apply a Master WO object to form
  const applyMasterWO = (masterItem) => {
    if (!masterItem) return;

    setNomorWo(masterItem.nomor_wo);
    setPekerjaan(masterItem.pekerjaan || 'PSB');
    setNamaPelanggan(masterItem.nama_pelanggan || '');
    setNoTelp(masterItem.nomor_telepon || '');
    setNamaTeknisi(masterItem.nama_teknisi || '');
    setPanjangKabel(masterItem.panjang_kabel ? String(masterItem.panjang_kabel) : '');
    setAutoFilledFromWO(masterItem.nomor_wo);
    setShowWODropdown(false);
    setShowWOPickerModal(false);
  };

  // Lookup WO in Master list when typing
  const handleWOChange = (val) => {
    setNomorWo(val);
    if (!val.trim()) {
      setShowWODropdown(false);
      return;
    }

    setShowWODropdown(true);

    // Exact match check
    const match = masterList.find(
      (m) => (m.nomor_wo || '').trim().toUpperCase() === val.trim().toUpperCase()
    );
    if (match) {
      applyMasterWO(match);
    }
  };

  // Filter master items for dropdown suggestion
  const suggestions = masterList.filter((m) =>
    (m.nomor_wo || '').toLowerCase().includes(nomorWo.toLowerCase()) ||
    (m.nama_pelanggan || '').toLowerCase().includes(nomorWo.toLowerCase())
  ).slice(0, 5);

  const handleRefreshTimestamp = () => {
    setTimestamp(formatIndonesianDateTime(new Date()));
  };

  const handleStatusChange = (itemId, newStatus) => {
    setChecklist((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status: newStatus,
      },
    }));
  };

  const handleFileUpload = async (itemId, file) => {
    if (!file) return;

    try {
      setUploadingItemId(itemId);
      setErrorMsg('');

      // 1. Compress image before uploading
      const compressed = await compressImage(file, 1280, 0.75);

      // 2. Upload to server
      const formData = new FormData();
      formData.append('file', compressed);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengupload foto');
      }

      // 3. Store photo URL
      setChecklist((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          foto: json.url,
        },
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMsg(`Gagal upload foto ${itemId}: ${err.message}`);
    } finally {
      setUploadingItemId(null);
    }
  };

  const handleRemovePhoto = (itemId) => {
    setChecklist((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        foto: '',
      },
    }));
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan form input ini?')) {
      setTimestamp(formatIndonesianDateTime(new Date()));
      setPekerjaan('PSB');
      setNomorWo('');
      setNamaPelanggan('');
      setNoTelp('');
      setNamaTeknisi('');
      setPanjangKabel('');
      setCatatan('');
      setHasilAudit('Lolos');
      setAutoFilledFromWO(null);

      const resetChecklist = {};
      CHECKLIST_ITEMS.forEach((item) => {
        resetChecklist[item.id] = { status: 'Sesuai', foto: '' };
      });
      setChecklist(resetChecklist);
      setErrorMsg('');
      setSubmitSuccess(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitSuccess(null);

    // Validation
    if (!nomorWo.trim()) {
      setErrorMsg('Nomor Workorder wajib diisi (contoh: WO12345)');
      return;
    }
    if (!namaPelanggan.trim()) {
      setErrorMsg('Nama Pelanggan wajib diisi');
      return;
    }
    if (!namaTeknisi.trim()) {
      setErrorMsg('Nama Teknisi wajib diisi');
      return;
    }
    if (!panjangKabel.trim()) {
      setErrorMsg('Panjang Kabel/Tarikan wajib diisi');
      return;
    }

    // Format nama pelanggan dengan nomor telp jika diisi
    const formattedPelanggan = noTelp.trim()
      ? `${namaPelanggan.trim()} (${noTelp.trim()})`
      : namaPelanggan.trim();

    // Prepare payload
    const payload = {
      timestamp,
      pekerjaan,
      nomor_wo: nomorWo.trim().toUpperCase(),
      nama_pelanggan: formattedPelanggan,
      nama_teknisi: namaTeknisi.trim(),
      panjang_kabel: `${panjangKabel.trim()} meter`,
      
      odp_status: checklist.odp.status,
      odp_foto: checklist.odp.foto,
      
      label_dc_status: checklist.label_dc.status,
      label_dc_foto: checklist.label_dc.foto,
      
      sclamp_status: checklist.sclamp.status,
      sclamp_foto: checklist.sclamp.foto,
      
      stoper_status: checklist.stoper.status,
      stoper_foto: checklist.stoper.foto,
      
      clamp_pelanggan_status: checklist.clamp_pelanggan.status,
      clamp_pelanggan_foto: checklist.clamp_pelanggan.foto,
      
      ikr_status: checklist.ikr.status,
      ikr_foto: checklist.ikr.foto,
      
      dropcore_baru_status: checklist.dropcore_baru.status,
      dropcore_baru_foto: checklist.dropcore_baru.foto,
      
      catatan: catatan.trim(),
      hasil_audit: hasilAudit,
    };

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/uji-petik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal menyimpan data uji petik');
      }

      setSubmitSuccess({
        id: result.id,
        nomorWo: payload.nomor_wo,
        source: result.source,
      });

      if (onSuccessSubmit) {
        onSuccessSubmit();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill sample data for quick demonstration
  const handleQuickFillSample = () => {
    setTimestamp(formatIndonesianDateTime(new Date()));
    setPekerjaan('PSB');
    setNomorWo('WO-100202');
    setNamaPelanggan('IYAY');
    setNoTelp('081361271787');
    setNamaTeknisi('Ahmad & Tim Borneo');
    setPanjangKabel('125');
    setCatatan('Instalasi rapi, redaman ODP -17.5 dBm, redaman roset -18.2 dBm. S-Clamp dan label terpasang sempurna.');
    setHasilAudit('Lolos');
    setAutoFilledFromWO('WO-100202');
  };

  // Count uploaded photos
  const uploadedCount = Object.values(checklist).filter((item) => Boolean(item.foto)).length;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-8 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Formulir Quality Control Lapangan
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Input Uji Petik Fiber Optikssss
          </h2>
          <p className="text-red-100 text-sm mt-1 max-w-xl">
            Masukkan Nomor WO untuk <strong>mengisi otomatis</strong> nama pelanggan, no telepon, teknisi, dan panjang tarikan dari Master Data PSB/Gangguan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSwitchToMasterWO}
            className="px-4 py-2.5 rounded-xl bg-red-950/40 border border-white/20 text-white font-bold text-xs hover:bg-red-950/60 transition-all shadow-md flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            <span>Upload Data WO</span>
          </button>

          <button
            type="button"
            onClick={handleQuickFillSample}
            className="px-4 py-2.5 rounded-xl bg-white text-red-600 font-bold text-xs hover:bg-red-50 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Isi Contoh Data</span>
          </button>
        </div>
      </div>

      {/* Auto-fill Indicator Alert */}
      {autoFilledFromWO && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-4 rounded-2xl shadow-sm mb-6 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Data Berhasil Terisi Otomatis dari Master WO:</span>
                <span className="font-mono bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-950 font-black">
                  {autoFilledFromWO}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  {pekerjaan}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Panjang kabel, nama pelanggan, kontak, dan teknisi telah disinkronkan. Anda tetap dapat menyesuaikan jika kondisi lapangan berbeda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAutoFilledFromWO(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Success Notification */}
      {submitSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-6 rounded-2xl shadow-lg mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-emerald-900">
                Data Uji Petik Berhasil Tersimpan!
              </h3>
              <p className="text-emerald-800 text-sm mt-1">
                Data dengan Nomor Workorder <strong>{submitSuccess.nomorWo}</strong> berhasil disimpan ke dalam sistem
                {submitSuccess.source === 'mysql' ? ' (Tersimpan ke Database MySQL)' : ' (Tersimpan ke Penyimpanan Database)'}.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onSwitchToRekapan}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Buka Menu Rekapan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition-all"
                >
                  Input Uji Petik Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-500 text-red-950 p-4 rounded-xl shadow-md mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* BAGIAN 1: INFORMASI UTAMA PEKERJAAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center">
                1
              </span>
              <h3 className="text-lg font-bold text-slate-800">
                Informasi Pekerjaan & Pelanggan
              </h3>
            </div>
            
            {/* Timestamp Otomatis */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span className="font-semibold text-slate-900">{timestamp}</span>
              <button
                type="button"
                onClick={handleRefreshTimestamp}
                title="Perbarui waktu saat ini"
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pekerjaan: PSB / GANGGUAN */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Jenis Pekerjaan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPekerjaan('PSB')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all font-bold text-sm sm:text-base ${
                    pekerjaan === 'PSB'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-md shadow-blue-500/10'
                      : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 ${pekerjaan === 'PSB' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <div>PSB (Pasang Baru)</div>
                    <div className="text-xs font-normal opacity-75">Instalasi Pelanggan Baru</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPekerjaan('GANGGUAN')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all font-bold text-sm sm:text-base ${
                    pekerjaan === 'GANGGUAN'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-800 shadow-md shadow-amber-500/10'
                      : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className={`w-5 h-5 ${pekerjaan === 'GANGGUAN' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <div>GANGGUAN</div>
                    <div className="text-xs font-normal opacity-75">Perbaikan / Maintenance</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Nomor Workorder dengan Auto-fill Trigger & Modal Picker */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Nomor Workorder (WO) <span className="text-red-500">*</span>
                </label>

                {/* Quick Picker from Master WO */}
                <button
                  type="button"
                  onClick={() => setShowWOPickerModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Search className="w-3 h-3" />
                  <span>Cari di Master WO ({masterList.length})</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ketik WO (contoh: WO-100201)..."
                  value={nomorWo}
                  onChange={(e) => handleWOChange(e.target.value)}
                  onFocus={() => {
                    if (nomorWo.trim()) setShowWODropdown(true);
                  }}
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-semibold tracking-wide text-slate-800 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                />

                {/* Direct button to pick */}
                <button
                  type="button"
                  onClick={() => setShowWOPickerModal(true)}
                  className="absolute inset-y-1 right-1 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilih</span>
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showWODropdown && suggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  <div className="bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Saran dari Master Data WO</span>
                    <button
                      type="button"
                      onClick={() => setShowWODropdown(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyMasterWO(item)}
                      className="w-full text-left p-3 hover:bg-indigo-50/60 transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.nomor_wo}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.pekerjaan === 'PSB' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.pekerjaan}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 mt-1">
                          {item.nama_pelanggan} {item.nomor_telepon ? `(${item.nomor_telepon})` : ''}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Teknisi: {item.nama_teknisi} • Tarikan: {item.panjang_kabel}m
                        </div>
                      </div>

                      <div className="text-indigo-600 font-bold text-xs flex items-center gap-1 shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Isi Otomatis</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-slate-500 mt-1">
                Ketik atau pilih nomor WO dari Master Data untuk mengisi otomatis seluruh kolom berikut.
              </p>
            </div>

            {/* Panjang Kabel / Tarikan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Panjang Kabel / Tarikan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Ruler className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 150"
                  value={panjangKabel}
                  onChange={(e) => setPanjangKabel(e.target.value)}
                  className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-semibold text-slate-800"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  Meter
                </div>
              </div>
              {/* Quick meter chips */}
              <div className="flex items-center gap-1.5 mt-2">
                {[50, 75, 100, 125, 150, 200].map((meter) => (
                  <button
                    key={meter}
                    type="button"
                    onClick={() => setPanjangKabel(String(meter))}
                    className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all"
                  >
                    {meter}m
                  </button>
                ))}
              </div>
            </div>

            {/* Nama Pelanggan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nama Pelanggan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IYAY"
                  value={namaPelanggan}
                  onChange={(e) => setNamaPelanggan(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            {/* No HP / WhatsApp Pelanggan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="081361271787"
                  value={noTelp}
                  onChange={(e) => setNoTelp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Hasil format: {namaPelanggan ? namaPelanggan : 'IYAY'} {noTelp ? `(${noTelp})` : '(081361271787)'}
              </p>
            </div>

            {/* Nama Teknisi */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nama Teknisi / Tim <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nama teknisi pelaksana instalasi / perbaikan"
                  value={namaTeknisi}
                  onChange={(e) => setNamaTeknisi(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                />
              </div>
            </div>

          </div>
        </div>

        {/* BAGIAN 2: CEKLIST INSTALASI (7 ITEM WAJIB FOTO) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Ceklist Instalasi & Bukti Foto
                </h3>
                <p className="text-xs text-slate-500">
                  Wajib melampirkan foto verifikasi lapangan untuk 7 item di bawah ini
                </p>
              </div>
            </div>

            {/* Progress Counter */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold">
              <span className="text-slate-600">Foto Terisi:</span>
              <span className={`px-2 py-0.5 rounded-full ${
                uploadedCount === 7 
                  ? 'bg-emerald-500 text-white' 
                  : uploadedCount > 0 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-300 text-slate-700'
              }`}>
                {uploadedCount} / 7
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {CHECKLIST_ITEMS.map((item, index) => {
              const currentStatus = checklist[item.id]?.status || 'Sesuai';
              const currentFoto = checklist[item.id]?.foto || '';
              const isUploading = uploadingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                    currentFoto
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Item Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        currentStatus === 'Sesuai'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-rose-100 text-rose-700 border border-rose-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-slate-900">
                            {item.label}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            • {item.sublabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Status & Photo Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                      
                      {/* Status Toggle: Sesuai / Tidak Sesuai */}
                      <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'Sesuai')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'Sesuai'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Sesuai</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'Tidak Sesuai')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'Tidak Sesuai'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tidak Sesuai</span>
                        </button>
                      </div>

                      {/* Photo Section */}
                      <div className="relative">
                        {currentFoto ? (
                          <div className="flex items-center gap-2">
                            {/* Thumbnail preview with zoom */}
                            <div 
                              onClick={() => setPreviewModalImg(currentFoto)}
                              className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm cursor-pointer group shrink-0 bg-slate-100"
                            >
                              <img
                                src={currentFoto}
                                alt={item.label}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-4 h-4" />
                              </div>
                            </div>

                            {/* Delete / Replace Photo */}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(item.id)}
                              title="Hapus foto"
                              className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex items-center justify-center transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                            isUploading
                              ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed'
                              : 'bg-white hover:bg-red-50 text-red-600 border-red-300 hover:border-red-400 active:scale-95'
                          }`}>
                            {isUploading ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4" />
                            )}
                            <span>{isUploading ? 'Mengunggah...' : 'Ambil Foto'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(item.id, file);
                              }}
                            />
                          </label>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BAGIAN 3: HASIL AUDIT & CATATAN AKHIR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
            <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="text-lg font-bold text-slate-800">
              Kesimpulan & Hasil Audit
            </h3>
          </div>

          <div className="space-y-6">
            {/* Status Hasil Audit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Status Hasil Uji Petik
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'Lolos', label: 'Lolos Uji Petik', color: 'emerald', desc: 'Instalasi sesuai SOP' },
                  { value: 'Perlu Perbaikan', label: 'Perlu Perbaikan', color: 'amber', desc: 'Ada item minor tidak sesuai' },
                  { value: 'Tidak Lolos', label: 'Tidak Lolos / Reject', color: 'rose', desc: 'Harus diulang / temuan mayor' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setHasilAudit(option.value)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      hasilAudit === option.value
                        ? option.value === 'Lolos'
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20'
                          : option.value === 'Perlu Perbaikan'
                          ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20'
                          : 'border-rose-500 bg-rose-50/80 text-rose-950 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-sm">{option.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan Kesimpulan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Catatan Petugas Uji Petik / Evaluator
              </label>
              <textarea
                rows={3}
                placeholder="Catatan tambahan mengenai kondisi lapangan, temuan khusus, atau rekomendasi perbaikan..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kosongkan Form</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Data ke Database...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Simpan Hasil Uji Petik</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* MODAL PICKER WO FROM MASTER DATA */}
      {showWOPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">
                  Pilih Workorder dari Master Data (PSB & Gangguan)
                </h3>
              </div>
              <button
                onClick={() => setShowWOPickerModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari Nomor WO, Nama Pelanggan, atau Teknisi..."
                  value={woSearchQuery}
                  onChange={(e) => setWoSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-slate-100">
              {masterList
                .filter((item) => {
                  const q = woSearchQuery.toLowerCase();
                  return (
                    (item.nomor_wo || '').toLowerCase().includes(q) ||
                    (item.nama_pelanggan || '').toLowerCase().includes(q) ||
                    (item.nama_teknisi || '').toLowerCase().includes(q)
                  );
                })
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => applyMasterWO(item)}
                    className="pt-2 pb-2 px-3 rounded-xl hover:bg-indigo-50/70 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 group-hover:bg-indigo-100 px-2 py-0.5 rounded">
                          {item.nomor_wo}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.pekerjaan === 'PSB' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.pekerjaan}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-1">
                        {item.nama_pelanggan} {item.nomor_telepon ? `(${item.nomor_telepon})` : ''}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Teknisi: <strong className="text-slate-700">{item.nama_teknisi}</strong> • Tarikan: <strong className="text-slate-700">{item.panjang_kabel}m</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Gunakan Data Ini</span>
                    </button>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan master workorder aktif</span>
              <button
                type="button"
                onClick={() => setShowWOPickerModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div 
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center"
            >
              ✕
            </button>
            <img
              src={previewModalImg}
              alt="Preview Uji Petik"
              className="max-h-[85vh] w-auto mx-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
