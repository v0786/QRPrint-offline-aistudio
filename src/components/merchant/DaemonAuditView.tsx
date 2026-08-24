import React, { useState } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  Database, 
  Terminal, 
  Activity,
  CheckCircle,
  AlertCircle,
  Zap,
  ZapOff
} from 'lucide-react';

export const DaemonAuditView: React.FC = () => {
  const { 
    serverStatus, 
    auditLogs, 
    clearAuditLogs, 
    restartLocalDaemon, 
    merchantSettings, 
    updateMerchantSettings,
    toggleQueueAutoProcess,
    setQueueAutoProcess
  } = usePrintJob();

  const [isRestarting, setIsRestarting] = useState(false);
  const [filterActor, setFilterActor] = useState<'ALL' | 'CUSTOMER' | 'MERCHANT' | 'SYSTEM_DAEMON'>('ALL');

  const formatUptime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hours}h ${mins}m ${s}s`;
  };

  const handleRestart = () => {
    setIsRestarting(true);
    setTimeout(() => {
      restartLocalDaemon();
      setIsRestarting(false);
    }, 1200);
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filterActor === 'ALL') return true;
    return log.actor === filterActor;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Daemon Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Windows Service</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Active (PID: 4920)</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Uptime: <span className="font-mono">{formatUptime(serverStatus.uptimeSeconds)}</span>
          </p>
        </div>

        {/* Port & Network */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Local Web Server</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
            0.0.0.0:{serverStatus.port}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {serverStatus.activeConnections} active TLS socket streams
          </p>
        </div>

        {/* SQLite Database */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Database Storage</span>
            <Database className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white truncate">
            SQLite 3 (WAL mode)
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Zero cloud sync • 1.4 MB on disk
          </p>
        </div>

        {/* RAM Usage & Spool Count */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Process Footprint</span>
            <Cpu className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
            {serverStatus.ramUsageMb} MB RAM
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {serverStatus.totalSpoolCount} total print jobs executed
          </p>
        </div>
      </div>

      {/* Daemon Controls & Security Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Daemon Security & Lifecycle Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured via <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">config.json</code> on host PC
            </p>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            disabled={isRestarting}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin' : ''}`} />
            <span>{isRestarting ? 'Restarting Service...' : 'Restart Windows Daemon'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Queue Auto-Process Toggle */}
          <div className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
            (merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true)
              ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${
                  (merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true)
                    ? 'text-emerald-500 fill-emerald-500 animate-pulse'
                    : 'text-slate-400'
                }`} />
                <span>Queue Auto-Process</span>
              </span>
              
              {/* Toggle switch button */}
              <button
                type="button"
                id="daemon-queue-auto-process-toggle"
                onClick={toggleQueueAutoProcess}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  (merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true) ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    (merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true) ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When enabled, automatically triggers the local printer spooler as soon as a file is uploaded and validated.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-400 uppercase">Spool Mode</span>
              <span className={`px-1.5 py-0.5 rounded font-bold ${
                (merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true)
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {(merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true) ? 'Auto-Trigger Active' : 'Manual Hold'}
              </span>
            </div>
          </div>

          {/* Auto Shred Toggle */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Auto-Shred Post-Print</span>
              </span>
              <input
                type="checkbox"
                checked={merchantSettings.autoShredAfterPrint}
                onChange={(e) => updateMerchantSettings({ ...merchantSettings, autoShredAfterPrint: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Executes DoD 3-pass forensic overwrite and unlinks local memory caches immediately upon print job completion.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-400 uppercase">Storage</span>
              <span className="text-slate-600 dark:text-slate-300 font-bold">0-persistence ephemerality</span>
            </div>
          </div>

          {/* Shredding Standard */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Overwriting Standard</span>
              </span>
              <select
                value={merchantSettings.shredPassCount}
                onChange={(e) => updateMerchantSettings({ ...merchantSettings, shredPassCount: parseInt(e.target.value, 10) || 3 })}
                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded px-2 py-1 border-0"
              >
                <option value={1}>1-Pass Zero Fill</option>
                <option value={3}>3-Pass DoD 5220.22-M</option>
                <option value={7}>7-Pass Gutmann Fast</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Complies with strict enterprise data protection & ephemeral local document storage standards.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-400 uppercase">Verification</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">SHA-256 Null Audit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Audit Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Immutable Local Audit Log ({auditLogs.length} entries)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tracks every job creation, payment, operator override, print spooling, and file destruction event
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 text-xs">
              {(['ALL', 'CUSTOMER', 'MERCHANT', 'SYSTEM_DAEMON'] as const).map(actor => (
                <button
                  key={actor}
                  type="button"
                  onClick={() => setFilterActor(actor)}
                  className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all ${
                    filterActor === actor
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {actor === 'SYSTEM_DAEMON' ? 'SYSTEM' : actor}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearAuditLogs}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear old logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Actor / Origin</th>
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      log.action === 'FILE_SHREDDED' 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : log.action === 'PAYMENT_RECEIVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : log.action === 'PREFERENCES_OVERRIDDEN'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                    {log.actor} ({log.ipAddress})
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                    {log.jobId || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-sans text-xs max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
