'use client';

import React from 'react';
import { ClipboardList, Database, FileSpreadsheet, Server, HardDrive, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, dataCount, masterCount, dbStatus, onOpenDbModal }) {
  const isMySQL = dbStatus?.type === 'mysql' && dbStatus?.connected;

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-md shadow-red-500/20 text-white font-bold text-xl sm:text-2xl tracking-wider">
              FO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  UJI PETIK FIBER OPTIK
                </h1>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                  TARAKAN
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                QC Lapangan Instalasi Pasang Baru (PSB) & Perbaikan Gangguan
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'form'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Input Form</span>
            </button>

            <button
              onClick={() => setActiveTab('rekapan')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 relative ${
                activeTab === 'rekapan'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Rekapan Data</span>
              {typeof dataCount === 'number' && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeTab === 'rekapan' ? 'bg-white text-red-600' : 'bg-slate-700 text-slate-200'
                }`}>
                  {dataCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('master')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 relative ${
                activeTab === 'master'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Upload Data WO</span>
              {typeof masterCount === 'number' && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeTab === 'master' ? 'bg-white text-indigo-700' : 'bg-slate-700 text-slate-200'
                }`}>
                  {masterCount}
                </span>
              )}
            </button>

            {/* DB Status Badge */}
            <button
              onClick={onOpenDbModal}
              title="Klik untuk melihat konfigurasi Database MySQL"
              className={`hidden md:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isMySQL
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
              }`}
            >
              {isMySQL ? (
                <>
                  <Server className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>MySQL: Online</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Penyimpanan Lokal</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
