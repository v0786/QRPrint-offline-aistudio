import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { 
  PrintJob, 
  LocalPrinter, 
  PricingSettings, 
  MerchantSettings, 
  AuditLogEntry, 
  JobStatus, 
  JobPriority,
  PrintPreferences,
  ToastNotification 
} from '../types';
import { 
  DEFAULT_PRICING, 
  DEFAULT_MERCHANT_SETTINGS, 
  DEFAULT_PRINTERS, 
  INITIAL_JOBS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData';
import { soundNotifier } from '../utils/audioNotification';

interface PrintJobContextType {
  jobs: PrintJob[];
  printers: LocalPrinter[];
  pricingSettings: PricingSettings;
  merchantSettings: MerchantSettings;
  auditLogs: AuditLogEntry[];
  toasts: ToastNotification[];
  shredHistory: ToastNotification[];
  soundEnabled: boolean;
  serverStatus: {
    isRunning: boolean;
    uptimeSeconds: number;
    port: number;
    dbEngine: string;
    ramUsageMb: number;
    activeConnections: number;
    totalSpoolCount: number;
  };
  // Actions
  createJob: (job: Omit<PrintJob, 'id' | 'collectionPin' | 'createdAt' | 'updatedAt' | 'progressPercent' | 'pagesPrinted' | 'shredStatus'>) => PrintJob;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  updateJobPreferences: (jobId: string, newPrefs: Partial<PrintPreferences>, reason: string) => void;
  assignPrinterToJob: (jobId: string, printerId: string) => void;
  spoolAndPrintJob: (jobId: string) => void;
  cancelJob: (jobId: string, reason?: string) => void;
  pauseJob: (jobId: string, reason?: string) => void;
  resumeJob: (jobId: string) => void;
  prioritizeJob: (jobId: string, priority: JobPriority, moveToTop?: boolean) => void;
  reorderQueue: (jobId: string, direction: 'up' | 'down' | 'top') => void;
  pauseAllJobs: () => void;
  resumeAllJobs: () => void;
  clearCompletedJobs: () => void;
  forceShredJobFiles: (jobId: string) => void;
  updatePrinterStatus: (printerId: string, updates: Partial<LocalPrinter>) => void;
  updatePricingSettings: (settings: PricingSettings) => void;
  updateMerchantSettings: (settings: MerchantSettings) => void;
  clearAuditLogs: () => void;
  restartLocalDaemon: () => void;
  sendCustomerAlert: (jobId: string, channel: 'sms' | 'whatsapp' | 'call', message: string) => void;
  toggleQueueAutoProcess: () => void;
  setQueueAutoProcess: (enabled: boolean) => void;
  // Toast notifications
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  triggerTestShredToast: () => void;
}

const PrintJobContext = createContext<PrintJobContextType | undefined>(undefined);

const STORAGE_KEYS = {
  JOBS: 'printspool_local_jobs_v1',
  PRINTERS: 'printspool_local_printers_v1',
  PRICING: 'printspool_local_pricing_v1',
  MERCHANT: 'printspool_local_merchant_v1',
  AUDIT: 'printspool_local_audit_v1',
  SHRED_HISTORY: 'printspool_local_shred_history_v1',
};

export const PrintJobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted or defaults
  const [jobs, setJobs] = useState<PrintJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
      return saved ? JSON.parse(saved) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [printers, setPrinters] = useState<LocalPrinter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRINTERS);
      return saved ? JSON.parse(saved) : DEFAULT_PRINTERS;
    } catch {
      return DEFAULT_PRINTERS;
    }
  });

  const [pricingSettings, setPricingSettingsState] = useState<PricingSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRICING);
      return saved ? JSON.parse(saved) : DEFAULT_PRICING;
    } catch {
      return DEFAULT_PRICING;
    }
  });

  const [merchantSettings, setMerchantSettingsState] = useState<MerchantSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MERCHANT);
      return saved ? JSON.parse(saved) : DEFAULT_MERCHANT_SETTINGS;
    } catch {
      return DEFAULT_MERCHANT_SETTINGS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [shredHistory, setShredHistory] = useState<ToastNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHRED_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundNotifier.setEnabled(enabled);
  }, []);

  const [serverStatus, setServerStatus] = useState({
    isRunning: true,
    uptimeSeconds: 14280,
    port: 3000,
    dbEngine: 'SQLite v3.45 (Local /wal mode)',
    ramUsageMb: 48.6,
    activeConnections: 3,
    totalSpoolCount: 142,
  });

  // Persist helpers
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify(printers));
  }, [printers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricingSettings));
  }, [pricingSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MERCHANT, JSON.stringify(merchantSettings));
  }, [merchantSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHRED_HISTORY, JSON.stringify(shredHistory));
  }, [shredHistory]);

  // Add Toast helper
  const addToast = useCallback((toastData: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newToast: ToastNotification = {
      ...toastData,
      id,
      timestamp: new Date().toISOString(),
      duration: toastData.duration ?? 7500,
    };

    setToasts(prev => [newToast, ...prev]);

    if (toastData.type === 'shred_success') {
      setShredHistory(prev => [newToast, ...prev.slice(0, 49)]);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Server Uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setServerStatus(prev => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addAudit = useCallback((
    action: AuditLogEntry['action'],
    details: string,
    actor: AuditLogEntry['actor'] = 'SYSTEM_DAEMON',
    jobId?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      action,
      details,
      actor,
      jobId,
      ipAddress: actor === 'CUSTOMER' ? '192.168.1.55' : '127.0.0.1',
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 199)]);
  }, []);

  // Force shred helper
  const forceShredJobFiles = useCallback((jobId: string) => {
    let targetedJob: PrintJob | undefined;

    setJobs(prev => {
      targetedJob = prev.find(j => j.id === jobId);
      return prev.map(job => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          files: job.files.map(f => ({
            ...f,
            isShredded: true,
            shredTimestamp: new Date().toISOString(),
          })),
          shredStatus: {
            isShredded: true,
            passes: merchantSettings.shredPassCount || 3,
            shreddedAt: new Date().toISOString(),
            overwritePattern: 'DoD 5220.22-M: 0x00, 0xFF, Random Noise',
          },
        };
      });
    });

    const passes = merchantSettings.shredPassCount || 3;
    const customerName = targetedJob?.customer.name || 'Customer';
    const files = targetedJob?.files || [];
    const fileNames = files.map(f => f.name);
    const fileCount = files.length || 1;
    const totalBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

    addAudit(
      'FILE_SHREDDED',
      `Secure shredder executed for Job ${jobId}. Temporary buffers (${fileNames.join(', ') || 'all files'}) overwritten with ${passes}-pass DoD standard and unlinked.`,
      'SYSTEM_DAEMON',
      jobId
    );

    // Audio chime
    soundNotifier.playShredComplete();

    // Trigger Visual Toast
    addToast({
      type: 'shred_success',
      title: 'DoD 5220.22-M File Shredded & Sanitized',
      message: `${fileCount} document(s) permanently unlinked & overwritten for Job #${jobId}`,
      jobId,
      customerName,
      fileNames: fileNames.length > 0 ? fileNames : ['Document_Payload.pdf'],
      fileCount,
      totalBytes,
      passes,
      duration: 8000,
      details: `Pass 1: 0x00 (Null) • Pass 2: 0xFF (High) • Pass 3: CSPRNG Random. Local buffer zeroed & unlinked from storage.`,
      actionLabel: 'View in Audit Log',
      actionTargetTab: 'daemon_audit'
    });
  }, [addAudit, merchantSettings.shredPassCount, addToast]);

  // Test helper to trigger simulated shred toast on demand
  const triggerTestShredToast = useCallback(() => {
    const dummyId = 'PJ-' + Math.floor(9200 + Math.random() * 700);
    const dummyFiles = ['Legal_Contract_v2.pdf', 'Confidential_Financials.pdf'];
    const passes = merchantSettings.shredPassCount || 3;

    addAudit(
      'FILE_SHREDDED',
      `[SIMULATION TEST] Secure shredder executed for Job ${dummyId}. 2 file buffers overwritten with ${passes}-pass DoD standard.`,
      'SYSTEM_DAEMON',
      dummyId
    );

    soundNotifier.playShredComplete();

    addToast({
      type: 'shred_success',
      title: 'DoD 5220.22-M File Shredded & Sanitized',
      message: `2 document(s) permanently unlinked & overwritten for Job #${dummyId}`,
      jobId: dummyId,
      customerName: 'Sarah Jenkins (Test)',
      fileNames: dummyFiles,
      fileCount: 2,
      totalBytes: 2450000,
      passes,
      duration: 8000,
      details: `Pass 1: 0x00 (Null) • Pass 2: 0xFF (High) • Pass 3: CSPRNG Random. Local storage memory buffer unlinked.`,
      actionLabel: 'View in Audit Log',
      actionTargetTab: 'daemon_audit'
    });
  }, [addAudit, merchantSettings.shredPassCount, addToast]);

  // Simulated print progression loop
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => {
        let changed = false;
        const updated = prevJobs.map(job => {
          if (job.status === 'spooling') {
            changed = true;
            return {
              ...job,
              status: 'printing' as JobStatus,
              progressPercent: 5,
              updatedAt: new Date().toISOString(),
            };
          }
          if (job.status === 'printing') {
            changed = true;
            const newProgress = Math.min(100, (job.progressPercent || 0) + 12);
            const printed = Math.min(job.totalPagesToPrint, Math.round((newProgress / 100) * job.totalPagesToPrint));
            
            if (newProgress >= 100) {
              // Automatically trigger shredding if enabled
              if (merchantSettings.autoShredAfterPrint && !job.shredStatus.isShredded) {
                setTimeout(() => forceShredJobFiles(job.id), 500);
              }
              return {
                ...job,
                status: 'ready_for_pickup' as JobStatus,
                progressPercent: 100,
                pagesPrinted: job.totalPagesToPrint,
                estimatedWaitMinutes: 0,
                updatedAt: new Date().toISOString(),
              };
            }

            return {
              ...job,
              progressPercent: newProgress,
              pagesPrinted: printed,
              estimatedWaitMinutes: Math.max(1, Math.ceil((100 - newProgress) / 25)),
              updatedAt: new Date().toISOString(),
            };
          }
          return job;
        });

        return changed ? updated : prevJobs;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [merchantSettings.autoShredAfterPrint, forceShredJobFiles]);

  // Create Job
  const createJob = useCallback((data: Omit<PrintJob, 'id' | 'collectionPin' | 'createdAt' | 'updatedAt' | 'progressPercent' | 'pagesPrinted' | 'shredStatus'>): PrintJob => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const id = 'PJ-' + Math.floor(9200 + Math.random() * 700);
    const newJob: PrintJob = {
      ...data,
      id,
      collectionPin: pin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progressPercent: 0,
      pagesPrinted: 0,
      shredStatus: {
        isShredded: false,
        passes: merchantSettings.shredPassCount || 3,
      },
    };

    setJobs(prev => [newJob, ...prev]);
    setServerStatus(prev => ({
      ...prev,
      totalSpoolCount: prev.totalSpoolCount + 1,
    }));

    addAudit(
      'JOB_CREATED',
      `New print job ${id} received from customer ${data.customer.name} (${data.files.length} file(s), ${data.totalPagesToPrint} pages)`,
      'CUSTOMER',
      id
    );

    addAudit(
      'PAYMENT_RECEIVED',
      `Payment of $${data.pricing.total.toFixed(2)} completed via ${data.payment.method}`,
      'SYSTEM_DAEMON',
      id
    );

    // Queue Auto-Process: automatically triggers local printer spooler as soon as a file is uploaded and validated
    const isAutoProcessActive = merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true;

    if (isAutoProcessActive) {
      setTimeout(() => {
        setJobs(current => current.map(j => j.id === id ? { ...j, status: 'spooling' as JobStatus, updatedAt: new Date().toISOString() } : j));
        const targetPrinter = printers.find(p => p.id === data.assignedPrinterId) || printers[0];
        addAudit(
          'JOB_SPOOLED',
          `[Queue Auto-Process] Payload validated. Auto-spool triggered for Job ${id} (${data.files.map(f => f.name).join(', ')}) -> "${targetPrinter?.name || 'Local Spooler'}"`,
          'SYSTEM_DAEMON',
          id
        );
        addToast({
          type: 'info',
          title: 'Queue Auto-Process Dispatched',
          message: `Job #${id} (${data.customer.name}) validated & auto-spooled to "${targetPrinter?.name || 'Local Printer'}"`,
          jobId: id,
          customerName: data.customer.name,
          fileNames: data.files.map(f => f.name),
          fileCount: data.files.length,
          duration: 6000,
          details: 'Queue Auto-Process bypassed manual hold. Spooler stream active.',
        });
      }, 1200);
    } else {
      addAudit(
        'JOB_CREATED',
        `Job ${id} placed on hold in queue for operator manual review (Queue Auto-Process is OFF).`,
        'SYSTEM_DAEMON',
        id
      );
      addToast({
        type: 'info',
        title: 'Job Held for Manual Approval',
        message: `Job #${id} (${data.customer.name}) uploaded & validated. Awaiting operator manual review.`,
        jobId: id,
        customerName: data.customer.name,
        fileNames: data.files.map(f => f.name),
        fileCount: data.files.length,
        duration: 6500,
        details: 'Queue Auto-Process is OFF. Click "Print Now" or review in Print Preview.',
      });
    }

    return newJob;
  }, [merchantSettings.shredPassCount, merchantSettings.queueAutoProcess, merchantSettings.autoPrintApprovedJobs, printers, addAudit, addToast]);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      if (status === 'completed' && merchantSettings.autoShredAfterPrint && !job.shredStatus.isShredded) {
        setTimeout(() => forceShredJobFiles(jobId), 300);
      }
      return {
        ...job,
        status,
        updatedAt: new Date().toISOString(),
      };
    }));
    addAudit(
      'JOB_COMPLETED',
      `Job ${jobId} status updated to ${status}`,
      'MERCHANT',
      jobId
    );
  }, [merchantSettings.autoShredAfterPrint, forceShredJobFiles, addAudit]);

  const updateJobPreferences = useCallback((jobId: string, newPrefs: Partial<PrintPreferences>, reason: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const prevPreferences = { ...job.preferences };
      const updatedPrefs = { ...job.preferences, ...newPrefs };
      const history = job.overrideHistory || [];
      return {
        ...job,
        preferences: updatedPrefs,
        updatedAt: new Date().toISOString(),
        merchantNotes: reason ? `Merchant override: ${reason}` : job.merchantNotes,
        overrideHistory: [
          ...history,
          {
            timestamp: new Date().toISOString(),
            reason: reason || 'Merchant manual adjustment',
            previousPreferences: prevPreferences,
          },
        ],
      };
    }));
    addAudit(
      'PREFERENCES_OVERRIDDEN',
      `Job ${jobId} preferences adjusted by merchant. Reason: ${reason || 'Operator override'}`,
      'MERCHANT',
      jobId
    );
  }, [addAudit]);

  const assignPrinterToJob = useCallback((jobId: string, printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    setJobs(prev => prev.map(job => job.id === jobId ? { ...job, assignedPrinterId: printerId, updatedAt: new Date().toISOString() } : job));
    addAudit(
      'PRINTER_CHANGED',
      `Job ${jobId} routed to printer "${printer?.name || printerId}"`,
      'MERCHANT',
      jobId
    );
  }, [printers, addAudit]);

  const spoolAndPrintJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      return {
        ...job,
        status: 'spooling' as JobStatus,
        progressPercent: 0,
        updatedAt: new Date().toISOString(),
      };
    }));
    addAudit(
      'JOB_SPOOLED',
      `Operator initiated print command for Job ${jobId}. Direct RAW byte transfer to Windows Spooler.`,
      'MERCHANT',
      jobId
    );
  }, [addAudit]);

  const pauseJob = useCallback((jobId: string, reason?: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      return {
        ...job,
        status: 'paused' as JobStatus,
        pausedAt: new Date().toISOString(),
        merchantNotes: reason ? `Paused: ${reason}` : (job.merchantNotes || 'Paused by operator'),
        updatedAt: new Date().toISOString(),
      };
    }));
    addAudit(
      'JOB_PAUSED',
      `Print Job ${jobId} was PAUSED by operator in local spooler. ${reason ? `Reason: ${reason}` : ''}`,
      'MERCHANT',
      jobId
    );
    addToast({
      type: 'warning',
      title: 'Print Job Paused',
      message: `Job #${jobId} has been paused. Spooler stream held.`,
      jobId,
      duration: 4000,
    });
  }, [addAudit, addToast]);

  const resumeJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const nextStatus: JobStatus = job.progressPercent > 0 ? 'printing' : 'spooling';
      return {
        ...job,
        status: nextStatus,
        resumedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }));
    addAudit(
      'JOB_RESUMED',
      `Print Job ${jobId} was RESUMED by operator. Spooler transmission active.`,
      'MERCHANT',
      jobId
    );
    addToast({
      type: 'info',
      title: 'Print Job Resumed',
      message: `Job #${jobId} resumed and back in active spool queue.`,
      jobId,
      duration: 4000,
    });
  }, [addAudit, addToast]);

  const prioritizeJob = useCallback((jobId: string, priority: JobPriority, moveToTop = false) => {
    setJobs(prev => {
      const targetIndex = prev.findIndex(j => j.id === jobId);
      if (targetIndex === -1) return prev;

      const targetJob: PrintJob = {
        ...prev[targetIndex],
        priority,
        updatedAt: new Date().toISOString(),
      };

      if (moveToTop || priority === 'urgent') {
        const remaining = prev.filter(j => j.id !== jobId);
        return [targetJob, ...remaining];
      }

      return prev.map(j => j.id === jobId ? targetJob : j);
    });

    addAudit(
      'JOB_PRIORITIZED',
      `Job ${jobId} priority set to ${priority.toUpperCase()}${moveToTop ? ' (Promoted to Top of Spool Queue)' : ''}`,
      'MERCHANT',
      jobId
    );

    addToast({
      type: priority === 'urgent' ? 'warning' : 'info',
      title: `Job Prioritized: ${priority.toUpperCase()}`,
      message: `Job #${jobId} priority updated to ${priority.toUpperCase()}${moveToTop ? ' and moved to front of queue.' : '.'}`,
      jobId,
      duration: 4000,
    });
  }, [addAudit, addToast]);

  const reorderQueue = useCallback((jobId: string, direction: 'up' | 'down' | 'top') => {
    setJobs(prev => {
      const index = prev.findIndex(j => j.id === jobId);
      if (index === -1) return prev;

      const newJobs = [...prev];
      if (direction === 'top') {
        const [removed] = newJobs.splice(index, 1);
        newJobs.unshift(removed);
      } else if (direction === 'up' && index > 0) {
        const [removed] = newJobs.splice(index, 1);
        newJobs.splice(index - 1, 0, removed);
      } else if (direction === 'down' && index < newJobs.length - 1) {
        const [removed] = newJobs.splice(index, 1);
        newJobs.splice(index + 1, 0, removed);
      }

      return newJobs;
    });

    addAudit(
      'QUEUE_REORDERED',
      `Operator manually shifted Job ${jobId} position in spool queue (${direction.toUpperCase()})`,
      'MERCHANT',
      jobId
    );
  }, [addAudit]);

  const pauseAllJobs = useCallback(() => {
    let pausedCount = 0;
    setJobs(prev => prev.map(job => {
      if (job.status === 'spooling' || job.status === 'printing' || job.status === 'received_local') {
        pausedCount++;
        return {
          ...job,
          status: 'paused' as JobStatus,
          pausedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return job;
    }));

    addAudit('JOB_PAUSED', `All active print spoolers paused by operator (${pausedCount} jobs held)`, 'MERCHANT');
    addToast({
      type: 'warning',
      title: 'All Print Spoolers Paused',
      message: `Paused ${pausedCount} active jobs in the spooler. Click Resume All to continue.`,
      duration: 5000,
    });
  }, [addAudit, addToast]);

  const resumeAllJobs = useCallback(() => {
    let resumedCount = 0;
    setJobs(prev => prev.map(job => {
      if (job.status === 'paused') {
        resumedCount++;
        const nextStatus: JobStatus = job.progressPercent > 0 ? 'printing' : 'spooling';
        return {
          ...job,
          status: nextStatus,
          resumedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return job;
    }));

    addAudit('JOB_RESUMED', `All paused jobs resumed by operator (${resumedCount} jobs re-spooled)`, 'MERCHANT');
    addToast({
      type: 'info',
      title: 'All Print Spoolers Resumed',
      message: `Resumed ${resumedCount} jobs back into printer queues.`,
      duration: 5000,
    });
  }, [addAudit, addToast]);

  const clearCompletedJobs = useCallback(() => {
    setJobs(prev => prev.filter(j => j.status !== 'completed' && j.status !== 'cancelled'));
    addAudit('JOB_COMPLETED', 'Operator cleared completed and cancelled jobs from spool memory', 'MERCHANT');
    addToast({
      type: 'info',
      title: 'Queue Cleaned',
      message: 'Completed and cancelled job records cleared from the active spooler.',
      duration: 4000,
    });
  }, [addAudit, addToast]);

  const cancelJob = useCallback((jobId: string, reason?: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      return {
        ...job,
        status: 'cancelled' as JobStatus,
        merchantNotes: reason ? `Cancelled: ${reason}` : 'Cancelled by merchant',
        updatedAt: new Date().toISOString(),
      };
    }));
    addAudit(
      'JOB_COMPLETED',
      `Job ${jobId} was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      'MERCHANT',
      jobId
    );
  }, [addAudit]);

  const setQueueAutoProcess = useCallback((enabled: boolean) => {
    setMerchantSettingsState(prev => {
      const updated = {
        ...prev,
        queueAutoProcess: enabled,
        autoPrintApprovedJobs: enabled,
      };
      return updated;
    });

    addAudit(
      'SYSTEM_STARTUP',
      `Merchant switched Queue Auto-Process to ${enabled ? 'ENABLED (Instant Spool on Upload)' : 'DISABLED (Hold in Queue for Manual Review)'}`,
      'MERCHANT'
    );

    addToast({
      type: 'info',
      title: enabled ? 'Queue Auto-Process: Active' : 'Queue Auto-Process: Manual Hold',
      message: enabled
        ? 'Incoming uploaded customer files will automatically trigger the printer spooler immediately upon validation.'
        : 'Incoming customer jobs will be held in the Pending queue awaiting operator manual preview & print approval.',
      duration: 5000,
    });
  }, [addAudit, addToast]);

  const toggleQueueAutoProcess = useCallback(() => {
    setQueueAutoProcess(!(merchantSettings.queueAutoProcess ?? merchantSettings.autoPrintApprovedJobs ?? true));
  }, [merchantSettings.queueAutoProcess, merchantSettings.autoPrintApprovedJobs, setQueueAutoProcess]);

  const updatePrinterStatus = useCallback((printerId: string, updates: Partial<LocalPrinter>) => {
    setPrinters(prev => prev.map(p => p.id === printerId ? { ...p, ...updates } : p));
  }, []);

  const updatePricingSettings = useCallback((settings: PricingSettings) => {
    setPricingSettingsState(settings);
    addAudit('SYSTEM_STARTUP', 'Merchant updated pricing configuration rules', 'MERCHANT');
  }, [addAudit]);

  const updateMerchantSettings = useCallback((settings: MerchantSettings) => {
    setMerchantSettingsState(settings);
    addAudit('SYSTEM_STARTUP', 'Merchant updated store settings and daemon preferences', 'MERCHANT');
  }, [addAudit]);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
  }, []);

  const restartLocalDaemon = useCallback(() => {
    setServerStatus(prev => ({
      ...prev,
      uptimeSeconds: 0,
      ramUsageMb: 42.1,
    }));
    addAudit('SYSTEM_STARTUP', 'Windows Service "PrintSpoolLocalDaemon" restarted successfully via IPC.', 'SYSTEM_DAEMON');
  }, [addAudit]);

  const sendCustomerAlert = useCallback((jobId: string, channel: 'sms' | 'whatsapp' | 'call', message: string) => {
    const job = jobs.find(j => j.id === jobId);
    addAudit(
      'JOB_COMPLETED',
      `Customer communication dispatched via ${channel.toUpperCase()} to ${job?.customer.phone || 'customer'}: "${message}"`,
      'MERCHANT',
      jobId
    );
  }, [jobs, addAudit]);

  return (
    <PrintJobContext.Provider value={{
      jobs,
      printers,
      pricingSettings,
      merchantSettings,
      auditLogs,
      toasts,
      shredHistory,
      soundEnabled,
      serverStatus,
      createJob,
      updateJobStatus,
      updateJobPreferences,
      assignPrinterToJob,
      spoolAndPrintJob,
      cancelJob,
      pauseJob,
      resumeJob,
      prioritizeJob,
      reorderQueue,
      pauseAllJobs,
      resumeAllJobs,
      clearCompletedJobs,
      forceShredJobFiles,
      updatePrinterStatus,
      updatePricingSettings,
      updateMerchantSettings,
      clearAuditLogs,
      restartLocalDaemon,
      sendCustomerAlert,
      toggleQueueAutoProcess,
      setQueueAutoProcess,
      addToast,
      dismissToast,
      clearToasts,
      setSoundEnabled,
      triggerTestShredToast,
    }}>
      {children}
    </PrintJobContext.Provider>
  );
};

export function usePrintJob() {
  const context = useContext(PrintJobContext);
  if (!context) {
    throw new Error('usePrintJob must be used within a PrintJobProvider');
  }
  return context;
}

export const usePrintJobs = usePrintJob;
