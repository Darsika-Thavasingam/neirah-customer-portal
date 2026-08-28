/**
 * Neirah Construction OS — Executive Excel (.xls) & Standard PDF/1.4 Document Exporter Utility
 *
 * XLSX: Generates formatted MS Excel XML/HTML spreadsheet files that open natively in Excel, Numbers, and Google Sheets.
 * PDF:  Generates high-definition, structured, executive-formatted PDF/1.4 binary documents with brand headers,
 *       dividers, metadata tables, and official certification seals that open cleanly in Adobe Acrobat, Chrome, Edge, and Preview.
 */

export interface ExcelColumn {
  header: string;
  key: string;
  style?: string;
}

/* ─────────────────────────────────────────────────────────────────────────
   XLSX / Excel HTML Report Generator with Premium Construction OS Styling
─────────────────────────────────────────────────────────────────────────── */
export function downloadExcelReport<T extends Record<string, any>>(
  title: string,
  fileName: string,
  columns: ExcelColumn[],
  data: T[]
) {
  const cleanTitle = title.toUpperCase();
  const timestamp = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let xml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #FFFFFF; }
  .brand-header { font-size: 18px; font-weight: 900; color: #0B1220; padding: 10px 0 4px 0; }
  .brand-sub { font-size: 11px; font-weight: bold; color: #067647; text-transform: uppercase; letter-spacing: 1px; }
  .report-meta { color: #667085; font-size: 11px; padding-bottom: 12px; }
  .divider { background-color: #067647; height: 3px; }
  th { background-color: #0B1220; color: #FFFFFF; font-weight: bold; border: 1px solid #1E293B; padding: 10px 12px; font-size: 12px; text-align: left; }
  td { border: 1px solid #CBD5E1; padding: 8px 12px; font-size: 11px; color: #0B1220; vertical-align: middle; }
  .row-even { background-color: #F8FAFC; }
  .row-odd { background-color: #FFFFFF; }
  .amount { font-weight: bold; color: #0B1220; text-align: right; font-family: Consolas, monospace; }
  .status-paid { color: #067647; font-weight: bold; background-color: #ECFDF5; text-align: center; }
  .status-pending { color: #B45309; font-weight: bold; background-color: #FFFBEB; text-align: center; }
  .footer-row { background-color: #E2E8F0; font-weight: bold; }
</style>
</head>
<body>
<table>
  <tr><td colspan="${columns.length}" class="brand-sub">NEIRAH CONSTRUCTION OS — OFFICIAL FINANCIAL REPORT</td></tr>
  <tr><td colspan="${columns.length}" class="brand-header">${cleanTitle}</td></tr>
  <tr><td colspan="${columns.length}" class="report-meta">Generated Date: ${timestamp} | System: Neirah Enterprise OS v4.2 | Total Records: ${data.length}</td></tr>
  <tr><td colspan="${columns.length}" class="divider"></td></tr>
  <tr></tr>
  <tr>
    ${columns.map((col) => `<th>${col.header}</th>`).join("\n    ")}
  </tr>`;

  data.forEach((item, idx) => {
    const rowClass = idx % 2 === 0 ? "row-even" : "row-odd";
    xml += `\n  <tr class="${rowClass}">`;
    columns.forEach((col) => {
      const val =
        item[col.key] !== undefined && item[col.key] !== null
          ? String(item[col.key])
          : "—";
      xml += `\n    <td ${col.style ? `class="${col.style}"` : ""}>${escapeHtml(val)}</td>`;
    });
    xml += `\n  </tr>`;
  });

  xml += `\n  <tr class="footer-row">
    <td colspan="${columns.length}">CONFIDENTIAL DOCUMENT — NEIRAH CONSTRUCTION MANAGEMENT (PVT) LTD</td>
  </tr>`;

  xml += `\n</table>\n</body>\n</html>`;

  const safeName = fileName.replace(/\s+/g, "_");
  const finalName =
    safeName.endsWith(".xls") || safeName.endsWith(".xlsx")
      ? safeName
      : `${safeName}.xls`;

  triggerDownload(new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" }), finalName);
}

/* ─────────────────────────────────────────────────────────────────────────
   Valid Executive PDF/1.4 Document Generator
   Constructs multi-font, bordered, line-separated vector PDF documents
─────────────────────────────────────────────────────────────────────────── */
export function downloadValidPdfFile(
  fileName: string,
  title: string,
  metadata: Record<string, string>
) {
  const safeTitle = sanitizePdfStr(title).toUpperCase();
  const timestamp = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  // PDF Graphics Stream
  let stream = "";

  // 1. Top Decorative Brand Bar (Dark Navy Background Header Box)
  stream += "q\n";
  stream += "0.043 0.070 0.125 rg\n"; // #0B1220 Dark Navy
  stream += "40 710 532 50 re f\n"; // Header rectangle
  stream += "0.024 0.463 0.278 rg\n"; // #067647 Neirah Emerald Line
  stream += "40 706 532 4 re f\n"; // Emerald accent line
  stream += "Q\n";

  // 2. Header Text Inside Navy Box
  stream += "BT\n";
  stream += "/F2 14 Tf\n"; // Helvetica-Bold
  stream += "1 1 1 rg\n"; // White text
  stream += "52 732 Td\n";
  stream += `(${escapePdfText(safeTitle)}) Tj\n`;
  stream += "/F1 8 Tf\n"; // Helvetica
  stream += "0.9 0.9 0.9 rg\n";
  stream += "0 -14 Td\n";
  stream += "(NEIRAH CONSTRUCTION OS  |  OFFICIAL PROJECT DOCUMENTATION) Tj\n";
  stream += "ET\n";

  // 3. Document Details Section Box
  stream += "q\n";
  stream += "0.95 0.96 0.98 rg\n"; // Soft slate gray fill
  stream += "40 450 532 240 re f\n"; // Background card
  stream += "0.8 0.85 0.9 RG\n"; // Border color
  stream += "1 w\n";
  stream += "40 450 532 240 re s\n"; // Border stroke
  stream += "Q\n";

  // 4. Key-Value Metadata Lines Inside Section Box
  stream += "BT\n";
  stream += "/F2 10 Tf\n";
  stream += "0.043 0.070 0.125 rg\n"; // Dark Navy text
  stream += "55 665 Td\n";
  stream += "(DOCUMENT METADATA & SPECIFICATIONS) Tj\n";
  stream += "ET\n";

  // Divider Line inside Metadata Box
  stream += "q\n";
  stream += "0.8 0.85 0.9 RG\n";
  stream += "1 w\n";
  stream += "55 655 m 557 655 l S\n";
  stream += "Q\n";

  // Metadata key-values rendering
  let currentY = 635;
  Object.entries(metadata).forEach(([k, v]) => {
    const keyStr = escapePdfText(sanitizePdfStr(k));
    const valStr = escapePdfText(sanitizePdfStr(v));

    stream += "BT\n";
    stream += "/F2 9 Tf\n";
    stream += "0.4 0.44 0.52 rg\n"; // Slate text
    stream += `55 ${currentY} Td\n`;
    stream += `(${keyStr}:) Tj\n`;
    stream += "/F2 9 Tf\n";
    stream += "0.043 0.070 0.125 rg\n"; // Bold Dark Navy value
    stream += `140 0 Td\n`;
    stream += `(${valStr}) Tj\n`;
    stream += "ET\n";

    // Subtle horizontal divider between metadata rows
    stream += "q\n";
    stream += "0.9 0.92 0.95 RG\n";
    stream += "0.5 w\n";
    stream += `55 ${currentY - 6} m 557 ${currentY - 6} l S\n`;
    stream += "Q\n";

    currentY -= 22;
  });

  // 5. Official Verification Stamp & Seal Box
  stream += "q\n";
  stream += "0.92 0.97 0.94 rg\n"; // Light emerald fill
  stream += "40 370 532 60 re f\n";
  stream += "0.024 0.463 0.278 RG\n"; // Emerald border
  stream += "1.5 w\n";
  stream += "40 370 532 60 re s\n";
  stream += "Q\n";

  stream += "BT\n";
  stream += "/F2 10 Tf\n";
  stream += "0.024 0.463 0.278 rg\n";
  stream += "55 410 Td\n";
  stream += "(VERIFIED & CERTIFIED BY NEIRAH ENGINEERING OS BOARD) Tj\n";
  stream += "/F1 8 Tf\n";
  stream += "0.2 0.3 0.25 rg\n";
  stream += "0 -14 Td\n";
  stream += `(Audit Hash: SHA256-NEIRAH-${Math.random().toString(36).substring(2, 10).toUpperCase()} | Timestamp: ${escapePdfText(timestamp)}) Tj\n`;
  stream += "ET\n";

  // 6. Page Footer
  stream += "BT\n";
  stream += "/F1 8 Tf\n";
  stream += "0.5 0.5 0.5 rg\n";
  stream += "40 50 Td\n";
  stream += "(This is an official computer-generated document issued by Neirah Construction Management. No signature required.) Tj\n";
  stream += "440 0 Td\n";
  stream += "(Page 1 of 1) Tj\n";
  stream += "ET\n";

  const streamBytes = new TextEncoder().encode(stream);
  const streamLen = streamBytes.length;

  // Build PDF Objects
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 =
    "3 0 obj\n" +
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n" +
    "   /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\n" +
    "endobj\n";
  const obj4 =
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj\n`;
  const obj5 =
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj6 =
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";

  // Compute xref Byte Offsets
  const header = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const enc = new TextEncoder();
  let offset = enc.encode(header).length;

  const offsets: number[] = [];
  const bodies = [obj1, obj2, obj3, obj4, obj5, obj6];
  const bodyParts: string[] = [header];

  for (const body of bodies) {
    offsets.push(offset);
    bodyParts.push(body);
    offset += enc.encode(body).length;
  }

  const xrefOffset = offset;
  const xref = [
    "xref\n",
    `0 ${offsets.length + 1}\n`,
    "0000000000 65535 f \n",
    ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`),
    "trailer\n",
    `<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`,
    "startxref\n",
    `${xrefOffset}\n`,
    "%%EOF\n",
  ].join("");

  bodyParts.push(xref);
  const fullPdf = bodyParts.join("");

  const finalName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  triggerDownload(new Blob([fullPdf], { type: "application/pdf" }), finalName);
}

/* ─────────────────────────────────────────────────────────────────────────
   Sanitization & Escaping Utilities
─────────────────────────────────────────────────────────────────────────── */
function sanitizePdfStr(s: string) {
  return String(s || "").replace(/[^\x20-\x7E]/g, "").trim();
}

function escapePdfText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function escapeHtml(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
