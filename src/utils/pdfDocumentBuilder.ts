// Lightweight, zero-dependency PDF 1.4 Binary Document Builder
// Generates standard-compliant, multi-page vector PDF binaries for document preview & testing.

export interface PdfDocumentSpec {
  title: string;
  pageCount: number;
  customerName?: string;
  jobId?: string;
  hasColorGraphics?: boolean;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
}

export function generateSamplePdfBytes(spec: PdfDocumentSpec): Uint8Array {
  const {
    title = 'Document Preview',
    pageCount = 3,
    customerName = 'Customer',
    jobId = 'JOB-001',
    hasColorGraphics = true,
    orientation = 'portrait',
    paperSize = 'A4'
  } = spec;

  // Paper dimensions in PDF points (72 points = 1 inch)
  let width = 595.28; // A4 portrait
  let height = 841.89;

  if (paperSize === 'A3') {
    width = 841.89;
    height = 1190.55;
  } else if (paperSize === 'Letter') {
    width = 612.0;
    height = 792.0;
  } else if (paperSize === 'Legal') {
    width = 612.0;
    height = 1008.0;
  }

  if (orientation === 'landscape') {
    const temp = width;
    width = height;
    height = temp;
  }

  const objects: string[] = [];
  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length; // 1-indexed
  };

  // Object 1: Catalog
  // Object 2: Outlines
  // Object 3: Pages parent
  // Object 4..N: Fonts & Resources
  // Subsequent objects: Page and Content streams

  const catalogObjId = addObject('<< /Type /Catalog /Pages 3 0 R >>');
  const outlinesObjId = addObject('<< /Type /Outlines /Count 0 >>');

  const pageObjectIds: number[] = [];
  const fontObjId = 4; // We will define standard Helvetica

  // Prepare font object
  const fontHelveticaObjId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontHelveticaBoldObjId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // We will placeholder Pages object index (object #3)
  const pagesObjIndex = 2; // array index 2 is object 3

  for (let p = 1; p <= pageCount; p++) {
    // Generate page stream
    let stream = '';
    
    // Background border & header rule
    stream += `0.9 0.9 0.95 rg\n`;
    stream += `36 36 ${width - 72} ${height - 72} re f\n`;
    stream += `1 1 1 rg\n`;
    stream += `40 40 ${width - 80} ${height - 80} re f\n`;

    // Header bar
    if (hasColorGraphics) {
      stream += `0.2 0.35 0.8 rg\n`; // Indigo primary
    } else {
      stream += `0.2 0.2 0.2 rg\n`; // Dark gray
    }
    stream += `40 ${height - 90} ${width - 80} 50 re f\n`;

    // Header text
    stream += `BT\n/F2 16 Tf\n1 1 1 rg\n55 ${height - 65} Td\n(${sanitizePdfText(title)}) Tj\nET\n`;
    stream += `BT\n/F1 10 Tf\n0.9 0.9 1 rg\n55 ${height - 80} Td\n(Job ID: ${sanitizePdfText(jobId)}  |  Customer: ${sanitizePdfText(customerName)}  |  Page ${p} of ${pageCount}) Tj\nET\n`;

    // Body content sections
    stream += `BT\n/F2 12 Tf\n0.1 0.1 0.1 rg\n55 ${height - 120} Td\n(1. Document Structure & Print Verification Overview) Tj\nET\n`;

    stream += `BT\n/F1 10 Tf\n0.3 0.3 0.3 rg\n55 ${height - 140} Td\n(This document was rendered on the local PrintSpool Windows workstation.) Tj\n`;
    stream += `0 -15 Td\n(Physical Target: ${sanitizePdfText(paperSize)} (${orientation.toUpperCase()})  |  Hardware Margin: 5.0mm safe boundary.) Tj\n`;
    stream += `0 -15 Td\n(Verify that text alignment, bleed boundaries, and color profiles match customer order.) Tj\nET\n`;

    // Draw vector chart / graphic
    if (hasColorGraphics) {
      // Color boxes
      stream += `0.93 0.27 0.27 rg\n55 ${height - 240} 80 40 re f\n`; // Red
      stream += `0.13 0.65 0.47 rg\n145 ${height - 240} 80 40 re f\n`; // Green
      stream += `0.23 0.51 0.96 rg\n235 ${height - 240} 80 40 re f\n`; // Blue
      stream += `0.95 0.60 0.07 rg\n325 ${height - 240} 80 40 re f\n`; // Amber

      stream += `BT\n/F1 9 Tf\n1 1 1 rg\n65 ${height - 220} Td\n(Cyan / Red) Tj\nET\n`;
      stream += `BT\n/F1 9 Tf\n1 1 1 rg\n155 ${height - 220} Td\n(Spot Green) Tj\nET\n`;
      stream += `BT\n/F1 9 Tf\n1 1 1 rg\n245 ${height - 220} Td\n(Rich Blue) Tj\nET\n`;
      stream += `BT\n/F1 9 Tf\n1 1 1 rg\n335 ${height - 220} Td\n(Process Gold) Tj\nET\n`;
    } else {
      // Monochrome boxes
      stream += `0.15 0.15 0.15 rg\n55 ${height - 240} 80 40 re f\n`;
      stream += `0.40 0.40 0.40 rg\n145 ${height - 240} 80 40 re f\n`;
      stream += `0.65 0.65 0.65 rg\n235 ${height - 240} 80 40 re f\n`;
      stream += `0.85 0.85 0.85 rg\n325 ${height - 240} 80 40 re f\n`;

      stream += `BT\n/F1 9 Tf\n1 1 1 rg\n65 ${height - 220} Td\n(100% K Tint) Tj\nET\n`;
      stream += `BT\n/F1 9 Tf\n1 1 1 rg\n155 ${height - 220} Td\n(60% Halftone) Tj\nET\n`;
      stream += `BT\n/F1 9 Tf\n0 0 0 rg\n245 ${height - 220} Td\n(35% Gray) Tj\nET\n`;
      stream += `BT\n/F1 9 Tf\n0 0 0 rg\n335 ${height - 220} Td\n(15% Tint) Tj\nET\n`;
    }

    // Data table section
    stream += `BT\n/F2 11 Tf\n0.1 0.1 0.1 rg\n55 ${height - 270} Td\n(2. Specification Verification Matrix) Tj\nET\n`;
    
    // Table lines
    stream += `0.8 0.8 0.8 RG\n1 w\n`;
    stream += `55 ${height - 280} m ${width - 55} ${height - 280} l S\n`;
    stream += `55 ${height - 305} m ${width - 55} ${height - 305} l S\n`;
    stream += `55 ${height - 330} m ${width - 55} ${height - 330} l S\n`;
    stream += `55 ${height - 355} m ${width - 55} ${height - 355} l S\n`;

    stream += `BT\n/F2 9 Tf\n0.2 0.2 0.2 rg\n60 ${height - 295} Td\n(Parameter) Tj\n150 0 Td\n(Requested Setting) Tj\n150 0 Td\n(Renderer Status) Tj\nET\n`;
    
    stream += `BT\n/F1 9 Tf\n0.3 0.3 0.3 rg\n`;
    stream += `60 ${height - 320} Td\n(Color Space) Tj\n150 0 Td\n(${hasColorGraphics ? 'CMYK 4-Color' : 'Monochrome 1-Bit'}) Tj\n150 0 Td\n(Calibrated & Verified) Tj\n`;
    stream += `-300 -25 Td\n(Orientation) Tj\n150 0 Td\n(${orientation.toUpperCase()}) Tj\n150 0 Td\n(Zero-distortion fit) Tj\n`;
    stream += `-300 -25 Td\n(Hardware Margins) Tj\n150 0 Td\n(5.00 mm Standard) Tj\n150 0 Td\n(Safe inside printable area) Tj\nET\n`;

    // Footer
    stream += `BT\n/F1 8 Tf\n0.5 0.5 0.5 rg\n55 55 Td\n(CONFIDENTIAL - PrintSpool Local Host Daemon - SHA256 Verified - Page ${p} of ${pageCount}) Tj\nET\n`;

    // Content stream object
    const streamBytes = new TextEncoder().encode(stream);
    const contentObjId = addObject(`<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`);

    // Page object
    const pageObjId = addObject(
      `<< /Type /Page /Parent 3 0 R /MediaBox [0 0 ${width.toFixed(2)} ${height.toFixed(2)}] ` +
      `/Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontHelveticaObjId} 0 R /F2 ${fontHelveticaBoldObjId} 0 R >> >> >>`
    );
    pageObjectIds.push(pageObjId);
  }

  // Update object 3 (Pages)
  const kidsStr = pageObjectIds.map(id => `${id} 0 R`).join(' ');
  objects[pagesObjIndex] = `<< /Type /Pages /Kids [${kidsStr}] /Count ${pageCount} >>`;

  // Build full PDF file with cross-reference table (xref)
  let pdfOutput = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdfOutput.length);
    pdfOutput += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdfOutput.length;
  pdfOutput += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdfOutput += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }

  pdfOutput += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new TextEncoder().encode(pdfOutput);
}

function sanitizePdfText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
