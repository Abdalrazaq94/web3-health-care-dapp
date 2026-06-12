
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useState, useEffect, useRef } from 'react';
import IPFSFileViewer from '../shared/IPFSFileViewer';
import AIChatPanel from '../shared/Aichatpanel';

// ── Patient IPFS metadata ─────────────────────────────────────────────────────
function usePatientMeta(patientAddress) {
  const [meta, setMeta] = useState(null);
  const { data: patientInfo } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'patients', args: [patientAddress], enabled: !!patientAddress,
  });
  useEffect(() => {
    const hash = patientInfo?.[7];
    if (!hash) return;
    (async () => {
      for (const url of [`https://ipfs.io/ipfs/${hash}`, `https://gateway.pinata.cloud/ipfs/${hash}`]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); return; }
        } catch (_) {}
      }
    })();
  }, [patientInfo]);
  return { meta, patientInfo };
}

// ── Record IPFS metadata ──────────────────────────────────────────────────────
function useRecordMeta(metadataHash) {
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!metadataHash || metadataHash === '') { setMeta(null); return; }
    setLoading(true);
    (async () => {
      for (const url of [`https://ipfs.io/ipfs/${metadataHash}`, `https://gateway.pinata.cloud/ipfs/${metadataHash}`]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); setLoading(false); return; }
        } catch (_) {}
      }
      setLoading(false);
    })();
  }, [metadataHash]);
  return { meta, loading };
}

