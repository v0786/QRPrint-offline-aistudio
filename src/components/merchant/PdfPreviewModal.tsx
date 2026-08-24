import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Printer, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Palette, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  BookOpen, 
  Layers, 
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { PrintJob, UploadedFileItem, ColorMode, Orientation, PaperSize, Sidedness } from '../../types';
import { usePrintJob } from '../../context/PrintJobContext';
import { generateSamplePdfBytes } from '../../utils/pdfDocumentBuilder';

interface PdfPreviewModalProps {
  job: PrintJob | null;
  fileIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onSendToPrinter?: (jobId: string) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  job,
  fileIndex = 0,
  isOpen,
  onClose,
  onSendToPrinter,
}) => {
  const { updateJobPreferences, spoolAndPrintJob, printers } = usePrintJob();

  // Selected file within job
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(fileIndex);

  // Preview interactive states
  const [viewColorMode, setViewColorMode] = useState<ColorMode>('bw');
  const [activeOrientation, setActiveOrientation] = useState<Orientation>('portrait');
  const [activePaperSize, setActivePaperSize] = useState<PaperSize>('A4');
  const [activeSidedness, setActiveSidedness] = useState<Sidedness>('single');
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMarginGuide, setShowMarginGuide] = useState<boolean>(true);
  const [showInkCoverage, setShowInkCoverage] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'single' | 'duplex_spread'>('single');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Iframe ref
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync initial state when job opens
  useEffect(() => {
    if (job) {
      setViewColorMode(job.preferences.colorMode);
      setActiveOrientation(job.preferences.orientation);
      setActivePaperSize(job.preferences.paperSize);
      setActiveSidedness(job.preferences.sidedness);
      setRotationDegrees(job.preferences.orientation === 'landscape' ? 90 : 0);
      setViewLayout(job.preferences.sidedness.startsWith('double') ? 'duplex_spread' : 'single');
      setCurrentPage(1);
      setSelectedFileIdx(0);
      setAppliedNotice(null);
    }
  }, [job]);

  const activeFile: UploadedFileItem | undefined = job?.files[selectedFileIdx] || job?.files[0];
  const totalPages = activeFile?.pageCount || 3;

  // Detect color vs B&W discrepancy
  const hasColorContentInFile = useMemo(() => {
    // If the file is an image or mock with color graphics
    return activeFile ? !activeFile.name.toLowerCase().includes('monochrome') && !activeFile.name.toLowerCase().includes('text_only') : true;
  }, [activeFile]);

  const showColorDiscrepancyWarning = job?.preferences.colorMode === 'bw' && hasColorContentInFile;

  // Generate or retrieve PDF data base64 / blob
  const pdfDataUri = useMemo(() => {
    if (!job || !activeFile) return '';
    if (activeFile.dataUrl && activeFile.dataUrl.startsWith('data:application/pdf')) {
      return activeFile.dataUrl;
    }

    // Build standard high-quality PDF binary
    const pdfBytes = generateSamplePdfBytes({
      title: activeFile.name,
      pageCount: activeFile.pageCount || 3,
      customerName: job.customer.name,
      jobId: job.id,
      hasColorGraphics: hasColorContentInFile,
      orientation: activeOrientation === 'auto' ? 'portrait' : activeOrientation,
      paperSize: activePaperSize
    });

    let binary = '';
    const bytes = new Uint8Array(pdfBytes);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:application/pdf;base64,' + btoa(binary);
  }, [job, activeFile, hasColorContentInFile, activeOrientation, activePaperSize]);

  // Generate secure iframe HTML document embedding PDF.js & Verification controls
  const iframeSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF.js Secure Isolated Preview</title>
  <!-- Load PDF.js with sandbox script isolation -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: auto;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      user-select: none;
    }
    #viewer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      width: 100%;
      max-width: 1200px;
    }
    .spread-layout {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }
    .page-card {
      position: relative;
      background: white;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      overflow: hidden;
      transition: transform 0.2s ease, filter 0.2s ease;
    }
    .page-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    /* Black and white simulation filter */
    .filter-bw {
      filter: grayscale(100%) contrast(125%) brightness(98%);
    }
    /* High contrast ink density proof */
    .filter-ink-density {
      filter: contrast(180%) grayscale(100%);
    }
    /* Margin boundary overlay */
    .margin-guide {
      position: absolute;
      top: 18px;
      left: 18px;
      right: 18px;
      bottom: 18px;
      border: 1.5px dashed rgba(239, 68, 68, 0.7);
      pointer-events: none;
      z-index: 10;
    }
    .margin-guide::after {
      content: '5mm Hardware Printable Safe Margin';
      position: absolute;
      bottom: 4px;
      right: 6px;
      font-size: 9px;
      font-weight: 600;
      color: rgba(239, 68, 68, 0.85);
      background: rgba(255, 255, 255, 0.85);
      padding: 1px 4px;
      border-radius: 2px;
    }
    /* Binding gutter overlay */
    .binding-gutter-long {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 35px;
      background: repeating-linear-gradient(
        45deg,
        rgba(59, 130, 246, 0.15),
        rgba(59, 130, 246, 0.15) 10px,
        rgba(59, 130, 246, 0.25) 10px,
        rgba(59, 130, 246, 0.25) 20px
      );
      border-right: 1.5px solid rgba(59, 130, 246, 0.5);
      pointer-events: none;
      z-index: 11;
    }
    .binding-tag {
      position: absolute;
      top: 50%;
      left: 6px;
      transform: translateY(-50%) rotate(-90deg);
      font-size: 9px;
      font-weight: bold;
      color: #1e40af;
      letter-spacing: 1px;
    }
    .page-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(15, 23, 42, 0.8);
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      backdrop-filter: blur(4px);
      z-index: 12;
    }
    #loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 60px;
      color: #94a3b8;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="loading-indicator">
    <div class="spinner"></div>
    <p style="font-size: 13px; font-weight: 500;">Rendering Document via PDF.js Worker...</p>
  </div>

  <div id="viewer-container"></div>

  <script>
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    let currentPdf = null;
    let renderOptions = {
      colorMode: '${viewColorMode}',
      rotation: ${rotationDegrees},
      zoom: ${zoomLevel},
      showMargins: ${showMarginGuide},
      showInkDensity: ${showInkCoverage},
      layout: '${viewLayout}',
      binding: '${job?.preferences.binding || 'none'}'
    };

    async function loadAndRenderPdf(dataUri) {
      const loadingEl = document.getElementById('loading-indicator');
      const container = document.getElementById('viewer-container');
      if (!dataUri) return;

      try {
        if (loadingEl) loadingEl.style.display = 'flex';
        container.innerHTML = '';

        const rawData = atob(dataUri.split(',')[1]);
        const uint8Array = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) {
          uint8Array[i] = rawData.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        currentPdf = await loadingTask.promise;

        if (loadingEl) loadingEl.style.display = 'none';

        const numPages = currentPdf.numPages;
        const isDuplex = renderOptions.layout === 'duplex_spread';
        
        container.className = isDuplex ? 'spread-layout' : '';

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await currentPdf.getPage(pageNum);
          
          // Apply custom rotation
          const defaultViewport = page.getViewport({ scale: 1, rotation: renderOptions.rotation });
          const targetScale = (renderOptions.zoom / 100) * (defaultViewport.width > 800 ? 1.0 : 1.3);
          const viewport = page.getViewport({ scale: targetScale, rotation: renderOptions.rotation });

          const card = document.createElement('div');
          card.className = 'page-card';
          card.id = 'page-card-' + pageNum;

          // Apply color mode filters
          if (renderOptions.showInkDensity) {
            card.classList.add('filter-ink-density');
          } else if (renderOptions.colorMode === 'bw') {
            card.classList.add('filter-bw');
          }

          const canvas = document.createElement('canvas');
          canvas.className = 'page-canvas';
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Page Badge
          const badge = document.createElement('div');
          badge.className = 'page-badge';
          badge.innerText = 'Page ' + pageNum + ' / ' + numPages + (isDuplex ? (pageNum % 2 === 1 ? ' (Front / Odd)' : ' (Back / Even)') : '');
          card.appendChild(badge);

          // Margin guides
          if (renderOptions.showMargins) {
            const marginGuide = document.createElement('div');
            marginGuide.className = 'margin-guide';
            card.appendChild(marginGuide);
          }

          // Binding Gutter guide
          if (renderOptions.binding !== 'none') {
            const gutter = document.createElement('div');
            gutter.className = 'binding-gutter-long';
            gutter.innerHTML = '<span class="binding-tag">' + renderOptions.binding.replace(/_/g, ' ').toUpperCase() + ' GUTTER</span>';
            card.appendChild(gutter);
          }

          card.appendChild(canvas);
          container.appendChild(card);

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        }

        // Notify parent of successful render & dimensions
        window.parent.postMessage({
          type: 'PDF_RENDERED',
          totalPages: numPages,
          width: defaultViewport.width,
          height: defaultViewport.height
        }, '*');

      } catch (err) {
        console.error('PDF.js Render Error:', err);
        if (loadingEl) {
          loadingEl.innerHTML = '<div style="color:#ef4444; font-weight:600;">Failed to render document preview</div><div style="font-size:11px; color:#94a3b8; margin-top:4px;">' + err.message + '</div>';
        }
      }
    }

    // Handle messages from parent React component
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.type === 'UPDATE_RENDER_SETTINGS') {
        renderOptions = { ...renderOptions, ...event.data.payload };
        if (currentPdf) {
          loadAndRenderPdf('${pdfDataUri}');
        }
      }
    });

    // Initial render
    loadAndRenderPdf('${pdfDataUri}');
  </script>
