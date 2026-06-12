// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { usePatientAuth } from '../../components/hooks/usePatientAuth';
import PatientProfileTab from '../../components/patient/PatientProfileTab';
import PatientDocumentUpload from '../../components/patient/PatientDocumentUpload';
import RecordCard from '../../components/patient/RecordCard';
import AppointmentCard from '../../components/patient/AppointmentCard';
import DoctorAccessCard from '../../components/patient/DoctorAccessCard';
import DoctorCard from '../../components/patient/DoctorCard';

// ── IPFS hook ─────────────────────────────────────────────────────────────────
function useIpfsMeta(hash) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!hash || hash === '') { setMeta(null); return; }
    setLoading(true);
    (async () => {
      for (const url of [`https://ipfs.io/ipfs/${hash}`, `https://gateway.pinata.cloud/ipfs/${hash}`]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); setLoading(false); return; }
        } catch (_) { }
      }
      setMeta(null); setLoading(false);
    })();
  }, [hash]);
  return { meta, loading };
}

// ── PatientDashboard ──────────────────────────────────────────────────────────
function PatientDashboard() {
  const { address, logout, ready, authenticated } = usePatientAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorsWithAccess, setDoctorsWithAccess] = useState(0);

  const { data: patientInfo } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'patients', args: [address],
  });

  // ── Redirect unregistered patients ────────────────────────────────────────
  useEffect(() => {
    if (!ready || !authenticated || !address) return;
    if (patientInfo && patientInfo[6] === false) {
      navigate('/patient/register');
    }
  }, [ready, authenticated, address, patientInfo, navigate]);

  const { data: appointmentCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointmentCount',
  });

  const { data: recordCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'recordCount',
  });

  if (!ready || !authenticated || !address || !patientInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const name = patientInfo[1] || '';
  const age = patientInfo[2]?.toString() || '—';
  const bloodType = patientInfo[3] || '—';
  const gender = patientInfo[4] || '—';
  const metadataHash = patientInfo[7] || '';
  const totalRecords = Number(patientInfo[8] || 0);
  const totalAppts = Number(patientInfo[9] || 0);
  const regDate = patientInfo[10]
    ? new Date(Number(patientInfo[10]) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';

  const tabs = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'activity', icon: '⚡', label: 'Recent Activity' },
    { id: 'records', icon: '📋', label: 'Medical Records', badge: totalRecords },
    { id: 'documents', icon: '📎', label: 'Upload Documents' },
    { id: 'appts', icon: '📅', label: 'Appointments', badge: totalAppts },
    { id: 'access', icon: '🔐', label: 'Manage Access', badge: doctorsWithAccess },
    { id: 'browse', icon: '🏥', label: 'Browse Doctors' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <PatientAvatar metadataHash={metadataHash} name={name} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {bloodType !== '—' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">🩸 {bloodType}</span>
                )}
                <span className="text-gray-400">·</span>
                <span className="text-xs text-gray-500">{gender}</span>
                <span className="text-gray-400">·</span>
                <span className="text-xs text-gray-500">Age {age}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  ✅ Registered
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow">
              📅 Member since {regDate}
            </div>
            <button onClick={logout}
              className="text-sm font-semibold text-red-500 hover:text-red-700 bg-white px-4 py-2 rounded-xl shadow transition-all">
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Tabbed panel ── */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-5">
            <div className="flex gap-2 flex-wrap">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-lg'
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
            {activeTab === 'overview' && (
              <OverviewTab
                name={name} age={age} bloodType={bloodType} gender={gender}
                address={address} regDate={regDate} totalRecords={totalRecords}
                totalAppts={totalAppts} doctorsWithAccess={doctorsWithAccess}
                metadataHash={metadataHash}
              />
            )}
            {activeTab === 'activity' && <RecentActivity patientAddress={address} />}
            {activeTab === 'records' && <InlineRecords patientAddress={address} patientName={name} />}
            {activeTab === 'documents' && <InlineDocuments patientInfo={patientInfo} />}
            {activeTab === 'appts' && <InlineAppointments />}
            <div className={activeTab === 'access' ? '' : 'hidden'}>
              <InlineAccess patientAddress={address} onCountUpdate={setDoctorsWithAccess} />
            </div>
            {activeTab === 'browse' && <InlineBrowse />}
            {activeTab === 'settings' && <PatientProfileTab patientInfo={patientInfo} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload Documents tab ──────────────────────────────────────────────────────
function InlineDocuments({ patientInfo }) {
  const [meta, setMeta] = useState(null);
  const [metaVersion, setMetaVersion] = useState(0);
  useEffect(() => {
    const hash = patientInfo?.[7];
    if (!hash) return;
    setMeta(null);
    (async () => {
      for (const url of [`https://ipfs.io/ipfs/${hash}`, `https://gateway.pinata.cloud/ipfs/${hash}`]) {
        try {
          const res = await fetch(`${url}?v=${metaVersion}`, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); return; }
        } catch (_) { }
      }
    })();
  }, [patientInfo, metaVersion]);

  const handleUploadComplete = (updatedMeta) => {
    if (updatedMeta) setMeta(updatedMeta);
  };

  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
        <span className="text-3xl">📎</span> My Documents
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Upload your previous medical records and prescriptions. Stored on IPFS and visible to doctors you grant access to.
      </p>
      <PatientDocumentUpload
        patientAddress={patientInfo?.[5]}
        patientMeta={meta}
        onUploadComplete={handleUploadComplete}
      />
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Patient avatar ────────────────────────────────────────────────────────────
function PatientAvatar({ metadataHash, name }) {
  const { meta } = useIpfsMeta(metadataHash);
  const photoUrl = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;
  return (
    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg">
      {photoUrl
        ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        : <svg className="w-9 h-9 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>}
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ name, age, bloodType, gender, address, regDate, totalRecords, totalAppts, doctorsWithAccess, metadataHash }) {
  const { meta, loading } = useIpfsMeta(metadataHash);
  const email = meta?.email || null;
  const phone = meta?.phone || null;
  const addr = meta?.address || null;
  const emergName = meta?.emergencyContactName || null;
  const emergPhone = meta?.emergencyContactPhone || null;
  const allergies = meta?.allergies || null;
  const conditions = meta?.chronicConditions || null;
  const photoUrl = meta?.photoCID ? `https://ipfs.io/ipfs/${meta.photoCID}` : null;
  const bloodStyles = {
    'A+': 'bg-red-100 text-red-700', 'A-': 'bg-red-100 text-red-700',
    'B+': 'bg-orange-100 text-orange-700', 'B-': 'bg-orange-100 text-orange-700',
    'O+': 'bg-blue-100 text-blue-700', 'O-': 'bg-blue-100 text-blue-700',
    'AB+': 'bg-purple-100 text-purple-700', 'AB-': 'bg-purple-100 text-purple-700',
  };
  return (
    <div className="space-y-8" style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><span className="text-3xl">👤</span> My Profile</h2>
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-blue-700 text-sm font-semibold">Loading extended profile from IPFS...</p>
        </div>
      )}
      {!loading && !meta && metadataHash === '' && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl text-sm text-yellow-800">
          ℹ️ Contact info, emergency contact and medical info will appear here once you update your profile.
          Go to <strong>⚙️ Settings</strong> to update.
        </div>
      )}
      <PSection title="Basic Information" icon="🪪">
        <div className="flex items-start gap-5">
          <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow border-2 border-dashed border-blue-200">
            {photoUrl
              ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              : <div className="text-center p-3"><span className="text-4xl">👤</span><p className="text-xs text-gray-400 mt-1">No photo<br />Add in ⚙️</p></div>}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
            <PBox icon="👤" label="Full Name" value={name} />
            <PBox icon="🎂" label="Age" value={`${age} years`} />
            <PBox icon="👤" label="Gender" value={gender} />
            <PBox icon="🩸" label="Blood Type" value={bloodType} colorClass={bloodStyles[bloodType]} />
            <PBox icon="🗓️" label="Registered" value={regDate} />
          </div>
        </div>
      </PSection>
      <PSection title="Contact Information" icon="📞">
        <div className="grid md:grid-cols-2 gap-3">
          <PBox icon="📧" label="Email" value={email} placeholder="Update in ⚙️ Settings" />
          <PBox icon="📱" label="Phone" value={phone} placeholder="Update in ⚙️ Settings" />
          <PBox icon="🏠" label="Address" value={addr} placeholder="Update in ⚙️ Settings" span2 />
        </div>
      </PSection>
      <PSection title="Emergency Contact" icon="🚨" accent="border-red-400">
        <div className="grid md:grid-cols-2 gap-3">
          <PBox icon="👤" label="Contact Name" value={emergName} placeholder="Update in ⚙️ Settings" />
          <PBox icon="📞" label="Contact Phone" value={emergPhone} placeholder="Update in ⚙️ Settings" />
        </div>
      </PSection>
      <PSection title="Medical Information" icon="🏥" accent="border-purple-400">
        <div className="grid md:grid-cols-2 gap-3">
          <PBox icon="💊" label="Known Allergies" value={allergies || 'None reported'} highlight={allergies ? 'orange' : null} />
          <PBox icon="🩺" label="Chronic Conditions" value={conditions || 'None reported'} highlight={conditions ? 'purple' : null} />
        </div>
      </PSection>
      <PSection title="Health Summary" icon="📊">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Medical Records', value: totalRecords, color: 'text-blue-600' },
            { label: 'Appointments', value: totalAppts, color: 'text-purple-600' },
            { label: 'Drs with Access', value: doctorsWithAccess, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </PSection>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Recent Activity ───────────────────────────────────────────────────────────
function RecentActivity({ patientAddress }) {
  const [items, setItems] = useState([]);
  const { data: appointmentCount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'appointmentCount' });
  const { data: recordCount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'recordCount' });
  useEffect(() => {
    const list = [];
    if (appointmentCount) { const c = Number(appointmentCount); for (let i = c; i >= Math.max(1, c - 4); i--) list.push({ type: 'appointment', id: i }); }
    if (recordCount) { const c = Number(recordCount); for (let i = c; i >= Math.max(1, c - 4); i--) list.push({ type: 'record', id: i }); }
    list.sort((a, b) => b.id - a.id);
    setItems(list.slice(0, 8));
  }, [appointmentCount, recordCount]);
  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6"><span className="text-3xl">⚡</span> Recent Activity</h2>
      {items.length === 0
        ? <EmptyState icon="📭" title="No Recent Activity" sub="Your appointments and records will appear here." />
        : <div className="space-y-3">{items.map(item => <ActivityItem key={`${item.type}-${item.id}`} item={item} patientAddress={patientAddress} />)}</div>}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function ActivityItem({ item, patientAddress }) {
  const { data: appt } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'appointments', args: [item.id], enabled: item.type === 'appointment' });
  const { data: record } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getMedicalRecord', args: [item.id, patientAddress], enabled: item.type === 'record' });
  if (item.type === 'appointment' && appt) {
    if (appt[1]?.toLowerCase() !== patientAddress?.toLowerCase()) return null;
    const status = Number(appt[6]);
    const icons = ['⏳', '✅', '❌', '✓', '🚫'];
    const labels = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
    const styles = ['bg-orange-50 border-orange-200', 'bg-blue-50 border-blue-200', 'bg-red-50 border-red-200', 'bg-green-50 border-green-200', 'bg-gray-50 border-gray-200'];
    return (
      <div className={`flex items-center gap-4 p-4 rounded-xl border-2 ${styles[status] || styles[4]} hover:shadow-md transition-all`}>
        <div className="text-3xl">{icons[status] || '📅'}</div>
        <div className="flex-1"><p className="font-semibold text-gray-800">Appointment <span className="font-bold">{labels[status] || 'Unknown'}</span></p><p className="text-sm text-gray-500">{appt[3]} at {appt[4]}</p></div>
        <span className="text-xs text-gray-400 font-semibold">#{item.id}</span>
      </div>
    );
  }
  if (item.type === 'record' && record) {
    if (record.patientAddress?.toLowerCase() !== patientAddress?.toLowerCase()) return null;
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl border-2 bg-purple-50 border-purple-200 hover:shadow-md transition-all">
        <div className="text-3xl">🩺</div>
        <div className="flex-1"><p className="font-semibold text-gray-800">Medical Record Added</p><p className="text-sm text-gray-600">{record.diagnosis}</p></div>
        <span className="text-xs text-gray-400 font-semibold">#{item.id}</span>
      </div>
    );
  }
  return null;
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function PSection({ title, icon, children, accent = 'border-blue-400' }) {
  return (
    <div className={`border-l-4 ${accent} pl-4`}>
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><span>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}

function PBox({ icon, label, value, placeholder, mono, span2, colorClass, highlight }) {
  const hl = { orange: 'bg-orange-50 border border-orange-200', purple: 'bg-purple-50 border border-purple-200' };
  return (
    <div className={`${hl[highlight] || colorClass || 'bg-gray-50'} rounded-xl p-3.5 hover:bg-blue-50 transition-colors ${span2 ? 'md:col-span-2' : ''}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{icon} {label}</p>
      {value ? <p className={`text-gray-800 font-semibold text-sm break-words ${mono ? 'font-mono' : ''}`}>{value}</p>
        : <p className="text-gray-400 text-sm italic">{placeholder || '—'}</p>}
    </div>
  );
}

// ── InlineRecords ─────────────────────────────────────────────────────────────
function InlineRecords({ patientAddress, patientName }) {
  const [recordIds, setRecordIds] = useState([]);
  const [filter, setFilter] = useState('all');
  const { data: recordCount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'recordCount' });
  useEffect(() => {
    if (!recordCount) return;
    const ids = [];
    for (let i = Number(recordCount); i >= 1; i--) ids.push(i);
    setRecordIds(ids);
  }, [recordCount]);
  const SEV_FILTERS = [
    { value: 'all', label: '📋 All' }, { value: '1', label: '🟢 Low' },
    { value: '2', label: '🟡 Medium' }, { value: '3', label: '🔴 High' },
  ];
  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-5"><span>📋</span> Medical Records</h2>
      <div className="flex gap-2 flex-wrap mb-5">
        {SEV_FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.value ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.label}
          </button>
        ))}
      </div>
      {recordIds.length === 0
        ? <EmptyState icon="📋" title="No Records Yet" sub="Records added by your doctors will appear here." />
        : <div className="space-y-4">{recordIds.map(id => <FilteredRecord key={id} recordId={id} patientAddress={patientAddress} filter={filter} patientName={patientName} />)}</div>}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function FilteredRecord({ recordId, patientAddress, filter, patientName }) {
  const { data: record } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getMedicalRecord', args: [recordId, patientAddress] });
  if (!record) return null;
  if (record.patientAddress?.toLowerCase() !== patientAddress?.toLowerCase()) return null;
  if (filter !== 'all' && Number(record.severity) !== Number(filter)) return null;
  return <RecordCard recordId={recordId} patientAddress={patientAddress} patientName={patientName} />;
}

// ── InlineAppointments ────────────────────────────────────────────────────────
function InlineAppointments() {
  const [ids, setIds] = useState([]);
  const [filter, setFilter] = useState('all');
  const { data: appointmentCount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'appointmentCount' });
  useEffect(() => {
    if (!appointmentCount) return;
    const arr = [];
    for (let i = Number(appointmentCount); i >= 1; i--) arr.push(i);
    setIds(arr);
  }, [appointmentCount]);
  const APPT_FILTERS = [
    { value: 'all', label: 'All', a: 'bg-blue-600 text-white', ia: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
    { value: 'pending', label: '⏳ Pending', a: 'bg-orange-500 text-white', ia: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
    { value: 'approved', label: '✅ Approved', a: 'bg-blue-500 text-white', ia: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { value: 'completed', label: '✓ Completed', a: 'bg-green-600 text-white', ia: 'bg-green-50 text-green-600 hover:bg-green-100' },
    { value: 'cancelled', label: '🚫 Cancelled', a: 'bg-gray-600 text-white', ia: 'bg-gray-50 text-gray-500 hover:bg-gray-100' },
  ];
  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-5"><span>📅</span> Appointments</h2>
      <div className="flex gap-2 flex-wrap mb-5">
        {APPT_FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.value ? f.a : f.ia}`}>
            {f.label}
          </button>
        ))}
      </div>
      {ids.length === 0
        ? <EmptyState icon="📅" title="No Appointments Yet" sub="Book your first appointment with a doctor." />
        : <div className="space-y-4">{ids.map(id => <AppointmentCard key={id} appointmentId={id} filter={filter} />)}</div>}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── InlineAccess ──────────────────────────────────────────────────────────────
