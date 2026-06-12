
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState, useEffect } from 'react';

function DoctorProfileModal({ doctor, onClose, onBook }) {
  const metadataHash = doctor?.metadataHash || doctor?.[7] || '';
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!metadataHash) return;
    setLoading(true);
    (async () => {
      for (const url of [
        `https://ipfs.io/ipfs/${metadataHash}`,
        `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
      ]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); setLoading(false); return; }
        } catch (_) {}
      }
      setLoading(false);
    })();
  }, [metadataHash]);

  if (!doctor) return null;

  // On-chain fields
  const name           = doctor.name           || doctor[1] || 'Unknown';
  const specialization = doctor.specialization || doctor[2] || 'N/A';
  const license        = doctor.licenseNumber  || doctor[3] || 'N/A';
  const walletAddress  = doctor.walletAddress  || doctor[4] || '';
  const isActive       = doctor.isActive       ?? doctor[6] ?? false;
  const totalPatients  = Number(doctor.totalPatients        || doctor[8]  || 0);
  const totalAppts     = Number(doctor.totalAppointments    || doctor[9]  || 0);
  const totalRecords   = Number(doctor.totalRecordsAdded    || doctor[10] || 0);
  const totalRating    = Number(doctor.totalRating          || doctor[11] || 0);
  const reviewCount    = Number(doctor.reviewCount          || doctor[12] || 0);
  const avgRating      = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : null;

  // IPFS fields
  const photoUrl   = meta?.photoCID         ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;
  const certUrl    = meta?.certificateCID   ? `https://ipfs.io/ipfs/${meta.certificateCID}` : null;
  const hospital   = meta?.hospital          || null;
  const fee        = meta?.consultationFee   || null;
  const exp        = meta?.yearsOfExperience || null;
  const bio        = meta?.bio               || null;
  const languages  = meta?.languages         || [];
  const email      = meta?.email             || null;
  const phone      = meta?.phone             || null;
  const address    = meta?.clinicAddress     || meta?.address || null;
  const education  = meta?.education         || null;
  const workingHours = meta?.workingHours    || null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ animation: 'modalIn .3s ease-out' }}>

        {/* ── Header banner ── */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 relative flex-shrink-0">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center text-xl font-bold transition-all">
            ×
          </button>

          <div className="flex items-center gap-5">
            {/* Photo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-white bg-opacity-20 flex items-center justify-center shadow-lg border-2 border-white border-opacity-40">
              {loading ? (
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : photoUrl ? (
                <img src={photoUrl} alt={`Dr. ${name}`} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-14 h-14 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>

            {/* Name + spec */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white">Dr. {name}</h2>
              <p className="text-green-100 font-semibold mt-0.5">{specialization}</p>
              <p className="text-white text-opacity-70 text-xs font-mono mt-1">{license}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isActive ? 'bg-green-400 bg-opacity-30 text-white' : 'bg-red-400 bg-opacity-30 text-white'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}/>
                  {isActive ? 'Available' : 'Unavailable'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white bg-opacity-20 text-white">
                  ✅ Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            <StatMini icon="👥" label="Patients"   value={totalPatients} color="text-blue-600"   bg="bg-blue-50"   />
            <StatMini icon="📅" label="Appts"      value={totalAppts}    color="text-purple-600" bg="bg-purple-50" />
            <StatMini icon="📋" label="Records"    value={totalRecords}  color="text-green-600"  bg="bg-green-50"  />
            <StatMini
              icon="⭐"
              label="Rating"
              value={avgRating ? `${avgRating}/5` : 'N/A'}
              color="text-yellow-600"
              bg="bg-yellow-50"
              sub={reviewCount > 0 ? `${reviewCount} reviews` : ''}
            />
          </div>

          {/* Bio */}
          {bio && (
            <Section title="About" icon="💬">
              <p className="text-gray-700 text-sm leading-relaxed">{bio}</p>
            </Section>
          )}

          {/* Practice info */}
          <Section title="Practice Information" icon="🏥">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow icon="🏥" label="Hospital / Clinic" value={hospital} />
              <InfoRow icon="💷" label="Consultation Fee"  value={fee ? `£${fee}` : null} />
              <InfoRow icon="⏱️" label="Experience"        value={exp ? `${exp} years` : null} />
              <InfoRow icon="🕐" label="Working Hours"     value={workingHours} />
              {address && <InfoRow icon="📍" label="Clinic Address" value={address} span2 />}
            </div>
          </Section>

          {/* Education */}
          {education && (
            <Section title="Education & Qualifications" icon="🎓">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{education}</p>
            </Section>
          )}

          {/* Rating breakdown */}
          {avgRating && (
            <Section title="Rating" icon="⭐">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-yellow-500">{avgRating}</p>
                  <p className="text-xs text-gray-400 mt-1">out of 5</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-6 h-6 ${Number(avgRating) >= s ? 'text-yellow-400' : 'text-gray-200'}`}
                        fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{reviewCount} patient review{reviewCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </Section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <Section title="Languages" icon="🌐">
              <div className="flex flex-wrap gap-2">
                {languages.map((l, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">🌐 {l}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Contact */}
          {(email || phone) && (
            <Section title="Contact" icon="📞">
              <div className="grid grid-cols-2 gap-3">
                <InfoRow icon="📧" label="Email" value={email} />
                <InfoRow icon="📱" label="Phone" value={phone} />
              </div>
            </Section>
          )}

          {/* Certificate */}
          {certUrl && (
            <Section title="Medical Certificate" icon="📜">
              <a href={certUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-all text-sm">
                <span>📜</span> View Certificate
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </Section>
          )}

          {/* Wallet */}
          <Section title="Blockchain Identity" icon="⛓️">
            <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-500 break-all">
              {walletAddress}
            </div>
          </Section>

          {/* IPFS note */}
          {!meta && !loading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700 flex items-center gap-2">
              <span>📦</span> Extended profile info will appear here once IPFS upload is complete.
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white">
          <button onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all">
            Close
          </button>
          <button onClick={onBook} disabled={!isActive}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2">
            {isActive ? <><span>📅</span> Book Appointment</> : <><span>🚫</span> Unavailable</>}
          </button>
        </div>
      </div>

      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <span>{icon}</span>{title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, span2 }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 ${span2 ? 'col-span-2' : ''}`}>
      <p className="text-xs text-gray-400 font-semibold mb-0.5">{icon} {label}</p>
      <p className={`text-sm font-semibold ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
        {value || '—'}
      </p>
    </div>
  );
}

function StatMini({ icon, label, value, color, bg, sub }) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <p className="text-lg mb-0.5">{icon}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default DoctorProfileModal;