import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Lock, Server, Layers, CheckCircle2, ArrowRight, Zap, Database, Terminal } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      
      {/* Top Architecture Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              System Architecture & Zero-Cloud Blueprint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end topological layout of customer web upload, local socket relay, SQLite storage, and hardware spooling
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The <strong>PrintSpool Local</strong> system is engineered specifically for privacy-sensitive print shops, universities, copy centers, and commercial hubs. Unlike legacy SaaS print platforms that mirror confidential customer documents onto multitenant cloud object stores (S3/GCS), PrintSpool Local executes a <strong>Zero-Cloud Persistence Architecture</strong>.
        </p>

        {/* Visual Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Customer Mobile Portal</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Static client hosted on GitHub Pages (<code className="text-indigo-500">*.github.io</code>). Scans in-store QR code, configures preferences, and handles payment gateway tokens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Direct Localhost Socket</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Document bytes stream directly via TLS socket to the physical store PC IP (<code className="text-indigo-500">:3000</code>). No cloud servers store or inspect document bodies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Win32 Print Spooler</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Local Windows daemon communicates with native <code className="text-indigo-500">winspool.drv</code> and GDI/PostScript drivers to route jobs to USB/Network printers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">DoD 5220.22-M Shredder</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Upon printer hardware confirmation of last page ejection, temporary file sectors are overwritten in 3 cryptographic passes and unlinked permanently.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix: Local-Only vs Cloud SaaS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Local-Only Deployment vs. Cloud-Based SaaS Architecture</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Architectural Parameter</th>
                <th className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-bold">PrintSpool Local (This System)</th>
                <th className="py-3 px-3 text-slate-500">Traditional Cloud SaaS Print Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Document Storage Location</td>
                <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                  Host PC RAM/Temp NTFS only (0% Cloud)
                </td>
                <td className="py-3 px-3 text-slate-500">
                  Multi-tenant AWS S3 / Google Cloud Storage
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Customer Data Privacy</td>
                <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                  Strict zero-knowledge; destroyed after print
                </td>
                <td className="py-3 px-3 text-slate-500">
                  Subject to cloud subpoenas, data breaches, AI scraping
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Network Latency</td>
                <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                  Sub-50ms Gigabit LAN spooling speed
                </td>
                <td className="py-3 px-3 text-slate-500">
                  Dependent on WAN cloud upload + download roundtrips
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Recurring Infrastructure Cost</td>
                <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                  $0.00/month (Free open self-hosted execution)
                </td>
                <td className="py-3 px-3 text-slate-500">
                  $49 - $299/month per printer subscription fees
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Offline Resilience</td>
                <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                  Functions 100% on local Wi-Fi even during WAN outages
                </td>
                <td className="py-3 px-3 text-slate-500">
                  Completely broken if internet provider goes down
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Deletion Protocol Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shredding Standard */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            <Lock className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              DoD 5220.22-M Sanitization Standard
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Standard OS file deletions only remove pointer entries in the Master File Table (MFT), leaving raw document bytes on magnetic/solid-state sectors recoverable via forensic software.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs space-y-1.5 font-mono text-[11px]">
            <p className="text-slate-700 dark:text-slate-300"><strong className="text-indigo-600">Pass 1:</strong> Overwrite entire byte range with fixed <code>0x00</code> (Zero Fill)</p>
            <p className="text-slate-700 dark:text-slate-300"><strong className="text-indigo-600">Pass 2:</strong> Overwrite entire byte range with complement <code>0xFF</code> (One Fill)</p>
            <p className="text-slate-700 dark:text-slate-300"><strong className="text-indigo-600">Pass 3:</strong> Overwrite with CSPRNG pseudo-random cryptographic noise</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold">Pass 4: Flush OS write buffer & unlink NTFS cluster</p>
          </div>
        </div>

        {/* Encryption at Rest & in Flight */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Encryption at Rest & In-Flight
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All document streams transmitted between customer mobile devices and the host machine PC are secured with TLS 1.3 encryption.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4">
            <li><strong>RAM-Buffering Spooler:</strong> Files below 32MB are spooled entirely in RAM memory buffers without hitting disk.</li>
            <li><strong>AES-GCM-256:</strong> Temporary spill-over files larger than 32MB are encrypted with ephemeral session keys generated per job.</li>
            <li><strong>Isolated Localhost IPC:</strong> Merchant management endpoints only bind to loopback address <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">127.0.0.1</code> or authorized local subnet.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
