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
        } catch (_) { }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [hash]);
  return { meta, loading };
}

function Field({ label, value, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 ${mono ? 'font-mono text-xs break-all bg-gray-50 p-2 rounded-lg' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function DoctorProfileModal({ doctorId, isPending, onClose, onApprove, onReject }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');

  // Fetch by numeric ID - same as old DoctorProfile component
  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'doctorById',
    args: [Number(doctorId)],
  });

  const hash = doctor?.[7] || '';
  const { meta, loading: ipfsLoading } = useIpfsMeta(hash);
  const photoUrl = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;
  const certUrl = meta?.certificateCID ? `https://ipfs.io/ipfs/${meta.certificateCID}` : null;

  // Loading state
  if (!doctor) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8,8,20,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl p-12 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading doctor profile…</p>
      </div>
    </div>
  );

  // doctor array indexes
  const name = doctor[1];
  const spec = doctor[2];
  const license = doctor[3];
  const wallet = doctor[4];
  const approved = doctor[5];
  const active = doctor[6];
  const patients = Number(doctor[8]);
  const appts = Number(doctor[9]);
  const records = Number(doctor[10]);
  const totalRating = Number(doctor[11]);
  const reviews = Number(doctor[12]);
  const regDate = Number(doctor[13]);
  const avgRating = reviews > 0 ? (totalRating / reviews).toFixed(1) : 'N/A';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,8,20,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div
        className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl
          max-h-[92vh] flex flex-col"
        style={{ animation: 'popIn .25s cubic-bezier(.34,1.56,.64,1)' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Dark hero header ── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900
          px-7 pt-7 pb-6 flex-shrink-0">

          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10
              hover:bg-white/20 text-white text-sm transition-all flex items-center justify-center">
            ✕
          </button>

          <div className="flex items-end gap-5">
            {/* Photo / initials */}
            <div className="relative flex-shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400
                  to-purple-600 flex items-center justify-center text-white font-black
                  text-2xl ring-4 ring-white/20 shadow-xl">
                  {ipfsLoading
                    ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
                {spec}
              </p>
              <h2 className="text-white font-black text-xl leading-tight truncate">{name}</h2>
              <p className="text-white/50 font-mono text-xs mt-1 truncate">{license}</p>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border
                  ${isPending
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                    : approved
                      ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-red-400/20 text-red-300 border-red-400/30'}`}>
                  {isPending ? '⏳ Pending Review' : approved ? '✓ Approved' : '✗ Rejected'}
                </span>
                {approved && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border
                    ${active
                      ? 'bg-teal-400/20 text-teal-300 border-teal-400/30'
                      : 'bg-gray-400/20 text-gray-300 border-gray-400/30'}`}>
                    {active ? '● Available' : '○ Unavailable'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { label: 'Patients', value: patients },
              { label: 'Appointments', value: appts },
              { label: 'Records', value: records },
              { label: 'Rating', value: `${avgRating}${reviews > 0 ? ` (${reviews})` : ''}` },
            ].map(s => (
              <div key={s.label}
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 text-center">
                <p className="text-white font-black text-sm">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">

          {/* IPFS loading banner */}
          {ipfsLoading && (
            <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50
              border border-indigo-100 rounded-xl">
              <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent
                rounded-full animate-spin flex-shrink-0" />
              <p className="text-sm text-indigo-700">Loading extended profile from IPFS…</p>
            </div>
          )}

          {/* Practice info from IPFS */}
          {meta && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Practice Information
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Hospital" value={meta.hospital} />
                <Field label="Consultation Fee" value={meta.consultationFee ? `£${meta.consultationFee}` : null} />
                <Field label="Experience" value={meta.yearsOfExperience ? `${meta.yearsOfExperience} years` : null} />
                <Field label="Working Hours" value={meta.workingHours} />
                <Field label="Clinic Address" value={meta.clinicAddress || meta.address} />
                <Field label="Email" value={meta.email} />
                <Field label="Phone" value={meta.phone} />
              </div>
            </section>
          )}

          {/* Bio */}
          {meta?.bio && (
            <section className="border-t border-gray-100 pt-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{meta.bio}</p>
            </section>
          )}

          {/* Education */}
          {meta?.education && (
            <section className="border-t border-gray-100 pt-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Education</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{meta.education}</p>
            </section>
          )}

          {/* Languages */}
          {meta?.languages?.length > 0 && (
            <section className="border-t border-gray-100 pt-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {meta.languages.map(l => (
                  <span key={l} className="px-3 py-1 bg-indigo-50 text-indigo-700
                    border border-indigo-100 rounded-full text-xs font-semibold">{l}</span>
                ))}
              </div>
            </section>
          )}

          {/* Certificate link */}
          {certUrl && (
            <section className="border-t border-gray-100 pt-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Documents</h4>
              <a href={certUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-emerald-50 text-emerald-700 border border-emerald-200
                  hover:bg-emerald-100 transition-all text-sm font-semibold">
                📜 View Medical Certificate (IPFS)
              </a>
            </section>
          )}

          {/* Blockchain data */}
          <section className="border-t border-gray-100 pt-5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Blockchain Details
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              <Field label="Wallet Address" value={wallet} mono />
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

        {/* ── Footer actions ── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/80 px-7 py-4">
          {isPending && !rejectMode && (
            <div className="flex gap-3">
              <button onClick={() => setRejectMode(true)}
                className="flex-1 py-2.5 rounded-xl border-2 border-red-200 text-red-600
                  hover:bg-red-50 font-bold text-sm transition-all">
                ✕ Reject
              </button>
              <button onClick={() => { onApprove(wallet); onClose(); }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700
                  text-white font-bold text-sm transition-all shadow-md shadow-indigo-200">
                ✓ Approve Doctor
              </button>
            </div>
          )}

          {isPending && rejectMode && (
            <div className="space-y-3">
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for rejection (required)…"
                rows={3}
                className="w-full border-2 border-red-200 rounded-xl px-3 py-2.5 text-sm
                  resize-none focus:border-red-400 focus:outline-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectMode(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500
                    hover:bg-gray-50 text-sm font-semibold transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => { if (reason.trim()) { onReject(wallet, reason); onClose(); } }}
                  disabled={!reason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700
                    disabled:opacity-40 text-white text-sm font-bold transition-all">
                  Confirm Reject
                </button>
              </div>
            </div>
          )}

          {!isPending && (
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600
                hover:bg-gray-100 font-semibold text-sm transition-all">
              Close
            </button>
          )}
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

export default DoctorProfileModal;