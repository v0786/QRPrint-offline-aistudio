import React, { useState } from 'react';
import { PrintJob } from '../../types';
import { MessageSquare, Phone, Send, X, Check, MessageCircle, AlertCircle } from 'lucide-react';

interface CustomerContactModalProps {
  job: PrintJob | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (jobId: string, channel: 'sms' | 'whatsapp' | 'call', message: string) => void;
}

export const CustomerContactModal: React.FC<CustomerContactModalProps> = ({
  job,
  isOpen,
  onClose,
  onSendMessage,
}) => {
  if (!isOpen || !job) return null;

  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'call'>('whatsapp');
  const [customMsg, setCustomMsg] = useState(
    `Hello ${job.customer.name}, your print order #${job.id} (${job.files.length} document(s), ${job.totalPagesToPrint} pages) is ready for collection at ${job.stationId}! Your Pickup PIN is ${job.collectionPin}.`
  );
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(job.id, channel, customMsg);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1200);
  };

  const setTemplate = (type: 'ready' | 'clarify' | 'delay') => {
    if (type === 'ready') {
      setCustomMsg(`Hello ${job.customer.name}, your print order #${job.id} is ready for collection at ${job.stationId}! Your Pickup PIN is ${job.collectionPin}.`);
    } else if (type === 'clarify') {
      setCustomMsg(`Hi ${job.customer.name}, regarding order #${job.id}: We noticed page 3 is landscape. Would you like us to fit to page or rotate?`);
    } else if (type === 'delay') {
      setCustomMsg(`Hi ${job.customer.name}, order #${job.id} is slightly delayed due to printer toner replenishment. Ready in approx 7 minutes!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Contact Customer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {job.customer.name} • {job.customer.phone}
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

        {sentSuccess ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Message Dispatched via {channel.toUpperCase()}!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logged in system audit history.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4 my-4">
            
            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Communication Channel
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`py-2 px-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 ${
                    channel === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`py-2 px-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 ${
                    channel === 'sms'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('call')}
                  className={`py-2 px-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 ${
                    channel === 'call'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct Call</span>
                </button>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Quick Template
              </label>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTemplate('ready')}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
                >
                  🎉 Order Ready
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('clarify')}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
                >
                  ❓ Need Clarification
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('delay')}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
                >
                  ⏱ Brief Delay
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Message Content
              </label>
              <textarea
                rows={4}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Alert Now</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
