/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PrintJobProvider } from './context/PrintJobContext';
import { Header, ActiveAppMode } from './components/common/Header';
import { CustomerView } from './components/customer/CustomerView';
import { MerchantView } from './components/merchant/MerchantView';
import { ArchitectureDocs } from './components/docs/ArchitectureDocs';
import { DatabaseSchemaView } from './components/docs/DatabaseSchemaView';
import { ApiSpecView } from './components/docs/ApiSpecView';
import { InstallerScriptView } from './components/docs/InstallerScriptView';
import { Smartphone, Wifi, Battery, Volume2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState<ActiveAppMode>('customer_mobile');
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  return (
    <PrintJobProvider>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
        
        {/* Global Navigation Header */}
        <Header
          activeMode={activeMode}
          onModeChange={setActiveMode}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(prev => !prev)}
        />

        {/* Main View Area */}
        <main className="flex-1 pb-16">
          
          {/* 1. Customer Mobile View */}
          {activeMode === 'customer_mobile' && (
            <div className="w-full">
              {isMobileFrame ? (
                /* Simulated Mobile Device Frame */
                <div className="py-8 px-4 flex justify-center items-center">
                  <div className="w-[390px] min-h-[780px] bg-white dark:bg-slate-900 rounded-[48px] border-[10px] border-slate-900 shadow-2xl overflow-hidden relative flex flex-col ring-1 ring-slate-800/10">
                    
                    {/* Phone Notch / Dynamic Island & Status Bar */}
                    <div className="h-10 bg-slate-900 text-white flex items-center justify-between px-6 text-[11px] font-semibold shrink-0 select-none z-30">
                      <span>9:41</span>
                      <div className="w-20 h-4 bg-black rounded-full mx-auto"></div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Scrollable Mobile Screen */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                      <CustomerView />
                    </div>

                    {/* Home Bar */}
                    <div className="h-5 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 z-30">
                      <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Full-width Responsive Customer View */
                <CustomerView />
              )}
            </div>
          )}

          {/* 2. Merchant Localhost Console */}
          {activeMode === 'merchant_dashboard' && <MerchantView />}

          {/* 3. System Architecture & Zero-Cloud Blueprint */}
          {activeMode === 'architecture_docs' && <ArchitectureDocs />}

          {/* 4. SQLite Database Schema DDL */}
          {activeMode === 'database_schema' && <DatabaseSchemaView />}

          {/* 5. REST API Spec */}
          {activeMode === 'api_spec' && <ApiSpecView />}

          {/* 6. Windows PowerShell / Batch Installer */}
          {activeMode === 'installer_scripts' && <InstallerScriptView />}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>PrintSpool Local v3.4.1</strong> — Localhost Windows Spooler & SQLite Architecture (Zero-Cloud Persistence)
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Port: <code>3000</code></span>
              <span>•</span>
              <span>Sanitization: <code>DoD 5220.22-M</code></span>
              <span>•</span>
              <span>Engine: <code>SQLite WAL</code></span>
            </div>
          </div>
        </footer>
      </div>
    </PrintJobProvider>
  );
}
