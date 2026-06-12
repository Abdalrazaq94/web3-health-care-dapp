

// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState, useRef } from 'react';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/uploadToIPFS';
import IPFSFileViewer from '../shared/IPFSFileViewer';

const RELAYER = 'http://localhost:5000';

function PatientDocumentUpload({ patientAddress, patientMeta, onUploadComplete }) {
  const [open, setOpen] = useState(false);

  const [medFiles,  setMedFiles]  = useState([]);
  const [presFiles, setPresFiles] = useState([]);

  const medRef  = useRef();
  const presRef = useRef();

  const [uploading,    setUploading]    = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMsg,     setErrorMsg]     = useState('');
  const [success,      setSuccess]      = useState(false);

  // ── localMeta: optimistic update so files show immediately after upload ───
  const [localMeta, setLocalMeta] = useState(null);
  const activeMeta = localMeta || patientMeta;

  const [viewingDoc, setViewingDoc] = useState(null);

  const addMedFiles = (e) => {
    const picked = Array.from(e.target.files).map(f => ({ file: f, name: f.name }));
    setMedFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const addPresFiles = (e) => {
    const picked = Array.from(e.target.files).map(f => ({ file: f, name: f.name }));
    setPresFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeMed  = (i) => setMedFiles(prev => prev.filter((_, idx) => idx !== i));
  const removePres = (i) => setPresFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (medFiles.length === 0 && presFiles.length === 0) {
      setErrorMsg('Please select at least one file to upload.');
      return;
    }
    setUploading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      // ── 1. Upload medical record files ─────────────────────────
      const uploadedMedRecords = [...(activeMeta?.medicalRecordFiles || [])];
      for (let i = 0; i < medFiles.length; i++) {
        setUploadStatus(`Uploading medical record ${i + 1} of ${medFiles.length}...`);
        const cid = await uploadFileToIPFS(medFiles[i].file);
        uploadedMedRecords.push({ cid, name: medFiles[i].name, uploadedAt: new Date().toISOString() });
      }

      // ── 2. Upload prescription files ───────────────────────────
      const uploadedPrescriptions = [...(activeMeta?.prescriptionFiles || [])];
      for (let i = 0; i < presFiles.length; i++) {
        setUploadStatus(`Uploading prescription ${i + 1} of ${presFiles.length}...`);
        const cid = await uploadFileToIPFS(presFiles[i].file);
        uploadedPrescriptions.push({ cid, name: presFiles[i].name, uploadedAt: new Date().toISOString() });
      }

      // ── 3. Build & upload updated metadata JSON ────────────────
      setUploadStatus('Uploading metadata to IPFS...');
      const updatedMeta = {
        ...(activeMeta || {}),
        medicalRecordFiles: uploadedMedRecords,
        prescriptionFiles:  uploadedPrescriptions,
        updatedAt: new Date().toISOString(),
      };
      const newMetadataHash = await uploadJSONToIPFS(updatedMeta, 'patient-documents');

      // ── 4. POST to relayer ─────────────────────────────────────
      setUploadStatus('Submitting to blockchain via relayer...');
      const res = await fetch(`${RELAYER}/api/update-patient-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientAddress, metadataHash: newMetadataHash }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Transaction failed');

      // ── 5. Optimistic update — show files immediately ──────────
      setLocalMeta(updatedMeta);
      setMedFiles([]);
      setPresFiles([]);
      setUploadStatus('');
      setSuccess(true);
      if (onUploadComplete) onUploadComplete(updatedMeta);

    } catch (err) {
      console.error(err);
      setErrorMsg('Upload failed: ' + err.message);
      setUploadStatus('');
    } finally {
      setUploading(false);
    }
  };

  const existingMedRecords    = activeMeta?.medicalRecordFiles || [];
  const existingPrescriptions = activeMeta?.prescriptionFiles  || [];

  return (
    <div className="mt-8">

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600
          hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl
          shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
        <span>📎</span>
        {open ? 'Close Upload Panel' : 'Upload Documents'}
        {(existingMedRecords.length + existingPrescriptions.length) > 0 && (
          <span className="ml-1 bg-white text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {existingMedRecords.length + existingPrescriptions.length}
          </span>
        )}
      </button>

      {/* Upload panel */}
      {open && (
        <div className="mt-4 bg-white rounded-2xl border-2 border-purple-100 shadow-xl overflow-hidden"
          style={{ animation: 'fadeIn .3s ease-out' }}>

          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <h3 className="text-white font-bold text-lg">📎 Upload Personal Documents</h3>
            <p className="text-purple-100 text-sm mt-0.5">
              Stored on IPFS and visible only to doctors you grant access to.
            </p>
          </div>

          <div className="p-6 space-y-6">

            {/* Medical Records */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">🏥</span> Previous Medical Records
                </h4>
                <button type="button" onClick={() => medRef.current?.click()}
                  className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200
                    rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all">
                  + Add Files
                </button>
                <input ref={medRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden" onChange={addMedFiles} />
              </div>
              {medFiles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {medFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-50
                      border border-blue-200 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>📄</span>
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-xs">{f.name}</span>
                        <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">New</span>
                      </div>
                      <button onClick={() => removeMed(i)}
                        className="w-6 h-6 bg-red-100 text-red-500 rounded-full hover:bg-red-200
                          flex items-center justify-center text-sm font-bold transition-all">×</button>
                    </div>
                  ))}
                </div>
              )}
              {medFiles.length === 0 && existingMedRecords.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                  <span className="text-3xl">🏥</span>
                  <p className="text-sm mt-2">No medical records uploaded yet</p>
                  <p className="text-xs mt-1">PDF, JPG, PNG, DOC supported</p>
                </div>
              )}
            </div>

            {/* Prescriptions */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">💊</span> Previous Prescriptions
                </h4>
                <button type="button" onClick={() => presRef.current?.click()}
                  className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200
                    rounded-xl text-sm font-semibold hover:bg-purple-100 transition-all">
                  + Add Files
                </button>
                <input ref={presRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden" onChange={addPresFiles} />
              </div>
              {presFiles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {presFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-purple-50
                      border border-purple-200 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>💊</span>
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-xs">{f.name}</span>
                        <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">New</span>
                      </div>
                      <button onClick={() => removePres(i)}
                        className="w-6 h-6 bg-red-100 text-red-500 rounded-full hover:bg-red-200
                          flex items-center justify-center text-sm font-bold transition-all">×</button>
                    </div>
                  ))}
                </div>
              )}
              {presFiles.length === 0 && existingPrescriptions.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                  <span className="text-3xl">💊</span>
                  <p className="text-sm mt-2">No prescriptions uploaded yet</p>
                  <p className="text-xs mt-1">PDF, JPG, PNG, DOC supported</p>
                </div>
              )}
            </div>

            {/* Status */}
            {(uploading || uploadStatus) && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl">
                <svg className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-sm text-blue-800 font-semibold">{uploadStatus || 'Uploading...'}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-green-800">Documents uploaded successfully!</p>
                  <p className="text-green-600 text-sm">Stored on IPFS and confirmed on blockchain.</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 font-semibold">❌ {errorMsg}</p>
              </div>
            )}

            {(medFiles.length > 0 || presFiles.length > 0) && !success && (
              <button onClick={handleUpload} disabled={uploading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600
                  hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl
                  shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all
                  flex items-center justify-center gap-2">
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <><span>📤</span> Upload {medFiles.length + presFiles.length} File{medFiles.length + presFiles.length > 1 ? 's' : ''} to IPFS</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Existing uploaded documents */}
      {(existingMedRecords.length > 0 || existingPrescriptions.length > 0) && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>📁</span> My Uploaded Documents
              <span className="ml-1 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {existingMedRecords.length + existingPrescriptions.length} files
              </span>
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {existingMedRecords.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🏥</span> Medical Records
                </h4>
                <div className="space-y-2">
                  {existingMedRecords.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-50
                      border border-blue-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(doc.uploadedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setViewingDoc({ cid: doc.cid, name: doc.name })}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold
                          rounded-lg hover:bg-blue-700 transition-all">
                        👁 View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingPrescriptions.length > 0 && (
              <div className={existingMedRecords.length > 0 ? 'pt-4 border-t border-gray-100' : ''}>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>💊</span> Prescriptions
                </h4>
                <div className="space-y-2">
                  {existingPrescriptions.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-purple-50
                      border border-purple-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💊</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(doc.uploadedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setViewingDoc({ cid: doc.cid, name: doc.name })}
                        className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold
                          rounded-lg hover:bg-purple-700 transition-all">
                        👁 View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewingDoc && (
        <IPFSFileViewer
          cid={viewingDoc.cid}
          fileName={viewingDoc.name}
          onClose={() => setViewingDoc(null)}
        />
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

export default PatientDocumentUpload;