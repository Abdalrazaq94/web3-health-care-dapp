
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';

function useIpfsMeta(hash) {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    if (!hash) return;
    let cancelled = false;
    (async () => {
      for (const gw of [
        `https://ipfs.io/ipfs/${hash}`,
        `https://gateway.pinata.cloud/ipfs/${hash}`,
        `https://cloudflare-ipfs.com/ipfs/${hash}`,
      ]) {
        try {
          const r = await fetch(gw, { signal: AbortSignal.timeout(6000) });
          if (r.ok) { if (!cancelled) setMeta(await r.json()); return; }
        } catch (_) {}
      }
    })();
    return () => { cancelled = true; };
  }, [hash]);
  return meta;
}

const BLOOD_BADGE = {
  'A+': 'bg-red-50 text-red-600 border-red-200',
  'A-': 'bg-red-50 text-red-600 border-red-200',
  'B+': 'bg-pink-50 text-pink-600 border-pink-200',
  'B-': 'bg-pink-50 text-pink-600 border-pink-200',
  'O+': 'bg-rose-50 text-rose-600 border-rose-200',
  'O-': 'bg-rose-50 text-rose-600 border-rose-200',
  'AB+': 'bg-purple-50 text-purple-600 border-purple-200',
  'AB-': 'bg-purple-50 text-purple-600 border-purple-200',
};

function PatientRow({ patientId, onViewProfile }) {
  // Same pattern as old DoctorCard - fetch by numeric ID
  const { data: p } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'patientById',
    args: [Number(patientId)],
  });

  // patient array indexes:
  // [0] id  [1] name  [2] age  [3] bloodType  [4] gender
  // [5] isRegistered  [6] walletAddress  [7] metadataHash -- wait, let me check
  // Actually: [0]id [1]name [2]age [3]bloodType [4]gender [5]walletAddress [6]isRegistered [7]metadataHash [8]totalRecords [9]totalAppointments [10]registrationDate

  const meta     = useIpfsMeta(p?.[7] || '');
  const photoUrl = meta?.photoHash ? `https://ipfs.io/ipfs/${meta.photoHash}` : null;

  // Skeleton row while loading
  if (!p) {
    return (
      <tr className="border-b border-gray-50">
        <td colSpan={7} className="px-5 py-3.5">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-32" />
              <div className="h-2.5 bg-gray-100 rounded w-20" />
            </div>
          </div>
        </td>
      </tr>
    );
  }

  const name    = p[1];
  const age     = Number(p[2]);
  const blood   = p[3];
  const gender  = p[4];
  const wallet  = p[5];
  const records = Number(p[8]);
  const appts   = Number(p[9]);
  const regDate = Number(p[10]);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bloodStyle = BLOOD_BADGE[blood] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <tr className="border-b border-gray-50 hover:bg-slate-50/70 transition-colors group">

      {/* Name + avatar */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            <img src={photoUrl} alt={name}
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-100" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500
              flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{name}</p>
            <p className="font-mono text-gray-400 text-xs">
              {wallet?.slice(0, 6)}…{wallet?.slice(-4)}
            </p>
          </div>
        </div>
      </td>

      {/* Age / Gender */}
      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
        {age} · {gender}
      </td>

      {/* Blood */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold border ${bloodStyle}`}>
          {blood}
        </span>
      </td>

      {/* Records */}
      <td className="px-4 py-3.5">
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg">
          📋 {records}
        </span>
      </td>

      {/* Appointments */}
      <td className="px-4 py-3.5">
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">
          📅 {appts}
        </span>
      </td>

      {/* Joined */}
      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
        {regDate > 0
          ? new Date(regDate * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—'}
      </td>

      {/* Action */}
      <td className="px-4 py-3.5">
        <button
          onClick={() => onViewProfile(patientId)}
          className="opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 text-xs
            font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100
            border border-indigo-100 whitespace-nowrap">
          View →
        </button>
      </td>
    </tr>
  );
}

export default PatientRow;  