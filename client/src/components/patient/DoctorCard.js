
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useState, useEffect } from 'react';
import BookAppointmentModal from './BookAppointmentModal';
import DoctorProfileModal from './DoctorProfileModal';

// ── IPFS hook ─────────────────────────────────────────────────────────────────
function useIpfsMeta(hash) {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    if (!hash || hash === '') return;
    (async () => {
      for (const url of [
        `https://ipfs.io/ipfs/${hash}`,
        `https://gateway.pinata.cloud/ipfs/${hash}`,
      ]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); return; }
        } catch (_) {}
      }
    })();
  }, [hash]);
  return meta;
}

function DoctorCard({ doctor }) {
  // ── ALL hooks before any early return ────────────────────────────────────
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const metadataHash = doctor?.metadataHash || doctor?.[7] || '';
  const meta = useIpfsMeta(metadataHash);

  if (!doctor) return null;

  const name           = doctor.name           || doctor[1] || 'Unknown';
  const specialization = doctor.specialization || doctor[2] || 'N/A';
  const license        = doctor.licenseNumber  || doctor[3] || 'N/A';
  const walletAddress  = doctor.walletAddress  || doctor[4] || '';
  const isApproved     = doctor.isApproved     ?? doctor[5] ?? false;
  const isActive       = doctor.isActive       ?? doctor[6] ?? false;
  const totalPatients  = Number(doctor.totalPatients || doctor[8]  || 0);
  const totalRating    = Number(doctor.totalRating   || doctor[11] || 0);
  const reviewCount    = Number(doctor.reviewCount   || doctor[12] || 0);
  const avgRating      = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : null;

  const photoUrl  = meta?.photoCID        ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;
  const hospital  = meta?.hospital          || null;
  const fee       = meta?.consultationFee   || null;
  const exp       = meta?.yearsOfExperience || null;
  const bio       = meta?.bio               || null;
  const languages = meta?.languages         || [];

  if (!isApproved) return null;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">

        {/* Availability bar */}
        <div className={`h-1.5 w-full ${isActive
          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
          : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />

        <div className="p-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Clickable photo → opens profile */}
              <div
                onClick={() => setShowProfile(true)}
                className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shadow cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
                {photoUrl
                  ? <img src={photoUrl} alt={`Dr. ${name}`} className="w-full h-full object-cover" />
                  : <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Dr. {name}</h3>
                <p className="text-green-600 font-semibold text-sm">{specialization}</p>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{license}</p>
              </div>
            </div>

            {/* Availability badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isActive ? 'Available' : 'Unavailable'}
            </span>
          </div>

          {/* Info pills */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <InfoPill icon="🏥" label="Hospital"   value={hospital || '—'} />
            <InfoPill icon="💷" label="Fee"        value={fee ? `£${fee}` : '—'} />
            <InfoPill icon="⏱️" label="Experience" value={exp ? `${exp} yrs` : '—'} />
            <InfoPill icon="👥" label="Patients"   value={totalPatients} />
          </div>

          {/* Rating */}
          {avgRating && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-yellow-50 rounded-xl border border-yellow-100">
              <span className="text-yellow-500">⭐</span>
              <span className="font-bold text-yellow-700">{avgRating}/5</span>
              <span className="text-yellow-600 text-xs">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {languages.map((l, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">🌐 {l}</span>
              ))}
            </div>
          )}

          {/* Bio preview */}
          {bio && <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{bio}</p>}

          {!meta && metadataHash === '' && (
            <p className="text-xs text-gray-400 italic mb-4">📦 Extended info available after IPFS upload</p>
          )}

          {/* Wallet */}
          <p className="text-xs text-gray-400 font-mono mb-5 truncate">
            {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-6)}
          </p>

          {/* ── Two action buttons ── */}
          <div className="flex gap-3">
            {/* View Full Profile */}
            <button
              onClick={() => setShowProfile(true)}
              className="flex-1 py-3 bg-gray-50 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all flex items-center justify-center gap-2">
              <span>👤</span> View Profile
            </button>

            {/* Book Appointment */}
            <button
              onClick={() => setShowBooking(true)}
              disabled={!isActive}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
              {isActive ? <><span>📅</span> Book</> : <><span>🚫</span> Unavailable</>}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProfile && (
        <DoctorProfileModal
          doctor={doctor}
          onClose={() => setShowProfile(false)}
          onBook={() => { setShowProfile(false); setShowBooking(true); }}
        />
      )}
      {showBooking && (
        <BookAppointmentModal doctor={doctor} onClose={() => setShowBooking(false)} />
      )}

      <style>{`.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-2.5">
      <p className="text-xs text-gray-400 font-semibold mb-0.5">{icon} {label}</p>
      <p className="text-sm font-bold text-gray-700 truncate">{value}</p>
    </div>
  );
}

export default DoctorCard;