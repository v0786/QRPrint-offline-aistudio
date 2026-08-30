import React, { useState } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { PrintJob, JobStatus } from '../../types';
import { PrintersView } from './PrintersView';
import { PricingRulesView } from './PricingRulesView';
import { StoreQrGeneratorView } from './StoreQrGeneratorView';
import { DaemonAuditView } from './DaemonAuditView';
import { JobOverrideModal } from './JobOverrideModal';
import { CustomerContactModal } from './CustomerContactModal';
import { SecureShredModal } from './SecureShredModal';
import { PdfPreviewModal } from './PdfPreviewModal';
import { ShredToastContainer } from './ShredToastContainer';
import { 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Settings2, 
  MessageSquare, 
  Play, 
  Layers, 
  Sliders, 
  DollarSign, 
  QrCode, 
  Terminal, 
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Copy,
  ChevronRight,
  Eye,
  Scan,
  Binary,
  Volume2,
  VolumeX,
  Bell,
  Zap,
  ZapOff,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { PrintVolumeWidget } from './PrintVolumeWidget';
import { QueueManagementPanel } from './QueueManagementPanel';

type MerchantSubTab = 'queue' | 'volume_analytics' | 'printers' | 'pricing' | 'qr_signage' | 'daemon_audit';

export const MerchantView: React.FC = () => {
  const { 
    jobs, 
    printers, 
    spoolAndPrintJob, 
    updateJobStatus, 
    updateJobPreferences, 
    assignPrinterToJob, 
    cancelJob, 
    forceShredJobFiles, 
    sendCustomerAlert, 
    serverStatus, 
    merchantSettings,
    shredHistory,
    soundEnabled,
    setSoundEnabled,
    triggerTestShredToast,
    toggleQueueAutoProcess,
    setQueueAutoProcess
  } = usePrintJob();

  // Navigation state
  const [activeTab, setActiveTab] = useState<MerchantSubTab>('queue');

  const isAutoProcessOn = merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true;

  // Modals state
  const [overrideJob, setOverrideJob] = useState<PrintJob | null>(null);
  const [contactJob, setContactJob] = useState<PrintJob | null>(null);
  const [shredJob, setShredJob] = useState<PrintJob | null>(null);
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6">
      
      {/* Top Localhost Server Header Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Host PC Local Daemon Running</span>
            </div>
            <span className="text-xs font-mono text-slate-400">http://localhost:3000</span>
          </div>

          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <span>{merchantSettings.storeName} — Local Console</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct Windows Spooler controller & offline SQLite database management
          </p>
        </div>

        {/* Quick stats chips & Shredder Alert indicator */}
        <div className="flex items-center gap-2.5 self-start md:self-auto overflow-x-auto text-xs flex-wrap sm:flex-nowrap">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[72px]">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Pending</p>
            <p className="text-base font-black text-blue-600 dark:text-blue-400">
              {jobs.filter(j => j.status === 'received_local' || j.status === 'spooling').length}
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[72px]">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Printing</p>
            <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
              {jobs.filter(j => j.status === 'printing').length}
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[72px]">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Ready</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {jobs.filter(j => j.status === 'ready_for_pickup').length}
            </p>
          </div>

          {/* Quick Print Volume Telemetry Trigger */}
          <button
            type="button"
            id="top-volume-analytics-shortcut-btn"
            onClick={() => setActiveTab('volume_analytics')}
            className={`p-2.5 rounded-xl border flex flex-col justify-between gap-0.5 min-w-[130px] transition-all text-left cursor-pointer ${
              activeTab === 'volume_analytics'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-400'
            }`}
            title="Click to view full Print Volume charts and ink/paper analytics"
          >
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                activeTab === 'volume_analytics' ? 'text-indigo-100' : 'text-indigo-700 dark:text-indigo-300'
              }`}>
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Volume</span>
              </span>
              <span className={`text-[9px] font-bold ${activeTab === 'volume_analytics' ? 'text-emerald-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                +14% wk
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className={`text-base font-black ${
                activeTab === 'volume_analytics' ? 'text-white' : 'text-indigo-900 dark:text-indigo-100'
              }`}>
                {jobs.reduce((acc, j) => acc + (j.totalPagesToPrint || j.pricing?.totalPages || 1), 0) + 247} <span className="text-[10px] font-medium opacity-80">pgs</span>
              </span>
              <span className={`text-[10px] font-bold ${
                activeTab === 'volume_analytics' ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                Charts &rarr;
              </span>
            </div>
          </button>

          {/* Queue Auto-Process Live Control Card */}
          <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 min-w-[155px] transition-colors ${
            isAutoProcessOn 
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80' 
              : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80'
          }`}>
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                isAutoProcessOn ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
              }`}>
                {isAutoProcessOn ? (
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500 animate-pulse" />
                ) : (
                  <ZapOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                )}
                <span>Auto-Process</span>
              </span>
              
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                isAutoProcessOn 
                  ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                  : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
              }`}>
                {isAutoProcessOn ? 'Auto' : 'Hold'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <span className={`text-[11px] font-bold ${
                isAutoProcessOn ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'
              }`}>
                {isAutoProcessOn ? 'Instant Spool' : 'Manual Hold'}
              </span>
              <button
                type="button"
                id="top-queue-auto-process-toggle-btn"
                onClick={toggleQueueAutoProcess}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors shadow-xs ${
                  isAutoProcessOn 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
                title={isAutoProcessOn ? "Queue Auto-Process is ENABLED: incoming files are spooled automatically upon upload. Click to pause." : "Queue Auto-Process is DISABLED: incoming files are held for manual operator approval. Click to enable."}
              >
                {isAutoProcessOn ? 'Turn OFF' : 'Turn ON'}
              </button>
            </div>
          </div>

          {/* Secure DoD Shredder & Toast trigger widget */}
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between gap-1 min-w-[130px]">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>DoD Shredder</span>
              </span>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white p-0.5"
                title={soundEnabled ? "Mute Shred Chime Audio" : "Unmute Shred Chime Audio"}
              >
                {soundEnabled ? <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                {shredHistory.length} Shredded
              </span>
              <button
                type="button"
                id="test-shred-toast-btn"
                onClick={triggerTestShredToast}
                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                title="Trigger a test DoD file shredding toast alert"
              >
                Test Toast
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1 overflow-x-auto">
        <button
          type="button"
          id="tab-queue"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'queue'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Live Print Spool Queue</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
            {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length}
          </span>
        </button>

        <button
          type="button"
          id="tab-volume-analytics"
          onClick={() => setActiveTab('volume_analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'volume_analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Print Volume & Analytics</span>
        </button>

        <button
          type="button"
          id="tab-printers"
          onClick={() => setActiveTab('printers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'printers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Printers & Trays ({printers.length})</span>
        </button>

        <button
          type="button"
          id="tab-pricing"
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'pricing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Pricing Rules</span>
        </button>

        <button
          type="button"
          id="tab-qr"
          onClick={() => setActiveTab('qr_signage')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'qr_signage'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Station QR Standee</span>
        </button>

        <button
          type="button"
          id="tab-daemon"
          onClick={() => setActiveTab('daemon_audit')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'daemon_audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Windows Service & Audit Logs</span>
        </button>
      </div>

      {/* TAB CONTENT: Live Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Print Volume & Resource Summary Widget */}
          <PrintVolumeWidget onNavigateTab={(tab) => setActiveTab(tab as MerchantSubTab)} />

          {/* Interactive Spool Queue Manager */}
          <QueueManagementPanel
            onOpenPreview={(job) => setPreviewJob(job)}
            onOpenOverride={(job) => setOverrideJob(job)}
            onOpenContact={(job) => setContactJob(job)}
            onOpenShred={(job) => setShredJob(job)}
          />
        </div>
      )}

      {/* TAB CONTENT: Volume & Analytics */}
      {activeTab === 'volume_analytics' && (
        <div className="space-y-4">
          <PrintVolumeWidget onNavigateTab={(tab) => setActiveTab(tab as MerchantSubTab)} />
        </div>
      )}

      {/* TAB CONTENT: Printers */}
      {activeTab === 'printers' && <PrintersView />}

      {/* TAB CONTENT: Pricing Rules */}
      {activeTab === 'pricing' && <PricingRulesView />}

      {/* TAB CONTENT: Store QR Standee */}
      {activeTab === 'qr_signage' && <StoreQrGeneratorView />}

      {/* TAB CONTENT: Windows Daemon & Audit */}
      {activeTab === 'daemon_audit' && <DaemonAuditView />}

      {/* Modals */}
      <JobOverrideModal
        job={overrideJob}
        isOpen={!!overrideJob}
        onClose={() => setOverrideJob(null)}
        onSave={updateJobPreferences}
      />

      <CustomerContactModal
        job={contactJob}
        isOpen={!!contactJob}
        onClose={() => setContactJob(null)}
        onSendMessage={sendCustomerAlert}
      />

      <SecureShredModal
        job={shredJob}
        isOpen={!!shredJob}
        onClose={() => setShredJob(null)}
        onConfirmShred={forceShredJobFiles}
      />

      <PdfPreviewModal
        job={previewJob}
        isOpen={!!previewJob}
        onClose={() => setPreviewJob(null)}
        onSendToPrinter={spoolAndPrintJob}
      />

      {/* Visual Toast Notification System */}
      <ShredToastContainer onNavigateTab={(tab) => setActiveTab(tab as MerchantSubTab)} />
    </div>
  );
};
