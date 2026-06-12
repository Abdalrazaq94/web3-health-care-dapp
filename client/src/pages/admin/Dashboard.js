
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import StatCard from '../../components/admin/StatCard';
import DoctorsPage from './DoctorsPage';
import PatientsPage from './PatientsPage';

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  const s = { success:'bg-emerald-600', error:'bg-red-600', info:'bg-indigo-600' };
  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-5 py-3
      rounded-2xl text-white text-sm font-semibold shadow-xl ${s[type]||s.info}`}
      style={{ animation: 'slideIn .3s cubic-bezier(.34,1.56,.64,1)' }}>
      {type==='success' ? 'done' : type==='error' ? 'x' : 'loading'} {msg}
      <style>{"@keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}"}</style>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState('doctors');
  const [toast, setToast] = useState(null);
  const { address } = useAccount();

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const { data: systemStats } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getSystemStats',
  });
  const { data: doctorCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'doctorCount',
  });
  const { data: adminAddr } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'admin',
  });

  const isAdmin = adminAddr && address && adminAddr.toLowerCase() === address.toLowerCase();

  const stats = systemStats ? {
    pending:      Number(systemStats[4]),
    doctors:      Number(systemStats[0]),
    patients:     Number(systemStats[1]),
    appointments: Number(systemStats[2]),
    records:      Number(systemStats[3]),
  } : null;

  // Use doctorCount directly so pending count is always accurate
  const actualDoctorCount = doctorCount ? Number(doctorCount) : null;

  const TABS = [
    { id: 'doctors',  label: 'Doctors',  pendingBadge: stats?.pending },
    { id: 'patients', label: 'Patients', countBadge: stats?.patients  },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">Admin Dashboard</h1>
              <p className="text-xs text-gray-400 mt-0.5">Blockchain Healthcare System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats?.pending > 0 && (
              <button onClick={() => setTab('doctors')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-amber-400 opacity-75"/>
                  <span className="relative h-2 w-2 rounded-full bg-amber-500"/>
                </span>
                {stats.pending} pending
              </button>
            )}
            {address && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span className="font-mono text-xs text-gray-500">{address.slice(0,6)}...{address.slice(-4)}</span>
                {isAdmin && <span className="text-xs font-bold text-emerald-600">Admin</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard title="Pending"      value={stats?.pending}      icon="clock"   color="orange" pulse />
          <StatCard title="Doctors"      value={actualDoctorCount ?? stats?.doctors} icon="doctor"  color="green"  />
          <StatCard title="Patients"     value={stats?.patients}     icon="patient" color="blue"   />
          <StatCard title="Appointments" value={stats?.appointments} icon="cal"     color="purple" />
          <StatCard title="Records"      value={stats?.records}      icon="rec"     color="cyan"   />
          <StatCard title="Admins"       value={1}                   icon="shield"  color="slate"  />
        </div>

        {/* Main panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 pt-4 gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all border-b-2 -mb-px
                  ${tab===t.id ? 'text-indigo-700 border-indigo-600 bg-indigo-50/60' : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'}`}>
                {t.label}
                {t.pendingBadge > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{t.pendingBadge}</span>
                )}
                {t.countBadge > 0 && (
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-1.5 py-0.5 rounded-full">{t.countBadge}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'doctors'  && <DoctorsPage  onToast={showToast} />}
            {tab === 'patients' && <PatientsPage />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;