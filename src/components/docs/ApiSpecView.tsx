import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, ChevronRight, Copy, Check, ShieldCheck, Zap } from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  category: 'Customer Portal' | 'Host PC Daemon' | 'Merchant Admin';
  description: string;
  requestBody?: string;
  responseBody: string;
}

export const ApiSpecView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const ENDPOINTS: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/api/v1/jobs/upload',
      category: 'Customer Portal',
      description: 'Multipart direct document stream directly to host machine memory/temp buffer.',
      requestBody: `// multipart/form-data
files: [File binary],
stationId: "STATION-01",
customerName: "Sarah Chen",
customerPhone: "+15552348891",
notifyVia: "whatsapp"`,
      responseBody: `{
  "status": "success",
  "data": {
    "jobId": "PJ-9104",
    "collectionPin": "4281",
    "receivedFiles": [
      {
        "fileId": "f-1",
        "name": "Thesis_Final_Draft.pdf",
        "sizeBytes": 4200000,
        "pageCount": 38,
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    ],
    "storageMode": "ZERO_CLOUD_RAM_DIRECT"
  }
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/jobs/:jobId/checkout',
      category: 'Customer Portal',
      description: 'Verifies payment gateway transaction token and transitions job to active local print spool.',
      requestBody: `{
  "paymentMethod": "card",
  "transactionToken": "tok_1Nq8234892",
  "amount": 17.80,
  "preferences": {
    "colorMode": "bw",
    "paperSize": "A4",
    "sidedness": "double_long",
    "copies": 2,
    "paperFinish": "premium_100gsm",
    "binding": "spiral_bound"
  }
}`,
      responseBody: `{
  "status": "confirmed",
  "jobStatus": "spooling",
  "spooledToPrinter": "HP LaserJet Pro MFP M428fdw",
  "estimatedWaitSeconds": 45,
  "collectionPin": "4281"
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/jobs/:jobId/status',
      category: 'Customer Portal',
      description: 'Server-Sent Events (SSE) or polling endpoint returning live printing progress and shredding verification.',
      responseBody: `{
  "jobId": "PJ-9104",
  "status": "printing",
  "pagesPrinted": 24,
  "totalPages": 76,
  "progressPercent": 31,
  "estimatedRemainingMinutes": 1,
  "shredStatus": {
    "isShredded": false,
    "policy": "AUTO_POST_PRINT_DOD_3PASS"
  }
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/merchant/jobs/:jobId/override',
      category: 'Merchant Admin',
      description: 'Allows store operator to modify customer preferences (e.g. switch B&W/color, page range) with mandatory audit reason.',
      requestBody: `{
  "colorMode": "bw",
  "paperSize": "A4",
  "copies": 3,
  "reason": "Customer called to add 1 extra copy"
}`,
      responseBody: `{
  "status": "updated",
  "jobId": "PJ-9104",
  "recalculatedTotal": 24.50,
  "auditLogged": true
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/merchant/jobs/:jobId/shred',
      category: 'Merchant Admin',
      description: 'Triggers manual or forced DoD 5220.22-M 3-pass forensic sector destruction of temporary buffers.',
      requestBody: `{
  "passCount": 3,
  "algorithm": "DoD_5220_22_M"
}`,
      responseBody: `{
  "status": "destroyed",
  "jobId": "PJ-9104",
  "shreddedFilesCount": 1,
  "bytesOverwritten": 4200000,
  "zeroFilledVerified": true,
  "timestamp": "2026-08-24T15:40:02.112Z"
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/merchant/printers',
      category: 'Host PC Daemon',
      description: 'Direct Win32 API hardware enumeration returning spooler queue statuses and SNMP ink/paper telemetry.',
      responseBody: `[
  {
    "id": "prn-01",
    "name": "HP LaserJet Pro MFP M428fdw",
    "connection": "USB",
    "status": "online",
    "blackTonerLevel": 78,
    "tray1Level": 85,
    "isDefault": true
  }
]`,
    },
  ];

  const current = ENDPOINTS[selectedEndpoint];

  const handleCopySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(ENDPOINTS, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'POST': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'PUT': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'DELETE': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>REST API Endpoints Specification</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal JSON-RPC & RESTful contract between GitHub Pages client and Local Windows Daemon
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySpec}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs self-start sm:self-auto transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied JSON' : 'Export OpenAPI JSON'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left endpoint selector */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
            Available API Routes
          </p>

          <div className="space-y-1.5">
            {ENDPOINTS.map((ep, idx) => (
              <button
                key={ep.path}
                type="button"
                onClick={() => setSelectedEndpoint(idx)}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
                  selectedEndpoint === idx
                    ? 'border border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${getMethodBadge(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-bold font-mono truncate">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {ep.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Right detail spec view */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          
          <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${getMethodBadge(current.method)}`}>
                {current.method}
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                {current.path}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
              {current.description}
            </p>
          </div>

          {/* Request Payload if applicable */}
          {current.requestBody && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Request Payload
              </p>
              <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
                <code>{current.requestBody}</code>
              </pre>
            </div>
          )}

          {/* Response Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Response Payload (200 OK)
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">application/json</span>
            </div>
            <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
              <code>{current.responseBody}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
