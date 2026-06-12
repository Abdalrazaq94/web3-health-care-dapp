
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useState, useEffect } from 'react';
import AddRecordModal      from './AddRecordModal';
import PatientRecordsModal from './PatientRecordsModal';
import PatientProfileModal from './PatientProfileModal';

// ── Inline IPFS hook ─────────────────────────────────────────────────────────
function useIpfsMeta(metadataHash) {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    if (!metadataHash || metadataHash === '') { setMeta(null); return; }
    const gateways = [
      `https://ipfs.io/ipfs/${metadataHash}`,
      `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
    ];
    const tryFetch = async () => {
      for (const url of gateways) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); return; }
        } catch (_) {}
      }
      setMeta(null);
    };
    tryFetch();
  }, [metadataHash]);
  return meta;
}

// ── PatientCard ──────────────────────────────────────────────────────────────
function PatientCard({ patientAddress }) {
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showRecords,   setShowRecords]   = useState(false);
  const [showProfile,   setShowProfile]   = useState(false);
  const { address: doctorAddress } = useAccount();

  const { data: patient } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'patients',
    args: [patientAddress],
  });

  const { data: hasAccess } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'checkAccess',
    args: [patientAddress, doctorAddress],
  });

  // ── IPFS metadata ─────────────────────────────────────────────
  const meta     = useIpfsMeta(patient?.[7] || '');
  const photoUrl = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;

  // ── Skeleton ──────────────────────────────────────────────────
  if (!patient) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/5" />
            <div className="h-3 bg-gray-100 rounded w-3/5" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // On-chain fields
  const name         = patient[1] || 'Unknown';
  const age          = patient[2]?.toString() || '—';
  const bloodType    = patient[3] || '—';
  const gender       = patient[4] || '—';
  const totalRecords = Number(patient[8] || 0);
  const totalAppts   = Number(patient[9] || 0);
  const regDate      = patient[10]
    ? new Date(Number(patient[10]) * 1000).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  // IPFS fields
  const email      = meta?.email                 || null;
  const phone      = meta?.phone                 || null;
  const allergies  = meta?.allergies             || null;
  const conditions = meta?.chronicConditions     || null;
  const emergName  = meta?.emergencyContactName  || null;
  const emergPhone = meta?.emergencyContactPhone || null;

  const bloodColors = {
    'A+':'bg-red-100 text-red-700','A-':'bg-red-100 text-red-700',
    'B+':'bg-orange-100 text-orange-700','B-':'bg-orange-100 text-orange-700',
    'O+':'bg-blue-100 text-blue-700','O-':'bg-blue-100 text-blue-700',
    'AB+':'bg-purple-100 text-purple-700','AB-':'bg-purple-100 text-purple-700',
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:shadow-xl transition-all duration-300">
        {/* Access accent bar */}
        <div className={`h-1.5 w-full ${hasAccess
          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
          : 'bg-gradient-to-r from-gray-300 to-gray-400'}`} />

        <div className="p-6">
          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow">
                {photoUrl
                  ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  : <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {patientAddress?.slice(0,6)}...{patientAddress?.slice(-4)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Registered {regDate}</p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${
              hasAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-red-500'}`} />
              {hasAccess ? 'Access Granted' : 'No Access'}
            </span>
          </div>

          {/* ── Basic info grid (on-chain) ── */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <MiniStat icon="🎂" label="Age"     value={`${age}y`} />
            <MiniStat icon="🩸" label="Blood"   value={bloodType} colorClass={bloodColors[bloodType]} />
            <MiniStat icon="👤" label="Gender"  value={gender === 'Male' ? 'M' : gender === 'Female' ? 'F' : gender} />
            <MiniStat icon="📋" label="Records" value={totalRecords} />
          </div>

          {/* ── IPFS info (only if available) ── */}
          {meta && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
              {email && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>📧</span><span className="font-medium">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>📱</span><span className="font-medium">{phone}</span>
                </div>
              )}
              {allergies && (
                <div className="flex items-center gap-2 text-xs">
                  <span>💊</span>
                  <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                    Allergies: {allergies}
                  </span>
                </div>
              )}
              {conditions && (
                <div className="flex items-center gap-2 text-xs">
                  <span>🩺</span>
                  <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    {conditions}
                  </span>
                </div>
              )}
              {emergName && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>🚨</span>
                  <span>Emergency: {emergName}{emergPhone ? ` · ${emergPhone}` : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Appointments row ── */}
          <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-blue-50 rounded-xl">
            <span>📅</span>
            <span className="text-sm text-blue-700 font-semibold">
              {totalAppts} appointment{totalAppts !== 1 ? 's' : ''} with you
            </span>
          </div>

          {/* ── Action buttons ── */}
          <div className="grid grid-cols-3 gap-2">
            <ActionBtn icon="👁️" label="View Profile"
              gradient="from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              onClick={() => setShowProfile(true)} />
            <ActionBtn icon="🩺" label="Add Record"
              gradient="from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
              onClick={() => setShowAddRecord(true)} disabled={!hasAccess} />
            <ActionBtn icon="📋" label="View History"
              gradient="from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={() => setShowRecords(true)} disabled={!hasAccess} />
          </div>

          {!hasAccess && (
            <p className="text-xs text-center text-gray-400 mt-3 italic">
              Patient must grant access before you can add or view records.
            </p>
          )}
        </div>
      </div>

      {showProfile   && <PatientProfileModal patient={patient} meta={meta} patientAddress={patientAddress} hasAccess={hasAccess} onClose={() => setShowProfile(false)} />}
      {showAddRecord && <AddRecordModal      patientAddress={patientAddress} patientName={name} onClose={() => setShowAddRecord(false)} />}
      {showRecords   && <PatientRecordsModal patientAddress={patientAddress} patientName={name} onClose={() => setShowRecords(false)} />}
    </>
  );
}

function MiniStat({ icon, label, value, colorClass }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${colorClass || 'bg-gray-50'}`}>
      <p className="text-base">{icon}</p>
      <p className={`text-sm font-bold mt-0.5 ${colorClass ? '' : 'text-gray-800'}`}>{value}</p>
      <p className={`text-xs ${colorClass ? 'opacity-75' : 'text-gray-400'}`}>{label}</p>
    </div>
  );
}

function ActionBtn({ icon, label, gradient, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 bg-gradient-to-br ${gradient} text-white font-semibold rounded-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow hover:shadow-lg transform hover:scale-105 disabled:transform-none`}>
      <span className="text-xl">{icon}</span>
      <span className="text-xs leading-tight">{label}</span>
    </button>
  );
}

export default PatientCard;