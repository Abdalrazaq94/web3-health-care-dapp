
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import DoctorCard from '../../components/admin/DoctorCard';
import DoctorProfileModal from '../../components/admin/DoctorProfileModal';

// KEY FIX: we loop through ALL doctors by numeric ID using doctorById
// Same pattern as the old working DoctorCard.js — never trust getPendingDoctors()
// which can miss entries if the internal array has issues

function DoctorsPage({ onToast }) {
  const [profileId, setProfileId] = useState(null);
  const [search, setSearch] = useState('');

  const { data: countData, refetch: refetchCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'doctorCount',
  });
  const totalDoctors = countData ? Number(countData) : 0;
  const doctorIds = Array.from({ length: totalDoctors }, (_, i) => i + 1);

  const { writeContract: approveDoc, data: approveHash } = useWriteContract();
  const { isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveHash });
  if (approveOk) { refetchCount(); onToast('Doctor approved', 'success'); }

  const { writeContract: rejectDoc, data: rejectHash } = useWriteContract();
  const { isSuccess: rejectOk } = useWaitForTransactionReceipt({ hash: rejectHash });
  if (rejectOk) { refetchCount(); onToast('Doctor rejected', 'error'); }

  const handleApprove = (wallet) => {
    approveDoc({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'approveDoctor', args: [wallet], gas: 5000000n });
    onToast('Sending transaction...', 'info');
  };
  const handleReject = (wallet, reason) => {
    rejectDoc({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'rejectDoctor', args: [wallet, reason], gas: 5000000n });
    onToast('Sending transaction...', 'info');
  };

  return (
    <div className="space-y-8" style={{ animation: 'fadeUp .3s ease-out' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{totalDoctors} doctor{totalDoctors !== 1 ? 's' : ''} on-chain</p>
        <div className="relative w-64">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name or specialisation..."
            className="w-full pl-4 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:bg-white focus:outline-none transition-all" />
        </div>
      </div>

      {totalDoctors === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-5xl mb-4">doctor</p>
          <p className="font-bold text-gray-700">No doctors registered yet</p>
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-black text-gray-800">Pending Approvals</h2>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {doctorIds.map(id => (
                <PendingWrapper key={id} doctorId={id} search={search}
                  onViewProfile={setProfileId} onApprove={handleApprove} onReject={handleReject} />
              ))}
            </div>
          </section>

          <div className="border-t border-gray-100" />

          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-black text-gray-800">Approved Doctors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {doctorIds.map(id => (
                <ApprovedWrapper key={id} doctorId={id} search={search} onViewProfile={setProfileId} />
              ))}
            </div>
          </section>
        </>
      )}

      {profileId !== null && (
        <DoctorProfileModal doctorId={profileId}
          onClose={() => setProfileId(null)}
          onApprove={(wallet) => { handleApprove(wallet); setProfileId(null); }}
          onReject={(wallet, reason) => { handleReject(wallet, reason); setProfileId(null); }}
        />
      )}
      <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}

function PendingWrapper({ doctorId, search, onViewProfile, onApprove, onReject }) {
  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'doctorById', args: [Number(doctorId)],
  });
  if (!doctor || doctor[5]) return null; // hide if approved
  if (search) {
    const n = (doctor[1]||'').toLowerCase(), s = (doctor[2]||'').toLowerCase();
    if (!n.includes(search.toLowerCase()) && !s.includes(search.toLowerCase())) return null;
  }
  return <DoctorCard doctorId={doctorId} onViewProfile={onViewProfile} onApprove={onApprove} onReject={onReject} />;
}

function ApprovedWrapper({ doctorId, search, onViewProfile }) {
  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'doctorById', args: [Number(doctorId)],
  });
  if (!doctor || !doctor[5]) return null; // hide if not approved
  if (search) {
    const n = (doctor[1]||'').toLowerCase(), s = (doctor[2]||'').toLowerCase();
    if (!n.includes(search.toLowerCase()) && !s.includes(search.toLowerCase())) return null;
  }
  return <DoctorCard doctorId={doctorId} onViewProfile={onViewProfile} onApprove={() => {}} onReject={() => {}} />;
}

export default DoctorsPage;