const SEV = {
  1: { label: 'Low',    bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  bar: 'from-green-400 to-emerald-500' },
  2: { label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', bar: 'from-yellow-400 to-orange-400' },
  3: { label: 'High',   bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    bar: 'from-red-400 to-rose-500'     },
};

// ── Build AI context from all patient data ────────────────────────────────────
function buildAllRecordsContext(patientName, patientAddress, patientMeta, records) {
  const docs = [
    ...(patientMeta?.medicalRecordFiles || []).map(d => `- ${d.name} (uploaded ${new Date(d.uploadedAt).toLocaleDateString()})`),
    ...(patientMeta?.prescriptionFiles  || []).map(d => `- ${d.name} (uploaded ${new Date(d.uploadedAt).toLocaleDateString()})`),
  ];

  const recordsSummary = records.map((r, i) => {
    const { record, meta, doctorName } = r;
    const sev = ['','Low','Medium','High'][Number(record?.severity)] || 'Unknown';
    const date = record?.timestamp ? new Date(Number(record.timestamp) * 1000).toLocaleDateString() : 'Unknown';
    const vitals = meta ? [
      meta.bloodPressure && `BP: ${meta.bloodPressure}mmHg`,
      meta.heartRate     && `HR: ${meta.heartRate}bpm`,
      meta.temperature   && `Temp: ${meta.temperature}°C`,
      meta.oxygenSaturation && `O2: ${meta.oxygenSaturation}%`,
      meta.weight        && `Weight: ${meta.weight}kg`,
      meta.height        && `Height: ${meta.height}cm`,
    ].filter(Boolean).join(', ') : '';

    return `
Record #${i + 1} — ${date} — Dr. ${doctorName} — Severity: ${sev}
  Diagnosis: ${record?.diagnosis || 'N/A'}
  Treatment: ${record?.treatment || 'N/A'}
  Prescription: ${record?.prescription || 'N/A'}
  Notes: ${record?.notes || 'None'}
  ${meta?.symptoms ? `Symptoms: ${meta.symptoms}` : ''}
  ${vitals ? `Vitals: ${vitals}` : ''}
  ${meta?.labResults ? `Lab Results: ${meta.labResults}` : ''}
  ${meta?.imagingResults ? `Imaging: ${meta.imagingResults}` : ''}
  ${meta?.followUpDate ? `Follow-up: ${meta.followUpDate} — ${meta.followUpNotes || ''}` : ''}
  ${meta?.attachments?.length ? `Attachments: ${meta.attachments.map(a => a.name).join(', ')}` : ''}`.trim();
  }).join('\n\n');

  const systemPrompt = `You are a clinical AI assistant helping a doctor review a patient's full medical history.
You are running locally and securely — all data is private and GDPR compliant.

PATIENT: ${patientName}
WALLET: ${patientAddress}
ALLERGIES: ${patientMeta?.allergies || 'None recorded'}
CHRONIC CONDITIONS: ${patientMeta?.chronicConditions || 'None recorded'}
BLOOD TYPE: ${patientMeta?.bloodType || 'Unknown'}
AGE: ${patientMeta?.age || 'Unknown'}

UPLOADED DOCUMENTS:
${docs.length > 0 ? docs.join('\n') : 'None uploaded'}

MEDICAL RECORDS (${records.length} total):
${recordsSummary || 'No records found'}

Your role: Help the doctor understand this patient's history, identify patterns, flag risks, suggest follow-ups.
Be concise, clinical, and helpful. Always remind the doctor to use their own clinical judgement.`;

  return {
    systemPrompt,
    initialMessage: `Please give me a comprehensive summary of ${patientName}'s medical history, highlighting any patterns, risks, or important findings across all ${records.length} records.`,
  };
}

function buildSingleRecordContext(patientName, record, meta, doctorName) {
  const sev  = ['','Low','Medium','High'][Number(record?.severity)] || 'Unknown';
  const date = record?.timestamp ? new Date(Number(record.timestamp) * 1000).toLocaleDateString() : 'Unknown';
  const vitals = meta ? [
    meta.bloodPressure    && `BP: ${meta.bloodPressure}mmHg`,
    meta.heartRate        && `HR: ${meta.heartRate}bpm`,
    meta.temperature      && `Temp: ${meta.temperature}°C`,
    meta.oxygenSaturation && `O2: ${meta.oxygenSaturation}%`,
    meta.weight           && `Weight: ${meta.weight}kg`,
    meta.height           && `Height: ${meta.height}cm`,
  ].filter(Boolean).join(', ') : '';

  const systemPrompt = `You are a clinical AI assistant helping a doctor review a specific medical record.
You are running locally and securely — all data is private and GDPR compliant.

PATIENT: ${patientName}
RECORD DATE: ${date}
ATTENDING DOCTOR: Dr. ${doctorName}
SEVERITY: ${sev}

CLINICAL DATA:
- Diagnosis: ${record?.diagnosis || 'N/A'}
- Treatment: ${record?.treatment || 'N/A'}
- Prescription: ${record?.prescription || 'N/A'}
- Notes: ${record?.notes || 'None'}
${meta?.symptoms        ? `- Symptoms: ${meta.symptoms}` : ''}
${vitals                ? `- Vitals: ${vitals}` : ''}
${meta?.labResults      ? `- Lab Results: ${meta.labResults}` : ''}
${meta?.imagingResults  ? `- Imaging: ${meta.imagingResults}` : ''}
${meta?.followUpDate    ? `- Follow-up: ${meta.followUpDate} — ${meta.followUpNotes || ''}` : ''}
${meta?.attachments?.length ? `- Attachments: ${meta.attachments.map(a => a.name).join(', ')}` : ''}

Your role: Help the doctor interpret this specific record, flag concerns, and suggest next steps.
Be concise and clinical. Always remind the doctor to apply their own clinical judgement.`;

  return {
    systemPrompt,
    initialMessage: `Analyse this medical record for ${patientName}. Highlight the key findings, any concerns about the diagnosis or treatment, and what follow-up you would recommend.`,
  };
}

// ── Main Modal ────────────────────────────────────────────────────────────────
function PatientRecordsModal({ patientAddress, patientName, onClose }) {
  const [recordIds, setRecordIds]     = useState([]);
  const [activeTab, setActiveTab]     = useState('records');
  const [aiContext, setAiContext]     = useState(null);
  const [allRecordsData, setAllRecordsData] = useState([]);

  const { data: recordCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'recordCount',
  });

  useEffect(() => {
    if (!recordCount) return;
    const ids = [];
    for (let i = Number(recordCount); i >= 1; i--) ids.push(i);
    setRecordIds(ids);
  }, [recordCount]);

  const { meta: patientMeta } = usePatientMeta(patientAddress);
  const medDocs   = patientMeta?.medicalRecordFiles || [];
  const presDocs  = patientMeta?.prescriptionFiles  || [];
  const totalDocs = medDocs.length + presDocs.length;

  const handleAnalyseAll = () => {
    const ctx = buildAllRecordsContext(patientName, patientAddress, patientMeta, allRecordsData);
    setAiContext({ ...ctx, title: `Full analysis — ${patientName}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>

      {/* Modal — wider when AI is open */}
      <div className={`bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex transition-all duration-500 ${
        aiContext ? 'w-full max-w-6xl' : 'w-full max-w-3xl'}`}
        style={{ animation: 'popIn .25s cubic-bezier(.34,1.56,.64,1)' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Left: Records panel ── */}
        <div className={`flex flex-col transition-all duration-500 ${aiContext ? 'w-1/2' : 'w-full'}`}>

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-7 py-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Patient Records</p>
                <h2 className="text-white font-black text-xl">{patientName}</h2>
                <p className="text-white/50 font-mono text-xs mt-0.5">
                  {patientAddress?.slice(0,8)}...{patientAddress?.slice(-6)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Analyse ALL button */}
                <button onClick={handleAnalyseAll}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg">
                  🤖 Analyse All
                </button>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-5">
              <TabBtn active={activeTab === 'records'}   onClick={() => setActiveTab('records')}>
                📋 Medical Records
                <Badge count={recordIds.length} color="blue" />
              </TabBtn>
              <TabBtn active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>
                📎 Patient Documents
                {totalDocs > 0 && <Badge count={totalDocs} color="purple" />}
              </TabBtn>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-7 py-5">
            {activeTab === 'records' && (
              <div className="space-y-4">
                {recordIds.length === 0 ? (
                  <EmptyState icon="📋" text="Loading records..." />
                ) : (
                  recordIds.map(id => (
                    <RecordItem
                      key={id} recordId={id} patientAddress={patientAddress}
                      patientName={patientName}
                      onRecordLoaded={(data) => setAllRecordsData(prev => {
                        const exists = prev.find(r => r.id === id);
                        if (exists) return prev;
                        return [...prev, { id, ...data }];
                      })}
                      onAskAI={(ctx) => setAiContext(ctx)}
                    />
                  ))
                )}
              </div>
            )}
            {activeTab === 'documents' && (
              <DocumentsTab medDocs={medDocs} presDocs={presDocs} totalDocs={totalDocs} />
            )}
          </div>
        </div>

        {/* ── Right: AI Chat panel ── */}
        {aiContext && (
          <div className="w-1/2 border-l border-gray-200 flex flex-col">
            <AIChatPanel
              context={aiContext}
              title={aiContext.title}
              onClose={() => setAiContext(null)}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}

// ── Record Item ───────────────────────────────────────────────────────────────
function RecordItem({ recordId, patientAddress, patientName, onRecordLoaded, onAskAI }) {
  const [expanded, setExpanded] = useState(false);

  const { data: record } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'getMedicalRecord', args: [recordId, patientAddress],
  });
  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'doctors', args: [record?.doctorAddress], enabled: !!record,
  });
  const { meta, loading: ipfsLoading } = useRecordMeta(record?.metadataHash || '');

  // Report data up to parent for "Analyse All"
  useEffect(() => {
    if (record && record.patientAddress?.toLowerCase() === patientAddress?.toLowerCase()) {
      onRecordLoaded({ record, meta, doctorName: doctor?.[1] || 'Unknown' });
    }
  }, [record, meta, doctor]);

  if (!record) return null;
  if (record.patientAddress?.toLowerCase() !== patientAddress?.toLowerCase()) return null;

  const severity = Number(record.severity) || 1;
  const sev      = SEV[severity] || SEV[1];
  const date     = new Date(Number(record.timestamp) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const time     = new Date(Number(record.timestamp) * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const apptId   = Number(record.appointmentId) > 0 ? record.appointmentId.toString() : null;
  const attachments    = meta?.attachments || [];
  const hasVitals      = meta?.bloodPressure || meta?.heartRate || meta?.temperature || meta?.weight || meta?.height || meta?.oxygenSaturation;

  const handleAskAI = (e) => {
    e.stopPropagation();
    const ctx = buildSingleRecordContext(patientName, record, meta, doctor?.[1] || 'Unknown');
    onAskAI({ ...ctx, title: `Record #${recordId} — ${date}` });
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className={`h-1 w-full bg-gradient-to-r ${sev.bar}`} />

      {/* Header row */}
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-all select-none"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-bold text-gray-800">Record #{recordId.toString()}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${sev.bg} ${sev.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`}/>{sev.label}
              </span>
              {apptId && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">🔗 Appt #{apptId}</span>}
              {meta    && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">📦 +IPFS</span>}
            </div>
            <p className="text-sm text-gray-500">Dr. {doctor?.[1] || '...'} · {date} {time}</p>
            <p className="text-sm text-gray-700 mt-1"><strong>Diagnosis:</strong> {record.diagnosis}</p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {/* Per-record AI button */}
            <button onClick={handleAskAI}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow"
              title="Ask AI about this record">
              🤖 Ask AI
            </button>
            <span className={`text-gray-400 font-bold transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100" style={{ animation: 'fadeIn .25s ease-out' }}>
          {ipfsLoading && (
            <div className="px-5 pt-4 flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading from IPFS...
            </div>
          )}

          <RecordSection title="Clinical Information" icon="🩺" accent="border-blue-400">
            <div className="grid md:grid-cols-2 gap-3">
              <DetailBox icon="🔬" label="Diagnosis"    value={record.diagnosis}    span2 highlight="blue" />
              <DetailBox icon="💉" label="Treatment"    value={record.treatment}    />
              <DetailBox icon="💊" label="Prescription" value={record.prescription} />
              {record.notes && <DetailBox icon="📌" label="Doctor's Notes" value={record.notes} span2 />}
            </div>
          </RecordSection>

          {meta?.symptoms && (
            <RecordSection title="Symptoms" icon="🤒" accent="border-orange-400">
              <DetailBox icon="🤒" label="Symptoms" value={meta.symptoms} ipfs />
            </RecordSection>
          )}

          {hasVitals && (
            <RecordSection title="Vital Signs" icon="❤️" accent="border-red-400">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {meta.bloodPressure    && <VitalBox icon="🩸" label="Blood Pressure"    value={meta.bloodPressure}    unit="mmHg" />}
                {meta.heartRate        && <VitalBox icon="❤️" label="Heart Rate"        value={meta.heartRate}        unit="bpm"  />}
                {meta.temperature      && <VitalBox icon="🌡️" label="Temperature"       value={meta.temperature}      unit="°C"   />}
                {meta.oxygenSaturation && <VitalBox icon="🫁" label="Oxygen Saturation" value={meta.oxygenSaturation} unit="%"    />}
                {meta.weight           && <VitalBox icon="⚖️" label="Weight"            value={meta.weight}           unit="kg"   />}
                {meta.height           && <VitalBox icon="📏" label="Height"            value={meta.height}           unit="cm"   />}
              </div>
            </RecordSection>
          )}

          {(meta?.labResults || meta?.imagingResults) && (
            <RecordSection title="Test Results" icon="🧪" accent="border-purple-400">
              <div className="grid md:grid-cols-2 gap-3">
                {meta.labResults     && <DetailBox icon="🧪" label="Lab Results"     value={meta.labResults}     ipfs />}
                {meta.imagingResults && <DetailBox icon="🔭" label="Imaging Results" value={meta.imagingResults} ipfs />}
              </div>
            </RecordSection>
          )}

          {attachments.length > 0 && (
            <RecordSection title="Attached Files" icon="📎" accent="border-indigo-400">
              <div className="space-y-2">
                {attachments.map((att, i) => <AttachmentRow key={i} attachment={att} />)}
              </div>
            </RecordSection>
          )}

          {(meta?.followUpDate || meta?.followUpNotes) && (
            <RecordSection title="Follow-up" icon="📆" accent="border-green-400">
              <div className="grid md:grid-cols-2 gap-3">
                {meta.followUpDate  && <DetailBox icon="📅" label="Follow-up Date"  value={meta.followUpDate}  ipfs />}
                {meta.followUpNotes && <DetailBox icon="📝" label="Follow-up Notes" value={meta.followUpNotes} ipfs />}
              </div>
            </RecordSection>
          )}

          <RecordSection title="Record Details" icon="⛓️" accent="border-gray-300">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetaBox icon="🆔" label="Record ID"  value={`#${recordId}`} />
              <MetaBox icon="📅" label="Date"       value={date} />
              <MetaBox icon="🕐" label="Time"       value={time} />
              <MetaBox icon="👨‍⚕️" label="Doctor"    value={`Dr. ${doctor?.[1] || '...'}`} />
              {apptId && <MetaBox icon="🔗" label="Appointment" value={`#${apptId}`} />}
              {record.metadataHash && <MetaBox icon="📦" label="IPFS Hash" value={`${record.metadataHash.slice(0,12)}...`} mono />}
            </div>
          </RecordSection>
        </div>
      )}
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab({ medDocs, presDocs, totalDocs }) {
  if (totalDocs === 0) return (
    <EmptyState icon="📁" text="This patient has not uploaded any personal documents yet." />
  );
  return (
    <div className="space-y-6">
      {medDocs.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            🏥 Previous Medical Records <Badge count={medDocs.length} color="blue" />
          </h4>
          <div className="space-y-2">
            {medDocs.map((doc, i) => <DocRow key={i} doc={doc} color="blue" icon="📄" />)}
          </div>
        </div>
      )}
      {presDocs.length > 0 && (
        <div className={medDocs.length > 0 ? 'pt-5 border-t border-gray-100' : ''}>
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            💊 Previous Prescriptions <Badge count={presDocs.length} color="purple" />
          </h4>
          <div className="space-y-2">
            {presDocs.map((doc, i) => <DocRow key={i} doc={doc} color="purple" icon="💊" />)}
          </div>
        </div>
      )}
    </div>
  );
}

function DocRow({ doc, color, icon }) {
  const [viewing, setViewing] = useState(false);
  const c = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   btn: 'bg-blue-600 hover:bg-blue-700'   },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', btn: 'bg-purple-600 hover:bg-purple-700' },
  }[color];
  return (
    <>
      <div className={`flex items-center justify-between ${c.bg} border ${c.border} rounded-xl px-4 py-3`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{doc.name}</p>
            <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <button onClick={() => setViewing(true)} className={`px-3 py-1.5 ${c.btn} text-white text-xs font-semibold rounded-lg transition-all`}>👁 View</button>
      </div>
      {viewing && <IPFSFileViewer cid={doc.cid} fileName={doc.name} onClose={() => setViewing(false)} />}
    </>
  );
}

function AttachmentRow({ attachment }) {
  const [viewing, setViewing] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{attachment.name}</p>
            <p className="text-xs text-gray-400">{attachment.category || 'general'} · {new Date(attachment.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <button onClick={() => setViewing(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all">👁 View</button>
      </div>
      {viewing && <IPFSFileViewer cid={attachment.cid} fileName={attachment.name} onClose={() => setViewing(false)} />}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
        active ? 'bg-white text-slate-900' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
      {children}
    </button>
  );
}

function Badge({ count, color }) {
  const c = { blue: 'bg-blue-500', purple: 'bg-purple-500' }[color] || 'bg-gray-500';
  return <span className={`ml-1 ${c} text-white text-xs px-1.5 py-0.5 rounded-full`}>{count}</span>;
}

function EmptyState({ icon, text }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-gray-500 font-semibold">{text}</p>
    </div>
  );
}

function RecordSection({ title, icon, accent = 'border-blue-400', children }) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 border-l-4 ${accent}`}>
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <span>{icon}</span>{title}
      </h4>
      {children}
    </div>
  );
}

function DetailBox({ icon, label, value, span2, highlight, ipfs }) {
  const hl = highlight === 'blue' ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-100';
  return (
    <div className={`${hl} rounded-xl p-3.5 ${span2 ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span>{icon}</span>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
        {ipfs && <span className="ml-auto text-xs bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded font-semibold">IPFS</span>}
      </div>
      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}

function VitalBox({ icon, label, value, unit }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
      <p className="text-lg mb-0.5">{icon}</p>
      <p className="text-lg font-bold text-red-700">{value}<span className="text-xs font-normal text-red-400 ml-0.5">{unit}</span></p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function MetaBox({ icon, label, value, mono }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 font-semibold mb-0.5">{icon} {label}</p>
      <p className={`text-sm font-semibold text-gray-700 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

export default PatientRecordsModal;