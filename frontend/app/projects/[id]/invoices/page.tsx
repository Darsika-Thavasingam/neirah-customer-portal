"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/PageHeader";
import StatusBadge from "../../../components/StatusBadge";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";
import { getDemoProjectById } from "../../../lib/demoData";
import { downloadExcelReport, downloadValidPdfFile } from "../../../lib/excelExporter";

type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  balanceAmount?: string | number;
  status: string;
  milestoneTitle?: string;
};

const MOCK_DEMO_INVOICES: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2026-001",
    issueDate: "2026-05-01",
    dueDate: "2026-05-31",
    totalAmount: 15000000,
    paidAmount: 15000000,
    balanceAmount: 0,
    status: "PAID",
    milestoneTitle: "Site Clearance & Excavation Milestone",
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2026-002",
    issueDate: "2026-07-01",
    dueDate: "2026-07-31",
    totalAmount: 30000000,
    paidAmount: 20000000,
    balanceAmount: 10000000,
    status: "PARTIALLY_PAID",
    milestoneTitle: "Structural Substructure & Core Wall Casting",
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
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(n || 0);
}

export default function ProjectInvoicesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};

        const projRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null);
        if (projRes) {
          if (!projRes.ok) {
            setError("Access Denied: You do not have permission to view this project's invoices.");
            setProject(null);
            setLoading(false);
            return;
          }
          const projData = await projRes.json();
          setProject(projData);

          const invRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/invoices`, { headers, cache: "no-store" }).catch(() => null);
          const invData = invRes && invRes.ok ? await invRes.json() : [];
          setInvoices(Array.isArray(invData) && invData.length > 0 ? invData : MOCK_DEMO_INVOICES);
        } else {
          setProject(getDemoProjectById(projectId));
          setInvoices(MOCK_DEMO_INVOICES);
        }
      } catch (err) {
        console.error(err);
        setError("Access Denied: Unable to fetch project invoices.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchData();
  }, [projectId]);

  const stats = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    invoices.forEach((inv) => {
      totalBilled += typeof inv.totalAmount === "number" ? inv.totalAmount : parseFloat(String(inv.totalAmount || 0));
      totalPaid += typeof inv.paidAmount === "number" ? inv.paidAmount : parseFloat(String(inv.paidAmount || 0));
    });
    return { totalBilled, totalPaid, outstanding: totalBilled - totalPaid };
  }, [invoices]);

  const handleDownloadInvoice = (inv: Invoice) => {
    const total = inv.totalAmount ?? inv.balanceAmount ?? 0;
    const paid = inv.paidAmount ?? 0;
    downloadValidPdfFile(
      `${inv.invoiceNumber}_Statement.pdf`,
      `NEIRAH CONSTRUCTION OS - INVOICE ${inv.invoiceNumber}`,
      {
        "Project": project?.name || "Project",
        "Invoice Number": inv.invoiceNumber,
        "Issue Date": formatDate(inv.issueDate),
        "Due Date": formatDate(inv.dueDate),
        "Milestone": inv.milestoneTitle || "Progress Valuation",
        "Total Billed": formatAmount(total),
        "Amount Paid": formatAmount(paid),
        "Status": inv.status,
      }
    );
  };

  const handleExportInvoicesExcel = (list: Invoice[] = invoices) => {
    downloadExcelReport(
      `${project?.name || "PROJECT"} INVOICES EXTRACTION REPORT`,
      `${project?.name || "Project"}_Invoices_Export.xls`,
      [
        { header: "Invoice Number", key: "invoiceNumber" },
        { header: "Milestone Reference", key: "milestoneTitle" },
        { header: "Issue Date", key: "issueDate" },
        { header: "Due Date", key: "dueDate" },
        { header: "Total Amount (LKR)", key: "totalAmount", style: "amount" },
        { header: "Paid Amount (LKR)", key: "paidAmount", style: "amount" },
        { header: "Status", key: "status", style: "status-paid" },
      ],
      list.map((inv) => ({
        ...inv,
        totalAmount: inv.totalAmount ?? inv.balanceAmount ?? 0,
        paidAmount: inv.paidAmount ?? 0,
      }))
    );
  };

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project invoices…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-shell">
        <ErrorState title="Unable to load invoices" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project?.projectCode || ""} · BILLING LEDGER`}
        title={project?.name || "Project Invoices"}
        subtitle={`Certified progress valuations, billing certificates, and payment statements.`}
        bgImage="/images/project-residential.png"
        className="mb-0"
      />
      {project && <ProjectSubNav project={project} />}

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 bg-slate-100/40 p-3 rounded-xl border border-slate-200/50 shrink-0">
          <div>
            <span className="text-[0.62rem] font-bold text-[#667085] uppercase block tracking-wider">Total Billed</span>
            <span className="text-sm font-black text-[#0B1220]">{formatAmount(stats.totalBilled)}</span>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <span className="text-[0.62rem] font-bold text-emerald-700 uppercase block tracking-wider">Total Settled</span>
            <span className="text-sm font-black text-[#067647]">{formatAmount(stats.totalPaid)}</span>
          </div>
        </div>
      </div>

      {/* Animated Visual Record List with High-Visibility Dividers & Hover Effects */}
      <div className="divide-y-2 divide-slate-300 border-y-2 border-slate-300 overflow-hidden bg-transparent">
        {invoices.map((inv, idx) => {
          const sideImg = RECORD_IMAGES[idx % RECORD_IMAGES.length];
          const total = Number(inv.totalAmount ?? inv.balanceAmount ?? 0);
          const paid = Number(inv.paidAmount ?? 0);
          const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;

          return (
            <div
              key={inv.id}
              onClick={() => setActiveInvoice(inv)}
              className="p-5 cursor-pointer hover:bg-blue-50/60 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              {/* Side Image Thumbnail */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#0B1220]">
                  <img
                    src={sideImg}
                    alt={inv.invoiceNumber}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[0.6rem] font-black text-white uppercase tracking-wider">
                    INV {idx + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.68rem] font-mono font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {inv.invoiceNumber}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <h3 className="text-sm font-black text-[#0B1220] group-hover:text-[#2563EB] transition-colors truncate">
                    {inv.milestoneTitle || "Interim Progress Valuation Claim"}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[#667085]">
                    <span>📅 Issued: {formatDate(inv.issueDate)}</span>
                    <span>•</span>
                    <span>⏳ Due: {formatDate(inv.dueDate)}</span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="mt-2.5 max-w-xs">
                    <div className="flex justify-between text-[0.68rem] font-bold text-[#667085] mb-1">
                      <span>Paid Progress</span>
                      <span className="text-[#2563EB]">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#2563EB] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed Amount & Action */}
              <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#98A2B3] block">Billed Valuation</span>
                  <span className="text-lg font-black text-[#0B1220]">{formatAmount(total)}</span>
                  <span className="text-xs font-bold text-[#067647] block mt-0.5">Paid: {formatAmount(paid)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportInvoicesExcel([inv]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#067647] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shrink-0"
                    title="Extract invoice record to Excel"
                  >
                    📊 XLSX
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadInvoice(inv);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shrink-0"
                    title="Download invoice PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInvoice(inv);
                    }}
                    className="btn btn-primary btn-sm text-xs font-bold shadow-md group-hover:scale-105 transition"
                  >
                    🔍 Inspect Claim →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Details Inspector Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[0.65rem] font-bold text-blue-600 uppercase tracking-widest block">Interim Progress Valuation</span>
                <h3 className="text-base font-black text-[#0B1220]">{activeInvoice.invoiceNumber}</h3>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">Total Billed</span>
                <p className="text-2xl font-black text-white">{formatAmount(activeInvoice.totalAmount ?? activeInvoice.balanceAmount ?? 0)}</p>
              </div>
              <StatusBadge status={activeInvoice.status} />
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Issue Date:</span>
                <span className="font-bold text-slate-900">{formatDate(activeInvoice.issueDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Due Date:</span>
                <span className="font-bold text-slate-900">{formatDate(activeInvoice.dueDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Milestone Reference:</span>
                <span className="font-medium text-slate-900">{activeInvoice.milestoneTitle || "Stage Progress Valuation"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">{formatAmount(activeInvoice.paidAmount ?? 0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveInvoice(null)}
                className="btn btn-ghost btn-sm flex-1 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadInvoice(activeInvoice);
                  setActiveInvoice(null);
                }}
                className="btn btn-primary btn-sm flex-1 text-xs font-bold shadow-lg"
              >
                📥 Download Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
