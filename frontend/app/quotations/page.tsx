"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";
import { downloadExcelReport, downloadValidPdfFile } from "../lib/excelExporter";

type Quotation = {
  id: string;
  quotationNumber: string;
  date: string;
  validUntil: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  status: string;
  documentUrl: string | null;
  project: {
    id: string;
    projectCode: string;
    name: string;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: string | number) {
  return Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function QuotationDistributionChart({ stats }: { stats: { total: number; accepted: number; sent: number; rejected: number; draft: number } }) {
  const segs = [
    { n: stats.accepted, color: "#067647", label: "Accepted" },
    { n: stats.sent, color: "#2563EB", label: "Under Review" },
    { n: stats.draft, color: "#667085", label: "Draft" },
    { n: stats.rejected, color: "#B42318", label: "Declined" },
  ].filter(s => s.n > 0);

  const total = stats.total || 1;
  const size = 120, sw = 16, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  let off = 0;

  return (
    <div className="mb-8 p-5 bg-[#EAF2FF] border border-blue-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#CBD5E1" strokeWidth={sw} />
            {segs.map((s, i) => {
              const dash = (s.n / total) * circ;
              const seg = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={sw}
                  strokeDasharray={`${Math.max(dash - 2, 0)} ${circ}`}
                  strokeDashoffset={-off}
                  strokeLinecap="round"
                />
              );
              off += dash;
              return seg;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-[#0B1220]">{stats.total}</span>
            <span className="text-[0.6rem] font-bold text-[#667085] uppercase">Proposals</span>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#0B1220] uppercase tracking-wider mb-2">Proposal Status Ratio</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {segs.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[#667085] font-semibold">{s.label}:</span>
                <strong className="text-[#0B1220]">{s.n}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-end justify-between gap-3 h-24 pt-2">
        {segs.map(s => {
          const pct = Math.round((s.n / total) * 100);
          return (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <span className="text-[0.65rem] font-bold text-[#0B1220]">{pct}%</span>
              <div className="w-full max-w-[32px] bg-blue-100/60 rounded-t-lg overflow-hidden flex items-end h-full p-0.5">
                <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${pct}%`, backgroundColor: s.color }} />
              </div>
              <span className="text-[0.65rem] font-semibold text-[#667085] truncate max-w-[60px] text-center">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    async function fetchQuotations() {
      try {
        const userId = getActiveUserId();
        if (!userId) {
          setError("Customer configuration is missing.");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/quotations`,
          { headers: { "x-user-id": userId } }
        );

        if (!response.ok) throw new Error("Failed to fetch quotations");

        const data: Quotation[] = await response.json();
        setQuotations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load quotations.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuotations();
  }, []);

  const stats = useMemo(() => {
    const total = quotations.length;
    const accepted = quotations.filter((q) => q.status.toUpperCase() === "ACCEPTED").length;
    const sent = quotations.filter((q) => q.status.toUpperCase() === "SENT" || q.status.toUpperCase() === "PENDING").length;
    const rejected = quotations.filter((q) => q.status.toUpperCase() === "REJECTED" || q.status.toUpperCase() === "DECLINED").length;
    const draft = quotations.filter((q) => q.status.toUpperCase() === "DRAFT").length;
    const totalValue = quotations.reduce((acc, q) => acc + (parseFloat(q.total) || 0), 0);
    return { total, accepted, sent, rejected, draft, totalValue };
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        q.quotationNumber.toLowerCase().includes(query) ||
        q.project.name.toLowerCase().includes(query) ||
        q.project.projectCode.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (selectedStatus !== "ALL") {
        const norm = q.status.toUpperCase();
        if (selectedStatus === "ACCEPTED" && norm !== "ACCEPTED") return false;
        if (selectedStatus === "SENT" && norm !== "SENT" && norm !== "PENDING") return false;
      }

      return true;
    });
  }, [quotations, searchQuery, selectedStatus]);

  const handleExportExcel = (list: Quotation[] = filteredQuotations) => {
    downloadExcelReport(
      "ALL QUOTATIONS FINANCIAL EXTRACTION REPORT",
      "Customer_Portal_Quotations_Export.xls",
      [
        { header: "Quotation Ref", key: "quotationNumber" },
        { header: "Project Code", key: "projectCode" },
        { header: "Project Name", key: "projectName" },
        { header: "Quoted Date", key: "date" },
        { header: "Valid Until", key: "validUntil" },
        { header: "Total Amount (LKR)", key: "total", style: "amount" },
        { header: "Status", key: "status", style: "status-paid" },
      ],
      list.map((q) => ({
        quotationNumber: q.quotationNumber,
        projectCode: q.project?.projectCode || "—",
        projectName: q.project?.name || "—",
        date: formatDate(q.date),
        validUntil: formatDate(q.validUntil),
        total: Number(q.total || 0),
        status: q.status,
      }))
    );
  };

  const handleDownloadQuotationPdf = (q: Quotation) => {
    downloadValidPdfFile(
      `${q.quotationNumber}_Estimate.pdf`,
      `NEIRAH CONSTRUCTION OS - COMMERCIAL ESTIMATE ${q.quotationNumber}`,
      {
        "Project": q.project?.name || "Project",
        "Quotation Ref": q.quotationNumber,
        "Issue Date": formatDate(q.date),
        "Valid Until": formatDate(q.validUntil),
        "Subtotal": `LKR ${formatAmount(q.subtotal)}`,
        "Total Valuation": `LKR ${formatAmount(q.total)}`,
        "Status": q.status,
      }
    );
  };

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Commercial" title="Project Quotations" />
        <PageLoading message="Loading commercial estimates…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker="COMMERCIAL ESTIMATIONS"
        title="Project Quotations & BOQs"
        subtitle="Itemized cost estimates, structural bills of quantities, and formal commercial proposals for active engineering developments."
        bgImage="/images/project-commercial.png"
      />
      {error && (
        <ErrorState title="Unable to load quotations" message={error} />
      )}

      {!error && (
        <>
          {/* Executive KPI Summary — Borderless Horizontal Stats Bar */}
          <div className="mb-8 border-y border-slate-200 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-200">
            <div className="flex flex-col justify-center">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085] block mb-1">Total Proposals</span>
              <div className="text-2xl font-black text-[#0B1220]">{stats.total}</div>
              <p className="text-[0.68rem] font-semibold text-[#667085]">Prepared Estimates</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#067647] block mb-1">Accepted</span>
              <div className="text-2xl font-black text-[#067647]">{stats.accepted}</div>
              <p className="text-[0.68rem] font-semibold text-[#067647]">Approved Contracts</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#2563EB] block mb-1">Under Review</span>
              <div className="text-2xl font-black text-[#2563EB]">{stats.sent}</div>
              <p className="text-[0.68rem] font-semibold text-[#2563EB]">Sent & Pending</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085] block mb-1">Total Value</span>
              <div className="text-xl font-black text-[#0B1220] truncate">
                LKR {formatAmount(stats.totalValue)}
              </div>
              <p className="text-[0.68rem] font-semibold text-[#667085]">Total Quotation Value</p>
            </div>
          </div>

          {/* Quotation Distribution & Ratio Visual Charts */}
          <QuotationDistributionChart stats={stats} />

          {/* Controls Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search by quotation number or project title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs py-2.5 pl-4 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#667085] hover:text-[#0B1220]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-2xl">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "ALL" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedStatus("ACCEPTED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "ACCEPTED" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                Accepted ({stats.accepted})
              </button>
              <button
                onClick={() => setSelectedStatus("SENT")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "SENT" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                Sent ({stats.sent})
              </button>
            </div>
          </div>

          {/* Quotations List / Cards */}
          {filteredQuotations.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#667085]">
              <EmptyState
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
                title="No quotations found"
                body="No quotation estimates match your current search or filter criteria."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredQuotations.map((quotation, idx) => {
                const sideImg = [
                  "/images/project-commercial.png",
                  "/images/project-residential.png",
                  "/images/project-industrial.png",
                ][idx % 3];

                return (
                  <div key={quotation.id} className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-[#0B1220]">
                        <img src={sideImg} alt="Thumbnail" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[0.68rem] font-mono font-bold text-[#2563EB] bg-[#EAF2FF] px-2 py-0.5 rounded-md">
                            {quotation.quotationNumber}
                          </span>
                          <StatusBadge status={quotation.status} />
                        </div>
                        <h3 className="text-base font-extrabold text-[#0B1220] hover:text-[#2563EB] transition-colors truncate">{quotation.project.name}</h3>
                        <p className="text-xs text-[#667085]">{quotation.project.projectCode} · Quoted: {formatDate(quotation.date)} · Valid: {formatDate(quotation.validUntil)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="meta-label block">Total Valuation</span>
                        <span className="text-base font-black text-[#0B1220]">LKR {formatAmount(quotation.total)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleExportExcel([quotation])}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#067647] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shrink-0 inline-flex items-center gap-1"
                          title="Extract quotation record to Excel"
                        >
                          📊 XLSX
                        </button>
                        <button
                          onClick={() => handleDownloadQuotationPdf(quotation)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shrink-0 inline-flex items-center gap-1"
                          title="Download quotation PDF"
                        >
                          📥 PDF
                        </button>
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm transition-all shrink-0 inline-flex items-center gap-1"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}