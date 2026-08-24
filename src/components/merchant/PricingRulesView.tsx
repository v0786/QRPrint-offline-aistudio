import React, { useState } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { PricingSettings, PaperFinish, BindingOption } from '../../types';
import { DollarSign, Save, Tag, Percent, Check, Layers, Scissors } from 'lucide-react';

export const PricingRulesView: React.FC = () => {
  const { pricingSettings, updatePricingSettings } = usePrintJob();
  const [form, setForm] = useState<PricingSettings>({ ...pricingSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const updateFinishPrice = (finish: PaperFinish, val: number) => {
    setForm({
      ...form,
      paperFinishPrices: {
        ...form.paperFinishPrices,
        [finish]: Math.max(0, val),
      },
    });
  };

  const updateBindingPrice = (binding: BindingOption, val: number) => {
    setForm({
      ...form,
      bindingPrices: {
        ...form.bindingPrices,
        [binding]: Math.max(0, val),
      },
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Store Pricing & Tariff Rules</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-calculates customer quotes dynamically in real-time. Stored in local SQLite database.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Rules Updated!' : 'Save Pricing Rules'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Page Tariffs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Base Page Rates & Size Multipliers
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                B&W / Monochrome ($ per page)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.bwPricePerPage}
                  onChange={(e) => setForm({ ...form, bwPricePerPage: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 pl-7 pr-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Color CMYK ($ per page)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.colorPricePerPage}
                  onChange={(e) => setForm({ ...form, colorPricePerPage: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 pl-7 pr-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                A3 Size Multiplier (vs A4)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={form.a3Multiplier}
                onChange={(e) => setForm({ ...form, a3Multiplier: parseFloat(e.target.value) || 1 })}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duplex Discount (% off)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={form.duplexDiscountPercent}
                onChange={(e) => setForm({ ...form, duplexDiscountPercent: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Local Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.taxRatePercent}
                onChange={(e) => setForm({ ...form, taxRatePercent: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Paper Stock & Finishing Surcharges */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Paper Stock Surcharges (per sheet)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-300">Premium 100gsm Smooth</span>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.paperFinishPrices.premium_100gsm}
                  onChange={(e) => updateFinishPrice('premium_100gsm', parseFloat(e.target.value) || 0)}
                  className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-right font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-300">Glossy Photo 200gsm</span>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.paperFinishPrices.glossy_photo_200gsm}
                  onChange={(e) => updateFinishPrice('glossy_photo_200gsm', parseFloat(e.target.value) || 0)}
                  className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-right font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-300">Heavy Cardstock 250gsm</span>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.paperFinishPrices.cardstock_250gsm}
                  onChange={(e) => updateFinishPrice('cardstock_250gsm', parseFloat(e.target.value) || 0)}
                  className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-right font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            <Scissors className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Finishing & Binding Fees (per unit)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-300">Corner Stapling</span>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.bindingPrices.staple_top_left}
                  onChange={(e) => updateBindingPrice('staple_top_left', parseFloat(e.target.value) || 0)}
                  className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-right font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-300">Spiral / Coil Bound</span>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.bindingPrices.spiral_bound}
                  onChange={(e) => updateBindingPrice('spiral_bound', parseFloat(e.target.value) || 0)}
                  className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-right font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
