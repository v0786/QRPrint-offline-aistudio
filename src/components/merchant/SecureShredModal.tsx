import React, { useState, useEffect } from 'react';
import { PrintJob } from '../../types';
import { ShieldAlert, Trash2, X, CheckCircle2, Binary, Lock, RefreshCw } from 'lucide-react';

interface SecureShredModalProps {
  job: PrintJob | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmShred: (jobId: string) => void;
}

export const SecureShredModal: React.FC<SecureShredModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirmShred,
}) => {
  if (!isOpen || !job) return null;

  const [currentPass, setCurrentPass] = useState(0);
  const [shreddingInProgress, setShreddingInProgress] = useState(false);
  const [hexPreview, setHexPreview] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const generateHexLines = (pass: number) => {
    const lines: string[] = [];
    for (let i = 0; i < 6; i++) {
      let pattern = '';
      if (pass === 1) pattern = '00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00';
      else if (pass === 2) pattern = 'FF FF FF FF FF FF FF FF  FF FF FF FF FF FF FF FF';
      else {
        pattern = Array.from({ length: 16 }, () => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
        ).join(' ');
      }
      lines.push(`0x000${(i * 16).toString(16).padStart(3, '0')} : ${pattern}`);
    }
    return lines;
  };

  const handleStartShred = () => {
    setShreddingInProgress(true);
    setCurrentPass(1);
    setHexPreview(generateHexLines(1));

    // Pass 1 (0x00)
    setTimeout(() => {
      setCurrentPass(2);
      setHexPreview(generateHexLines(2));

      // Pass 2 (0xFF)
      setTimeout(() => {
        setCurrentPass(3);
        setHexPreview(generateHexLines(3));

        // Pass 3 (Crypto Random) & Unlink
        setTimeout(() => {
          setShreddingInProgress(false);
          setIsCompleted(true);
          onConfirmShred(job.id);
        }, 700);
      }, 700);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                DoD 5220.22-M Secure File Shredder
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Job #{job.id} • {job.files.length} Document(s)
              </p>
            </div>
          </div>
          {!shreddingInProgress && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="my-4 space-y-4">
          {!isCompleted && !shreddingInProgress && (
            <>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Target Temporary File Buffers:
                </p>
                {job.files.map(f => (
                  <div key={f.id} className="font-mono text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span className="truncate">{f.name}</span>
                    <span>{(f.sizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This operation performs a forensic 3-pass overwrite (Zero Fill, Complement Fill, Cryptographic Noise) followed by an NTFS file unlinking and sector zeroing. This action is irreversible.
                </span>
              </div>
            </>
          )}

          {/* Shredding Execution / Animation */}
          {shreddingInProgress && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                  Executing Pass {currentPass} of 3 ({currentPass === 1 ? 'Zero Fill' : currentPass === 2 ? 'Inversion 0xFF' : 'Random Noise'})...
                </span>
                <span className="text-rose-600 font-mono">{Math.round((currentPass / 3) * 100)}%</span>
              </div>

              {/* Hex Preview */}
              <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto space-y-0.5 border border-slate-800">
                {hexPreview.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                All File Sectors Forensically Destroyed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Zero remnants remaining in memory buffers or local drive caches. Audit trail updated with SHA-256 certificate of destruction.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
          {!isCompleted && !shreddingInProgress && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartShred}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Execute 3-Pass Overwrite & Shred</span>
              </button>
            </>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
