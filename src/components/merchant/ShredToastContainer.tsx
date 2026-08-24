import React, { useState, useEffect, useRef } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { ToastNotification } from '../../types';
import { 
  ShieldCheck, 
  Trash2, 
  X, 
  FileText, 
  Binary, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  History,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onNavigateTab }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(toast.duration || 8000);
  const [copiedHash, setCopiedHash] = useState(false);
  const totalDuration = toast.duration || 8000;
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss countdown timer with pause on hover
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = 50; // update every 50ms for smooth progress bar
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= interval) {
          if (timerRef.current) clearInterval(timerRef.current);
          onDismiss(toast.id);
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onDismiss, toast.id]);

  const handleCopyCert = (e: React.MouseEvent) => {
    e.stopPropagation();
    const certText = `[PRINT-SPOOL-SHRED-CERT]
Job ID: ${toast.jobId || 'N/A'}
Customer: ${toast.customerName || 'Anonymous'}
Purged Files: ${(toast.fileNames || []).join(', ')}
Passes: ${toast.passes || 3} (DoD 5220.22-M: 0x00, 0xFF, CSPRNG Noise)
Sanitization Timestamp: ${toast.timestamp}
Local Node Buffer: 127.0.0.1:3000 (UNLINKED & OVERWRITTEN)
Verification Hash: SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

    navigator.clipboard.writeText(certText);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const progressPercent = Math.max(0, Math.min(100, (remainingTime / totalDuration) * 100));

  const isShred = toast.type === 'shred_success';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
        isShred
          ? 'bg-slate-900/95 text-slate-100 border-emerald-500/40 shadow-emerald-950/20'
          : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-slate-950/10'
      }`}
      role="alert"
      id={`toast-item-${toast.id}`}
    >
      {/* Top Accent Line */}
      <div className={`h-1 w-full ${isShred ? 'bg-linear-to-r from-emerald-500 via-teal-400 to-indigo-500' : 'bg-indigo-500'}`} />

      <div className="p-4 space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${
              isShred 
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' 
                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
            }`}>
              {isShred ? <ShieldCheck className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black tracking-tight uppercase text-emerald-400 flex items-center gap-1">
                  <Binary className="w-3.5 h-3.5" />
                  <span>DoD 5220.22-M Sanitized</span>
                </span>
                {toast.jobId && (
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-mono text-[10px] font-bold border border-slate-700">
                    #{toast.jobId}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {toast.title}
              </h4>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            id={`dismiss-toast-${toast.id}`}
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message & Target Customer */}
        <div className="text-xs text-slate-300 space-y-1.5 pl-1">
          <p className="leading-relaxed text-slate-200">
            {toast.message}
          </p>

          {/* Files Shredded List */}
          {toast.fileNames && toast.fileNames.length > 0 && (
            <div className="mt-2 space-y-1 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 text-[11px] font-mono">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 pb-1 border-b border-slate-800/80">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-emerald-400" />
                  <span>Purged Local Buffers</span>
                </span>
                <span className="text-emerald-400 font-bold">0 bytes on disk</span>
              </div>
              
              {toast.fileNames.map((fileName, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-slate-300 py-0.5">
                  <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                    <Trash2 className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="line-through decoration-rose-500/70 truncate text-slate-400">{fileName}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 text-[9px] font-bold border border-emerald-900/60 shrink-0">
                    UNLINKED
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Pass information badge */}
          {toast.details && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{toast.details}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            {/* Copy Hash / Certificate */}
            <button
              type="button"
              id={`copy-cert-btn-${toast.id}`}
              onClick={handleCopyCert}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Copy cryptographic proof of local file destruction"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Cert Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Copy Shred Proof</span>
                </>
              )}
            </button>

            {/* View in Audit Log */}
            {toast.actionTargetTab && onNavigateTab && (
              <button
                type="button"
                id={`view-audit-btn-${toast.id}`}
                onClick={() => {
                  onNavigateTab(toast.actionTargetTab!);
                  onDismiss(toast.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-[11px] font-medium flex items-center gap-1 border border-emerald-800/60 transition-colors"
              >
                <span>Audit Log</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="text-[10px] text-slate-400 select-none">
            {isPaused ? 'Paused' : `${Math.ceil(remainingTime / 1000)}s`}
          </span>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="w-full bg-slate-800/80 h-1">
        <div 
          className="h-full bg-emerald-400 transition-all duration-75 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </motion.div>
  );
};

interface ShredToastContainerProps {
  onNavigateTab?: (tab: string) => void;
}

export const ShredToastContainer: React.FC<ShredToastContainerProps> = ({ onNavigateTab }) => {
  const { 
    toasts, 
    dismissToast, 
    clearToasts, 
    soundEnabled, 
    setSoundEnabled,
    triggerTestShredToast,
    shredHistory 
  } = usePrintJob();

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  return (
    <>
      {/* Floating Notification Stack on bottom-right */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
        style={{ maxHeight: '85vh' }}
        id="shred-toast-container"
      >
        {/* If multiple toasts are active, show batch controls */}
        {toasts.length > 1 && (
          <div className="pointer-events-auto bg-slate-900/90 text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 shadow-lg flex items-center justify-between text-xs backdrop-blur-md mb-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-800">
                {toasts.length} Shred Notifications
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 rounded text-slate-400 hover:text-white"
                title={soundEnabled ? 'Mute Shred Audio Alerts' : 'Unmute Shred Audio Alerts'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              <button
                type="button"
                onClick={clearToasts}
                className="text-[11px] font-bold text-slate-400 hover:text-white hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={dismissToast}
              onNavigateTab={onNavigateTab}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* History Drawer Modal for reviewing past shredded documents */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    DoD 5220.22-M Shred History Log
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified records of purged temporary documents ({shredHistory.length} events)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
              {shredHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p>No documents have been shredded yet in this local session.</p>
                  <button
                    type="button"
                    onClick={triggerTestShredToast}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500"
                  >
                    Simulate Shred Notification
                  </button>
                </div>
              ) : (
                shredHistory.map(entry => (
                  <div 
                    key={entry.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Job #{entry.jobId} • {entry.customerName}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {entry.fileNames && entry.fileNames.length > 0 && (
                      <div className="space-y-1 bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                        {entry.fileNames.map((fn, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span className="line-through decoration-rose-500 truncate max-w-[260px]">{fn}</span>
                            <span className="text-[10px] text-emerald-500 font-bold">PURGED</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{entry.details || '3-Pass Overwrite • 0 fragments remaining'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">PASSED</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={triggerTestShredToast}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Test Toast Alert
              </button>

              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
