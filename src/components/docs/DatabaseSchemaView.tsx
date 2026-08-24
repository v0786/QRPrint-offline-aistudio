import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, Table, Play, ShieldAlert } from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState('print_jobs');
  const [queryInput, setQueryInput] = useState('SELECT id, station_id, status, total_amount, created_at FROM print_jobs ORDER BY created_at DESC LIMIT 5;');
  const [queryResult, setQueryResult] = useState<string | null>(null);

  const SQL_DDL_SCHEMA = `-- ==========================================================
-- PrintSpool Local SQLite Database Schema (v3.45 WAL Mode)
-- High-Performance Local-Only Embedded Relational Architecture
-- ==========================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- 1. Merchants & Store Configuration
CREATE TABLE IF NOT EXISTS merchants (
    merchant_id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    address TEXT NOT NULL,
    support_phone TEXT,
    support_email TEXT,
    local_port INTEGER DEFAULT 3000,
    auto_print_enabled INTEGER DEFAULT 1 CHECK (auto_print_enabled IN (0, 1)),
    auto_shred_enabled INTEGER DEFAULT 1 CHECK (auto_shred_enabled IN (0, 1)),
    shred_pass_count INTEGER DEFAULT 3,
    dashboard_passcode_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Local Windows Printers
CREATE TABLE IF NOT EXISTS local_printers (
    printer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    model TEXT,
    connection_type TEXT CHECK (connection_type IN ('USB', 'Network', 'Virtual')),
    ip_address TEXT,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'busy', 'paper_jam', 'low_toner', 'offline')),
    supports_color INTEGER DEFAULT 0 CHECK (supports_color IN (0, 1)),
    supports_duplex INTEGER DEFAULT 1 CHECK (supports_duplex IN (0, 1)),
    is_default INTEGER DEFAULT 0 CHECK (is_default IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dynamic Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
    rule_id TEXT PRIMARY KEY,
    bw_price_per_page REAL NOT NULL DEFAULT 0.10,
    color_price_per_page REAL NOT NULL DEFAULT 0.45,
    a3_multiplier REAL DEFAULT 2.0,
    duplex_discount_percent REAL DEFAULT 10.0,
    tax_rate_percent REAL DEFAULT 8.5,
    currency TEXT DEFAULT '$',
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customer Records (Ephemeral / Privacy Preserving)
CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    preferred_notify_channel TEXT DEFAULT 'whatsapp' CHECK (preferred_notify_channel IN ('sms', 'whatsapp', 'email', 'none')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Primary Print Jobs Table
CREATE TABLE IF NOT EXISTS print_jobs (
    job_id TEXT PRIMARY KEY,
    collection_pin TEXT NOT NULL,
    station_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    assigned_printer_id TEXT NOT NULL,
    color_mode TEXT NOT NULL CHECK (color_mode IN ('bw', 'color')),
    paper_size TEXT NOT NULL CHECK (paper_size IN ('A4', 'A3', 'Letter', 'Legal')),
    sidedness TEXT NOT NULL CHECK (sidedness IN ('single', 'double_long', 'double_short')),
    orientation TEXT DEFAULT 'portrait',
    page_range TEXT DEFAULT 'All',
    copies INTEGER NOT NULL DEFAULT 1 CHECK (copies > 0),
    paper_finish TEXT DEFAULT 'standard_80gsm',
    binding_option TEXT DEFAULT 'none',
    status TEXT NOT NULL DEFAULT 'received_local' 
        CHECK (status IN ('pending_payment', 'received_local', 'spooling', 'printing', 'ready_for_pickup', 'completed', 'cancelled', 'failed')),
    total_pages_billed INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    merchant_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_printer_id) REFERENCES local_printers(printer_id)
);

-- 6. Uploaded Temporary Job Documents
CREATE TABLE IF NOT EXISTS job_files (
    file_id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    sha256_hash TEXT NOT NULL,
    temp_disk_path TEXT,
    is_shredded INTEGER DEFAULT 0 CHECK (is_shredded IN (0, 1)),
    shredded_at DATETIME,
    FOREIGN KEY (job_id) REFERENCES print_jobs(job_id) ON DELETE CASCADE
);

-- 7. Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    transaction_id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL UNIQUE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'upi_qr', 'apple_google_pay', 'cash_counter')),
    amount_paid REAL NOT NULL,
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'refunded', 'failed')),
    gateway_reference TEXT,
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES print_jobs(job_id)
);

-- 8. Forensic Shredding & Destruction Audit Trail
CREATE TABLE IF NOT EXISTS shred_audit_logs (
    shred_id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    file_id TEXT NOT NULL,
    pass_count INTEGER NOT NULL DEFAULT 3,
    algorithm TEXT DEFAULT 'DoD 5220.22-M',
    bytes_overwritten INTEGER NOT NULL,
    verified_zeroed INTEGER DEFAULT 1,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES print_jobs(job_id)
);

-- Indexes for Sub-Millisecond Queries
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_pin ON print_jobs(collection_pin);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created ON print_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_files_shredded ON job_files(is_shredded);

-- Trigger: Auto Update updated_at Timestamps
CREATE TRIGGER IF NOT EXISTS trg_print_jobs_updated_at
AFTER UPDATE ON print_jobs
BEGIN
    UPDATE print_jobs SET updated_at = CURRENT_TIMESTAMP WHERE job_id = NEW.job_id;
END;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_DDL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteQuery = () => {
    // Simulated query executor
    if (queryInput.toLowerCase().includes('print_jobs')) {
      setQueryResult(JSON.stringify([
        { job_id: 'PJ-9104', station_id: 'STATION-01', status: 'printing', total_amount: 17.80, created_at: '2026-08-24 15:23:40' },
        { job_id: 'PJ-9105', station_id: 'STATION-01', status: 'received_local', total_amount: 33.20, created_at: '2026-08-24 15:33:12' },
        { job_id: 'PJ-9102', station_id: 'STATION-01', status: 'ready_for_pickup', total_amount: 23.33, created_at: '2026-08-24 14:56:01' },
      ], null, 2));
    } else {
      setQueryResult(JSON.stringify({ status: 'OK', rowsAffected: 1, executionTimeMs: 0.42 }, null, 2));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>SQLite Database Schema & Relational DDL</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Zero-cloud, embedded SQLite 3 relational tables with write-ahead logging (WAL), triggers, and forensic audit tables
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs self-start sm:self-auto transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied DDL' : 'Copy SQL Schema DDL'}</span>
        </button>
      </div>

      {/* Tables Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: 'print_jobs', desc: 'Core job records & state machine' },
          { name: 'job_files', desc: 'Temporary docs & SHA-256 hashes' },
          { name: 'local_printers', desc: 'Windows Win32 printer endpoints' },
          { name: 'shred_audit_logs', desc: 'DoD 3-pass destruction certs' },
        ].map((t) => (
          <div
            key={t.name}
            onClick={() => setSelectedTable(t.name)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedTable === t.name
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
              <Table className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.name}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* SQL DDL Code Viewer */}
      <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-emerald-400 font-bold">schema.sql (SQLite 3.45+)</span>
          </div>
          <span className="text-[11px] font-mono">PRAGMA journal_mode = WAL</span>
        </div>

        <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
          <code>{SQL_DDL_SCHEMA}</code>
        </pre>
      </div>

      {/* Interactive SQL Query Playground */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Simulated SQLite Query Console
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Local WAL Engine</span>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleExecuteQuery}
              className="px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          </div>

          {queryResult && (
            <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-48">
              {queryResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
