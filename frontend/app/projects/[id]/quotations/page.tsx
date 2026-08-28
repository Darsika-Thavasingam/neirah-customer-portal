"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import StatusBadge from "../../../components/StatusBadge";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";
import { getDemoProjectById } from "../../../lib/demoData";
import { downloadExcelReport, downloadValidPdfFile } from "../../../lib/excelExporter";

type Quotation = {
  id: string;
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  total: string;
  status: string;
  scopeSummary?: string;
  approvedBy?: string;
};

const MOCK_DEMO_QUOTATIONS: Quotation[] = [
  {
    id: "q1",
    quotationNumber: "QT-2026-088",
    issueDate: "2026-04-15",
    validUntil: "2026-05-15",
    total: "45000000",
    status: "APPROVED",
    scopeSummary: "12-Story Structural Reinforced Concrete Superstructure & Façade Works",
    approvedBy: "Eng. Damith Perera (Managing Director)",
  },
  {
    id: "q2",
    quotationNumber: "QT-2026-102",
    issueDate: "2026-06-10",
    validUntil: "2026-07-10",
    total: "18500000",
    status: "SENT",
    scopeSummary: "MEP Central HVAC, Fire Suppression & Electrical First Fix Package",
    approvedBy: "Chief Quantity Surveyor",
  },
];

const RECORD_IMAGES = [
  "/images/project-commercial.png",
  "/images/project-residential.png",
  "/images/project-industrial.png",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(n || 0);
}

export default function ProjectQuotationsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};

        const projRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null);
        if (projRes) {
          if (!projRes.ok) {
            setError("Access Denied: You do not have permission to view this project's quotations.");
            setProject(null);
            setLoading(false);
            return;
          }
          const projData = await projRes.json();
          setProject(projData);

          const quotRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/quotations`, { headers, cache: "no-store" }).catch(() => null);
          const quotData = quotRes && quotRes.ok ? await quotRes.json() : [];
          setQuotations(Array.isArray(quotData) && quotData.length > 0 ? quotData : MOCK_DEMO_QUOTATIONS);
        } else {
          setProject(getDemoProjectById(projectId));
          setQuotations(MOCK_DEMO_QUOTATIONS);
        }
      } catch (err) {
        console.error(err);
        setError("Access Denied: Unable to fetch project quotations.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchData();
  }, [projectId]);

  const downloadQuotationPdf = (q: Quotation) => {
    downloadValidPdfFile(
      `${q.quotationNumber}_Commercial_Proposal.pdf`,
      `NEIRAH CONSTRUCTION OS - COMMERCIAL PROPOSAL ${q.quotationNumber}`,
      {
        "Project": project?.name || "Project",
        "Quotation Ref": q.quotationNumber,
        "Issue Date": formatDate(q.issueDate),
        "Valid Until": formatDate(q.validUntil),
        "Total Amount": formatAmount(q.total),
        "Status": q.status,
        "Approved By": q.approvedBy || "Chief QS",
        "Scope": q.scopeSummary || "Work Package BOQ",
      }
    );
  };

  const handleExportQuotationsExcel = (list: Quotation[] = quotations) => {
    downloadExcelReport(
      `${project?.name || "PROJECT"} QUOTATIONS EXTRACTION REPORT`,
      `${project?.name || "Project"}_Quotations_Export.xls`,
      [
        { header: "Quotation Ref", key: "quotationNumber" },
        { header: "Scope Summary", key: "scopeSummary" },
        { header: "Issue Date", key: "issueDate" },
        { header: "Valid Until", key: "validUntil" },
        { header: "Total Amount (LKR)", key: "total", style: "amount" },
        { header: "Approved By", key: "approvedBy" },
        { header: "Status", key: "status", style: "status-paid" },
      ],
      list
    );
  };

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project quotations…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-shell">
        <ErrorState title="Unable to load quotations" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project?.projectCode || ""} · QUOTATIONS`}
        title={project?.name || "Project Quotations"}
        subtitle={`Approved commercial proposals and itemized BOQ estimates.`}
        bgImage="/images/project-commercial.png"
        className="mb-0"
      />
      {project && <ProjectSubNav project={project} />}

      {/* Animated Visual Record List with High-Visibility Dividers & Hover Effects */}
      <div className="divide-y-2 divide-slate-300 border-y-2 border-slate-300 overflow-hidden bg-transparent">
        {quotations.map((q, idx) => {
          const sideImg = RECORD_IMAGES[idx % RECORD_IMAGES.length];
          return (
            <div
              key={q.id}
              onClick={() => setActiveQuotation(q)}
              className="p-5 cursor-pointer hover:bg-blue-50/60 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              {/* Side Thumbnail Image with Overlay */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#0B1220]">
                  <img
                    src={sideImg}
                    alt={q.quotationNumber}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[0.6rem] font-black text-white uppercase tracking-wider">
                    BOQ {idx + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.68rem] font-mono font-extrabold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                      {q.quotationNumber}
                    </span>
                    <StatusBadge status={q.status} />
                  </div>
                  <h3 className="text-sm font-black text-[#0B1220] hover:text-[#2563EB] transition-colors truncate">
                    {q.scopeSummary || "Commercial Work Package BOQ"}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[#667085]">
                    <span>📅 Issued: {formatDate(q.issueDate)}</span>
                    <span>•</span>
                    <span>⏳ Valid Until: {formatDate(q.validUntil)}</span>
                  </div>
                </div>
              </div>

              {/* Amount & Inspector Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto">
                <div className="text-left md:text-right">
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Proposal Valuation</span>
                  <span className="text-lg font-black text-[#0B1220]">{formatAmount(q.total)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportQuotationsExcel([q]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#067647] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shrink-0 inline-flex items-center gap-1"
                    title="Extract quotation record to Excel"
                  >
                    📊 XLSX
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadQuotationPdf(q);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shrink-0 inline-flex items-center gap-1"
                    title="Download quotation PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveQuotation(q);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm transition-all shrink-0 inline-flex items-center gap-1"
                  >
                    Inspect Proposal →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Quotation Inspection Modal */}
      {activeQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  {activeQuotation.quotationNumber}
                </span>
                <h3 className="text-base font-black text-[#0B1220] mt-1.5">{activeQuotation.scopeSummary}</h3>
              </div>
              <button
                onClick={() => setActiveQuotation(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-5 p-5 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[0.62rem] font-bold uppercase tracking-wider text-cyan-300">Total BOQ Valuation</span>
                <p className="text-2xl font-black text-white">{formatAmount(activeQuotation.total)}</p>
              </div>
              <StatusBadge status={activeQuotation.status} />
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date Issued:</span>
                <span className="font-bold text-slate-900">{formatDate(activeQuotation.issueDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Validity Expiry:</span>
                <span className="font-bold text-slate-900">{formatDate(activeQuotation.validUntil)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Approving Engineer:</span>
                <span className="font-semibold text-slate-900">{activeQuotation.approvedBy || "Chief Quantity Surveyor"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveQuotation(null)}
                className="btn btn-ghost btn-sm text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleExportQuotationsExcel([activeQuotation]);
                }}
                className="btn bg-[#067647] hover:bg-[#05603A] text-white btn-sm flex-1 text-xs font-bold"
              >
                📊 Extract XLSX
              </button>
              <button
                onClick={() => {
                  downloadQuotationPdf(activeQuotation);
                  setActiveQuotation(null);
                }}
                className="btn btn-primary btn-sm flex-1 text-xs font-bold shadow-lg"
              >
                📥 Download BOQ Document (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
