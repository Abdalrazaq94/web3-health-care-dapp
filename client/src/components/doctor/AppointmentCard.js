
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useState, useEffect } from 'react';

// ── Patient IPFS hook ─────────────────────────────────────────────────────────
function usePatientMeta(metadataHash) {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    if (!metadataHash || metadataHash === '') { setMeta(null); return; }
    const gateways = [
      `https://ipfs.io/ipfs/${metadataHash}`,
      `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
    ];
    (async () => {
      for (const url of gateways) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); return; }
        } catch (_) {}
      }
    })();
  }, [metadataHash]);
  return meta;
}

const STATUS_CFG = [
  { label: 'Pending',   bg: 'bg-orange-100', text: 'text-orange-800', bar: 'from-orange-400 to-amber-400',  icon: '⏳' },
  { label: 'Approved',  bg: 'bg-blue-100',   text: 'text-blue-800',   bar: 'from-blue-400 to-indigo-400',   icon: '✅' },
  { label: 'Rejected',  bg: 'bg-red-100',    text: 'text-red-800',    bar: 'from-red-400 to-rose-400',      icon: '❌' },
  { label: 'Completed', bg: 'bg-green-100',  text: 'text-green-800',  bar: 'from-green-400 to-emerald-400', icon: '✓'  },
  { label: 'Cancelled', bg: 'bg-gray-100',   text: 'text-gray-600',   bar: 'from-gray-300 to-gray-400',     icon: '🚫' },
];

const BLOOD_COLORS = {
  'A+':'bg-red-100 text-red-700','A-':'bg-red-100 text-red-700',
  'B+':'bg-orange-100 text-orange-700','B-':'bg-orange-100 text-orange-700',
  'O+':'bg-blue-100 text-blue-700','O-':'bg-blue-100 text-blue-700',
  'AB+':'bg-purple-100 text-purple-700','AB-':'bg-purple-100 text-purple-700',
};

const RELAYER = 'http://localhost:5000';

function AppointmentCard({ appointmentId }) {
  const { address: doctorAddress } = useAccount();

  // ── MetaMask — approve only ───────────────────────────────────────────────
  const [approveTxHash, setApproveTxHash] = useState(null);
  const { writeContract, isPending: isApproving } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // ── Relayer — complete only ───────────────────────────────────────────────
  const [relayerLoading, setRelayerLoading] = useState(false);
  const [relayerSuccess, setRelayerSuccess] = useState(false);
  const [error, setError]                   = useState('');
  const [localStatus, setLocalStatus]       = useState(null);

  const { data: appointment, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointments', args: [appointmentId],
  });

  const { data: patient } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'patients', args: [appointment?.[1]],
    enabled: !!appointment,
  });

  const patientMeta = usePatientMeta(patient?.[7] || '');
  const photoUrl    = patientMeta?.photoCID ? `https://ipfs.io/ipfs/${patientMeta.photoCID}` : null;
  const allergies   = patientMeta?.allergies || null;

  // Optimistic update after approve confirmed on-chain
  useEffect(() => {
    if (approveSuccess) {
      setLocalStatus(1);
      setTimeout(() => refetch(), 4000);
    }
  }, [approveSuccess]);

  if (!appointment) return null;
  if (appointment[2]?.toLowerCase() !== doctorAddress?.toLowerCase()) return null;

  const status    = localStatus !== null ? localStatus : Number(appointment[6]);
  const cfg       = STATUS_CFG[status] ?? STATUS_CFG[4];
  const patName   = patient?.[1] || 'Loading...';
  const age       = patient?.[2]?.toString() || null;
  const bloodType = patient?.[3] || null;
  const gender    = patient?.[4] || null;
  const isBusy    = isApproving || isConfirming || relayerLoading;

  // ── Approve via MetaMask ──────────────────────────────────────────────────
  const handleApprove = () => {
    setError('');
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'approveAppointment',
        args: [appointmentId],
        gas: 5000000n,
      },
      { onSuccess: (hash) => setApproveTxHash(hash) }
    );
  };

  // ── Complete via relayer ──────────────────────────────────────────────────
  const handleComplete = async () => {
    setRelayerLoading(true);
    setError('');
    try {
      const res = await fetch(`${RELAYER}/api/complete-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorAddress, appointmentId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Transaction failed');
      setRelayerSuccess(true);
      setLocalStatus(3);
      setTimeout(() => refetch(), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRelayerLoading(false);
    }
  };

  const success = approveSuccess || relayerSuccess;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:shadow-xl transition-all duration-300">

      {/* Status bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.bar}`} />

      <div className="p-6">

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">Action completed successfully!</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <span className="text-xl">❌</span>
            <span className="font-semibold">{error}</span>
          </div>
        )}
        {(isApproving || isConfirming) && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="font-semibold text-sm">
              {isApproving ? 'Confirm in MetaMask...' : 'Waiting for confirmation...'}
            </span>
          </div>
        )}

        {/* Patient header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shadow">
              {photoUrl
                ? <img src={photoUrl} alt={patName} className="w-full h-full object-cover" />
                : <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Patient</p>
              <p className="text-lg font-bold text-gray-800">{patName}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {age       && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">🎂 {age}y</span>}
                {bloodType && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${BLOOD_COLORS[bloodType] || 'bg-gray-100 text-gray-600'}`}>🩸 {bloodType}</span>}
                {gender    && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">👤 {gender}</span>}
                {allergies && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">⚠️ Allergies</span>}
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
            <span>{cfg.icon}</span>{cfg.label}
          </span>
        </div>

        {/* Allergies warning */}
        {allergies && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-xl">
            <span>⚠️</span>
            <p className="text-xs text-orange-800 font-semibold">
              <strong>Known Allergies:</strong> {allergies}
            </p>
          </div>
        )}

        {/* Appointment details */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoPill icon="📅" label="Date"   value={appointment[3]} />
          <InfoPill icon="🕐" label="Time"   value={appointment[4]} />
          <InfoPill icon="🆔" label="Appt #" value={`#${appointmentId}`} />
          <InfoPill icon="💊" label="Reason" value={appointment[5]} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap items-center">
          {status === 0 && (
            <ActionBtn
              label="Approve"
              icon="✅"
              color="from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              loading={isBusy}
              onClick={handleApprove}
            />
          )}
          {status === 1 && (
            <ActionBtn
              label="Mark Complete"
              icon="✓"
              color="from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              loading={isBusy}
              onClick={handleComplete}
            />
          )}
          {status >= 2 && (
            <span className="text-sm text-gray-400 italic">No actions available</span>
          )}
        </div>

        {/* MetaMask hint */}
        {status === 0 && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            🦊 Approval requires your MetaMask signature for accountability
          </p>
        )}
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500 font-semibold mb-0.5">{icon} {label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}

function ActionBtn({ label, icon, color, loading, onClick }) {
  return (
    <button onClick={onClick} disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${color} text-white font-semibold rounded-xl shadow transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed`}>
      {loading
        ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        : <span>{icon}</span>}
      {label}
    </button>
  );
}

export default AppointmentCard;