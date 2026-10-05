'use client';

import React from 'react';
import { ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import { CHECKLIST_ITEMS } from '@/lib/checklistItems';

export default function PrintReport({ item, onBack }) {
  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      
      {/* Control bar (hidden during print) */}
      <div className="no-print bg-slate-900 text-white p-4 rounded-2xl shadow-lg mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Mode Pratinjau Berita Acara / Laporan</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 look) */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-sm text-slate-900">
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 text-white rounded-xl flex items-center justify-center font-black text-2xl tracking-tighter">
              FO
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                FORMULIR BERITA ACARA UJI PETIK (QC)
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                INSTALASI FIBER OPTIK (PSB & GANGGUAN) — WILAYAH TARAKAN
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-500">NO. DOKUMEN</div>
            <div className="text-sm font-extrabold text-red-600">QC-{item.nomor_wo}</div>
          </div>
        </div>

        {/* Informasi Pekerjaan */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs border border-slate-300 p-4 rounded-xl bg-slate-50">
          <div>
            <span className="font-bold text-slate-500 block">NOMOR WORK ORDER:</span>
            <span className="font-extrabold text-sm text-slate-900">{item.nomor_wo}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">JENIS PEKERJAAN:</span>
            <span className={`inline-block px-2.5 py-0.5 rounded font-black text-xs ${
              item.pekerjaan === 'PSB' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {item.pekerjaan === 'PSB' ? 'PASANG BARU (PSB)' : 'PERBAIKAN GANGGUAN'}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">NAMA PELANGGAN:</span>
            <span className="font-bold text-slate-900">{item.nama_pelanggan}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">WAKTU AUDIT:</span>
            <span className="font-bold text-slate-900">{item.timestamp}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">TEKNISI PELAKSANA:</span>
            <span className="font-bold text-slate-900">{item.nama_teknisi}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">PANJANG TARIKAN KABEL:</span>
            <span className="font-bold text-slate-900">{item.panjang_kabel}</span>
          </div>
        </div>

        {/* Tabel 7 Ceklist & Foto Bukti */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
            HASIL PEMERIKSAAN 7 POIN CEKLIST & BUKTI FISIK LAPANGAN
          </h3>
          
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 p-2 text-center w-10">No</th>
                <th className="border border-slate-300 p-2 text-left w-36">Poin Pemeriksaan</th>
                <th className="border border-slate-300 p-2 text-left">Deskripsi Standar</th>
                <th className="border border-slate-300 p-2 text-center w-24">Status</th>
                <th className="border border-slate-300 p-2 text-center w-36">Foto Bukti Fisik</th>
              </tr>
            </thead>
            <tbody>
              {CHECKLIST_ITEMS.map((ci, idx) => {
                const status = item[ci.statusField] || 'Sesuai';
                const foto = item[ci.fotoField] || '';

                return (
                  <tr key={ci.id} className="print-break-inside-avoid">
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-900">
                      {ci.label}
                      <span className="block text-[10px] font-normal text-slate-500">{ci.sublabel}</span>
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-600 text-[11px]">
                      {ci.description}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        status === 'Sesuai' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-1 text-center">
                      {foto ? (
                        <img
                          src={foto}
                          alt={ci.label}
                          className="h-16 w-28 mx-auto object-cover rounded border border-slate-200"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tidak ada foto</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Kesimpulan & Catatan */}
        <div className="border border-slate-300 p-4 rounded-xl mb-8 bg-slate-50 print-break-inside-avoid">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase">STATUS KELAYAKAN HASIL UJI PETIK:</span>
            <span className={`px-4 py-1 rounded-lg text-xs font-black uppercase ${
              item.hasil_audit === 'Lolos' 
                ? 'bg-emerald-600 text-white' 
                : item.hasil_audit === 'Perlu Perbaikan'
                ? 'bg-amber-500 text-slate-900'
                : 'bg-rose-600 text-white'
            }`}>
              {item.hasil_audit}
            </span>
          </div>
          {item.catatan && (
            <p className="text-xs text-slate-700 italic border-t border-slate-200 pt-2 mt-2">
              <strong>Catatan Evaluator:</strong> "{item.catatan}"
            </p>
          )}
        </div>

        {/* Kolom Tanda Tangan */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs mt-10 print-break-inside-avoid">
          <div>
            <div className="font-semibold text-slate-600 mb-16">Teknisi Pelaksana</div>
            <div className="font-bold border-t border-slate-400 pt-1 mx-4">
              ( {item.nama_teknisi} )
            </div>
          </div>

          <div>
            <div className="font-semibold text-slate-600 mb-16">Petugas Uji Petik (QC)</div>
            <div className="font-bold border-t border-slate-400 pt-1 mx-4">
              ( .................................... )
            </div>
          </div>

          <div>
            <div className="font-semibold text-slate-600 mb-16">Team Leader / Asman</div>
            <div className="font-bold border-t border-slate-400 pt-1 mx-4">
              ( .................................... )
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
