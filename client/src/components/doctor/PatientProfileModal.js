
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState, useEffect } from 'react';

function useIpfsMeta(metadataHash) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!metadataHash || metadataHash === '') { setMeta(null); return; }
    setLoading(true);
    const gateways = [
      `https://ipfs.io/ipfs/${metadataHash}`,
      `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
    ];
    const tryFetch = async () => {
      for (const url of gateways) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); setLoading(false); return; }
        } catch (_) {}
      }
      setMeta(null); setLoading(false);
    };
    tryFetch();
  }, [metadataHash]);
  return { meta, loading };
}

function PatientProfileModal({ patient, patientAddress, hasAccess, onClose }) {
  const name         = patient[1] || 'Unknown';
  const age          = patient[2]?.toString() || '—';
  const bloodType    = patient[3] || '—';
  const gender       = patient[4] || '—';
  const wallet       = patient[5] || patientAddress;
  const totalRecords = Number(patient[8]  || 0);
  const totalAppts   = Number(patient[9]  || 0);
  const metadataHash = patient[7] || '';
  const regDate      = patient[10]
    ? new Date(Number(patient[10]) * 1000).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';

  const { meta, loading } = useIpfsMeta(metadataHash);

  const email      = meta?.email                 || null;
  const phone      = meta?.phone                 || null;
  const address    = meta?.address               || null;
  const emergName  = meta?.emergencyContactName  || null;
  const emergPhone = meta?.emergencyContactPhone || null;
  const allergies  = meta?.allergies             || null;
  const conditions = meta?.chronicConditions     || null;
  // ✅ Fixed: was meta?.photoHash — now correctly uses photoCID
  const photoUrl   = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;

  const bloodStyles = {
    'A+':'bg-red-100 text-red-700','A-':'bg-red-100 text-red-700',
    'B+':'bg-orange-100 text-orange-700','B-':'bg-orange-100 text-orange-700',
    'O+':'bg-blue-100 text-blue-700','O-':'bg-blue-100 text-blue-700',
    'AB+':'bg-purple-100 text-purple-700','AB-':'bg-purple-100 text-purple-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[93vh] flex flex-col shadow-2xl"
        style={{ animation: 'modalIn .3s ease-out' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Banner ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-white bg-opacity-20 flex items-center justify-center shadow-lg border-2 border-white border-opacity-30">
                {photoUrl
                  ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  : <span className="text-4xl">👤</span>}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${bloodStyles[bloodType] || 'bg-gray-100 text-gray-700'}`}>
                    🩸 {bloodType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white bg-opacity-20 text-white">{gender}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white bg-opacity-20 text-white">Age {age}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${hasAccess ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                    {hasAccess ? '✅ Access Granted' : '❌ No Access'}
                  </span>
                </div>
                <p className="text-blue-200 text-xs mt-1.5 font-mono">{wallet?.slice(0,10)}...{wallet?.slice(-6)}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200 text-3xl leading-none flex-shrink-0">×</button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: '📋', label: 'Medical Records', value: totalRecords },
              { icon: '📅', label: 'Appointments',    value: totalAppts  },
              { icon: '🗓️', label: 'Registered',      value: regDate     },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <p className="text-xl">{icon}</p>
                <p className="text-white font-bold text-lg mt-0.5">{value}</p>
                <p className="text-blue-100 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {loading && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-blue-700 text-sm font-semibold">Loading extended profile from IPFS...</p>
            </div>
          )}

          {!loading && !meta && metadataHash === '' && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl text-sm text-yellow-800">
              ℹ️ This patient has not yet uploaded extended profile info (contact, emergency, medical history).
            </div>
          )}

          {/* Contact Info */}
          <ProfileSection title="Contact Information" icon="📞">
            <InfoGrid>
              <InfoBox icon="📧" label="Email Address"    value={email}   placeholder="Not provided" />
              <InfoBox icon="📱" label="Phone Number"     value={phone}   placeholder="Not provided" />
              <InfoBox icon="🏠" label="Physical Address" value={address} placeholder="Not provided" span2 />
            </InfoGrid>
          </ProfileSection>

          {/* Emergency Contact */}
          <ProfileSection title="Emergency Contact" icon="🚨" accent="border-red-400">
            <InfoGrid>
              <InfoBox icon="👤" label="Contact Name"  value={emergName}  placeholder="Not provided" />
              <InfoBox icon="📞" label="Contact Phone" value={emergPhone} placeholder="Not provided" />
            </InfoGrid>
          </ProfileSection>

          {/* Medical Info */}
          <ProfileSection title="Medical Information" icon="🏥" accent="border-purple-400">
            <InfoGrid>
              <InfoBox icon="🩸" label="Blood Type" value={bloodType} />
              <InfoBox icon="👤" label="Gender"     value={gender} />
              <InfoBox icon="🎂" label="Age"        value={`${age} years old`} />
              <InfoBox icon="💊" label="Known Allergies"
                value={allergies || 'None reported'}
                highlight={allergies ? 'orange' : null} />
              <InfoBox icon="🩺" label="Chronic Conditions"
                value={conditions || 'None reported'}
                highlight={conditions ? 'purple' : null} span2 />
            </InfoGrid>
          </ProfileSection>

          {/* Blockchain */}
          <ProfileSection title="Blockchain Identity" icon="⛓️" accent="border-gray-400">
            <InfoGrid>
              <InfoBox icon="💳" label="Wallet Address"    value={wallet}                          mono span2 />
              <InfoBox icon="🗓️" label="Registration Date" value={regDate} />
              <InfoBox icon="🔗" label="IPFS Metadata Hash" value={metadataHash || 'Not uploaded'} mono truncate />
            </InfoGrid>
          </ProfileSection>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex justify-end">
          <button onClick={onClose}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            Close Profile
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:translateY(20px) scale(.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }
      `}</style>
    </div>
  );
}

function ProfileSection({ title, icon, children, accent = 'border-blue-400' }) {
  return (
    <div className={`border-l-4 ${accent} pl-4`}>
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

function InfoBox({ icon, label, value, placeholder, mono, span2, truncate, highlight }) {
  const highlights = {
    orange: 'bg-orange-50 border border-orange-200',
    purple: 'bg-purple-50 border border-purple-200',
  };
  return (
    <div className={`${highlights[highlight] || 'bg-gray-50'} rounded-xl p-3.5 ${span2 ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{icon} {label}</p>
      {value
        ? <p className={`text-gray-800 font-semibold text-sm ${mono ? 'font-mono' : ''} ${truncate ? 'truncate' : 'break-words'}`}>{value}</p>
        : <p className="text-gray-400 text-sm italic">{placeholder || '—'}</p>}
    </div>
  );
}

export default PatientProfileModal;