
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useState, useEffect } from 'react';

function useIpfsMeta(hash) {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    if (!hash || hash === '') return;
    (async () => {
      for (const url of [`https://ipfs.io/ipfs/${hash}`, `https://gateway.pinata.cloud/ipfs/${hash}`]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); return; }
        } catch (_) {}
      }
    })();
  }, [hash]);
  return meta;
}

function DoctorAccessCard({ doctorAddress, patientAddress }) {
  const [txHash, setTxHash] = useState(null);

  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'doctors', args: [doctorAddress],
  });

  const { data: hasAccess } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'checkAccess', args: [patientAddress, doctorAddress],
  });

  // ── Find latest appointment between this patient and doctor ───────────────
  const { data: appointmentCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointmentCount',
  });

  const { writeContract } = useWriteContract({ onSuccess: (hash) => setTxHash(hash) });
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess: () => { setTxHash(null); window.location.reload(); },
  });

  const meta     = useIpfsMeta(doctor?.[7] || '');
  const photoUrl = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;
  const hospital = meta?.hospital || null;

  if (!doctor) return null;

  const name     = doctor[1] || 'Unknown';
  const spec     = doctor[2] || 'N/A';
  const license  = doctor[3] || 'N/A';
  const isActive = doctor[6] ?? false;

  const toggleAccess = () => writeContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: hasAccess ? 'revokeAccess' : 'grantAccess',
    args: [doctorAddress], gas: 5000000n,
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className={`h-1.5 w-full ${hasAccess
        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
        : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}/>

      <div className="p-6">
        {isSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold text-green-800">Access updated successfully!</span>
          </div>
        )}

        {/* Doctor info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shadow">
              {photoUrl
                ? <img src={photoUrl} alt={name} className="w-full h-full object-cover"/>
                : <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-800">Dr. {name}</h3>
              <p className="text-green-600 font-semibold text-sm">{spec}</p>
              {hospital && <p className="text-xs text-gray-400 mt-0.5">🏥 {hospital}</p>}
              <p className="text-xs font-mono text-gray-400 mt-0.5">{license}</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              hasAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasAccess ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}/>
              {hasAccess ? 'Access Granted' : 'No Access'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
              {isActive ? '🟢 Available' : '🔴 Unavailable'}
            </span>
          </div>
        </div>

        {/* Access info box */}
        <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2 ${
          hasAccess
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'}`}>
          <span className="flex-shrink-0">{hasAccess ? '🔓' : '🔒'}</span>
          <p className="text-xs font-semibold text-gray-700">
            {hasAccess
              ? 'This doctor can currently view your full medical records. Revoke if you no longer want them to have access.'
              : 'This doctor cannot view your records. Access is automatically suggested when they approve your appointment — you can also manually grant it here.'}
          </p>
        </div>

        {/* ⚠️ Warning when granting manually */}
        {!hasAccess && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <p className="text-xs text-orange-700 font-semibold">
              Access should only be granted after the doctor has approved your appointment.
            </p>
          </div>
        )}

        {/* Toggle button */}
        <button onClick={toggleAccess} disabled={isLoading}
          className={`w-full mt-4 py-3 rounded-xl font-bold transition-all shadow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            hasAccess
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'}`}>
          {isLoading
            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Processing...</>
            : hasAccess
              ? <><span>🔒</span> Revoke Record Access</>
              : <><span>🔓</span> Grant Record Access</>}
        </button>
      </div>
    </div>
  );
}

export default DoctorAccessCard;