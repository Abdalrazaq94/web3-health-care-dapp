
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useState, useEffect } from 'react';
import IPFSFileViewer from '../shared/IPFSFileViewer';
import PatientAIPanel, { buildPatientSingleRecordContext } from './Patientaipanel';

function useIpfsMeta(hash) {
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!hash || hash === '') return;
    setLoading(true);
    (async () => {
      for (const url of [`https://ipfs.io/ipfs/${hash}`, `https://gateway.pinata.cloud/ipfs/${hash}`]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) { setMeta(await res.json()); setLoading(false); return; }
        } catch (_) {}
      }
      setLoading(false);
    })();
  }, [hash]);
  return { meta, loading };
}

const SEV = {
  1: { label: 'Low',    bg: 'bg-green-100',  text: 'text-green-700',  bar: 'from-green-400 to-emerald-500',  dot: 'bg-green-500',  icon: '🟢' },
  2: { label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'from-yellow-400 to-orange-400',  dot: 'bg-yellow-500', icon: '🟡' },
  3: { label: 'High',   bg: 'bg-red-100',    text: 'text-red-700',    bar: 'from-red-400 to-rose-500',       dot: 'bg-red-500',    icon: '🔴' },
};

function RecordCard({ recordId, patientAddress, patientName }) {
  const [expanded, setExpanded]   = useState(false);
  const [showAI, setShowAI]       = useState(false);
  const [aiContext, setAiContext]  = useState(null);

  const { data: record } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'getMedicalRecord', args: [recordId, patientAddress],
  });
  const { data: doctor } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'doctors', args: [record?.doctorAddress], enabled: !!record,
  });

  const metadataHash = record?.metadataHash || '';
  const { meta, loading: ipfsLoading } = useIpfsMeta(metadataHash);

  if (!record) return null;
  if (record.patientAddress?.toLowerCase() !== patientAddress?.toLowerCase()) return null;

  const severity     = Number(record.severity) || 1;
  const sev          = SEV[severity] || SEV[1];
  const date         = new Date(Number(record.timestamp) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time         = new Date(Number(record.timestamp) * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const doctorName   = doctor?.[1] || 'Unknown Doctor';
  const doctorSpec   = doctor?.[2] || '';
  const apptId       = Number(record.appointmentId) > 0 ? record.appointmentId.toString() : null;
  const attachments  = meta?.attachments || [];
  const hasVitals    = meta?.bloodPressure || meta?.heartRate || meta?.temperature || meta?.weight || meta?.height || meta?.oxygenSaturation;

  const handleAskAI = (e) => {
    e.stopPropagation();
    const ctx = buildPatientSingleRecordContext(patientName || 'Patient', record, meta, doctorName);
    setAiContext(ctx);
    setShowAI(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className={`h-1.5 w-full bg-gradient-to-r ${sev.bar}`} />

        {/* Collapsed header */}
        <div className="p-5 cursor-pointer hover:bg-gray-50 transition-colors select-none"
          onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={`p-3 rounded-xl flex-shrink-0 ${sev.bg}`}>
                <svg className={`w-6 h-6 ${sev.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-bold text-gray-800 text-base">Medical Record #{recordId.toString()}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${sev.bg} ${sev.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`}/>{sev.icon} {sev.label} Severity
                  </span>
                  {apptId && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">🔗 Appt #{apptId}</span>}
                  {meta && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600">📦 +Details</span>}
                  {attachments.length > 0 && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">📎 {attachments.length} file{attachments.length > 1 ? 's' : ''}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">Dr. {doctorName}</span>
                  {doctorSpec && <span className="text-green-600 text-xs font-semibold">{doctorSpec}</span>}
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{date}</span>
                  <span className="text-gray-400 text-xs">{time}</span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-500 uppercase text-xs tracking-wide">Diagnosis </span>
                  {record.diagnosis}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
              {/* Ask AI button */}
              <button onClick={handleAskAI}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow">
                🤖 Ask AI
              </button>
              <span className={`text-gray-400 text-xl transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>▾</span>
            </div>
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-gray-100" style={{ animation: 'fadeIn .25s ease-out' }}>
            {ipfsLoading && (
              <div className="px-6 pt-4 flex items-center gap-2 text-sm text-blue-600">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Loading extended record from IPFS...
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
              <RecordSection title="Symptoms Reported" icon="🤒" accent="border-orange-400">
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

            {(meta?.allergiesNoted || meta?.chronicConditionsNoted) && (
              <RecordSection title="Patient History (at time of visit)" icon="📋" accent="border-yellow-400">
                <div className="grid md:grid-cols-2 gap-3">
                  {meta.allergiesNoted          && <DetailBox icon="⚠️" label="Allergies Noted"    value={meta.allergiesNoted}          ipfs />}
                  {meta.chronicConditionsNoted  && <DetailBox icon="🏥" label="Chronic Conditions" value={meta.chronicConditionsNoted}   ipfs />}
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

            {!meta && !ipfsLoading && metadataHash === '' && (
              <div className="mx-6 mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                <span className="text-blue-500 flex-shrink-0">📦</span>
                <p className="text-xs text-blue-700">Extended fields will appear here for newer records.</p>
              </div>
            )}

            <RecordSection title="Record Details" icon="⛓️" accent="border-gray-300">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetaBox icon="🆔" label="Record ID"   value={`#${recordId.toString()}`} />
                <MetaBox icon="📅" label="Date"        value={date} />
                <MetaBox icon="🕐" label="Time"        value={time} />
                <MetaBox icon="👨‍⚕️" label="Doctor"     value={`Dr. ${doctorName}`} />
                {apptId && <MetaBox icon="🔗" label="Appointment" value={`#${apptId}`} />}
                {metadataHash && <MetaBox icon="📦" label="IPFS Hash" value={`${metadataHash.slice(0,12)}...`} title={metadataHash} mono />}
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <MetaBox icon="🏥" label="Patient Address" value={`${patientAddress?.slice(0,10)}...${patientAddress?.slice(-6)}`} mono />
                <MetaBox icon="👨‍⚕️" label="Doctor Address"  value={`${record.doctorAddress?.slice(0,10)}...${record.doctorAddress?.slice(-6)}`} mono />
              </div>
            </RecordSection>
          </div>
        )}
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>

      {/* AI Panel — slides in as overlay */}
      {showAI && aiContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4"
          style={{ background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowAI(false)}>
          <div className="w-full max-w-md h-[85vh]" onClick={e => e.stopPropagation()}>
            <PatientAIPanel
              context={aiContext}
              title={aiContext.title}
              mode="single"
              onClose={() => setShowAI(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ── Attachment row ────────────────────────────────────────────────────────────
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

// ── Sub-components ────────────────────────────────────────────────────────────
function RecordSection({ title, icon, accent = 'border-blue-400', children }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-100 border-l-4 ${accent}`}>
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
    <div className={`${hl} rounded-xl p-4 ${span2 ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-1.5 mb-2">
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
      <p className="text-xl font-bold text-red-700">{value}<span className="text-xs font-normal text-red-400 ml-0.5">{unit}</span></p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      <span className="text-xs bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded font-semibold">IPFS</span>
    </div>
  );
}

function MetaBox({ icon, label, value, mono, title }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3" title={title}>
      <p className="text-xs text-gray-400 font-semibold mb-0.5">{icon} {label}</p>
      <p className={`text-sm font-semibold text-gray-700 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

export default RecordCard;