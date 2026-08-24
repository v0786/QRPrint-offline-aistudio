import React, { useState, useMemo } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { FileUploadArea } from './FileUploadArea';
import { PrintPreferencesForm } from './PrintPreferencesForm';
import { PriceBreakdownCard } from './PriceBreakdownCard';
import { PaymentModal } from './PaymentModal';
import { JobTrackerCard } from './JobTrackerCard';
import { calculatePricing } from '../../utils/pricingCalculator';
import { 
  UploadedFileItem, 
  PrintPreferences, 
  CustomerInfo, 
  PaymentMethod, 
  PrintJob 
} from '../../types';
import { 
  QrCode, 
  MapPin, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  FileCheck2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { 
    merchantSettings, 
    pricingSettings, 
    printers, 
    createJob, 
    jobs 
  } = usePrintJob();

  // State
  const [selectedStation, setSelectedStation] = useState(merchantSettings.activeStationId);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [preferences, setPreferences] = useState<PrintPreferences>({
    colorMode: 'bw',
    paperSize: 'A4',
    sidedness: 'double_long',
    orientation: 'portrait',
    pageRange: 'All',
    copies: 1,
    paperFinish: 'standard_80gsm',
    binding: 'none',
    customNotes: '',
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Total original pages
  const totalOriginalPages = useMemo(() => {
    return uploadedFiles.reduce((acc, f) => acc + f.pageCount, 0);
  }, [uploadedFiles]);

  // Calculate live pricing
  const pricing = useMemo(() => {
    return calculatePricing(
      Math.max(1, totalOriginalPages || 1),
      preferences,
      pricingSettings
    );
  }, [totalOriginalPages, preferences, pricingSettings]);

  // Current active job if any
  const currentActiveJob = useMemo(() => {
    if (!activeJobId) return null;
    return jobs.find(j => j.id === activeJobId) || null;
  }, [activeJobId, jobs]);

  // Handle payment complete & submit to local PC
  const handlePaymentSuccess = (customer: CustomerInfo, paymentMethod: PaymentMethod, txnId: string) => {
    setIsCheckoutOpen(false);

    // Pick default printer or first suitable
    const defaultPrinter = printers.find(p => p.isDefault) || printers[0];

    const newJob = createJob({
      stationId: selectedStation,
      customer,
      files: uploadedFiles,
      preferences,
      pricing,
      payment: {
        method: paymentMethod,
        status: 'completed',
        transactionId: txnId,
        paidAt: new Date().toISOString(),
        amount: pricing.total,
      },
      status: 'received_local',
      assignedPrinterId: defaultPrinter?.id || 'prn-01',
      totalPagesToPrint: pricing.totalPages,
      estimatedWaitMinutes: Math.max(1, Math.ceil(pricing.totalPages / 20)),
    });

    setActiveJobId(newJob.id);
  };

  const handleResetForNewJob = () => {
    setActiveJobId(null);
    setUploadedFiles([]);
    setPreferences({
      colorMode: 'bw',
      paperSize: 'A4',
      sidedness: 'double_long',
      orientation: 'portrait',
      pageRange: 'All',
      copies: 1,
      paperFinish: 'standard_80gsm',
      binding: 'none',
      customNotes: '',
    });
  };

  // If viewing an active submitted job
  if (currentActiveJob) {
    return (
      <div className="py-6 px-4 max-w-xl mx-auto">
        <JobTrackerCard job={currentActiveJob} onReset={handleResetForNewJob} />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto space-y-6">
      
      {/* Top Welcome Banner / Location context */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              <span>Direct Self-Service Print Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {merchantSettings.storeName}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{merchantSettings.address}</span>
            </p>
          </div>

          {/* Station Selector badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shrink-0">
            <label className="block text-[10px] uppercase font-bold text-indigo-200 tracking-wider mb-1">
              Active Station Counter
            </label>
            <select
              id="select-station"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 border border-indigo-400/40 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="STATION-01 (Front Counter)">Counter #1 (Express Pickup)</option>
              <option value="STATION-02 (Self-Serve Kiosk)">Kiosk #2 (Color Lab)</option>
              <option value="STATION-03 (Bulk Print Dept)">Station #3 (Heavy Binder)</option>
            </select>
          </div>
        </div>

        {/* 3 Step Indicator */}
        <div className="grid grid-cols-3 gap-2 pt-6 border-t border-indigo-900/60 mt-5 text-center text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
            <span className="truncate">Upload Docs</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
            <span className="truncate">Set Options</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
            <span className="truncate">Pay & Print</span>
          </div>
        </div>
      </div>

      {/* Main Form Flow */}
      <div className="space-y-6">
        
        {/* Step 1: Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Upload Document(s)</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">PDF, Word, Images up to 100MB</span>
          </div>

          <FileUploadArea
            files={uploadedFiles}
            onFilesChange={setUploadedFiles}
          />
        </div>

        {/* Step 2: Preferences */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Configure Print Preferences</span>
            </h2>

            <PrintPreferencesForm
              preferences={preferences}
              onChange={setPreferences}
              pricingSettings={pricingSettings}
              totalOriginalPages={totalOriginalPages}
            />
          </div>
        )}

        {/* Step 3: Pricing & Checkout */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Review Quote & Submit</span>
            </h2>

            <PriceBreakdownCard
              pricing={pricing}
              pricingSettings={pricingSettings}
              onProceedToCheckout={() => setIsCheckoutOpen(true)}
              disabled={uploadedFiles.length === 0}
            />
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        pricing={pricing}
        files={uploadedFiles}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
