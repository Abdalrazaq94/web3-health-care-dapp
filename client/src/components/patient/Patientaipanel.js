
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useState, useEffect, useRef } from 'react';

const ALL_RECORDS_OPTIONS = [
  { icon: '📋', label: 'Summarise my medical history' },
  { icon: '💊', label: 'List all my current medications' },
  { icon: '📅', label: 'When is my next follow-up?' },
  { icon: '⚠️', label: 'Any health warnings I should know?' },
];

const SINGLE_RECORD_OPTIONS = [
  { icon: '🔬', label: 'What does my diagnosis mean?' },
  { icon: '💊', label: 'Explain my prescription' },
  { icon: '🌡️', label: 'Are my vitals normal?' },
  { icon: '📅', label: 'What happens at my follow-up?' },
];

function PatientAIPanel({ context, title, mode = 'all', onClose, hasData = true }) {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [streaming, setStreaming] = useState('');
  const bottomRef = useRef(null);
  const abortRef  = useRef(null);
  const streamRef = useRef('');

  const options      = mode === 'single' ? SINGLE_RECORD_OPTIONS : ALL_RECORDS_OPTIONS;
  const isGenerating = loading || !!streaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const handleStop = () => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  };

  const askQuestion = async (question) => {
    if (isGenerating || !hasData) return;

    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    setStreaming('');
    streamRef.current = '';

    const controller = new AbortController();
    abortRef.current = controller;
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'llama3.2:1b',
          stream: true,
          messages: [
            { role: 'system', content: context.systemPrompt },
            ...history,
            { role: 'user', content: question },
          ],
        }),
      });

      if (!res.ok) throw new Error('Ollama not reachable');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              full += json.message.content;
              streamRef.current = full;
              setStreaming(full);
            }
          } catch (_) {}
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }]);
      setStreaming('');

    } catch (err) {
      const content = err.name === 'AbortError'
        ? (streamRef.current ? streamRef.current + '\n\n_[Stopped]_' : '⏹ Stopped.')
        : '❌ Could not reach Ollama. Make sure it is running.';
      setMessages(prev => [...prev, { role: 'assistant', content }]);
      setStreaming('');
    }

    abortRef.current = null;
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white rounded-2xl overflow-hidden"
      style={{ animation: 'slideIn .3s cubic-bezier(.34,1.56,.64,1)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">🤖</div>
          <div>
            <p className="font-bold text-sm">Health AI Assistant</p>
            <p className="text-white/60 text-xs truncate max-w-48">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-300 bg-green-900/40 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Private
          </span>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
            ✕
          </button>
        </div>
      </div>

      {/* GDPR notice */}
      <div className="px-4 py-2 bg-green-900/30 border-b border-green-800/30 flex-shrink-0">
        <p className="text-xs text-green-400 flex items-center gap-1.5">
          <span>🔒</span> Your health data never leaves this device — GDPR compliant
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* No data state */}
        {!hasData && (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-300 font-semibold text-sm">No record data to analyse</p>
            <p className="text-gray-500 text-xs mt-1">This record doesn't have enough information yet.</p>
          </div>
        )}

        {/* Welcome */}
        {hasData && messages.length === 0 && !isGenerating && (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🏥</div>
            <p className="text-gray-300 font-semibold text-sm">Hi! Choose a question below.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">🤖</div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-800 text-gray-100 rounded-tl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">🤖</div>
            <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap">
              {streaming || (
                <span className="flex items-center gap-2 text-gray-400">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Thinking...
                </span>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom */}
      <div className="px-4 pb-4 flex-shrink-0 space-y-2">
        {isGenerating && (
          <button onClick={handleStop}
            className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-sm"/>Stop
          </button>
        )}

        {hasData && !isGenerating && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide px-1">
              {messages.length === 0 ? 'Choose a question:' : 'Ask another:'}
            </p>
            {options.map((opt, i) => (
              <button key={i} onClick={() => askQuestion(opt.label)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-blue-900/50 border border-gray-700 hover:border-blue-500 text-gray-200 hover:text-white rounded-xl transition-all text-sm font-semibold text-left">
                <span className="text-lg flex-shrink-0">{opt.icon}</span>
                <span>{opt.label}</span>
                <span className="ml-auto text-gray-600">→</span>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-600 text-center pt-1">
          ⚕️ For information only — always consult your doctor
        </p>
      </div>

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

// ── Context builders ──────────────────────────────────────────────────────────
export function buildPatientAllRecordsContext(patientName, patientMeta, records) {
  const recordsSummary = records.map((r, i) => {
    const { record, meta, doctorName } = r;
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
    return `Record #${i+1} | ${date} | Dr. ${doctorName} | Severity: ${sev}
  Diagnosis: ${record?.diagnosis || 'N/A'} | Treatment: ${record?.treatment || 'N/A'} | Prescription: ${record?.prescription || 'N/A'}
  ${meta?.symptoms ? `Symptoms: ${meta.symptoms}` : ''}${vitals ? ` | Vitals: ${vitals}` : ''}${meta?.labResults ? ` | Lab: ${meta.labResults}` : ''}${meta?.followUpDate ? ` | Follow-up: ${meta.followUpDate}` : ''}`.trim();
  }).join('\n');

  return {
    systemPrompt: `You are a health assistant. Answer ONLY from the patient data below. Be brief — 3 sentences max.
If data is missing for the question, say "I don't have that information in your records."
End every reply with: "Please consult your doctor."
Do NOT repeat the question. Do NOT add extra advice unless asked.

PATIENT: ${patientName}
ALLERGIES: ${patientMeta?.allergies || 'None'}
CONDITIONS: ${patientMeta?.chronicConditions || 'None'}
BLOOD TYPE: ${patientMeta?.bloodType || 'Unknown'}
RECORDS (${records.length}):
${recordsSummary || 'No records available'}`,
    title: 'My Medical History',
    hasData: records.length > 0,
  };
}

export function buildPatientSingleRecordContext(patientName, record, meta, doctorName) {
  const date   = record?.timestamp ? new Date(Number(record.timestamp) * 1000).toLocaleDateString() : 'Unknown';
  const vitals = meta ? [
    meta.bloodPressure    && `BP: ${meta.bloodPressure}mmHg`,
    meta.heartRate        && `HR: ${meta.heartRate}bpm`,
    meta.temperature      && `Temp: ${meta.temperature}°C`,
    meta.oxygenSaturation && `O2: ${meta.oxygenSaturation}%`,
    meta.weight           && `Weight: ${meta.weight}kg`,
    meta.height           && `Height: ${meta.height}cm`,
  ].filter(Boolean).join(', ') : '';

  const hasMeaningfulData = record?.diagnosis || record?.treatment || record?.prescription || vitals || meta?.symptoms;

  return {
    systemPrompt: `You are a health assistant. Answer ONLY from the record data below. Be brief — 3 sentences max.
If data is missing, say "This record doesn't have that information."
End every reply with: "Please consult your doctor."
Do NOT repeat the question. Do NOT add extra advice unless asked.

PATIENT: ${patientName} | DATE: ${date} | DOCTOR: Dr. ${doctorName}
DIAGNOSIS: ${record?.diagnosis || 'N/A'}
TREATMENT: ${record?.treatment || 'N/A'}
PRESCRIPTION: ${record?.prescription || 'N/A'}
NOTES: ${record?.notes || 'None'}
${meta?.symptoms ? `SYMPTOMS: ${meta.symptoms}` : ''}
${vitals ? `VITALS: ${vitals}` : ''}
${meta?.labResults ? `LAB: ${meta.labResults}` : ''}
${meta?.followUpDate ? `FOLLOW-UP: ${meta.followUpDate} — ${meta.followUpNotes || ''}` : ''}`,
    title: `Record — ${date}`,
    hasData: !!hasMeaningfulData,
  };
}

export default PatientAIPanel;