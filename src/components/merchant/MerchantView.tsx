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

  // Navigation & Filter state
  const [activeTab, setActiveTab] = useState<MerchantSubTab>('queue');
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'ACTIVE' | 'PRINTING' | 'READY' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isAutoProcessOn = merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true;

  // Modals state
  const [overrideJob, setOverrideJob] = useState<PrintJob | null>(null);
  const [contactJob, setContactJob] = useState<PrintJob | null>(null);
  const [shredJob, setShredJob] = useState<PrintJob | null>(null);
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    // Search matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = job.id.toLowerCase().includes(q) ||
        job.customer.name.toLowerCase().includes(q) ||
        job.customer.phone.includes(q) ||
        job.collectionPin.includes(q) ||
        job.files.some(f => f.name.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Queue tab matching
    if (queueFilter === 'ACTIVE') return job.status === 'received_local' || job.status === 'spooling';
    if (queueFilter === 'PRINTING') return job.status === 'printing';
    if (queueFilter === 'READY') return job.status === 'ready_for_pickup';
    if (queueFilter === 'COMPLETED') return job.status === 'completed' || job.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'received_local':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">RECEIVED</span>;
      case 'spooling':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 animate-pulse">SPOOLING</span>;
      case 'printing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 animate-bounce">PRINTING</span>;
      case 'ready_for_pickup':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">READY PICKUP</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">COMPLETED</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200">CANCELLED</span>;
      default:
        return null;
    }
  };

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
          
          {/* Filter & Search Bar + Auto-Process Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            
            {/* Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {(['ALL', 'ACTIVE', 'PRINTING', 'READY', 'COMPLETED'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setQueueFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                    queueFilter === f
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Right side: Auto-Process Quick Switch + Search Input */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Inline Queue Auto-Process Switch */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Zap className={`w-3.5 h-3.5 ${isAutoProcessOn ? 'text-emerald-500 fill-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Auto-Process
                  </span>
                </div>

                <button
                  type="button"
                  id="toolbar-queue-auto-process-toggle"
                  onClick={toggleQueueAutoProcess}
                  role="switch"
                  aria-checked={isAutoProcessOn}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isAutoProcessOn ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  title={isAutoProcessOn ? "Queue Auto-Process ON: automatically spools incoming customer documents upon upload & validation" : "Queue Auto-Process OFF: holds customer documents in queue for operator manual approval"}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isAutoProcessOn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                
                <span className={`text-[10px] font-extrabold uppercase ${isAutoProcessOn ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isAutoProcessOn ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search job, name, PIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Job List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <Printer className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No print jobs found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                New customer jobs submitted via the QR portal will stream here instantly via local IPC.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => {
                const assignedPrinter = printers.find(p => p.id === job.assignedPrinterId);

                return (
                  <div
                    key={job.id}
                    id={`job-card-${job.id}`}
                    className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    {/* Top Row: Job ID, Pin, Customer, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                              {job.id}
                            </span>
                            {getStatusBadge(job.status)}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>PIN: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{job.collectionPin}</strong></span>
                            <span>•</span>
                            <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                            <span>•</span>
                            <span>{job.stationId}</span>
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
                        <div className="text-right">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{job.customer.name}</p>
                          <p className="text-slate-500 dark:text-slate-400">{job.customer.phone}</p>
                        </div>

                        <button
                          type="button"
                          id={`contact-customer-${job.id}`}
                          onClick={() => setContactJob(job)}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Contact</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Specs, Files, and Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* Documents */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Documents Attached</p>
                          <button
                            type="button"
                            onClick={() => setPreviewJob(job)}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                        </div>
                        {job.files.map(f => (
                          <div 
                            key={f.id} 
                            onClick={() => setPreviewJob(job)}
                            className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-mono text-[11px] hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer group"
                            title="Click to open PDF.js Print Preview"
                          >
                            <span className="truncate max-w-[180px] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                              <span>{f.name}</span>
                            </span>
                            <span className="font-bold shrink-0">{f.pageCount} pgs</span>
                          </div>
                        ))}
                      </div>

                      {/* Print Settings */}
                      <div className="space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Target Settings</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {job.preferences.colorMode === 'bw' ? 'Black & White' : 'Full Color CMYK'} • {job.preferences.paperSize}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {job.preferences.copies} {job.preferences.copies > 1 ? 'copies' : 'copy'} • {job.preferences.sidedness.startsWith('double') ? 'Duplex' : 'Single'} • {job.preferences.binding.replace(/_/g, ' ')}
                        </p>
                        {job.merchantNotes && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
                            {job.merchantNotes}
                          </p>
                        )}
                      </div>

                      {/* Printer Route & Payment */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Routing & Payment</p>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Printer:</span>
                          <select
                            value={job.assignedPrinterId}
                            onChange={(e) => assignPrinterToJob(job.id, e.target.value)}
                            className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5"
                          >
                            {printers.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500">Paid:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ${job.pricing.total.toFixed(2)} ({job.payment.method.replace(/_/g, ' ')})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Printing Progress Bar if active */}
                    {job.status === 'printing' && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          <span>Printing Spool: {job.pagesPrinted} / {job.totalPagesToPrint} pages</span>
                          <span>{job.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${job.progressPercent}%` }}></div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                      
                      {/* Left: Shred status */}
                      <div className="flex items-center gap-2 text-xs">
                        {job.shredStatus.isShredded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Files Shredded (DoD 3-Pass)</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShredJob(job)}
                            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Force Secure Shred File</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Operator Actions */}
                      <div className="flex items-center gap-2">
                        {/* PDF.js Print Preview */}
                        <button
                          type="button"
                          id={`preview-btn-${job.id}`}
                          onClick={() => setPreviewJob(job)}
                          className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Open PDF.js Secure Client-Side Print Preview"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Print Preview</span>
                        </button>

                        {/* Override Preferences */}
                        <button
                          type="button"
                          id={`override-btn-${job.id}`}
                          onClick={() => setOverrideJob(job)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Modify Settings</span>
                        </button>

                        {/* If received or cancelled, option to Spool & Print */}
                        {(job.status === 'received_local' || job.status === 'cancelled') && (
                          <button
                            type="button"
                            id={`spool-btn-${job.id}`}
                            onClick={() => spoolAndPrintJob(job.id)}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Send to Printer</span>
                          </button>
                        )}

                        {/* If Ready for Pickup, mark Complete */}
                        {job.status === 'ready_for_pickup' && (
                          <button
                            type="button"
                            id={`complete-btn-${job.id}`}
                            onClick={() => updateJobStatus(job.id, 'completed')}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Handed Over</span>
                          </button>
                        )}

                        {/* Cancel button */}
                        {job.status !== 'completed' && job.status !== 'cancelled' && (
                          <button
                            type="button"
                            id={`cancel-btn-${job.id}`}
                            onClick={() => cancelJob(job.id, 'Cancelled by operator')}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-red-600 rounded-lg text-xs"
                            title="Cancel Job"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
