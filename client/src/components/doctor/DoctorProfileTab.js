
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/uploadToIPFS';

const RELAYER = 'http://localhost:5000';

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

// ─────────────────────────────────────────────────────────────────────────────
function DoctorProfileTab({ doctorInfo }) {
  const { address: doctorAddress } = useAccount();

  const doctorName     = doctorInfo[1] || '';
  const specialization = doctorInfo[2] || '';
  const licenseNumber  = doctorInfo[3] || '';
  const metadataHash   = doctorInfo[7] || '';

  const { meta, loading: metaLoading } = useIpfsMeta(metadataHash);

  const [form, setForm] = useState({
    name:              doctorName,
    specialization:    specialization,
    licenseNumber:     licenseNumber,
    email:             '',
    phone:             '',
    hospital:          '',
    consultationFee:   '',
    yearsOfExperience: '',
    bio:               '',
    languages:         [],
    languageInput:     '',
  });

  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDeleted, setPhotoDeleted] = useState(false);
  const [certFile,     setCertFile]     = useState(null);
  const [certPreview,  setCertPreview]  = useState(null);
  const [certDeleted,  setCertDeleted]  = useState(false);

  const photoRef = useRef();
  const certRef  = useRef();

  const [saving,       setSaving]       = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [success,      setSuccess]      = useState(false);
  const [saveMsg,      setSaveMsg]      = useState('');

  // Populate form from IPFS
  useEffect(() => {
    if (!meta) return;
    setForm(prev => ({
      ...prev,
      email:             meta.email             || '',
      phone:             meta.phone             || '',
      hospital:          meta.hospital          || '',
      consultationFee:   meta.consultationFee   || '',
      yearsOfExperience: meta.yearsOfExperience || '',
      bio:               meta.bio               || '',
      languages:         meta.languages         || [],
    }));
    if (meta.photoCID)       setPhotoPreview(`https://ipfs.io/ipfs/${meta.photoCID}`);
    if (meta.certificateCID) setCertPreview(meta.certificateCID);
  }, [meta]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); setPhotoDeleted(false);
  };
  const handleCertChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setCertFile(file); setCertPreview(file.name); setCertDeleted(false);
  };
  const deletePhoto = () => { setPhotoFile(null); setPhotoPreview(null); setPhotoDeleted(true); if (photoRef.current) photoRef.current.value = ''; };
  const deleteCert  = () => { setCertFile(null);  setCertPreview(null);  setCertDeleted(true);  if (certRef.current)  certRef.current.value  = ''; };

  const addLanguage = () => {
    if (!form.languageInput.trim()) return;
    setForm(prev => ({ ...prev, languages: [...prev.languages, prev.languageInput.trim()], languageInput: '' }));
  };
  const removeLanguage = (i) =>
    setForm(prev => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSuccess(false);
    setUploadStatus('');

    try {
      // Step 1: Photo
      let photoCID = photoDeleted ? '' : (meta?.photoCID || '');
      if (photoFile) {
        setUploadStatus('Uploading photo to IPFS...');
        photoCID = await uploadFileToIPFS(photoFile);
      }

      // Step 2: Certificate
      let certificateCID = certDeleted ? '' : (meta?.certificateCID || '');
      if (certFile) {
        setUploadStatus('Uploading certificate to IPFS...');
        certificateCID = await uploadFileToIPFS(certFile);
      }

      // Step 3: Metadata JSON
      setUploadStatus('Uploading profile metadata to IPFS...');
      const metadata = {
        email:             form.email,
        phone:             form.phone,
        hospital:          form.hospital,
        consultationFee:   form.consultationFee,
        yearsOfExperience: form.yearsOfExperience,
        bio:               form.bio,
        languages:         form.languages,
        photoCID,
        certificateCID,
        updatedAt: new Date().toISOString(),
      };
      const newMetadataHash = await uploadJSONToIPFS(metadata, `doctor-${form.name}-update`);

      // Step 4: Relayer
      setUploadStatus('Submitting to blockchain via relayer...');
      const res = await fetch(`${RELAYER}/api/update-doctor-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorAddress, metadataHash: newMetadataHash }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Transaction failed');

      setSuccess(true);
      setUploadStatus('');

    } catch (err) {
      console.error(err);
      setSaveMsg('Error: ' + err.message);
      setUploadStatus('');
    } finally {
      setSaving(false);
    }
  };

  const FileCard = ({ icon, label, hint, preview, isImage, accept, onPick, onDelete, inputRef }) => (
    <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-green-400 transition-all overflow-hidden">
      <div className="relative flex items-center justify-center min-h-40 bg-gradient-to-br from-gray-50 to-gray-100">
        {preview ? (
          isImage
            ? <img src={preview} alt={label} className="w-full h-40 object-cover" />
            : <div className="flex flex-col items-center justify-center py-8 px-4">
                <span className="text-5xl mb-2">📄</span>
                <p className="text-sm font-semibold text-gray-700 text-center break-all">{preview}</p>
              </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <span className="text-5xl mb-2">{icon}</span>
            <p className="text-sm text-gray-500">{hint}</p>
          </div>
        )}
        {preview && (
          <button type="button" onClick={onDelete}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 font-bold text-lg">
            ×
          </button>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400">Optional · Stored on IPFS</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all shadow transform hover:scale-105">
          {preview ? '🔄 Change' : '⬆️ Upload'}
        </button>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onPick} />
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">⚙️</span> Settings
        </h2>
        {metaLoading && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading from IPFS...
          </div>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-green-800">Profile Updated Successfully!</p>
            <p className="text-green-600 text-sm">Changes confirmed on the blockchain.</p>
          </div>
        </div>
      )}

      {(saving || uploadStatus) && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-blue-800 font-semibold">{uploadStatus || 'Processing...'}</p>
        </div>
      )}

      {saveMsg && !success && !saving && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border ${
          saveMsg.startsWith('Error') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          {saveMsg.startsWith('Error') ? '❌' : '⏳'} {saveMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        <FormSection title="Photo & Documents" icon="📸">
          <div className="grid md:grid-cols-2 gap-4">
            <FileCard icon="👤" label="Profile Photo" hint="JPG or PNG · Max 5MB"
              preview={photoPreview} isImage={true} accept="image/*"
              onPick={handlePhotoChange} onDelete={deletePhoto} inputRef={photoRef} />
            <FileCard icon="📋" label="Medical Certificate" hint="PDF, JPG or PNG · Max 10MB"
              preview={certPreview} isImage={false} accept=".pdf,image/*"
              onPick={handleCertChange} onDelete={deleteCert} inputRef={certRef} />
          </div>
          {meta?.certificateCID && !certDeleted && !certFile && (
            <a href={`https://ipfs.io/ipfs/${meta.certificateCID}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-all">
              📜 View Current Certificate on IPFS
            </a>
          )}
        </FormSection>

        <FormSection title="Basic Information" icon="🪪">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormLabel>Full Name *</FormLabel>
              <FormInput value={form.name} onChange={v => setForm({...form, name: v})} placeholder="Dr. John Smith" required />
            </div>
            <div>
              <FormLabel>Specialization *</FormLabel>
              <select value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all" required>
                <option value="">Select Specialization</option>
                {['General Practice','Cardiology','Neurology','Pediatrics','Orthopedics',
                  'Dermatology','Psychiatry','Radiology','Surgery','Oncology',
                  'Gynecology','Ophthalmology','ENT','Other'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <FormLabel>Medical License Number *</FormLabel>
              <FormInput value={form.licenseNumber} onChange={v => setForm({...form, licenseNumber: v})} placeholder="GMC-123456" required />
            </div>
          </div>
        </FormSection>

        <FormSection title="Contact Information" icon="📞">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <FormLabel>Email Address</FormLabel>
              <FormInput type="email" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="doctor@hospital.com" />
            </div>
            <div>
              <FormLabel>Phone Number</FormLabel>
              <FormInput type="tel" value={form.phone} onChange={v => setForm({...form, phone: v})} placeholder="+44 20 1234 5678" />
            </div>
            <div className="md:col-span-2">
              <FormLabel>Languages Spoken</FormLabel>
              <div className="flex gap-2">
                <input type="text" value={form.languageInput}
                  onChange={e => setForm({...form, languageInput: e.target.value})}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  placeholder="Type a language and press Add" />
                <button type="button" onClick={addLanguage}
                  className="px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all">Add</button>
              </div>
              {form.languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.languages.map((lang, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {lang}
                      <button type="button" onClick={() => removeLanguage(i)} className="text-green-600 hover:text-green-900 font-bold leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Professional Details" icon="🏥">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormLabel>Hospital / Clinic Name</FormLabel>
              <FormInput value={form.hospital} onChange={v => setForm({...form, hospital: v})} placeholder="General Hospital" />
            </div>
            <div>
              <FormLabel>Consultation Fee (£)</FormLabel>
              <FormInput type="number" value={form.consultationFee} onChange={v => setForm({...form, consultationFee: v})} placeholder="100" min="0" />
            </div>
            <div>
              <FormLabel>Years of Experience</FormLabel>
              <FormInput type="number" value={form.yearsOfExperience} onChange={v => setForm({...form, yearsOfExperience: v})} placeholder="10" min="0" max="60" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Professional Bio" icon="📝">
          <FormLabel>Bio — visible to patients</FormLabel>
          <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all resize-none"
            rows="5" placeholder="Tell patients about your experience, expertise and approach to care..." />
        </FormSection>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="px-12 py-3.5 bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 hover:from-green-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
            {saving
              ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
              : <><span>💾</span> Save Profile</>}
          </button>
        </div>
      </form>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function FormSection({ title, icon, children }) {
  return (
    <div className="border-l-4 border-green-400 pl-5">
      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><span>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}
function FormLabel({ children }) {
  return <label className="block text-sm font-semibold text-gray-700 mb-2">{children}</label>;
}
function FormInput({ value, onChange, type = 'text', placeholder, required, min, max }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required} min={min} max={max}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all transform hover:border-gray-300" />
  );
}

export default DoctorProfileTab;