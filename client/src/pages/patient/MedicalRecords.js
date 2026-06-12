// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RecordCard from '../../components/patient/RecordCard';
import PatientDocumentUpload from '../../components/patient/PatientDocumentUpload';

const FILTERS = [
  { value: 'all', label: '📋 All Records' },
  { value: '1',   label: '🟢 Low Severity'   },
  { value: '2',   label: '🟡 Medium Severity' },
  { value: '3',   label: '🔴 High Severity'   },
];

function MedicalRecords() {
  const { address } = useAccount();
  const navigate    = useNavigate();
  const [recordIds, setRecordIds] = useState([]);
  const [filter, setFilter]       = useState('all');

  // ── Doctor-added records ─────────────────────────────────────────────────
  const { data: recordCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'recordCount',
  });

  useEffect(() => {
    if (!recordCount) return;
    const count = Number(recordCount);
    const ids = [];
    for (let i = count; i >= 1; i--) ids.push(i); // newest first
    setRecordIds(ids);
  }, [recordCount]);

  // ── Patient IPFS metadata (for document uploads) ─────────────────────────
  const { data: patientInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'patients',
    args: [address],
  });

  const [meta, setMeta] = useState(null);
  useEffect(() => {
    const hash = patientInfo?.[5];
    if (!hash) return;
    fetch(`https://ipfs.io/ipfs/${hash}`)
      .then(r => r.ok ? r.json() : null)
      .then(setMeta)
      .catch(() => null);
  }, [patientInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>📋</span> My Medical Records
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {recordIds.length} record{recordIds.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button onClick={() => navigate('/patient/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow text-blue-600 font-semibold hover:shadow-md transition-all">
            ← Dashboard
          </button>
        </div>

        {/* Severity filter */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6 flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Doctor-added records */}
        {recordIds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Medical Records Yet</h4>
            <p className="text-gray-500 text-sm">Records added by your doctors will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recordIds.map(id => (
              <FilteredRecord key={id} recordId={id} patientAddress={address} filter={filter} />
            ))}
          </div>
        )}

        {/* Patient document uploads — separate section */}
        <PatientDocumentUpload
          patientMeta={meta}
          onUploadComplete={() => window.location.reload()}
        />

      </div>
    </div>
  );
}

// ── Reads severity before rendering — only shows matching records ────────────
function FilteredRecord({ recordId, patientAddress, filter }) {
  const { data: record } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'getMedicalRecord', args: [recordId, patientAddress],
  });
  if (!record) return null;
  if (record.patientAddress?.toLowerCase() !== patientAddress?.toLowerCase()) return null;
  if (filter !== 'all' && Number(record.severity) !== Number(filter)) return null;
  return <RecordCard recordId={recordId} patientAddress={patientAddress} />;
}

export default MedicalRecords;