function InlineAccess({ patientAddress, onCountUpdate }) {
  const [apptIds, setApptIds] = useState([]);
  const [uniqueDoctors, setUnique] = useState(new Set());
  const { data: appointmentCount } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'appointmentCount' });

  useEffect(() => {
    if (!appointmentCount) return;
    const arr = [];
    for (let i = 1; i <= Number(appointmentCount); i++) arr.push(i);
    setApptIds(arr);
  }, [appointmentCount]);

  const handleDoctorFound = useCallback((addr) => setUnique(prev => new Set([...prev, addr])), []);
  const doctorList = Array.from(uniqueDoctors);

  // ── Report count up to parent dashboard ──────────────────────────────────
  useEffect(() => {
    if (onCountUpdate) onCountUpdate(doctorList.length);
  }, [doctorList.length, onCountUpdate]);

  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-3"><span>🔐</span> Manage Doctor Access</h2>
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-xl mb-5 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🛡️</span>
        <p className="text-sm text-blue-700">Grant or revoke a doctor's access to your medical records at any time.</p>
      </div>
      {apptIds.map(id => <DoctorExtractor key={id} appointmentId={id} patientAddress={patientAddress} onDoctorFound={handleDoctorFound} />)}
      {doctorList.length === 0
        ? <EmptyState icon="🔐" title="No Doctors Yet" sub="Doctors from your appointments will appear here." />
        : <div className="space-y-4">{doctorList.map(addr => <DoctorAccessCard key={addr} doctorAddress={addr} patientAddress={patientAddress} />)}</div>}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function DoctorExtractor({ appointmentId, patientAddress, onDoctorFound }) {
  const { data: appointment } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'appointments', args: [appointmentId] });
  useEffect(() => {
    if (appointment && appointment[1]?.toLowerCase() === patientAddress?.toLowerCase()) onDoctorFound(appointment[2]);
  }, [appointment, patientAddress, onDoctorFound]);
  return null;
}

