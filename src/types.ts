export type ColorMode = 'bw' | 'color';
export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type Sidedness = 'single' | 'double_long' | 'double_short';
export type PaperFinish = 'standard_80gsm' | 'premium_100gsm' | 'glossy_photo_200gsm' | 'cardstock_250gsm';
export type BindingOption = 'none' | 'staple_top_left' | 'corner_punch' | 'spiral_bound' | 'comb_bound';
export type Orientation = 'portrait' | 'landscape' | 'auto';

export type JobStatus = 
  | 'pending_payment'
  | 'received_local'
  | 'spooling'
  | 'printing'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type PaymentMethod = 'card' | 'upi_qr' | 'apple_google_pay' | 'cash_counter';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface UploadedFileItem {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  pageCount: number;
  dataUrl?: string; // local temporary preview
  thumbnailUrl?: string;
  sha256Hash: string;
  isShredded: boolean;
  shredTimestamp?: string;
}

export interface PrintPreferences {
  colorMode: ColorMode;
  paperSize: PaperSize;
  sidedness: Sidedness;
  orientation: Orientation;
  pageRange: string; // e.g. "All", "1-5", "2,4,7"
  copies: number;
  paperFinish: PaperFinish;
  binding: BindingOption;
  customNotes?: string;
}

export interface PricingBreakdown {
  basePagePrice: number;
  totalPages: number; // total calculated billed sheets
  subtotal: number;
  colorSurcharge: number;
  finishSurcharge: number;
  bindingSurcharge: number;
  duplexDiscount: number;
  bulkDiscount: number;
  tax: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  notifyVia: 'sms' | 'whatsapp' | 'email' | 'none';
}

export interface PrintJob {
  id: string; // e.g. PJ-8921
  collectionPin: string; // 4-digit PIN e.g. 4821
  stationId: string; // e.g. STATION-01
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  files: UploadedFileItem[];
  preferences: PrintPreferences;
  pricing: PricingBreakdown;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: string;
    amount: number;
  };
  status: JobStatus;
  assignedPrinterId: string;
  progressPercent: number;
  pagesPrinted: number;
  totalPagesToPrint: number;
  estimatedWaitMinutes: number;
  merchantNotes?: string;
  overrideHistory?: {
    timestamp: string;
    reason: string;
    previousPreferences: Partial<PrintPreferences>;
  }[];
  shredStatus: {
    isShredded: boolean;
    passes: number; // e.g. 3 (DoD 5220.22-M)
    shreddedAt?: string;
    overwritePattern?: string;
  };
}

export interface LocalPrinter {
  id: string;
  name: string;
  model: string;
  connection: 'USB' | 'Network' | 'Virtual';
  ipAddress?: string;
  status: 'online' | 'busy' | 'paper_jam' | 'low_toner' | 'offline';
  supportsColor: boolean;
  supportsDuplex: boolean;
  supportedSizes: PaperSize[];
  tray1Level: number; // percentage
  tray2Level?: number;
  blackTonerLevel: number; // percentage
  cyanTonerLevel?: number;
  magentaTonerLevel?: number;
  yellowTonerLevel?: number;
  isDefault: boolean;
}

export interface PricingSettings {
  bwPricePerPage: number; // e.g. $0.10
  colorPricePerPage: number; // e.g. $0.45
  a3Multiplier: number; // 2.0x
  legalMultiplier: number; // 1.2x
  duplexDiscountPercent: number; // 10%
  paperFinishPrices: Record<PaperFinish, number>;
  bindingPrices: Record<BindingOption, number>;
  bulkDiscounts: { minPages: number; discountPercent: number }[];
  currency: string;
  taxRatePercent: number;
}

export interface MerchantSettings {
  storeName: string;
  storeTagline: string;
  address: string;
  supportPhone: string;
  supportEmail: string;
  operatingHours: string;
  localServerPort: number; // 3000 or 8080
  autoPrintApprovedJobs: boolean;
  queueAutoProcess: boolean; // Auto-triggers printer spooler as soon as a file is uploaded and validated
  autoShredAfterPrint: boolean;
  shredPassCount: number; // 1, 3 (DoD), or 7 (Gutmann)
  enableSmsNotifications: boolean;
  enableWhatsAppAlerts: boolean;
  requirePinForCollection: boolean;
  passcodeProtectedDashboard: boolean;
  dashboardPasscode?: string;
  activeStationId: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'JOB_CREATED' | 'PAYMENT_RECEIVED' | 'JOB_SPOOLED' | 'JOB_COMPLETED' | 'FILE_SHREDDED' | 'PREFERENCES_OVERRIDDEN' | 'PRINTER_CHANGED' | 'SYSTEM_STARTUP';
  jobId?: string;
  details: string;
  actor: 'CUSTOMER' | 'MERCHANT' | 'SYSTEM_DAEMON';
  ipAddress: string;
}

export type ToastType = 'shred_success' | 'job_completed' | 'info' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  jobId?: string;
  customerName?: string;
  fileNames?: string[];
  fileCount?: number;
  totalBytes?: number;
  passes?: number;
  duration?: number; // ms before auto-dismiss, e.g. 7000
  details?: string;
  actionLabel?: string;
  actionTargetTab?: string;
}
