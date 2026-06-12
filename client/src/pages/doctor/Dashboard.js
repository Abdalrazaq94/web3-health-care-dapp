// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useState, useEffect } from 'react';
import AppointmentsList  from '../../components/doctor/AppointmentsList';
import PatientsList      from '../../components/doctor/PatientsList';
import DoctorProfileTab  from '../../components/doctor/DoctorProfileTab';
import IPFSFileViewer    from '../../components/shared/IPFSFileViewer';

// ── Inline IPFS hook ─────────────────────────────────────────────────────────
function useIpfsMeta(metadataHash) {
  const [meta, setMeta]       = useState(null);
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

// ── DoctorDashboard ──────────────────────────────────────────────────────────
function DoctorDashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab]   = useState('overview');
  const [localActive, setLocalActive] = useState(null);

  const { data: doctorInfo } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'doctors', args: [address],
  });

  const { data: totalAppointmentCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointmentCount',
  });

  if (!doctorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
    
  }
  

  const isApproved        = doctorInfo[5];
  const doctorName        = doctorInfo[1]  || '';
  const specialization    = doctorInfo[2]  || '';
  const licenseNumber     = doctorInfo[3]  || '';
  const walletAddress     = doctorInfo[4]  || address;
  const metadataHash      = doctorInfo[7]  || '';
  const totalPatients     = Number(doctorInfo[8]  || 0);
  const totalAppointments = Number(doctorInfo[9]  || 0);
  const totalRecords      = Number(doctorInfo[10] || 0);
  const totalRating       = Number(doctorInfo[11] || 0);
  const reviewCount       = Number(doctorInfo[12] || 0);
  const avgRating         = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : null;
  const regDate           = doctorInfo[13]
    ? new Date(Number(doctorInfo[13]) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';
  const myAppointmentCount = Number(totalAppointmentCount || 0);

  const isActive     = doctorInfo[6];
  const displayActive = localActive !== null ? localActive : isActive;

  // ── Pending approval ──
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="inline-block p-5 bg-yellow-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Pending Approval</h2>
          <p className="text-gray-600 mb-6 text-lg">Welcome, <strong>Dr. {doctorName}</strong>! Your registration is being reviewed.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-left mb-6">
            <p className="font-semibold text-yellow-800 mb-2">What happens next?</p>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>✓ Admin reviews your credentials and license</li>
              <li>✓ You'll receive a notification once approved</li>
              <li>✓ After approval you can accept appointments</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-left">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Specialization</p>
              <p className="font-semibold text-gray-800">{specialization}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">License</p>
              <p className="font-semibold font-mono text-gray-800">{licenseNumber}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <DoctorAvatar metadataHash={metadataHash} name={doctorName} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dr. {doctorName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-green-600 font-semibold">{specialization}</span>
                <span className="text-gray-400">·</span>
                <span className="text-xs font-mono text-gray-500">{licenseNumber}</span>
                <button onClick={() => setLocalActive(!displayActive)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all transform hover:scale-105 shadow-sm ${
                    displayActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                      : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-300'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${displayActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  {displayActive ? 'Available' : 'Unavailable'}
                  <span className="ml-0.5 opacity-60">✎</span>
                </button>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  ✅ Approved
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow">
            📅 Member since {regDate}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👥" label="Total Patients"  value={totalPatients}      gradient="from-blue-500 to-indigo-600" />
          <StatCard icon="📅" label="Appointments" value={myAppointmentCount} gradient="from-purple-500 to-pink-600" />
          <StatCard icon="🩺" label="Records Added"   value={totalRecords}       gradient="from-green-500 to-emerald-600" />
          <StatCard icon="⭐" label="Avg Rating"      value={avgRating ?? '—'}   gradient="from-yellow-500 to-orange-500"
            subtitle={reviewCount > 0 ? `${reviewCount} review${reviewCount > 1 ? 's' : ''}` : 'No reviews yet'} />
        </div>

        {/* Tabbed panel */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-5">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'overview',     icon: '🏠', label: 'Overview' },
                { id: 'appointments', icon: '📅', label: 'Appointments', badge: myAppointmentCount },
                { id: 'patients',     icon: '👥', label: 'My Patients',  badge: totalPatients },
                { id: 'profile',      icon: '⚙️', label: 'Settings' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-green-700 shadow-lg'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'}`}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-xs font-bold">{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'overview'     && (
              <OverviewTab
                doctorName={doctorName} specialization={specialization}
                licenseNumber={licenseNumber} walletAddress={walletAddress}
                regDate={regDate} isActive={displayActive}
                totalPatients={totalPatients} totalAppointments={totalAppointments}
                totalRecords={totalRecords} avgRating={avgRating}
                reviewCount={reviewCount} metadataHash={metadataHash}
              />
            )}
            {activeTab === 'appointments' && <AppointmentsList />}
            {activeTab === 'patients'     && <PatientsList />}
            {activeTab === 'profile'      && <DoctorProfileTab doctorInfo={doctorInfo} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Doctor avatar — fixed: photoCID not photoHash ────────────────────────────
function DoctorAvatar({ metadataHash, name }) {
  const { meta } = useIpfsMeta(metadataHash);
  // ✅ Fixed: was meta?.photoHash
  const photoUrl = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;
  return (
    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center shadow-lg">
      {photoUrl
        ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        : <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>}
    </div>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  doctorName, specialization, licenseNumber, walletAddress,
  regDate, isActive, totalPatients, totalAppointments,
  totalRecords, avgRating, reviewCount, metadataHash,
}) {
  const { meta, loading } = useIpfsMeta(metadataHash);
  const [viewingCert, setViewingCert] = useState(false);

  const email      = meta?.email             || null;
  const phone      = meta?.phone             || null;
  const hospital   = meta?.hospital          || null;
  const fee        = meta?.consultationFee   || null;
  const experience = meta?.yearsOfExperience || null;
  const bio        = meta?.bio               || null;
  const languages  = meta?.languages         || [];

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span className="text-3xl">👨‍⚕️</span> Doctor Profile
      </h2>

      {loading && (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
          <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-green-700 text-sm font-semibold">Loading extended profile from IPFS...</p>
        </div>
      )}

      {/* Basic Info */}
      <OSection title="Basic Information" icon="🪪">
        <OGrid>
          <OBox icon="👤" label="Full Name"      value={`Dr. ${doctorName}`} />
          <OBox icon="🏥" label="Specialization" value={specialization} />
          <OBox icon="📋" label="License Number" value={licenseNumber} mono />
          <OBox icon="🟢" label="Availability"   value={isActive ? 'Available for Appointments' : 'Currently Unavailable'} />
          <OBox icon="💳" label="Wallet Address" value={`${walletAddress?.slice(0,8)}...${walletAddress?.slice(-6)}`} mono />
          <OBox icon="🗓️" label="Member Since"   value={regDate} />
        </OGrid>
      </OSection>

      {/* Photo & Certificate — secure viewer for cert */}
      <OSection title="Photo & Certificate" icon="📸">
        <div className="grid md:grid-cols-2 gap-4">

          {/* Profile Photo */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
            <div className="flex items-center justify-center h-52 bg-gradient-to-br from-gray-50 to-gray-100">
              {meta?.photoCID ? (
                <img src={`https://ipfs.io/ipfs/${meta.photoCID}`} alt="Doctor profile"
                  className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <span className="text-6xl mb-3">👤</span>
                  <p className="text-sm font-semibold text-gray-500">No photo uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload in ⚙️ Settings</p>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Profile Photo</p>
              {meta?.photoCID
                ? <p className="text-xs font-mono text-green-600 mt-0.5 truncate">✅ {meta.photoCID.slice(0,20)}...</p>
                : <p className="text-xs text-gray-400 italic mt-0.5">Upload in Settings</p>}
            </div>
          </div>

          {/* Medical Certificate — secure viewer, no exposed URL */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
            <div className="flex items-center justify-center h-52 bg-gradient-to-br from-gray-50 to-gray-100">
              {meta?.certificateCID ? (
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3 shadow">
                    <span className="text-3xl">📋</span>
                  </div>
                  <p className="text-sm font-bold text-gray-700">Certificate Uploaded</p>
                  {/* ✅ Fixed: secure viewer instead of raw IPFS link */}
                  <button
                    onClick={() => setViewingCert(true)}
                    className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
                    👁 View Certificate
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <span className="text-6xl mb-3">📋</span>
                  <p className="text-sm font-semibold text-gray-500">No certificate uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload in ⚙️ Settings</p>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Medical Certificate</p>
              {meta?.certificateCID
                ? <p className="text-xs font-mono text-green-600 mt-0.5 truncate">✅ {meta.certificateCID.slice(0,20)}...</p>
                : <p className="text-xs text-gray-400 italic mt-0.5">Upload in Settings</p>}
            </div>
          </div>

        </div>
      </OSection>

      {/* Contact */}
      <OSection title="Contact Information" icon="📞">
        <OGrid>
          <OBox icon="📧" label="Email Address" value={email} placeholder="Not provided" />
          <OBox icon="📱" label="Phone Number"  value={phone} placeholder="Not provided" />
        </OGrid>
      </OSection>

      {/* Professional */}
      <OSection title="Professional Details" icon="🏥">
        <OGrid>
          <OBox icon="🏨" label="Hospital / Clinic"   value={hospital}                          placeholder="Not provided" />
          <OBox icon="💷" label="Consultation Fee"    value={fee ? `£${fee}` : null}            placeholder="Not provided" />
          <OBox icon="⏱️" label="Years of Experience" value={experience ? `${experience} years` : null} placeholder="Not provided" />
          <div className="bg-gray-50 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">🌐 Languages Spoken</p>
            {languages.length > 0
              ? <div className="flex flex-wrap gap-2">
                  {languages.map((l, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{l}</span>
                  ))}
                </div>
              : <p className="text-gray-400 text-sm italic">Not provided</p>}
          </div>
        </OGrid>
        <div className="mt-3 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">📝 Professional Bio</p>
          {bio
            ? <p className="text-gray-800 text-sm leading-relaxed">{bio}</p>
            : <p className="text-gray-400 text-sm italic">Not provided</p>}
        </div>
      </OSection>

      {/* Performance */}
      <OSection title="Performance Summary" icon="📊">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { label: 'Patients Seen',  value: totalPatients,     color: 'text-blue-600'   },
            { label: 'Appointments',   value: totalAppointments, color: 'text-purple-600' },
            { label: 'Records Added',  value: totalRecords,      color: 'text-green-600'  },
            { label: 'Avg Rating',     value: avgRating ? `${avgRating}/5` : 'N/A', color: 'text-yellow-600',
              sub: reviewCount > 0 ? `${reviewCount} reviews` : '' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-gray-600 mt-1">{label}</p>
              {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
          ))}
        </div>
      </OSection>

      {/* Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Quick Actions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>→ <strong>Appointments</strong> tab — approve, reject, or complete appointments</li>
          <li>→ <strong>My Patients</strong> tab — view profiles, add records, or view medical history</li>
        </ul>
      </div>

      {/* Secure certificate viewer */}
      {viewingCert && meta?.certificateCID && (
        <IPFSFileViewer
          cid={meta.certificateCID}
          fileName="Medical Certificate"
          onClose={() => setViewingCert(false)}
        />
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function StatCard({ icon, label, value, gradient, subtitle }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-white text-opacity-90 text-sm font-semibold">{label}</p>
      {subtitle && <p className="text-white text-opacity-70 text-xs mt-0.5">{subtitle}</p>}
    </div>
  );
}

function OSection({ title, icon, children }) {
  return (
    <div className="border-l-4 border-green-400 pl-4">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><span>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}

function OGrid({ children }) {
  return <div className="grid md:grid-cols-2 gap-3">{children}</div>;
}

function OBox({ icon, label, value, placeholder, mono }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3.5 hover:bg-green-50 transition-colors">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{icon} {label}</p>
      {value
        ? <p className={`text-gray-800 font-semibold text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
        : <p className="text-gray-400 text-sm italic">{placeholder || '—'}</p>}
    </div>
  );
}

export default DoctorDashboard;