'use client';

import React, { useState } from 'react';
import { X, Server, Database, CheckCircle2, AlertTriangle, RefreshCw, Key, Shield } from 'lucide-react';

export default function DbConfigModal({ isOpen, onClose, dbStatus, onRefreshStatus }) {
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const isMySQL = dbStatus?.type === 'mysql' && dbStatus?.connected;

  const handleTest = async () => {
    setTesting(true);
    await onRefreshStatus();
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-base text-white">
              Status Database & Konfigurasi MySQL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border ${
            isMySQL 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {isMySQL ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {isMySQL ? 'Terhubung ke MySQL Database' : 'Mode Penyimpanan Cadangan Lokal Aktif'}
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {dbStatus?.message || (isMySQL ? 'Koneksi ke MySQL normal dan stabil.' : 'Aplikasi menggunakan penyimpanan berkas lokal otomatis.')}
                </p>
              </div>
            </div>
          </div>

          {/* Config details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Parameter File .env.local
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
              <span className="text-slate-500">MYSQL_HOST:</span>
              <span className="font-bold text-slate-800">127.0.0.1</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
              <span className="text-slate-500">MYSQL_PORT:</span>
              <span className="font-bold text-slate-800">3306</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
              <span className="text-slate-500">MYSQL_USER:</span>
              <span className="font-bold text-slate-800">root</span>
            </div>
            <div className="flex justify-between py-1 font-mono">
              <span className="text-slate-500">MYSQL_DATABASE:</span>
              <span className="font-bold text-slate-800">uji_petik_db</span>
            </div>
          </div>

          {/* Tips to connect MySQL */}
          {!isMySQL && (
            <div className="text-xs text-slate-600 bg-slate-100 p-4 rounded-2xl space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Cara Mengaktifkan MySQL:</span>
              </div>
              <p className="leading-relaxed">
                1. Buka file <strong>.env.local</strong> di folder proyek.
              </p>
              <p className="leading-relaxed">
                2. Masukkan password root MySQL Anda pada baris <code>MYSQL_PASSWORD=...</code>
              </p>
              <p className="leading-relaxed">
                3. Jalankan perintah <code>npm run db:init</code> di terminal untuk membuat database & tabel secara otomatis.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Memeriksa...' : 'Uji Koneksi Ulang'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all"
            >
              Tutup
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
