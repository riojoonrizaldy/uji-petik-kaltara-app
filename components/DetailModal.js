'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Calendar, 
  User, 
  FileText, 
  Ruler, 
  CheckCircle2, 
  XCircle, 
  ZoomIn, 
  Sparkles, 
  Wrench,
  Download,
  AlertTriangle
} from 'lucide-react';
import { CHECKLIST_ITEMS } from '@/lib/checklistItems';

export default function DetailModal({ item, onClose, onPrint }) {
  const [zoomImg, setZoomImg] = useState(null);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              item.pekerjaan === 'PSB'
                ? 'bg-blue-500 text-white'
                : 'bg-amber-500 text-slate-900'
            }`}>
              {item.pekerjaan === 'PSB' ? 'Pasang Baru (PSB)' : 'Perbaikan Gangguan'}
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Detail Uji Petik: {item.nomor_wo}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(item)}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tanggal & Waktu
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {item.timestamp}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pelanggan
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {item.nama_pelanggan}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Teknisi Pelaksana
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {item.nama_teknisi}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Panjang Tarikan
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {item.panjang_kabel}
              </div>
            </div>
          </div>

          {/* Hasil Audit & Catatan */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-500">Status Hasil Uji Petik</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ${
                  item.hasil_audit === 'Lolos'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : item.hasil_audit === 'Perlu Perbaikan'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {item.hasil_audit}
                </span>
              </div>
            </div>

            {item.catatan && (
              <div className="flex-1 sm:max-w-md bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-800 block mb-0.5">Catatan Evaluator:</span>
                {item.catatan}
              </div>
            )}
          </div>

          {/* 7 Checklist Items & Bukti Foto */}
          <div>
            <h4 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
              <span>Bukti Foto & Checklist Instalasi</span>
              <span className="text-xs font-normal text-slate-500">(7 Poin Inspeksi)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHECKLIST_ITEMS.map((ci) => {
                const status = item[ci.statusField] || 'Sesuai';
                const foto = item[ci.fotoField] || '';

                return (
                  <div 
                    key={ci.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {ci.label}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          status === 'Sesuai'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {status === 'Sesuai' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                        {ci.sublabel}
                      </p>
                    </div>

                    {/* Foto box */}
                    <div className="mt-2">
                      {foto ? (
                        <div 
                          onClick={() => setZoomImg(foto)}
                          className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-900 cursor-pointer group shadow-sm"
                        >
                          <img
                            src={foto}
                            alt={ci.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                            <ZoomIn className="w-4 h-4" />
                            <span>Perbesar</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs">
                          <AlertTriangle className="w-6 h-6 mb-1 text-slate-400" />
                          <span>Tidak Ada Foto</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Lightbox Zoom */}
      {zoomImg && (
        <div
          onClick={() => setZoomImg(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setZoomImg(null)}
              className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
            >
              ✕
            </button>
            <img
              src={zoomImg}
              alt="Foto Detail"
              className="max-h-[85vh] w-auto mx-auto rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
