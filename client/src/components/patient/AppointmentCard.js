
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { usePatientAuth } from '../hooks/usePatientAuth';
import { useState, useEffect } from 'react';

// ── Doctor IPFS photo hook ────────────────────────────────────────────────────
function useDoctorPhoto(metadataHash) {
  const [photoUrl, setPhotoUrl] = useState(null);
  useEffect(() => {
    if (!metadataHash || metadataHash === '') return;
    (async () => {
      for (const url of [
        `https://ipfs.io/ipfs/${metadataHash}`,
        `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
      ]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) {
            const data = await res.json();
            if (data?.photoCID) setPhotoUrl(`https://ipfs.io/ipfs/${data.photoCID}`);
            return;
          }
        } catch (_) {}
      }
    })();
  }, [metadataHash]);
  return photoUrl;
}

const STATUS_CFG = [
  { label: 'Pending',   badge: 'bg-orange-100 text-orange-700', bar: 'from-orange-400 to-amber-400',  icon: '⏳' },
  { label: 'Approved',  badge: 'bg-blue-100 text-blue-700',     bar: 'from-blue-400 to-indigo-400',   icon: '✅' },
  { label: 'Rejected',  badge: 'bg-red-100 text-red-700',       bar: 'from-red-400 to-rose-400',      icon: '❌' },
  { label: 'Completed', badge: 'bg-green-100 text-green-700',   bar: 'from-green-400 to-emerald-400', icon: '✓'  },
  { label: 'Cancelled', badge: 'bg-gray-100 text-gray-600',     bar: 'from-gray-300 to-gray-400',     icon: '🚫' },
];

function AppointmentCard({ appointmentId, filter = 'all' }) {
  const { address: patientAddress } = usePatientAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: appointment, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointments', args: [appointmentId],
  });

  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'doctors', args: [appointment?.[2]],
    enabled: !!appointment,
  });

  const { data: hasAccess, refetch: refetchAccess } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'checkAccess', args: [patientAddress, appointment?.[2]],
    enabled: !!appointment && !!patientAddress,
  });

  const doctorPhoto = useDoctorPhoto(doctor?.[7] || '');

  if (!appointment) return null;

  const status = Number(appointment[6]);

  // Filter check
  if (filter !== 'all') {
    if (filter === 'pending'   && status !== 0) return null;
    if (filter === 'approved'  && status !== 1) return null;
    if (filter === 'completed' && status !== 3) return null;
    if (filter === 'cancelled' && status !== 4) return null;
  }

  // Only show this patient's appointments
  if (appointment[1]?.toLowerCase() !== patientAddress?.toLowerCase()) return null;

  const cfg        = STATUS_CFG[status] ?? STATUS_CFG[4];
  const doctorName = doctor?.[1] || 'Loading...';
  const doctorSpec = doctor?.[2] || '';

  const callRelayer = async (endpoint, body) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setIsDone(true);
      setTimeout(() => { refetch(); refetchAccess(); setIsDone(false); }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => callRelayer('cancel-appointment', {
    patientAddress,
    appointmentId,
  });

  const handleToggleAccess = () => callRelayer(hasAccess ? 'revoke-access' : 'grant-access', {
    patientAddress,
    doctorAddress: appointment[2],
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">

      {/* Status bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.bar}`} />

      <div className="p-6">
        {isDone && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold text-green-800">Action completed successfully!</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-semibold">❌ {errorMsg}</p>
          </div>
        )}

        {/* Doctor header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shadow">
              {doctorPhoto
                ? <img src={doctorPhoto} alt={doctorName} className="w-full h-full object-cover" />
                : <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Doctor</p>
              <p className="text-lg font-bold text-gray-800">Dr. {doctorName}</p>
              {doctorSpec && <p className="text-sm text-green-600 font-semibold">{doctorSpec}</p>}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold flex-shrink-0 ${cfg.badge}`}>
            <span>{cfg.icon}</span>{cfg.label}
          </span>
        </div>

        {/* Info pills */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <InfoPill icon="📅" label="Date"   value={appointment[3]} />
          <InfoPill icon="🕐" label="Time"   value={appointment[4]} />
          <InfoPill icon="🆔" label="Appt #" value={`#${appointmentId}`} />
          <InfoPill icon="💬" label="Reason" value={appointment[5]} />
        </div>

        {/* Access row */}
        <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${
          hasAccess ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasAccess ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}/>
            <span className="text-sm font-semibold text-gray-700">
              {hasAccess ? 'Doctor can view your records' : 'Doctor has no record access'}
            </span>
          </div>
          {(status === 1 || status === 3) && (
            <button onClick={handleToggleAccess} disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                hasAccess ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
              {isLoading ? '...' : hasAccess ? '🔒 Revoke' : '🔓 Grant'}
            </button>
          )}
        </div>

        {/* Cancel button */}
        {(status === 0 || status === 1) && (
          <button onClick={handleCancel} disabled={isLoading}
            className="w-full py-2.5 bg-red-50 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading
              ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              : '🚫'} Cancel Appointment
          </button>
        )}

        {/* Completed + linked record */}
        {status === 3 && appointment[10] && appointment[10] !== 0n && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800 font-semibold">🩺 Medical record added (ID: {appointment[10].toString()})</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 font-semibold mb-0.5">{icon} {label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}

export default AppointmentCard;