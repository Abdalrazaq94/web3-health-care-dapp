import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// IPFSFileViewer
// Shows a file from IPFS in a secure modal popup.
// Supports: images (jpg, png, gif, webp), PDFs, and generic files.
// The IPFS URL is never shown to the user.
// ─────────────────────────────────────────────────────────────────────────────
function IPFSFileViewer({ cid, fileName, onClose }) {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [blobUrl, setBlobUrl]   = useState(null);
  const [fileType, setFileType] = useState(null);

  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(ext);
  const isPdf   = ext === 'pdf';

  useEffect(() => {
    if (!cid) return;

    const gateways = [
      `https://ipfs.io/ipfs/${cid}`,
      `https://gateway.pinata.cloud/ipfs/${cid}`,
    ];

    const fetchFile = async () => {
      setLoading(true);
      setError(false);

      for (const url of gateways) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
          if (!res.ok) continue;

          const contentType = res.headers.get('content-type') || '';
          setFileType(contentType);

          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          setLoading(false);
          return;
        } catch (_) {}
      }

      setError(true);
      setLoading(false);
    };

    fetchFile();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [cid]);

  const isImageType = isImage || fileType?.startsWith('image/');
  const isPdfType   = isPdf   || fileType?.includes('pdf');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        style={{ animation: 'popIn .2s cubic-bezier(.34,1.56,.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isImageType ? '🖼️' : isPdfType ? '📋' : '📄'}</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">{fileName}</p>
              <p className="text-xs text-gray-400">Secure IPFS viewer — link not exposed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 min-h-64">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-16">
              <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-gray-500 text-sm font-semibold">Loading file from IPFS...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-8">
              <span className="text-5xl">⚠️</span>
              <p className="font-bold text-gray-700">Could not load file</p>
              <p className="text-gray-400 text-sm">The file may still be propagating on IPFS. Try again in a moment.</p>
              <button
                onClick={() => { setError(false); setLoading(true); setBlobUrl(null); }}
                className="mt-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <>
              {isImageType && (
                <img
                  src={blobUrl}
                  alt={fileName}
                  className="max-w-full max-h-[70vh] object-contain p-4"
                />
              )}

              {isPdfType && (
                <iframe
                  src={blobUrl}
                  title={fileName}
                  className="w-full h-[70vh]"
                  style={{ border: 'none' }}
                />
              )}

              {!isImageType && !isPdfType && (
                <div className="flex flex-col items-center gap-4 py-16 text-center px-8">
                  <span className="text-6xl">📄</span>
                  <p className="font-bold text-gray-700 text-lg">{fileName}</p>
                  <p className="text-gray-400 text-sm">
                    This file type cannot be previewed directly.<br/>
                    Click below to download it securely.
                  </p>
                  <a
                    href={blobUrl}
                    download={fileName}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    ⬇️ Download File
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(.94) translateY(12px); }
          to   { opacity:1; transform:scale(1)   translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default IPFSFileViewer;