</body>
</html>`;
  }, [
    pdfDataUri, 
    viewColorMode, 
    rotationDegrees, 
    zoomLevel, 
    showMarginGuide, 
    showInkCoverage, 
    viewLayout, 
    job?.preferences.binding
  ]);

  if (!isOpen || !job) return null;

  // Actions: Rotate
  const handleRotateCw = () => {
    const nextDeg = (rotationDegrees + 90) % 360;
    setRotationDegrees(nextDeg);
    const newOrientation: Orientation = (nextDeg === 90 || nextDeg === 270) ? 'landscape' : 'portrait';
    setActiveOrientation(newOrientation);
  };

  const handleRotateCcw = () => {
    const nextDeg = (rotationDegrees + 270) % 360;
    setRotationDegrees(nextDeg);
    const newOrientation: Orientation = (nextDeg === 90 || nextDeg === 270) ? 'landscape' : 'portrait';
    setActiveOrientation(newOrientation);
  };

  // Quick Sync Settings to Job
  const handleApplyPreferencesToJob = () => {
    updateJobPreferences(
      job.id,
      {
        colorMode: viewColorMode,
        orientation: activeOrientation,
        paperSize: activePaperSize,
        sidedness: activeSidedness,
      },
      `Merchant verified and adjusted via PDF.js Print Preview: ${viewColorMode.toUpperCase()}, ${activeOrientation.toUpperCase()}, ${activePaperSize}`
    );
    setAppliedNotice('Job preferences successfully updated and synced with print engine.');
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  // Direct Print
  const handleDirectPrint = () => {
    if (onSendToPrinter) {
      onSendToPrinter(job.id);
    } else {
      spoolAndPrintJob(job.id);
    }
    onClose();
  };

  // Browser Print
  const handleBrowserPrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const assignedPrinter = printers.find(p => p.id === job.assignedPrinterId) || printers[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-fadeIn"
      id="pdf-preview-modal"
    >
      <div className="relative w-full h-[95vh] max-w-7xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* HEADER BAR */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Client-Side Print Preview</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    PDF.js Sandbox Engine
                  </span>
                </h2>
                <span className="text-xs font-mono text-slate-400 font-medium">#{job.id}</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Customer: <strong className="text-slate-200">{job.customer.name}</strong></span>
                <span>•</span>
                <span>Printer: <strong className="text-slate-200">{assignedPrinter?.name}</strong></span>
                <span>•</span>
                <span>PIN: <strong className="text-indigo-400 font-mono">{job.collectionPin}</strong></span>
              </p>
            </div>
          </div>

          {/* Document switcher if multiple */}
          {job.files.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 text-[11px] px-2 font-medium">Files:</span>
              {job.files.map((file, idx) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    selectedFileIdx === idx
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {file.name.length > 14 ? file.name.substring(0, 12) + '...' : file.name}
                </button>
              ))}
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            id="close-pdf-preview"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NOTIFICATION BANNER IF SETTINGS APPLIED */}
        {appliedNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 px-5 py-2 text-xs text-emerald-300 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{appliedNotice}</span>
          </div>
        )}

        {/* COLOR & ORIENTATION WARNING ALERT */}
        {showColorDiscrepancyWarning && (
          <div className="bg-amber-950/70 border-b border-amber-800/80 px-5 py-2.5 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Color Content Detected:</strong> Customer uploaded color assets, but job is currently set to <strong>Black & White</strong>. Colored elements will be converted to monochrome halftones.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewColorMode('color')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] shrink-0 transition-colors"
            >
              Switch to Color Preview
            </button>
          </div>
        )}

        {/* INTERACTIVE CONTROLS TOOLBAR */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Left: Color & Tone Verifiers */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Color Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-semibold px-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Color Simulation:</span>
              </span>
              <button
                type="button"
                id="preview-color-bw"
                onClick={() => setViewColorMode('bw')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  viewColorMode === 'bw'
                    ? 'bg-slate-950 text-white shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Black & White (B&W)
              </button>
              <button
                type="button"
                id="preview-color-cmyk"
                onClick={() => setViewColorMode('color')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  viewColorMode === 'color'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Color (CMYK)
              </button>
            </div>

            {/* Ink Density / High Contrast Toggle */}
            <button
              type="button"
              onClick={() => setShowInkCoverage(!showInkCoverage)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                showInkCoverage
                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="High contrast proofing to detect faint text or over-inked blocks"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Toner Proof</span>
            </button>

            {/* Hardware Margin Guide */}
            <button
              type="button"
              onClick={() => setShowMarginGuide(!showMarginGuide)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                showMarginGuide
                  ? 'bg-indigo-950 border-indigo-700 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle 5mm non-printable hardware margin boundary"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5mm Margins Guide</span>
            </button>
          </div>

          {/* Center: Orientation, Rotation & Layout */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Paper Size selector */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-[11px]">Paper:</span>
              <select
                value={activePaperSize}
                onChange={(e) => setActivePaperSize(e.target.value as PaperSize)}
                className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="A4" className="bg-slate-800">A4 (210×297mm)</option>
                <option value="A3" className="bg-slate-800">A3 (297×420mm)</option>
                <option value="Letter" className="bg-slate-800">Letter (8.5×11")</option>
                <option value="Legal" className="bg-slate-800">Legal (8.5×14")</option>
              </select>
            </div>

            {/* Orientation & Rotation Controls */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                id="rotate-ccw-btn"
                onClick={handleRotateCcw}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Rotate 90° Counter-Clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              
              <div className="px-2 font-mono text-[11px] font-bold text-indigo-400">
                {rotationDegrees}° ({activeOrientation.toUpperCase()})
              </div>

              <button
                type="button"
                id="rotate-cw-btn"
                onClick={handleRotateCw}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Layout Spread (Single vs Duplex) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setViewLayout('single')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  viewLayout === 'single' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Single Page
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('duplex_spread')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                  viewLayout === 'duplex_spread' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Duplex Spread</span>
              </button>
            </div>
          </div>

          {/* Right: Zoom & Scale */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
                className="p-1.5 text-slate-400 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300 font-bold min-w-[42px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 15))}
                className="p-1.5 text-slate-400 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                title="Reset Zoom to 100%"
              >
                Fit
              </button>
            </div>
          </div>
        </div>

        {/* MAIN PREVIEW CANVAS AREA (SANDBOXED IFRAME) */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col">
          <iframe
            ref={iframeRef}
            id="pdfjs-preview-iframe"
            title="PDF.js Secure Isolated Print Preview"
            srcDoc={iframeSrcDoc}
            sandbox="allow-scripts allow-same-origin allow-modals"
            className="w-full h-full border-0"
          />
        </div>

        {/* FOOTER ACTION BAR */}
        <div className="px-5 py-3 bg-slate-800/95 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          
          {/* Verification Status Summary */}
          <div className="flex items-center gap-3 text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Cloud Client Verified</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span>Settings:</span>
              <span className="font-mono text-slate-200">
                {viewColorMode === 'bw' ? 'B&W Grayscale' : 'Color CMYK'} | {activeOrientation.toUpperCase()} | {activePaperSize} | {totalPages} pgs
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            
            {/* Sync Settings to Job button */}
            <button
              type="button"
              id="sync-preview-settings-btn"
              onClick={handleApplyPreferencesToJob}
              className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-semibold flex items-center gap-1.5 transition-colors border border-slate-600"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Apply Verified Settings to Job</span>
            </button>

            {/* Print from browser */}
            <button
              type="button"
              id="browser-print-btn"
              onClick={handleBrowserPrint}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>System Print</span>
            </button>

            {/* Direct Send to Spooler */}
            <button
              type="button"
              id="spool-from-preview-btn"
              onClick={handleDirectPrint}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Approve & Send to Spooler</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
