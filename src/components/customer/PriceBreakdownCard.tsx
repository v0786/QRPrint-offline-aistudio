import React from 'react';
import { PricingBreakdown, PricingSettings } from '../../types';
import { Calculator, ShieldCheck, Tag, Zap } from 'lucide-react';

interface PriceBreakdownCardProps {
  pricing: PricingBreakdown;
  pricingSettings: PricingSettings;
  onProceedToCheckout: () => void;
  disabled?: boolean;
}

export const PriceBreakdownCard: React.FC<PriceBreakdownCardProps> = ({
  pricing,
  pricingSettings,
  onProceedToCheckout,
  disabled = false,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Order Summary & Quote
          </h3>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {pricing.totalPages} Total Printed Pages
        </span>
      </div>

      {/* Breakdown line items */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Base Printing ({pricing.totalPages} pages)</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            ${pricing.subtotal.toFixed(2)}
          </span>
        </div>

        {pricing.finishSurcharge > 0 && (
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Special Paper Stock</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              +${pricing.finishSurcharge.toFixed(2)}
            </span>
          </div>
        )}

        {pricing.bindingSurcharge > 0 && (
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Finishing & Binding</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              +${pricing.bindingSurcharge.toFixed(2)}
            </span>
          </div>
        )}

        {pricing.duplexDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Duplex Paper Savings
            </span>
            <span className="font-medium">-${pricing.duplexDiscount.toFixed(2)}</span>
          </div>
        )}

        {pricing.bulkDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Bulk Volume Discount
            </span>
            <span className="font-medium">-${pricing.bulkDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <span>Sales Tax ({pricingSettings.taxRatePercent}%)</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            ${pricing.tax.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Grand Total */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Due</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${pricing.total.toFixed(2)}
          </p>
        </div>

        <button
          type="button"
          id="proceed-checkout-btn"
          onClick={onProceedToCheckout}
          disabled={disabled}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-xs ${
            disabled
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-[0.98]'
          }`}
        >
          <span>Proceed to Pay</span>
          <span>→</span>
        </button>
      </div>

      {/* Privacy note */}
      <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Direct encrypted socket transfer to local store PC • Securely shredded upon completion.</span>
      </div>
    </div>
  );
};
