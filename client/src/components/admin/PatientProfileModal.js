
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
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!hash) return;
    setLoading(true);
    let cancelled = false;
    (async () => {
      for (const gw of [
        `https://ipfs.io/ipfs/${hash}`,
        `https://gateway.pinata.cloud/ipfs/${hash}`,
        `https://cloudflare-ipfs.com/ipfs/${hash}`,
      ]) {
        try {
          const r = await fetch(gw, { signal: AbortSignal.timeout(6000) });
          if (r.ok) {
            if (!cancelled) { setMeta(await r.json()); setLoading(false); }
            return;
          }
        } catch (_) {}
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [hash]);
  return { meta, loading };
}

function Field({ label, value, mono = false, highlight = null }) {
  if (!value && value !== 0) return null;
  const highlightClass =
    highlight === 'danger'  ? 'text-red-700 font-semibold' :
    highlight === 'warning' ? 'text-amber-700 font-semibold' : 'text-gray-800';
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm ${highlightClass} ${mono ? 'font-mono text-xs break-all bg-gray-50 p-2 rounded-lg' : ''}`}>
        {value}
      </p>
    </div>
  );
}

const BLOOD_GRADIENT = {
  'A+': 'from-red-500 to-rose-600',   'A-': 'from-red-500 to-rose-600',
  'B+': 'from-pink-500 to-red-500',   'B-': 'from-pink-500 to-red-500',
  'O+': 'from-orange-500 to-red-500', 'O-': 'from-orange-500 to-red-500',
  'AB+':'from-purple-500 to-pink-500','AB-':'from-purple-500 to-pink-500',
};

function PatientProfileModal({ patientId, onClose }) {
  // Same pattern — fetch by numeric ID
  const { data: p } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'patientById',
    args: [Number(patientId)],
  });

  const hash = p?.[7] || '';
  const { meta, loading: ipfsLoading } = useIpfsMeta(hash);
  const photoUrl = meta?.photoHash ? `https://ipfs.io/ipfs/${meta.photoHash}` : null;

  if (!p) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8,8,20,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl p-12 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading patient data…</p>
      </div>
    </div>
  );

  // patient array indexes
  const name    = p[1];
  const age     = Number(p[2]);
  const blood   = p[3];
  const gender  = p[4];
  const wallet  = p[5];
  const records = Number(p[8]);
  const appts   = Number(p[9]);
  const regDate = Number(p[10]);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bloodGrad = BLOOD_GRADIENT[blood] || 'from-gray-400 to-gray-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,8,20,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl
        max-h-[92vh] flex flex-col"
        style={{ animation: 'popIn .25s cubic-bezier(.34,1.56,.64,1)' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Hero ── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
          px-7 pt-7 pb-6 flex-shrink-0">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10
              hover:bg-white/20 text-white text-sm transition-all flex items-center justify-center">
            ✕
          </button>

          <div className="flex items-end gap-5">
            <div className="relative flex-shrink-0">
              {/* Blood type glow */}
              <div className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-br ${bloodGrad}
                opacity-50 blur-sm`} />
              {photoUrl ? (
                <img src={photoUrl} alt={name}
                  className="relative w-20 h-20 rounded-2xl object-cover
                    ring-4 ring-white/20 shadow-xl" />
              ) : (
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br
                  from-blue-400 to-indigo-600 flex items-center justify-center
                  text-white font-black text-2xl ring-4 ring-white/20 shadow-xl">
                  {ipfsLoading
                    ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : initials}
                </div>
              )}
              {/* Blood badge */}
              <span className={`absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-lg
                text-white text-xs font-black shadow-lg bg-gradient-to-br ${bloodGrad}`}>
                {blood}
              </span>
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Patient</p>
              <h2 className="text-white font-black text-xl leading-tight truncate">{name}</h2>
              <p className="text-white/60 text-sm mt-0.5">{gender} · {age} years old</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold
                px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                ✓ Registered
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label: 'Medical Records', value: records },
              { label: 'Appointments',    value: appts },
              { label: 'Blood Type',      value: blood },
            ].map(s => (
              <div key={s.label}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 text-center">
                <p className="text-white font-black text-base">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">

          {/* IPFS loading */}
          {ipfsLoading && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50
              border border-blue-100 rounded-xl">
              <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent
                rounded-full animate-spin flex-shrink-0" />
              <p className="text-sm text-blue-700">Loading extended profile from IPFS…</p>
            </div>
          )}

          {/* Contact info from IPFS */}
          {meta && (meta.email || meta.phone || meta.address || meta.emergencyContact) && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Email"             value={meta.email} />
                <Field label="Phone"             value={meta.phone} />
                <Field label="Address"           value={meta.address} />
                <Field label="Emergency Contact" value={meta.emergencyContact} highlight="danger" />
              </div>
            </section>
          )}

          {/* Medical history from IPFS */}
          {meta && (meta.allergies || meta.chronicConditions) && (
            <section className="border-t border-gray-100 pt-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Medical History
              </h4>
              <div className="space-y-3">
                {meta.allergies && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">
                      ⚠️ Allergies
                    </p>
                    <p className="text-sm text-red-800">{meta.allergies}</p>
                  </div>
                )}
                {meta.chronicConditions && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">
                      🏥 Chronic Conditions
                    </p>
                    <p className="text-sm text-amber-900">{meta.chronicConditions}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Blockchain */}
          <section className="border-t border-gray-100 pt-5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Blockchain Details
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              <Field label="Wallet Address"    value={wallet}  mono />
              {hash && <Field label="IPFS Metadata Hash" value={hash} mono />}
              {regDate > 0 && (
                <Field label="Registration Date"
                  value={new Date(regDate * 1000).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })} />
              )}
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/80 px-7 py-4">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600
              hover:bg-gray-100 font-semibold text-sm transition-all">
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(.93) translateY(14px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </div>
  );
}

export default PatientProfileModal;