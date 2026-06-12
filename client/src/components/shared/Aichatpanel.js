import { useState, useEffect, useRef } from 'react';

function AIChatPanel({ context, title, onClose }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [streaming, setStreaming] = useState('');
  const bottomRef   = useRef(null);
  const abortRef    = useRef(null); // ✅ abort controller ref
  const streamingRef = useRef('');   // ✅ tracks streamed text for stop

  // Auto-analyse on open
  useEffect(() => {
    if (context) sendMessage(null, context.systemPrompt, context.initialMessage);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  // ✅ Stop streaming
  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  const sendMessage = async (userText, systemPrompt, autoMessage) => {
    const msgText = userText || autoMessage;
    if (!msgText?.trim()) return;

    const newMessages = userText
      ? [...messages, { role: 'user', content: userText }]
      : messages;

    if (userText) setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreaming('');

    const systemContent = systemPrompt || context?.systemPrompt || '';

    // ✅ Create abort controller for this request
    const controller  = new AbortController();
    abortRef.current  = controller;
    streamingRef.current = '';

    try {
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'llama3.2:1b',
          stream: true,
          messages: [
            { role: 'system', content: systemContent },
            ...newMessages,
            ...(userText ? [] : [{ role: 'user', content: msgText }]),
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
        const lines = decoder.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              full += json.message.content;
              streamingRef.current = full;
              setStreaming(full);
            }
          } catch (_) {}
        }
      }

      setMessages(prev => [
        ...prev,
        ...(userText ? [] : [{ role: 'user', content: msgText }]),
        { role: 'assistant', content: full },
      ]);
      setStreaming('');

    } catch (err) {
      if (err.name === 'AbortError') {
        // ✅ User stopped — save whatever was streamed so far
        setMessages(prev => [
          ...prev,
          ...(userText ? [] : [{ role: 'user', content: msgText }]),
          { role: 'assistant', content: streamingRef.current + '\n\n_[Response stopped by user]_' },
        ]);
        setStreaming('');
      } else {
        setMessages(prev => [
          ...prev,
          ...(userText ? [] : [{ role: 'user', content: msgText }]),
          { role: 'assistant', content: '❌ Could not reach Ollama. Make sure it is running on localhost:11434 with OLLAMA_ORIGINS set.' },
        ]);
        setStreaming('');
      }
    }

    abortRef.current = null;
    setLoading(false);
  };

  const quickPrompts = [
    'Summarise this patient\'s history',
    'Any drug interaction risks?',
    'What follow-up would you recommend?',
    'Are there any red flags?',
  ];

  const isGenerating = loading || !!streaming;

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white rounded-2xl overflow-hidden"
      style={{ animation: 'slideIn .3s cubic-bezier(.34,1.56,.64,1)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">🤖</div>
          <div>
            <p className="font-bold text-sm">Medical AI Assistant</p>
            <p className="text-white/60 text-xs truncate max-w-48">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-300 bg-green-900/40 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Local
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
          <span>🔒</span> All analysis runs locally — no patient data leaves this device (GDPR compliant)
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !loading && !streaming && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🧠</div>
            <p className="text-sm">Loading patient context...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">🤖</div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-gray-800 text-gray-100 rounded-tl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {(loading || streaming) && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">🤖</div>
            <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap">
              {streaming || (
                <span className="flex items-center gap-2 text-gray-400">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analysing...
                </span>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only when idle */}
      {messages.length > 0 && !isGenerating && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
          {quickPrompts.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-violet-800 text-gray-300 hover:text-white rounded-full transition-all border border-gray-700 hover:border-violet-500">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input + Stop button */}
      <div className="px-4 pb-4 flex-shrink-0 space-y-2">

        {/* ✅ Stop button — only while generating */}
        {isGenerating && (
          <button onClick={handleStop}
            className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-sm"/>
            Stop generating
          </button>
        )}

        <div className="flex gap-2 bg-gray-800 rounded-xl border border-gray-700 focus-within:border-violet-500 transition-all p-1">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isGenerating) sendMessage(input); }}
            placeholder={isGenerating ? 'Waiting for response...' : 'Ask about this patient...'}
            disabled={isGenerating}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 outline-none disabled:opacity-50"/>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isGenerating}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold transition-all">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChatPanel;