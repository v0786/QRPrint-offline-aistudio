import React, { useState } from 'react';
import { PrintJob, PrintPreferences, ColorMode, PaperSize, Sidedness } from '../../types';
import { Settings2, X, AlertTriangle, Check, Save } from 'lucide-react';

interface JobOverrideModalProps {
  job: PrintJob | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobId: string, updatedPrefs: Partial<PrintPreferences>, reason: string) => void;
}

export const JobOverrideModal: React.FC<JobOverrideModalProps> = ({
  job,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !job) return null;

  const [colorMode, setColorMode] = useState<ColorMode>(job.preferences.colorMode);
  const [paperSize, setPaperSize] = useState<PaperSize>(job.preferences.paperSize);
  const [sidedness, setSidedness] = useState<Sidedness>(job.preferences.sidedness);
  const [copies, setCopies] = useState<number>(job.preferences.copies);
  const [pageRange, setPageRange] = useState<string>(job.preferences.pageRange || 'All');
  const [reason, setReason] = useState<string>('Adjusted for hardware compatibility / customer verbal request');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      job.id,
      {
        colorMode,
        paperSize,
        sidedness,
        copies,
        pageRange,
      },
      reason
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Merchant Settings Override
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Job #{job.id} • Customer: {job.customer.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Modifying these print parameters overrides customer-selected options before routing to the Windows printer spooler. All changes are recorded in the audit log.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Color Mode */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Color Setting
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="bw">Black & White (Monochrome)</option>
                <option value="color">Full Color CMYK</option>
              </select>
            </div>

            {/* Paper Size */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paper Size
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="A4">A4 (Standard 210x297mm)</option>
                <option value="A3">A3 (Large 297x420mm)</option>
                <option value="Letter">Letter (8.5x11 in)</option>
                <option value="Legal">Legal (8.5x14 in)</option>
              </select>
            </div>

            {/* Sidedness */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duplex / Sidedness
              </label>
              <select
                value={sidedness}
                onChange={(e) => setSidedness(e.target.value as Sidedness)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="single">Single-Sided (Simplex)</option>
                <option value="double_long">Double-Sided (Long Edge Flip)</option>
                <option value="double_short">Double-Sided (Short Edge Flip)</option>
              </select>
            </div>

            {/* Copies */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Copies Count
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
          </div>

          {/* Page Range Override */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Page Range Filter
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="e.g. All, 1-10, 15"
              className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            />
          </div>

          {/* Reason for Audit Log */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Override (Audit Log Record)
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Low color toner, customer phoned to change copies to 3"
              className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply & Save Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
