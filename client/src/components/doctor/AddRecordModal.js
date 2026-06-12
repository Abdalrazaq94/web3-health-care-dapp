
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/uploadToIPFS';

const RELAYER = 'http://localhost:5000';

function AddRecordModal({ patientAddress, patientName, onClose }) {
  const { address: doctorAddress } = useAccount();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    diagnosis:        '',
    treatment:        '',
    prescription:     '',
    notes:            '',
    appointmentId:    '0',
    severity:         '1',
    symptoms:         '',
    followUpDate:     '',
    followUpNotes:    '',
    bloodPressure:    '',
    heartRate:        '',
    temperature:      '',
    weight:           '',
    height:           '',
    oxygenSaturation: '',
    labResults:       '',
    imagingResults:   '',
  });

  const [attachments,  setAttachments]  = useState([]);
  const fileRef = useRef();

  const [uploading,    setUploading]    = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMsg,     setErrorMsg]     = useState('');
  const [success,      setSuccess]      = useState(false);

  const addAttachment = (e) => {
    const files = Array.from(e.target.files).map(f => ({ file: f, name: f.name, category: 'general' }));
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };
  const removeAttachment = (i) => setAttachments(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg('');

    try {
      // ── 1. Upload attachments to IPFS ──────────────────────────
      const uploadedFiles = [];
      for (let i = 0; i < attachments.length; i++) {
        setUploadStatus(`Uploading file ${i + 1} of ${attachments.length}: ${attachments[i].name}...`);
        const cid = await uploadFileToIPFS(attachments[i].file);
        uploadedFiles.push({ cid, name: attachments[i].name, category: attachments[i].category, uploadedAt: new Date().toISOString() });
      }

      // ── 2. Build & upload metadata JSON to IPFS ────────────────
      setUploadStatus('Uploading record metadata to IPFS...');
      const metadata = {
        symptoms:         formData.symptoms         || undefined,
        followUpDate:     formData.followUpDate     || undefined,
        followUpNotes:    formData.followUpNotes    || undefined,
        bloodPressure:    formData.bloodPressure    || undefined,
        heartRate:        formData.heartRate        || undefined,
        temperature:      formData.temperature      || undefined,
        weight:           formData.weight           || undefined,
        height:           formData.height           || undefined,
        oxygenSaturation: formData.oxygenSaturation || undefined,
        labResults:       formData.labResults       || undefined,
        imagingResults:   formData.imagingResults   || undefined,
        attachments:      uploadedFiles.length > 0 ? uploadedFiles : undefined,
        createdAt:        new Date().toISOString(),
      };
      Object.keys(metadata).forEach(k => metadata[k] === undefined && delete metadata[k]);

      let metadataHash = '';
      if (Object.keys(metadata).length > 1 || uploadedFiles.length > 0) {
        metadataHash = await uploadJSONToIPFS(metadata, 'medical-record');
      }

      // ── 3. POST to relayer ─────────────────────────────────────
      setUploadStatus('Submitting to blockchain via relayer...');
      const res = await fetch(`${RELAYER}/api/add-medical-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorAddress,
          patientAddress,
          diagnosis:     formData.diagnosis,
          treatment:     formData.treatment,
          prescription:  formData.prescription,
          notes:         formData.notes,
          appointmentId: Number(formData.appointmentId),
          metadataHash,
          severity:      Number(formData.severity),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Transaction failed');

      setSuccess(true);
      setUploadStatus('');
      setTimeout(() => onClose(), 2000)

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed: ' + (err.message || 'Unknown error'));
      setUploadStatus('');
    } finally {
      setUploading(false);
    }
  };

  const severityConfig = {
    1: { label: 'Low',    color: 'bg-green-100 text-green-700 border-green-300',    dot: 'bg-green-500'  },
    2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-500' },
    3: { label: 'High',   color: 'bg-red-100 text-red-700 border-red-300',          dot: 'bg-red-500'    },
  };

  const totalSteps = 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><span>🩺</span> Add Medical Record</h2>
              <p className="text-blue-100 text-sm mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200 text-3xl leading-none">×</button>
          </div>
          <div className="flex gap-2 mt-4">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white bg-opacity-30'}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Patient badge */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-blue-500 font-semibold uppercase">Patient</p>
              <p className="font-bold text-blue-900">{patientName}</p>
              <p className="text-xs text-blue-400 font-mono">{patientAddress?.slice(0,10)}...{patientAddress?.slice(-6)}</p>
            </div>
          </div>

          {/* Status */}
          {(uploading || uploadStatus) && (
            <div className="mb-4 flex items-center gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl">
              <svg className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm text-blue-800 font-semibold">{uploadStatus || 'Processing...'}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl animate-bounce">✅</span>
              <div>
                <p className="font-bold text-green-800">Record Added Successfully!</p>
                <p className="text-green-600 text-sm">Closing in a moment...</p>
              </div>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 font-semibold">❌ {errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span>📋</span> Clinical Details</h3>
                <FormField label="Diagnosis *">
                  <textarea value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    rows="3" placeholder="Describe the diagnosis..." required />
                </FormField>
                <FormField label="Treatment *">
                  <textarea value={formData.treatment} onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    rows="3" placeholder="Describe the treatment plan..." required />
                </FormField>
                <FormField label="Symptoms (optional)">
                  <textarea value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    rows="2" placeholder="Patient-reported symptoms..." />
                </FormField>
                <FormField label="Severity Level *">
                  <div className="flex gap-3">
                    {[1,2,3].map(level => {
                      const cfg = severityConfig[level];
                      return (
                        <button key={level} type="button" onClick={() => setFormData({ ...formData, severity: String(level) })}
                          className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                            formData.severity === String(level) ? cfg.color + ' border-current shadow-md scale-105' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          <div className="flex items-center justify-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${formData.severity === String(level) ? cfg.dot : 'bg-gray-300'}`} />
                            {cfg.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FormField>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span>💊</span> Prescription & Vitals</h3>
                <FormField label="Prescription *">
                  <textarea value={formData.prescription} onChange={e => setFormData({ ...formData, prescription: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    rows="3" placeholder="List medications, dosage, frequency..." required />
                </FormField>
                <FormField label="Additional Notes">
                  <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    rows="2" placeholder="Follow-up instructions, warnings, etc..." />
                </FormField>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span>❤️</span> Vital Signs
                    <span className="text-xs text-purple-500 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">Stored on IPFS</span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'bloodPressure',    label: 'Blood Pressure',    placeholder: '120/80', unit: 'mmHg', icon: '🩸' },
                      { key: 'heartRate',        label: 'Heart Rate',        placeholder: '72',     unit: 'bpm',  icon: '❤️' },
                      { key: 'temperature',      label: 'Temperature',       placeholder: '37.0',   unit: '°C',   icon: '🌡️' },
                      { key: 'oxygenSaturation', label: 'Oxygen Saturation', placeholder: '98',     unit: '%',    icon: '🫁' },
                      { key: 'weight',           label: 'Weight',            placeholder: '70',     unit: 'kg',   icon: '⚖️' },
                      { key: 'height',           label: 'Height',            placeholder: '175',    unit: 'cm',   icon: '📏' },
                    ].map(({ key, label, placeholder, unit, icon }) => (
                      <div key={key} className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                          <span>{icon}</span>{label}
                          <span className="ml-auto text-red-400 text-xs">{unit}</span>
                        </label>
                        <input value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                          placeholder={placeholder}
                          className="w-full bg-white px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <FormField label="🧪 Lab Results">
                    <textarea value={formData.labResults} onChange={e => setFormData({ ...formData, labResults: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all resize-none text-sm"
                      rows="3" placeholder="Blood work, urinalysis, etc..." />
                  </FormField>
                  <FormField label="🔭 Imaging Results">
                    <textarea value={formData.imagingResults} onChange={e => setFormData({ ...formData, imagingResults: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all resize-none text-sm"
                      rows="3" placeholder="X-ray, MRI, CT scan findings..." />
                  </FormField>
                </div>
                <FormField label="Linked Appointment ID (optional)">
                  <input type="number" value={formData.appointmentId} onChange={e => setFormData({ ...formData, appointmentId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    min="0" placeholder="0" />
                </FormField>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span>📎</span> Attachments & Follow-up</h3>
                <div className="border-2 border-dashed border-purple-200 rounded-2xl p-5 bg-purple-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">📎 Attach Files</p>
                      <p className="text-xs text-gray-500 mt-0.5">X-rays, lab reports, scans — stored securely on IPFS</p>
                    </div>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-all">
                      + Add Files
                    </button>
                    <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.dicom" className="hidden" onChange={addAttachment} />
                  </div>
                  {attachments.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <span className="text-4xl">📁</span>
                      <p className="text-sm mt-2">No files attached yet</p>
                      <p className="text-xs mt-1">PDF, JPG, PNG, DICOM supported</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-purple-200 rounded-xl px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span>📄</span>
                            <span className="text-sm font-semibold text-gray-700 truncate max-w-xs">{f.name}</span>
                            <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">{(f.file.size / 1024).toFixed(0)} KB</span>
                          </div>
                          <button type="button" onClick={() => removeAttachment(i)}
                            className="w-6 h-6 bg-red-100 text-red-500 rounded-full hover:bg-red-200 flex items-center justify-center text-sm font-bold transition-all">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label="📅 Follow-up Date">
                    <input type="date" value={formData.followUpDate} onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
                  </FormField>
                  <FormField label="📝 Follow-up Notes">
                    <textarea value={formData.followUpNotes} onChange={e => setFormData({ ...formData, followUpNotes: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                      rows="3" placeholder="Instructions for next visit..." />
                  </FormField>
                </div>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl text-sm text-blue-800">
                  <p className="font-semibold mb-1">📦 What gets stored where:</p>
                  <p>• <strong>Blockchain:</strong> Diagnosis, treatment, prescription, notes, severity</p>
                  <p>• <strong>IPFS:</strong> Vitals, symptoms, lab results, attachments, follow-up</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              {step > 1
                ? <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 text-gray-600 font-semibold hover:text-gray-800 transition-all">← Back</button>
                : <div />}
              {step < totalSteps ? (
                <button type="button"
                  onClick={() => { if (step === 1 && (!formData.diagnosis || !formData.treatment)) return; setStep(s => s + 1); }}
                  disabled={step === 1 && (!formData.diagnosis || !formData.treatment)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Next →
                </button>
              ) : (
                <button type="submit" disabled={uploading || success}
                  className="px-10 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                  {uploading
                    ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                    : <><span>🩺</span> Save Record</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

export default AddRecordModal;