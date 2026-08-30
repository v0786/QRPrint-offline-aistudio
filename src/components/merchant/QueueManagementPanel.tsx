import React, { useState, useMemo } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { PrintJob, JobPriority, JobStatus, LocalPrinter } from '../../types';
import { 
  Pause, 
  Play, 
  ArrowUp, 
  ArrowDown, 
  Zap, 
  Clock, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Settings2, 
  MessageSquare, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  FileText,
  Search,
  Filter,
  Check,
  RefreshCw,
  TrendingUp,
  Flame,
  HelpCircle
} from 'lucide-react';

interface QueueManagementPanelProps {
  onOpenPreview: (job: PrintJob) => void;
  onOpenOverride: (job: PrintJob) => void;
  onOpenContact: (job: PrintJob) => void;
  onOpenShred: (job: PrintJob) => void;
}

type QueueFilterMode = 'ALL_ACTIVE' | 'PRINTING' | 'PAUSED' | 'URGENT' | 'ALL_HISTORY';
type ViewDisplayMode = 'cards' | 'compact';

export const QueueManagementPanel: React.FC<QueueManagementPanelProps> = ({
  onOpenPreview,
  onOpenOverride,
  onOpenContact,
  onOpenShred,
}) => {
  const {
    jobs,
    printers,
    pauseJob,
    resumeJob,
    prioritizeJob,
    reorderQueue,
    pauseAllJobs,
    resumeAllJobs,
    clearCompletedJobs,
    assignPrinterToJob,
    spoolAndPrintJob,
    cancelJob,
    updateJobStatus,
  } = usePrintJob();

  const [filterMode, setFilterMode] = useState<QueueFilterMode>('ALL_ACTIVE');
  const [displayMode, setDisplayMode] = useState<ViewDisplayMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorityMap, setSelectedPriorityMap] = useState<Record<string, JobPriority>>({});

  // Active spool queue (received_local, spooling, printing, paused) vs completed/cancelled
  const activeQueueJobs = useMemo(() => {
    return jobs.filter(j => j.status === 'received_local' || j.status === 'spooling' || j.status === 'printing' || j.status === 'paused');
  }, [jobs]);

  const pausedJobsCount = useMemo(() => {
    return jobs.filter(j => j.status === 'paused').length;
  }, [jobs]);

  const printingJobsCount = useMemo(() => {
    return jobs.filter(j => j.status === 'printing' || j.status === 'spooling').length;
  }, [jobs]);

  const urgentJobsCount = useMemo(() => {
    return jobs.filter(j => (j.priority === 'urgent' || j.priority === 'high') && j.status !== 'completed' && j.status !== 'cancelled').length;
  }, [jobs]);

  const totalActivePages = useMemo(() => {
    return activeQueueJobs.reduce((sum, j) => sum + (j.totalPagesToPrint || 0), 0);
  }, [activeQueueJobs]);

  const estimatedTotalWaitMinutes = useMemo(() => {
    return activeQueueJobs.reduce((sum, j) => sum + (j.estimatedWaitMinutes || 1), 0);
  }, [activeQueueJobs]);

  // Filtered jobs for display
  const displayedJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          job.id.toLowerCase().includes(q) ||
          job.customer.name.toLowerCase().includes(q) ||
          job.customer.phone.includes(q) ||
          job.collectionPin.includes(q) ||
          job.files.some(f => f.name.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Tab filter
      if (filterMode === 'ALL_ACTIVE') {
        return job.status === 'received_local' || job.status === 'spooling' || job.status === 'printing' || job.status === 'paused';
      }
      if (filterMode === 'PRINTING') {
        return job.status === 'printing' || job.status === 'spooling';
      }
      if (filterMode === 'PAUSED') {
        return job.status === 'paused';
      }
      if (filterMode === 'URGENT') {
        return (job.priority === 'urgent' || job.priority === 'high') && job.status !== 'completed' && job.status !== 'cancelled';
      }
      if (filterMode === 'ALL_HISTORY') {
        return true;
      }
      return true;
    });
  }, [jobs, filterMode, searchQuery]);

  const getPriorityBadge = (priority: JobPriority = 'normal') => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-black uppercase tracking-wider animate-pulse">
            <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
            <span>Urgent Rush</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
            <span>High Priority</span>
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-medium">
            <span>Low / Background</span>
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium">
            <span>Normal</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs">
            <Pause className="w-3 h-3 fill-current text-amber-600" />
            <span>PAUSED</span>
          </span>
        );
      case 'printing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span>PRINTING</span>
          </span>
        );
      case 'spooling':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800">
            <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
            <span>SPOOLING</span>
          </span>
        );
      case 'received_local':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
            <span>WAITING IN QUEUE</span>
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
            <Check className="w-3 h-3" />
            <span>READY PICKUP</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
            CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5 space-y-5">
      
      {/* Header & Metrics Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Interactive Spool Queue Manager
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
                  REAL-TIME CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pause print streams, rush urgent orders, reorder spool buffer, or route between local hardware
              </p>
            </div>
          </div>
        </div>

        {/* Global Batch Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {pausedJobsCount > 0 ? (
            <button
              type="button"
              id="batch-resume-all-btn"
              onClick={resumeAllJobs}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume All ({pausedJobsCount})</span>
            </button>
          ) : (
            <button
              type="button"
              id="batch-pause-all-btn"
              onClick={pauseAllJobs}
              disabled={printingJobsCount === 0 && activeQueueJobs.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                printingJobsCount > 0 || activeQueueJobs.length > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Active Spoolers</span>
            </button>
          )}

          <button
            type="button"
            id="batch-clean-completed-btn"
            onClick={clearCompletedJobs}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Remove completed and cancelled items from queue buffer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Purge Finished</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Active Spools */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Spools</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {activeQueueJobs.length}
              </span>
              <span className="text-[10px] text-slate-500">
                ({printingJobsCount} printing)
              </span>
            </div>
          </div>
        </div>

        {/* Paused Streams */}
        <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
          pausedJobsCount > 0 
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80' 
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
        }`}>
          <div className={`p-2.5 rounded-lg shrink-0 ${
            pausedJobsCount > 0 
              ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200' 
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
          }`}>
            <Pause className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paused Streams</span>
            <span className={`text-lg font-black font-mono ${pausedJobsCount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>
              {pausedJobsCount}
            </span>
          </div>
        </div>

        {/* Urgent Rush Orders */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rush / High Pri</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {urgentJobsCount}
            </span>
          </div>
        </div>

        {/* Queue Wait Time */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Workload</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {totalActivePages}
              </span>
              <span className="text-[10px] text-slate-500">pgs (~{estimatedTotalWaitMinutes}m)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterMode('ALL_ACTIVE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filterMode === 'ALL_ACTIVE'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>Active Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800">
              {activeQueueJobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('PRINTING')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filterMode === 'PRINTING'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>Spooling</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-700 text-indigo-100">
              {printingJobsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('PAUSED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filterMode === 'PAUSED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>Paused</span>
            {pausedJobsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-800 text-amber-100 animate-pulse">
                {pausedJobsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('URGENT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filterMode === 'URGENT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>Rush Priority</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-700 text-rose-100">
              {urgentJobsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('ALL_HISTORY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
              filterMode === 'ALL_HISTORY'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Records ({jobs.length})</span>
          </button>
        </div>

        {/* Search input and View Mode Switch */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setDisplayMode('cards')}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                displayMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Card View"
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('compact')}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                displayMode === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Compact Table"
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Queue Items Rendering */}
      {displayedJobs.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 space-y-2">
          <Printer className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No print jobs match filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {filterMode === 'PAUSED'
              ? 'No jobs are currently paused in the spool queue.'
              : filterMode === 'URGENT'
              ? 'No urgent or high priority rush jobs currently queued.'
              : 'Waiting for new customer print jobs to arrive from mobile QR scans.'}
          </p>
        </div>
      ) : displayMode === 'compact' ? (
        /* Compact Table Mode */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 w-16">Pos / Order</th>
                <th className="py-2.5 px-3">Job ID & Customer</th>
                <th className="py-2.5 px-3">Document</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Printer Route</th>
                <th className="py-2.5 px-3 text-right">Quick Spool Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
              {displayedJobs.map((job, idx) => {
                const isPaused = job.status === 'paused';
                const isPrinting = job.status === 'printing' || job.status === 'spooling';
                const canReorder = job.status !== 'completed' && job.status !== 'cancelled';

                return (
                  <tr 
                    key={job.id} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${
                      isPaused ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    {/* Position Reordering */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-slate-400 text-xs w-6">
                          #{idx + 1}
                        </span>
                        {canReorder && (
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => reorderQueue(job.id, 'up')}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-indigo-600 disabled:opacity-20 p-0.5"
                              title="Move Up in Queue"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => reorderQueue(job.id, 'down')}
                              disabled={idx === displayedJobs.length - 1}
                              className="text-slate-400 hover:text-indigo-600 disabled:opacity-20 p-0.5"
                              title="Move Down in Queue"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Job ID & Customer */}
                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-mono font-black text-slate-900 dark:text-white">
                          {job.id}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[140px]">
                          {job.customer.name} • PIN: {job.collectionPin}
                        </p>
                      </div>
                    </td>

                    {/* Document & Specs */}
                    <td className="py-2.5 px-3">
                      <div className="truncate max-w-[180px]">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {job.files[0]?.name || 'Document'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {job.totalPagesToPrint} pgs • {job.preferences.colorMode === 'bw' ? 'B&W' : 'Color'} • {job.preferences.paperSize}
                        </p>
                      </div>
                    </td>

                    {/* Priority Selector */}
                    <td className="py-2.5 px-3">
                      <select
                        value={job.priority || 'normal'}
                        onChange={(e) => prioritizeJob(job.id, e.target.value as JobPriority)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors ${
                          job.priority === 'urgent'
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-black'
                            : job.priority === 'high'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <option value="urgent">⚡ Urgent Rush</option>
                        <option value="high">🔥 High</option>
                        <option value="normal">Standard Normal</option>
                        <option value="low">Low Background</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      {getStatusBadge(job.status)}
                    </td>

                    {/* Printer Routing */}
                    <td className="py-2.5 px-3">
                      <select
                        value={job.assignedPrinterId}
                        onChange={(e) => assignPrinterToJob(job.id, e.target.value)}
                        className="text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300 max-w-[130px] truncate"
                      >
                        {printers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Pause / Resume Button */}
                        {isPaused ? (
                          <button
                            type="button"
                            onClick={() => resumeJob(job.id)}
                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs"
                            title="Resume Spooler"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Resume</span>
                          </button>
                        ) : isPrinting || job.status === 'received_local' ? (
                          <button
                            type="button"
                            onClick={() => pauseJob(job.id, 'Operator held print stream')}
                            className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1 shadow-xs"
                            title="Pause Spooler"
                          >
                            <Pause className="w-3 h-3 fill-current" />
                            <span>Pause</span>
                          </button>
                        ) : null}

                        {/* Rush to Top */}
                        {canReorder && idx > 0 && (
                          <button
                            type="button"
                            onClick={() => prioritizeJob(job.id, 'urgent', true)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Rush to Top of Queue"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Preview */}
                        <button
                          type="button"
                          onClick={() => onOpenPreview(job)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Settings Override */}
                        <button
                          type="button"
                          onClick={() => onOpenOverride(job)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Modify Settings"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Detailed Card Mode */
        <div className="space-y-3.5">
          {displayedJobs.map((job, idx) => {
            const isPaused = job.status === 'paused';
            const isPrinting = job.status === 'printing' || job.status === 'spooling';
            const canReorder = job.status !== 'completed' && job.status !== 'cancelled';
            const isUrgent = job.priority === 'urgent';
            const isHigh = job.priority === 'high';

            return (
              <div
                key={job.id}
                id={`queue-card-${job.id}`}
                className={`rounded-xl border p-4 transition-all space-y-3 ${
                  isPaused
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-xs'
                    : isUrgent
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80 shadow-xs'
                    : isPrinting
                    ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Top Row: Position, Priority, ID, Status, and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  
                  {/* Left: Position Number, Job ID, Status */}
                  <div className="flex items-center gap-2.5">
                    {/* Position Reorder Control */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                      <span className="font-mono font-black text-slate-700 dark:text-slate-300 text-xs">
                        #{idx + 1}
                      </span>
                      {canReorder && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            type="button"
                            onClick={() => reorderQueue(job.id, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-20"
                            title="Move Up in Spool Queue"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => reorderQueue(job.id, 'down')}
                            disabled={idx === displayedJobs.length - 1}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-20"
                            title="Move Down in Spool Queue"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                          {job.id}
                        </span>
                        {getStatusBadge(job.status)}
                        {getPriorityBadge(job.priority)}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Customer: <strong className="text-slate-700 dark:text-slate-300">{job.customer.name}</strong></span>
                        <span>•</span>
                        <span>PIN: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{job.collectionPin}</strong></span>
                        <span>•</span>
                        <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Pause / Resume Button */}
                    {isPaused ? (
                      <button
                        type="button"
                        id={`resume-job-btn-${job.id}`}
                        onClick={() => resumeJob(job.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Spool</span>
                      </button>
                    ) : isPrinting || job.status === 'received_local' ? (
                      <button
                        type="button"
                        id={`pause-job-btn-${job.id}`}
                        onClick={() => pauseJob(job.id, 'Operator held print stream')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause Spool</span>
                      </button>
                    ) : null}

                    {/* Rush to Top */}
                    {canReorder && idx > 0 && (
                      <button
                        type="button"
                        id={`rush-job-btn-${job.id}`}
                        onClick={() => prioritizeJob(job.id, 'urgent', true)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Move to #1 position in Spool Queue"
                      >
                        <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                        <span>Rush to Top</span>
                      </button>
                    )}

                    {/* Priority Dropdown */}
                    <div className="flex items-center gap-1 text-xs">
                      <select
                        id={`priority-select-${job.id}`}
                        value={job.priority || 'normal'}
                        onChange={(e) => prioritizeJob(job.id, e.target.value as JobPriority)}
                        className="text-xs font-bold rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                      >
                        <option value="urgent">⚡ Urgent Rush</option>
                        <option value="high">🔥 High Priority</option>
                        <option value="normal">Standard Priority</option>
                        <option value="low">Low Background</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (if Printing or Paused) */}
                {(isPrinting || isPaused) && (
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={isPaused ? 'text-amber-700 dark:text-amber-300 flex items-center gap-1.5' : 'text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5'}>
                        {isPaused ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Spool Stream Suspended ({job.pagesPrinted} / {job.totalPagesToPrint} pages printed)</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Spooling Hardware Stream: {job.pagesPrinted} / {job.totalPagesToPrint} pages</span>
                          </>
                        )}
                      </span>
                      <span className="font-mono">{job.progressPercent}%</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPaused
                            ? 'bg-amber-500 bg-[linear-gradient(45deg,rgba(255,255,255,.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.25)_50%,rgba(255,255,255,.25)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${job.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Middle Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  
                  {/* Documents Attached */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Documents</span>
                      <button
                        type="button"
                        onClick={() => onOpenPreview(job)}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    </div>
                    {job.files.map(f => (
                      <div key={f.id} className="flex items-center justify-between font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[170px]">{f.name}</span>
                        <span className="font-bold text-slate-500">{f.pageCount} pgs</span>
                      </div>
                    ))}
                  </div>

                  {/* Print Parameters */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Print Job Specs</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {job.preferences.colorMode === 'bw' ? 'Monochrome B&W' : 'Full Color CMYK'} • {job.preferences.paperSize}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {job.preferences.copies} {job.preferences.copies > 1 ? 'copies' : 'copy'} • {job.preferences.sidedness.startsWith('double') ? 'Duplex' : 'Single-sided'}
                    </p>
                  </div>

                  {/* Hardware Routing & Payment */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Target Spooler</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        ${job.pricing.total.toFixed(2)} Paid
                      </span>
                    </div>
                    <select
                      value={job.assignedPrinterId}
                      onChange={(e) => assignPrinterToJob(job.id, e.target.value)}
                      className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100"
                    >
                      {printers.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Controls: Settings, Preview, Shred, Mark Complete */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-700/80">
                  
                  {/* Left: Notes or Shred status */}
                  <div className="flex items-center gap-2">
                    {job.shredStatus.isShredded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>DoD 5220.22-M Buffer Sanitized</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenShred(job)}
                        className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-medium hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Force Secure Shred</span>
                      </button>
                    )}

                    {job.merchantNotes && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate max-w-[200px]">
                        • {job.merchantNotes}
                      </span>
                    )}
                  </div>

                  {/* Right: Operator Modals */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenContact(job)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Contact</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPreview(job)}
                      className="px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenOverride(job)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Overrides</span>
                    </button>

                    {/* Send to printer if in received_local */}
                    {job.status === 'received_local' && (
                      <button
                        type="button"
                        onClick={() => spoolAndPrintJob(job.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Send to Printer</span>
                      </button>
                    )}

                    {/* Ready for Pickup -> Handover */}
                    {job.status === 'ready_for_pickup' && (
                      <button
                        type="button"
                        onClick={() => updateJobStatus(job.id, 'completed')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Handed Over</span>
                      </button>
                    )}

                    {/* Cancel */}
                    {job.status !== 'completed' && job.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => cancelJob(job.id, 'Cancelled by operator in queue panel')}
                        className="text-slate-400 hover:text-rose-600 px-2 py-1 text-xs"
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

      {/* Footer Info Tips */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300">Spool Queue Pro-Tips: </span>
          Use the <strong className="text-rose-600 dark:text-rose-400">⚡ Rush to Top</strong> button to promote counter pickups directly to position #1. Pausing a print job holds its RAW raster buffer in RAM without losing position or requiring the customer to re-upload.
        </div>
      </div>

    </div>
  );
};
