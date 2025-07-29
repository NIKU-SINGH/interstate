import React, { useState } from 'react';

interface ImportExportWalletModalProps {
  mode: 'import' | 'export';
  isOpen: boolean;
  onClose: () => void;
  onImport?: (wallets: any[]) => void;
  wallets?: any[];
}

export default function ImportExportWalletModal({ mode, isOpen, onClose, onImport, wallets }: ImportExportWalletModalProps) {
  const [importText, setImportText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        setError('');
        onImport?.(parsed);
        setImportText('');
        onClose();
      } else {
        setError('Invalid format. Must be an array.');
      }
    } catch {
      setError('Invalid JSON.');
    }
  };

  const handleCopy = () => {
    if (wallets) {
      navigator.clipboard.writeText(JSON.stringify(wallets, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-neutral-400 hover:text-white" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4 text-white">{mode === 'import' ? 'Import Wallets' : 'Export Wallets'}</h2>
        {mode === 'import' ? (
          <>
            <textarea
              className="w-full h-32 p-2 rounded bg-neutral-800 text-neutral-100 border border-neutral-700 mb-2"
              placeholder="Paste your exported wallets here..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
            <div className="text-xs text-neutral-400 mb-4 space-y-1">
              <div><span className="text-green-400">✔</span> BullX wallet imports are supported.</div>
              <div><span className="text-green-400">✔</span> GMGN wallet imports are supported.</div>
              <div><span className="text-blue-400">✔</span> RayBot wallet imports are supported.</div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition-all duration-300" onClick={handleImport}>Import</button>
          </>
        ) : (
          <>
            <textarea
              className="w-full h-32 p-2 rounded bg-neutral-800 text-neutral-100 border border-neutral-700 mb-2"
              value={JSON.stringify(wallets, null, 2)}
              readOnly
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition-all duration-300 mb-2" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
          </>
        )}
      </div>
    </div>
  );
} 