// ── InlineBrowse ──────────────────────────────────────────────────────────────
function InlineBrowse() {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [availFilter, setAvailFilter] = useState('all');
  const { data: allDoctors } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getAllApprovedDoctors', enabled: !isSearching });
  const { data: filteredDoctors } = useReadContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getDoctorsBySpecialization', args: [search], enabled: isSearching && search.length > 0 });
  const doctors = (isSearching ? filteredDoctors : allDoctors) || [];
  const displayed = doctors.filter(d => { const active = d.isActive ?? d[6]; if (availFilter === 'available') return active; if (availFilter === 'unavailable') return !active; return true; });
  const SPECS = ['General Practice', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Radiology', 'Surgery', 'Oncology', 'Gynecology', 'ENT'];
  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-5"><span>🏥</span> Browse Doctors</h2>
      <div className="bg-gray-50 rounded-2xl p-4 mb-5">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && search.trim()) setIsSearching(true); }}
              placeholder="Search specialization..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white" />
          </div>
          <button onClick={() => { if (search.trim()) setIsSearching(true); }} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow hover:shadow-lg transition-all">Search</button>
          {isSearching && <button onClick={() => { setSearch(''); setIsSearching(false); }} className="px-4 py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-all">Clear</button>}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {SPECS.map(s => (
            <button key={s} onClick={() => { setSearch(s); setIsSearching(true); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${search === s && isSearching ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'}`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {[{ v: 'all', l: '👥 All' }, { v: 'available', l: '🟢 Available' }, { v: 'unavailable', l: '🔴 Unavailable' }].map(f => (
            <button key={f.v} onClick={() => setAvailFilter(f.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${availFilter === f.v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{f.l}</button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-500 font-semibold mb-4">{displayed.length} doctor{displayed.length !== 1 ? 's' : ''} found</p>
      {displayed.length === 0
        ? <EmptyState icon="🏥" title={isSearching ? `No doctors for "${search}"` : 'No approved doctors yet'} sub={isSearching ? 'Try a different search.' : ''} />
        : <div className="grid md:grid-cols-2 gap-4">{displayed.map((doctor, i) => <DoctorCard key={i} doctor={doctor} />)}</div>}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div className="text-5xl mb-3">{icon}</div>
      <h4 className="text-lg font-bold text-gray-700 mb-1">{title}</h4>
      {sub && <p className="text-gray-500 text-sm">{sub}</p>}
    </div>
  );
}

export default PatientDashboard;