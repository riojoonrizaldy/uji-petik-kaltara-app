'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import InputForm from '@/components/InputForm';
import RekapanView from '@/components/RekapanView';
import MasterWOView from '@/components/MasterWOView';
import DetailModal from '@/components/DetailModal';
import PrintReport from '@/components/PrintReport';
import DbConfigModal from '@/components/DbConfigModal';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'rekapan' | 'master'
  const [items, setItems] = useState([]);
  const [masterList, setMasterList] = useState([]);
  const [selectedMasterWO, setSelectedMasterWO] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & sub-views
  const [detailItem, setDetailItem] = useState(null);
  const [printItem, setPrintItem] = useState(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Fetch audited items & db status
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/uji-petik');
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        if (json.dbStatus) {
          setDbStatus(json.dbStatus);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Master WO list
  const fetchMasterData = async () => {
    try {
      const res = await fetch('/api/master-wo');
      const json = await res.json();
      if (json.success) {
        setMasterList(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching master WO list:', e);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      const json = await res.json();
      setDbStatus(json);
    } catch (e) {
      console.error('Error fetching db status:', e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMasterData();
  }, []);

  // Delete an audited item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data Uji Petik ini?')) {
      return;
    }

    try {
      const res = await fetch(`/api/uji-petik/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        fetchMasterData(); // re-sync audit statuses
      } else {
        alert(json.error || 'Gagal menghapus data');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus data: ' + err.message);
    }
  };

  // If currently in print report view
  if (printItem) {
    return (
      <main className="min-h-screen bg-slate-100 py-6">
        <PrintReport
          item={printItem}
          onBack={() => setPrintItem(null)}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataCount={items.length}
        masterCount={masterList.length}
        dbStatus={dbStatus}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'form' && (
          <InputForm
            prefilledWO={selectedMasterWO}
            onSuccessSubmit={() => {
              fetchData();
              fetchMasterData();
            }}
            onSwitchToRekapan={() => setActiveTab('rekapan')}
            onSwitchToMasterWO={() => setActiveTab('master')}
          />
        )}

        {activeTab === 'rekapan' && (
          <RekapanView
            items={items}
            onRefresh={fetchData}
            onSelectDetail={(item) => setDetailItem(item)}
            onSelectPrint={(item) => setPrintItem(item)}
            onDelete={handleDeleteItem}
            onSwitchToForm={() => {
              setSelectedMasterWO(null);
              setActiveTab('form');
            }}
          />
        )}

        {activeTab === 'master' && (
          <MasterWOView
            masterList={masterList}
            onRefresh={fetchMasterData}
            onSelectForAudit={(wo) => {
              setSelectedMasterWO(wo);
              setActiveTab('form');
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Aplikasi Uji Petik Fiber Optik — Tarakan Quality Assurance</p>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif
            </span>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="hover:text-white underline underline-offset-4"
            >
              Info Database
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onPrint={(item) => {
            setDetailItem(null);
            setPrintItem(item);
          }}
        />
      )}

      {/* Database Config Modal */}
      <DbConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={dbStatus}
        onRefreshStatus={fetchDbStatus}
      />

    </div>
  );
}
