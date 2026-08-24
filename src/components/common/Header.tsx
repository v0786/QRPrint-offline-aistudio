import React from 'react';
import { 
  Printer, 
  Smartphone, 
  Monitor, 
  Layers, 
  Database, 
  Terminal, 
  Code2, 
  FileCode,
  ShieldCheck
} from 'lucide-react';

export type ActiveAppMode = 
  | 'customer_mobile' 
  | 'merchant_dashboard' 
  | 'architecture_docs' 
  | 'database_schema' 
  | 'api_spec' 
  | 'installer_scripts';

interface HeaderProps {
  activeMode: ActiveAppMode;
  onModeChange: (mode: ActiveAppMode) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onModeChange,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                  PrintSpool Local
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  Zero-Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Windows Host PC Spooler & GitHub Web Portal
              </p>
            </div>
          </div>

          {/* Mode Switcher Nav */}
          <nav className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs overflow-x-auto max-w-full">
            
            {/* Customer Portal */}
            <button
              type="button"
              id="nav-customer-portal"
              onClick={() => onModeChange('customer_mobile')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeMode === 'customer_mobile'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Customer QR Web</span>
            </button>

            {/* Merchant Dashboard */}
            <button
              type="button"
              id="nav-merchant-console"
              onClick={() => onModeChange('merchant_dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeMode === 'merchant_dashboard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Merchant Localhost</span>
            </button>

            {/* Architecture Docs */}
            <button
              type="button"
              id="nav-architecture"
              onClick={() => onModeChange('architecture_docs')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeMode === 'architecture_docs'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Architecture</span>
            </button>

            {/* Database Schema */}
            <button
              type="button"
              id="nav-db-schema"
              onClick={() => onModeChange('database_schema')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeMode === 'database_schema'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">SQLite DDL</span>
            </button>

            {/* API Spec */}
            <button
              type="button"
              id="nav-api-spec"
              onClick={() => onModeChange('api_spec')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeMode === 'api_spec'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">REST API</span>
            </button>

            {/* Installer Script */}
            <button
              type="button"
              id="nav-installer"
              onClick={() => onModeChange('installer_scripts')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeMode === 'installer_scripts'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Installer (.ps1/.bat)</span>
            </button>
          </nav>

          {/* Right Controls */}
          {activeMode === 'customer_mobile' && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                id="toggle-device-frame"
                onClick={onToggleMobileFrame}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isMobileFrame 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {isMobileFrame ? '📱 Mobile Frame On' : '🖥 Fullscreen View'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
