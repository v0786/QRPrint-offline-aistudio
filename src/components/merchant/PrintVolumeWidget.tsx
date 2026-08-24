import React, { useState, useMemo } from 'react';
import { usePrintJob } from '../../context/PrintJobContext';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Printer, 
  Layers, 
  Droplets, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  SlidersHorizontal,
  Zap,
  ChevronDown,
  ChevronUp,
  Percent,
  CircleDollarSign,
  Maximize2
} from 'lucide-react';

type TimeRange = 'daily_7d' | 'hourly_today' | 'weekly_6w' | 'monthly_3m';
type MetricFocus = 'all' | 'volume' | 'ink' | 'paper' | 'printers';

const COLOR_PALETTE = {
  bwPages: '#6366f1', // Indigo
  colorPages: '#06b6d4', // Cyan
  jobs: '#10b981', // Emerald
  tonerBlack: '#334155', // Slate 700
  tonerCyan: '#0ea5e9', // Sky 500
  tonerMagenta: '#ec4899', // Pink 500
  tonerYellow: '#eab308', // Yellow 500
  paperA4: '#6366f1',
  paperLetter: '#8b5cf6',
  paperA3: '#ec4899',
  paperLegal: '#f59e0b',
};

// Custom Chart Tooltip component for sleek dark/light styling
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-slate-100 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[160px] space-y-1.5 z-50">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-normal text-slate-400">Print Telemetry</span>
        </p>
        <div className="space-y-1 pt-0.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-slate-300 font-medium">{entry.name}:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                {entry.unit ? ` ${entry.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface PrintVolumeWidgetProps {
  isCompact?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const PrintVolumeWidget: React.FC<PrintVolumeWidgetProps> = ({ isCompact = false, onNavigateTab }) => {
  const { jobs, printers, merchantSettings } = usePrintJob();

  const [timeRange, setTimeRange] = useState<TimeRange>('daily_7d');
  const [metricFocus, setMetricFocus] = useState<MetricFocus>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // Compute live aggregates from current state jobs
  const liveStats = useMemo(() => {
    let totalJobs = jobs.length;
    let totalPages = 0;
    let bwPages = 0;
    let colorPages = 0;
    let sheetsUsed = 0;
    let a4Count = 0;
    let letterCount = 0;
    let a3Count = 0;
    let legalCount = 0;
    let duplexPagesSaved = 0;
    let totalRevenue = 0;

    jobs.forEach(job => {
      totalRevenue += job.pricing?.total || 0;
      const jobPages = job.totalPagesToPrint || job.pricing?.totalPages || 1;
      totalPages += jobPages;

      if (job.preferences.colorMode === 'color') {
        colorPages += jobPages;
      } else {
        bwPages += jobPages;
      }

      // Sidedness savings
      if (job.preferences.sidedness !== 'single') {
        const physicalSheets = Math.ceil(jobPages / 2);
        sheetsUsed += physicalSheets;
        duplexPagesSaved += (jobPages - physicalSheets);
      } else {
        sheetsUsed += jobPages;
      }

      // Paper size distribution
      switch (job.preferences.paperSize) {
        case 'A4': a4Count += jobPages; break;
        case 'Letter': letterCount += jobPages; break;
        case 'A3': a3Count += jobPages; break;
        case 'Legal': legalCount += jobPages; break;
        default: a4Count += jobPages; break;
      }
    });

    // Approximate ink/toner ml or grams used: ~0.03ml per B&W page, ~0.15ml per color page
    const blackInkGrams = Math.round((bwPages * 0.035 + colorPages * 0.02) * 10) / 10;
    const colorInkMl = Math.round((colorPages * 0.12) * 10) / 10;

    return {
      totalJobs,
      totalPages,
      bwPages,
      colorPages,
      sheetsUsed,
      a4Count,
      letterCount,
      a3Count,
      legalCount,
      duplexPagesSaved,
      totalRevenue,
      blackInkGrams,
      colorInkMl,
      colorRatio: totalPages > 0 ? Math.round((colorPages / totalPages) * 100) : 0,
      duplexEfficiency: totalPages > 0 ? Math.round((duplexPagesSaved / totalPages) * 100) : 0,
    };
  }, [jobs]);

  // Generate historical datasets tailored to the selected TimeRange
  const historicalData = useMemo(() => {
    if (timeRange === 'daily_7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
      const baseDaily = [
        { period: 'Mon (18th)', jobs: 14, bwPages: 142, colorPages: 38, totalPages: 180, sheets: 120, blackInk: 5.6, colorInk: 4.5, revenue: 28.5 },
        { period: 'Tue (19th)', jobs: 19, bwPages: 210, colorPages: 65, totalPages: 275, sheets: 195, blackInk: 8.6, colorInk: 7.8, revenue: 45.2 },
        { period: 'Wed (20th)', jobs: 24, bwPages: 320, colorPages: 84, totalPages: 404, sheets: 260, blackInk: 12.8, colorInk: 10.1, revenue: 64.8 },
        { period: 'Thu (21st)', jobs: 22, bwPages: 280, colorPages: 72, totalPages: 352, sheets: 230, blackInk: 11.2, colorInk: 8.6, revenue: 58.0 },
        { period: 'Fri (22nd)', jobs: 31, bwPages: 440, colorPages: 120, totalPages: 560, sheets: 380, blackInk: 17.8, colorInk: 14.4, revenue: 92.5 },
        { period: 'Sat (23rd)', jobs: 28, bwPages: 360, colorPages: 95, totalPages: 455, sheets: 310, blackInk: 14.5, colorInk: 11.4, revenue: 76.0 },
        { 
          period: 'Today (Sun)', 
          jobs: liveStats.totalJobs + 18, 
          bwPages: liveStats.bwPages + 195, 
          colorPages: liveStats.colorPages + 52, 
          totalPages: liveStats.totalPages + 247, 
          sheets: liveStats.sheetsUsed + 165, 
          blackInk: Math.round((liveStats.blackInkGrams + 7.8) * 10) / 10, 
          colorInk: Math.round((liveStats.colorInkMl + 6.2) * 10) / 10, 
          revenue: Math.round((liveStats.totalRevenue + 41.5) * 10) / 10 
        },
      ];
      return baseDaily;
    }

    if (timeRange === 'hourly_today') {
      return [
        { period: '08:00 AM', jobs: 2, bwPages: 24, colorPages: 4, totalPages: 28, sheets: 18, blackInk: 0.9, colorInk: 0.5, revenue: 4.2 },
        { period: '10:00 AM', jobs: 6, bwPages: 78, colorPages: 18, totalPages: 96, sheets: 64, blackInk: 3.1, colorInk: 2.2, revenue: 16.5 },
        { period: '12:00 PM', jobs: 9, bwPages: 130, colorPages: 34, totalPages: 164, sheets: 110, blackInk: 5.2, colorInk: 4.1, revenue: 27.8 },
        { period: '02:00 PM', jobs: 7, bwPages: 92, colorPages: 26, totalPages: 118, sheets: 80, blackInk: 3.7, colorInk: 3.1, revenue: 19.4 },
        { period: '04:00 PM', jobs: 8, bwPages: 115, colorPages: 29, totalPages: 144, sheets: 98, blackInk: 4.6, colorInk: 3.5, revenue: 23.6 },
        { period: '06:00 PM (Now)', jobs: liveStats.totalJobs, bwPages: liveStats.bwPages, colorPages: liveStats.colorPages, totalPages: liveStats.totalPages, sheets: liveStats.sheetsUsed, blackInk: liveStats.blackInkGrams, colorInk: liveStats.colorInkMl, revenue: liveStats.totalRevenue },
      ];
    }

    if (timeRange === 'weekly_6w') {
      return [
        { period: 'Wk 29', jobs: 112, bwPages: 1540, colorPages: 390, totalPages: 1930, sheets: 1280, blackInk: 61.5, colorInk: 46.8, revenue: 310.5 },
        { period: 'Wk 30', jobs: 135, bwPages: 1890, colorPages: 460, totalPages: 2350, sheets: 1590, blackInk: 75.6, colorInk: 55.2, revenue: 382.0 },
        { period: 'Wk 31', jobs: 148, bwPages: 2100, colorPages: 520, totalPages: 2620, sheets: 1780, blackInk: 84.0, colorInk: 62.4, revenue: 425.0 },
        { period: 'Wk 32', jobs: 128, bwPages: 1750, colorPages: 410, totalPages: 2160, sheets: 1450, blackInk: 70.0, colorInk: 49.2, revenue: 348.5 },
        { period: 'Wk 33', jobs: 165, bwPages: 2420, colorPages: 640, totalPages: 3060, sheets: 2080, blackInk: 96.8, colorInk: 76.8, revenue: 504.0 },
        { period: 'This Week', jobs: 156 + liveStats.totalJobs, bwPages: 2180 + liveStats.bwPages, colorPages: 580 + liveStats.colorPages, totalPages: 2760 + liveStats.totalPages, sheets: 1860 + liveStats.sheetsUsed, blackInk: 87.2 + liveStats.blackInkGrams, colorInk: 69.6 + liveStats.colorInkMl, revenue: 450 + liveStats.totalRevenue },
      ];
    }

    // Monthly 3M
    return [
      { period: 'June', jobs: 540, bwPages: 7600, colorPages: 1850, totalPages: 9450, sheets: 6350, blackInk: 304.0, colorInk: 222.0, revenue: 1520.0 },
      { period: 'July', jobs: 620, bwPages: 8900, colorPages: 2240, totalPages: 11140, sheets: 7500, blackInk: 356.0, colorInk: 268.8, revenue: 1810.0 },
      { period: 'August (MTD)', jobs: 590 + liveStats.totalJobs, bwPages: 8250 + liveStats.bwPages, colorPages: 2100 + liveStats.colorPages, totalPages: 10350 + liveStats.totalPages, sheets: 6980 + liveStats.sheetsUsed, blackInk: 330.0 + liveStats.blackInkGrams, colorInk: 252.0 + liveStats.colorInkMl, revenue: 1680.0 + liveStats.totalRevenue },
    ];
  }, [timeRange, liveStats]);

  // Paper format distribution for Pie Chart
  const paperDistributionData = useMemo(() => {
    const rawA4 = liveStats.a4Count + 1450;
    const rawLetter = liveStats.letterCount + 820;
    const rawA3 = liveStats.a3Count + 210;
    const rawLegal = liveStats.legalCount + 140;
    const total = rawA4 + rawLetter + rawA3 + rawLegal;

    return [
      { name: 'A4 Standard (80gsm)', value: rawA4, color: COLOR_PALETTE.paperA4, percent: Math.round((rawA4 / total) * 100) },
      { name: 'Letter (8.5x11")', value: rawLetter, color: COLOR_PALETTE.paperLetter, percent: Math.round((rawLetter / total) * 100) },
      { name: 'A3 Poster (11x17")', value: rawA3, color: COLOR_PALETTE.paperA3, percent: Math.round((rawA3 / total) * 100) },
      { name: 'Legal (8.5x14")', value: rawLegal, color: COLOR_PALETTE.paperLegal, percent: Math.round((rawLegal / total) * 100) },
    ];
  }, [liveStats]);

  // Printer utilization data
  const printerUtilizationData = useMemo(() => {
    return printers.map((p, index) => {
      const shareMultipliers = [0.55, 0.32, 0.13];
      const mult = shareMultipliers[index % shareMultipliers.length];
      const pages = Math.round((liveStats.totalPages + 2400) * mult);
      const jobsCount = Math.round((liveStats.totalJobs + 140) * mult);

      return {
        name: p.name.length > 20 ? `${p.name.substring(0, 18)}...` : p.name,
        fullName: p.name,
        pages,
        jobs: jobsCount,
        tray1: p.tray1Level,
        tray2: p.tray2Level ?? 0,
        blackToner: p.blackTonerLevel,
        status: p.status,
      };
    });
  }, [printers, liveStats]);

  const handleExportCsv = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);

    const headers = ['Period', 'Total Jobs', 'B&W Pages', 'Color Pages', 'Total Pages', 'Physical Sheets', 'Black Ink (g)', 'Color Ink (ml)', 'Gross Revenue ($)'];
    const rows = historicalData.map(d => [
      d.period,
      d.jobs,
      d.bwPages,
      d.colorPages,
      d.totalPages,
      d.sheets,
      d.blackInk,
      d.colorInk,
      d.revenue
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PrintSpool_Volume_Report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all"
      id="print-volume-summary-widget"
    >
      {/* Widget Header & Global Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Print Volume & Resource Metrics
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Spooler Telemetry</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Throughput analytics, ink/toner depletion curves, paper media mix, and hardware load balancing
            </p>
          </div>
        </div>

        {/* Action Buttons & Timeframe Selector */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Timeframe selector */}
          <div className="inline-flex p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-xl border border-slate-300/60 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              id="timeframe-daily-btn"
              onClick={() => setTimeRange('daily_7d')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                timeRange === 'daily_7d'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily (7D)
            </button>

            <button
              type="button"
              id="timeframe-hourly-btn"
              onClick={() => setTimeRange('hourly_today')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                timeRange === 'hourly_today'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today (24h)
            </button>

            <button
              type="button"
              id="timeframe-weekly-btn"
              onClick={() => setTimeRange('weekly_6w')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                timeRange === 'weekly_6w'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly (6W)
            </button>

            <button
              type="button"
              id="timeframe-monthly-btn"
              onClick={() => setTimeRange('monthly_3m')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                timeRange === 'monthly_3m'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly (3M)
            </button>
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            id="export-volume-csv-btn"
            onClick={handleExportCsv}
            className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Download CSV report of print volume and consumption metrics"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            id="collapse-volume-widget-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={isCollapsed ? "Expand Print Volume Widget" : "Collapse Print Volume Widget"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Export notification banner */}
      {exportNotice && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>CSV Volume export generated & downloaded successfully!</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">PrintSpool_Volume_Report.csv</span>
        </div>
      )}

      {/* Primary Content (Collapsible) */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-6">
          
          {/* Quick Metrics KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Total Jobs */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase">
                <span className="flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Total Jobs</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+14.2%</span>
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {historicalData.reduce((acc, curr) => acc + curr.jobs, 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {liveStats.totalJobs} active in local queue session
              </p>
            </div>

            {/* 2. Total Pages Printed */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Pages Printed</span>
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">
                  {liveStats.colorRatio}% Color
                </span>
              </div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {historicalData.reduce((acc, curr) => acc + curr.totalPages, 0).toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>B&W: {historicalData.reduce((acc, curr) => acc + curr.bwPages, 0).toLocaleString()}</span>
                <span>Color: {historicalData.reduce((acc, curr) => acc + curr.colorPages, 0).toLocaleString()}</span>
              </div>
            </div>

            {/* 3. Paper Sheets & Duplex Efficiency */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-500" />
                  <span>Physical Sheets</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  {liveStats.duplexEfficiency}% Duplex
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {historicalData.reduce((acc, curr) => acc + curr.sheets, 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Saved {liveStats.duplexPagesSaved * 3} sheets via double-sided printing
              </p>
            </div>

            {/* 4. Estimated Toner / Ink Depleted */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Ink / Toner Used</span>
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[10px] font-bold">
                  {historicalData.reduce((acc, curr) => acc + curr.colorInk, 0).toFixed(1)} ml
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {historicalData.reduce((acc, curr) => acc + curr.blackInk, 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">grams K</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Gross Volume Revenue: ${historicalData.reduce((acc, curr) => acc + curr.revenue, 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Metric Sub-Tabs Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] pr-2">Chart Focus:</span>
            
            <button
              type="button"
              onClick={() => setMetricFocus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                metricFocus === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Overall Volume & Job Flow
            </button>

            <button
              type="button"
              onClick={() => setMetricFocus('ink')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                metricFocus === 'ink'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ink & Toner Depletion</span>
            </button>

            <button
              type="button"
              onClick={() => setMetricFocus('paper')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                metricFocus === 'paper'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Paper & Media Breakdown</span>
            </button>

            <button
              type="button"
              onClick={() => setMetricFocus('printers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                metricFocus === 'printers'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardware Spooler Load</span>
            </button>
          </div>

          {/* MAIN CHART VISUALIZATION AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left/Main Column: Recharts Primary Interactive Chart (2 Columns Wide on large screens) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {metricFocus === 'all' && `Throughput Trends (${timeRange === 'daily_7d' ? 'Daily Volume' : timeRange === 'hourly_today' ? 'Hourly Activity' : timeRange === 'weekly_6w' ? 'Weekly Volume' : 'Monthly Volume'})`}
                  {metricFocus === 'ink' && 'Ink & Toner Depletion Forecast (K, C, M, Y)'}
                  {metricFocus === 'paper' && 'Daily Physical Paper & Sheet Usage'}
                  {metricFocus === 'printers' && 'Local Print Spooler Dispatched Load'}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {historicalData.length} data points
                </span>
              </div>

              {/* Chart Container */}
              <div className="h-72 w-full bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60">
                {metricFocus === 'all' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={historicalData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bwGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLOR_PALETTE.bwPages} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={COLOR_PALETTE.bwPages} stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLOR_PALETTE.colorPages} stopOpacity={0.5}/>
                          <stop offset="95%" stopColor={COLOR_PALETTE.colorPages} stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis 
                        dataKey="period" 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        tickLine={false} 
                      />
                      <YAxis 
                        yAxisId="left"
                        stroke="#94a3b8" 
                        fontSize={11} 
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#10b981" 
                        fontSize={11} 
                        tickLine={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      
                      {/* Area for B&W Pages */}
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="bwPages" 
                        name="B&W Pages" 
                        stroke={COLOR_PALETTE.bwPages} 
                        fill="url(#bwGradient)" 
                        strokeWidth={2}
                      />
                      
                      {/* Area for Color Pages */}
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="colorPages" 
                        name="Color Pages" 
                        stroke={COLOR_PALETTE.colorPages} 
                        fill="url(#colorGradient)" 
                        strokeWidth={2}
                      />

                      {/* Bar for Physical Sheets */}
                      <Bar 
                        yAxisId="left"
                        dataKey="sheets" 
                        name="Sheets Used" 
                        fill="#8b5cf6" 
                        opacity={0.7} 
                        radius={[4, 4, 0, 0]} 
                        barSize={14}
                      />

                      {/* Line for Jobs Count on Right Axis */}
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="jobs" 
                        name="Job Count" 
                        stroke={COLOR_PALETTE.jobs} 
                        strokeWidth={3}
                        dot={{ r: 4, fill: COLOR_PALETTE.jobs }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {metricFocus === 'ink' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      
                      <Bar dataKey="blackInk" name="Black Toner (g)" fill="#475569" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="colorInk" name="Color Ink (ml)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <ReferenceLine y={15} label="Daily High Alert" stroke="#ef4444" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {metricFocus === 'paper' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sheetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      
                      <Area type="monotone" dataKey="totalPages" name="Total Pages Output" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                      <Area type="monotone" dataKey="sheets" name="Physical Paper Sheets" stroke="#8b5cf6" fill="url(#sheetGradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {metricFocus === 'printers' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={printerUtilizationData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={120} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      
                      <Bar dataKey="pages" name="Pages Handled" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="jobs" name="Jobs Handled" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Right Column: Secondary Pie Chart & Supply Levels Breakdown */}
            <div className="space-y-4">
              
              {/* Paper Media Distribution Donut */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-violet-500" />
                    <span>Media & Paper Distribution</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">All Jobs</span>
                </div>

                <div className="h-40 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paperDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paperDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {liveStats.totalPages + 2620}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Pages</span>
                  </div>
                </div>

                {/* Paper Size Legend List */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  {paperDistributionData.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="truncate text-[10px]">{p.name.split(' ')[0]}</span>
                      </div>
                      <span className="font-mono font-bold text-[10px] text-slate-900 dark:text-slate-100">
                        {p.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Supply Alert / Tray Status Pill */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hardware Supply Alerts</span>
                  </span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('printers')}
                      className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:underline"
                    >
                      Manage Trays &rarr;
                    </button>
                  )}
                </div>

                {/* Progress bars for hardware supplies */}
                <div className="space-y-1.5">
                  {printers.slice(0, 2).map((printer) => (
                    <div key={printer.id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="truncate max-w-[150px] font-medium">{printer.name}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          Toner: {printer.blackTonerLevel}% | Tray: {printer.tray1Level}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden flex">
                        <div 
                          className={`h-full ${printer.blackTonerLevel < 25 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${printer.blackTonerLevel}%` }}
                          title={`Black Toner: ${printer.blackTonerLevel}%`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
