import React, { useState } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { LocalPrinter, PaperSize } from '../../types';
import { Printer, CheckCircle2, AlertTriangle, RefreshCw, Plus, Sliders, Droplets, HardDrive, Wifi, Usb } from 'lucide-react';

export const PrintersView: React.FC = () => {
  const { printers, updatePrinterStatus } = usePrintJob();
  const [isScanning, setIsScanning] = useState(false);

  const handleScanHardware = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1000);
  };

  const toggleDefault = (id: string) => {
    printers.forEach(p => {
      updatePrinterStatus(p.id, { isDefault: p.id === id });
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Connected Windows Printers ({printers.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detected local Windows Print Spooler endpoints & network IP sockets
          </p>
        </div>

        <button
          type="button"
          onClick={handleScanHardware}
          disabled={isScanning}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Querying Win32_Printer...' : 'Rescan Local Printers'}</span>
        </button>
      </div>

      {/* Printer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {printers.map((printer) => (
          <div
            key={printer.id}
            id={`printer-card-${printer.id}`}
            className={`bg-white dark:bg-slate-800 rounded-xl border p-5 space-y-4 shadow-xs transition-all relative ${
              printer.isDefault
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {printer.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {printer.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  {printer.connection === 'USB' ? <Usb className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                  <span>{printer.connection} {printer.ipAddress ? `(${printer.ipAddress})` : 'Direct Port'}</span>
                </p>
              </div>

              {printer.isDefault ? (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                  DEFAULT
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleDefault(printer.id)}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                >
                  Set Default
                </button>
              )}
            </div>

            {/* Specs & Capabilities */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 block text-[10px]">Color Support</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {printer.supportsColor ? 'Full CMYK Color' : 'Monochrome (B&W)'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 block text-[10px]">Duplex Unit</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {printer.supportsDuplex ? 'Auto Two-Sided' : 'Manual / Simplex'}
                </span>
              </div>
            </div>

            {/* Consumables (Toner & Ink meters) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-slate-400" />
                  <span>Toner / Ink Reserves</span>
                </span>
                <span className="text-[10px] text-slate-400">SNMP Polled</span>
              </div>

              {/* Black Toner */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Black Toner (K)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{printer.blackTonerLevel}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-900 dark:bg-slate-200 h-full rounded-full"
                    style={{ width: `${printer.blackTonerLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Color toners if supported */}
              {printer.supportsColor && printer.cyanTonerLevel !== undefined && (
                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div>
                    <div className="flex justify-between text-cyan-600 font-bold mb-0.5">
                      <span>C</span>
                      <span>{printer.cyanTonerLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${printer.cyanTonerLevel}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-pink-600 font-bold mb-0.5">
                      <span>M</span>
                      <span>{printer.magentaTonerLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: `${printer.magentaTonerLevel}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-amber-500 font-bold mb-0.5">
                      <span>Y</span>
                      <span>{printer.yellowTonerLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${printer.yellowTonerLevel}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Paper Tray Levels */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tray 1 (A4/Letter)</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{printer.tray1Level}% Full</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${printer.tray1Level}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Test page job spooled to ${printer.name} via Windows Spooler API.`);
                }}
                className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors text-center"
              >
                Send Test Page
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
