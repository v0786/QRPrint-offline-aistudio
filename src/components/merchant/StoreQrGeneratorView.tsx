import React, { useState } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { QrCode, Printer, Download, Copy, Check, MapPin, Smartphone, Sparkles } from 'lucide-react';

export const StoreQrGeneratorView: React.FC = () => {
  const { merchantSettings } = usePrintJob();
  const [stationLabel, setStationLabel] = useState('Counter #1 (Front Entrance Express)');
  const [customHeader, setCustomHeader] = useState('Scan to Print Directly from your Phone');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const portalUrl = `https://metroprint.local.internal:3000/?station=${encodeURIComponent(stationLabel)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handlePrintTent = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Store QR Code & Table-Tent Standee Generator</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generates high-contrast QR codes for customer self-service scanning at physical store counters
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied Link' : 'Copy Direct URL'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintTent}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Counter Standee</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Settings Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Signage Customization
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store Location / Counter Station Tag
              </label>
              <input
                type="text"
                value={stationLabel}
                onChange={(e) => setStationLabel(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Call to Action Heading
              </label>
              <input
                type="text"
                value={customHeader}
                onChange={(e) => setCustomHeader(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>How Customer Scanning Works</span>
            </p>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              When customers point their phone camera at this QR code, they are directed to the fast mobile portal. The station code is pre-selected so their document routes directly to this physical counter PC.
            </p>
          </div>
        </div>

        {/* Printable Standee Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-8 border-2 border-slate-900 shadow-xl space-y-6 text-center">
            
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                SELF-SERVICE PRINT STATION
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 pt-2">
                {merchantSettings.storeName}
              </h2>
              <p className="text-xs text-slate-600 font-medium flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{stationLabel}</span>
              </p>
            </div>

            {/* Simulated Vector QR code box */}
            <div className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center space-y-3">
              {/* Scalable SVG QR Code */}
              <div className="w-44 h-44 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer corner boxes */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="77" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="77" width="10" height="10" rx="1" fill="#0f172a" />

                  {/* QR Matrix Dots */}
                  <rect x="36" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="45" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="54" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="36" y="17" width="5" height="5" fill="#0f172a" />
                  <rect x="54" y="17" width="5" height="5" fill="#0f172a" />
                  <rect x="45" y="26" width="5" height="5" fill="#0f172a" />
                  
                  {/* Center & bottom noise */}
                  <rect x="10" y="38" width="5" height="5" fill="#0f172a" />
                  <rect x="22" y="38" width="5" height="5" fill="#0f172a" />
                  <rect x="36" y="38" width="12" height="12" rx="2" fill="#4f46e5" />
                  <rect x="54" y="38" width="5" height="5" fill="#0f172a" />
                  <rect x="72" y="38" width="5" height="5" fill="#0f172a" />
                  <rect x="85" y="38" width="5" height="5" fill="#0f172a" />

                  <rect x="36" y="55" width="5" height="5" fill="#0f172a" />
                  <rect x="48" y="55" width="5" height="5" fill="#0f172a" />
                  <rect x="62" y="55" width="5" height="5" fill="#0f172a" />
                  <rect x="78" y="55" width="5" height="5" fill="#0f172a" />

                  <rect x="36" y="69" width="5" height="5" fill="#0f172a" />
                  <rect x="48" y="69" width="5" height="5" fill="#0f172a" />
                  <rect x="62" y="69" width="5" height="5" fill="#0f172a" />
                  <rect x="78" y="69" width="5" height="5" fill="#0f172a" />

                  <rect x="42" y="80" width="8" height="8" fill="#0f172a" />
                  <rect x="60" y="80" width="8" height="8" fill="#0f172a" />
                  <rect x="78" y="80" width="8" height="8" fill="#0f172a" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>{customHeader}</span>
              </div>
            </div>

            {/* Instruction bullets */}
            <div className="space-y-1 text-left text-[11px] text-slate-600 border-t border-slate-200 pt-3">
              <p className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[9px] flex items-center justify-center">1</span>
                <span>Scan QR with camera & upload your document</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[9px] flex items-center justify-center">2</span>
                <span>Select color / duplex & pay securely online</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[9px] flex items-center justify-center">3</span>
                <span>Show 4-digit Collection PIN at counter</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
