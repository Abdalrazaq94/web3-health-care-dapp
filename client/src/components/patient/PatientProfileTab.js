
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useState, useEffect, useRef } from 'react';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/uploadToIPFS';
import { usePatientAuth } from '../hooks/usePatientAuth';

// ── Inline IPFS hook ──────────────────────────────────────────────────────────
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

// ── PatientProfileTab ─────────────────────────────────────────────────────────
function PatientProfileTab({ patientInfo }) {
  const metadataHash = patientInfo?.[7] || '';
  const { meta, loading } = useIpfsMeta(metadataHash);
  const { address } = usePatientAuth();

  // On-chain fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [gender, setGender] = useState('');

  // IPFS fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address2, setAddress2] = useState('');
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');

  // Photo
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDeleted, setPhotoDeleted] = useState(false);
  const photoInputRef = useRef();

  // Status
  const [isBusy, setIsBusy] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState(false);

  // Pre-populate from on-chain
  useEffect(() => {
    if (patientInfo) {
      setName(patientInfo[1] || '');
      setAge((patientInfo[2]?.toString()) || '');
      setBloodType(patientInfo[3] || '');
      setGender(patientInfo[4] || '');
    }
  }, [patientInfo]);

  // Pre-populate from IPFS
  useEffect(() => {
    if (meta) {
      setEmail(meta.email || '');
      setPhone(meta.phone || '');
      setAddress2(meta.address || '');
      setEmergName(meta.emergencyContactName || '');
      setEmergPhone(meta.emergencyContactPhone || '');
      setAllergies(meta.allergies || '');
      setConditions(meta.chronicConditions || '');
      if (meta.photoCID && !photoDeleted) {
        setPhotoPreview(`https://ipfs.io/ipfs/${meta.photoCID}`);
      }
    }
  }, [meta]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoDeleted(false);
  };

  const handlePhotoDelete = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoDeleted(true);
  };

  const handleSave = async () => {
    setIsBusy(true);
    setErrorMsg('');
    setUploadStatus('');

    try {
      if (!address) throw new Error('No wallet address found. Please log in again.');

      // ── 1. Upload photo if changed ────────────────────────────
      let photoCID = meta?.photoCID || '';
      if (photoFile) {
        setUploadStatus('📸 Uploading photo to IPFS...');
        photoCID = await uploadFileToIPFS(photoFile);
      }
      if (photoDeleted) photoCID = '';

      // ── 2. Upload metadata JSON to IPFS ───────────────────────
      setUploadStatus('📦 Uploading profile metadata to IPFS...');
      const updatedMeta = {
        ...(meta || {}),
        name, age, bloodType, gender,
        email, phone,
        address: address2,
        emergencyContactName: emergName,
        emergencyContactPhone: emergPhone,
        allergies,
        chronicConditions: conditions,
        photoCID,
        updatedAt: new Date().toISOString(),
      };
      const newMetadataHash = await uploadJSONToIPFS(updatedMeta, 'patient-profile');

      // ── 3. Call relayer backend ───────────────────────────────
      setUploadStatus('⛓️ Updating on blockchain...');
      const response = await fetch('http://localhost:5000/api/update-patient-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientAddress: address, metadataHash: newMetadataHash }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      console.log('✅ Profile updated, tx:', result.hash);
      setUploadStatus('');
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);

    } catch (err) {
      console.error(err);
      setErrorMsg('Save failed: ' + (err.message || 'Unknown error'));
      setUploadStatus('');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn .4s ease-out' }}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span className="text-3xl">⚙️</span> Profile Settings
      </h2>

      {loading && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-blue-700 text-sm font-semibold">Loading profile from IPFS...</p>
        </div>
      )}

      {uploadStatus && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl">
          <svg className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-blue-800 font-semibold">{uploadStatus}</p>
        </div>
      )}

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-green-800">Profile Updated!</p>
            <p className="text-green-600 text-sm">Saved to IPFS and confirmed on blockchain.</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800 font-semibold">❌ {errorMsg}</p>
        </div>
      )}

      {/* ── Profile Photo ── */}
      <Section title="Profile Photo" icon="📸" accent="border-blue-400">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-dashed border-blue-200 shadow">
              {photoPreview
                ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                : <div className="text-center p-4"><span className="text-5xl">👤</span><p className="text-xs text-gray-400 mt-1">No photo</p></div>}
            </div>
            {photoPreview && (
              <button onClick={handlePhotoDelete}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm shadow transition-all">
                ✕
              </button>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">Upload a clear profile photo. Supported: JPG, PNG, WEBP. Stored on IPFS.</p>
            <button type="button" onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow">
              <span>📷</span>{photoPreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
            {photoFile && <p className="text-xs text-green-600 font-semibold mt-2">✅ {photoFile.name} selected</p>}
            {meta?.photoCID && !photoDeleted && !photoFile && (
              <p className="text-xs text-blue-600 font-mono mt-2 truncate max-w-xs">Current: {meta.photoCID.slice(0, 20)}...</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Basic Information ── */}
      <Section title="Basic Information" icon="🪪" accent="border-blue-400">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="👤 Full Name *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </Field>
          <Field label="🎂 Age *">
            <input type="number" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </Field>
          <Field label="🩸 Blood Type *">
            <select value={bloodType} onChange={e => setBloodType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white">
              <option value="">Select blood type</option>
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </Field>
          <Field label="👤 Gender *">
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white">
              <option value="">Select gender</option>
              {['Male','Female','Non-binary','Prefer not to say','Other'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <p className="text-xs text-blue-600 mt-2 font-semibold">⛓ Saved to blockchain via NHS relayer</p>
      </Section>

      {/* ── Contact Information ── */}
      <Section title="Contact Information" icon="📞" accent="border-purple-400">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="📧 Email Address">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </Field>
          <Field label="📱 Phone Number">
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7000 000000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </Field>
          <Field label="🏠 Physical Address" span2>
            <input value={address2} onChange={e => setAddress2(e.target.value)} placeholder="123 Main Street, City, Country"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </Field>
        </div>
        <p className="text-xs text-purple-600 mt-2 font-semibold">📦 Saved to IPFS</p>
      </Section>

      {/* ── Emergency Contact ── */}
      <Section title="Emergency Contact" icon="🚨" accent="border-red-400">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="👤 Contact Name">
            <input value={emergName} onChange={e => setEmergName(e.target.value)} placeholder="Emergency contact name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </Field>
          <Field label="📞 Contact Phone">
            <input type="tel" value={emergPhone} onChange={e => setEmergPhone(e.target.value)} placeholder="+44 7000 000000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </Field>
        </div>
        <p className="text-xs text-purple-600 mt-2 font-semibold">📦 Saved to IPFS</p>
      </Section>

      {/* ── Medical Information ── */}
      <Section title="Medical Information" icon="🏥" accent="border-purple-400">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="💊 Known Allergies">
            <textarea value={allergies} onChange={e => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Peanuts, Latex..." rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none" />
          </Field>
          <Field label="🩺 Chronic Conditions">
            <textarea value={conditions} onChange={e => setConditions(e.target.value)}
              placeholder="e.g. Diabetes, Hypertension..." rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none" />
          </Field>
        </div>
        <p className="text-xs text-purple-600 mt-2 font-semibold">📦 Saved to IPFS</p>
      </Section>

      {/* Save button */}
      <button onClick={handleSave} disabled={isBusy}
        className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3">
        {isBusy
          ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
          : <><span>💾</span> Save Profile</>}
      </button>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function Section({ title, icon, accent = 'border-blue-400', children }) {
  return (
    <div className={`border-l-4 ${accent} pl-4`}>
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><span>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, span2 }) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

export default PatientProfileTab;