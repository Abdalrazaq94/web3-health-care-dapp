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
    (async () => {
      for (const gw of [
        `https://ipfs.io/ipfs/${hash}`,
        `https://gateway.pinata.cloud/ipfs/${hash}`,
      ]) {
        try {
          const r = await fetch(gw, { signal: AbortSignal.timeout(5000) });
          if (r.ok) { setMeta(await r.json()); return; }
        } catch (_) {}
      }
    })();
  }, [hash]);
  return meta;
}

// doctorById returns:
// [0]=id [1]=name [2]=specialization [3]=licenseNumber [4]=walletAddress
// [5]=isApproved [6]=isActive [7]=metadataHash [8]=totalPatients
// [9]=totalAppointments [10]=totalRecordsAdded [11]=totalRating
// [12]=reviewCount [13]=registrationDate

function DoctorCard({ doctorId, onViewProfile, onApprove, onReject }) {
  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'doctorById',
    args: [Number(doctorId)],
  });

  const meta     = useIpfsMeta(doctor?.[7] || '');
  const photoUrl = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;

  if (!doctor) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-4 items-start">
        <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-40" />
        </div>
      </div>
    </div>
  );

  const name      = doctor[1];
  const spec      = doctor[2];
  const license   = doctor[3];
  const wallet    = doctor[4];
  const isApproved = doctor[5];
  const isActive   = doctor[6];
  const patients  = Number(doctor[8]);
  const appts     = Number(doctor[9]);
  const records   = Number(doctor[10]);
  const totalRating = Number(doctor[11]);
  const reviews   = Number(doctor[12]);
  const regDate   = Number(doctor[13]);
  const avgRating = reviews > 0 ? (totalRating / reviews).toFixed(1) : null;
  const initials  = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const isPending = !isApproved;

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200
      hover:shadow-lg hover:-translate-y-0.5
      ${isPending ? 'border-amber-200' : 'border-gray-100'}`}>

      {/* accent line */}
      <div className={`h-0.5 ${isPending
        ? 'bg-gradient-to-r from-amber-400 to-orange-400'
        : isActive
          ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
          : 'bg-gray-200'}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar — click to view profile */}
          <button onClick={() => onViewProfile(doctorId)}
            className="flex-shrink-0 rounded-xl overflow-hidden w-14 h-14
              ring-2 ring-offset-1 ring-gray-100 hover:ring-indigo-300 transition-all">
            {photoUrl
              ? <img src={photoUrl} alt={name} className="w-14 h-14 object-cover" />
              : <div className={`w-14 h-14 flex items-center justify-center font-black text-lg text-white
                  ${isPending
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                    : 'bg-gradient-to-br from-indigo-400 to-purple-500'}`}>
                  {initials}
                </div>
            }
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{name}</h3>
                <p className={`text-xs font-semibold mt-0.5 ${isPending ? 'text-amber-600' : 'text-indigo-600'}`}>
                  {spec}
                </p>
                <p className="text-gray-400 font-mono text-xs mt-0.5 truncate">{license}</p>
              </div>
              <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border
                ${isPending
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {isPending ? '⏳ Pending' : isActive ? '● Active' : '○ Away'}
              </span>
            </div>

            {meta?.hospital && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 truncate">
                <span>🏥</span><span>{meta.hospital}</span>
              </p>
            )}
            {regDate > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {isPending ? 'Applied' : 'Joined'}{' '}
                {new Date(regDate * 1000).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Stats — approved only */}
        {!isPending && (
          <div className="grid grid-cols-4 gap-1.5 mt-4">
            {[
              { label: 'Patients', value: patients,  bg: 'bg-blue-50',   text: 'text-blue-700'   },
              { label: 'Appts',    value: appts,     bg: 'bg-purple-50', text: 'text-purple-700' },
              { label: 'Records',  value: records,   bg: 'bg-teal-50',   text: 'text-teal-700'   },
              { label: 'Rating',   value: avgRating ?? '—', bg: 'bg-amber-50', text: 'text-amber-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-lg py-1.5 text-center`}>
                <div className={`text-sm font-black ${s.text}`}>{s.value}</div>
                <div className="text-gray-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={() => onViewProfile(doctorId)}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs
              font-semibold hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            View Profile
          </button>
          {isPending && (
            <>
              <button onClick={() => onReject(doctorId, wallet)}
                className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-xs
                  font-bold hover:bg-red-50 transition-all">
                ✕ Reject
              </button>
              <button onClick={() => onApprove(wallet)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs
                  font-bold hover:bg-indigo-700 transition-all shadow-sm">
                ✓ Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorCard;