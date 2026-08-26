"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

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

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

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
    const totalValue = quotations.reduce((acc, q) => acc + (parseFloat(q.total) || 0), 0);
    return { total, accepted, sent, totalValue };
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
        actions={
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1 rounded-2xl">
            <button
              onClick={() => setViewMode("GRID")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "GRID" ? "bg-[#2563EB] text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "TABLE" ? "bg-[#2563EB] text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Table View
            </button>
          </div>
        }
      />

      {error && (
        <ErrorState title="Unable to load quotations" message={error} />
      )}

      {!error && (
        <>
          {/* Executive KPI Summary — Borderless Horizontal Stats Bar */}
          <div className="mb-8 border-y border-slate-200 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-100 sm:divide-slate-200">
            <div className="flex flex-col justify-center">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] block mb-1">Total Proposals</span>
              <div className="text-2xl font-black text-[#0B1220]">{stats.total}</div>
              <p className="text-[0.68rem] font-bold text-[#667085]">Prepared Estimates</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#067647] block mb-1">Accepted</span>
              <div className="text-2xl font-black text-[#067647]">{stats.accepted}</div>
              <p className="text-[0.68rem] font-bold text-[#067647]">Approved Contracts</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#2563EB] block mb-1">Under Review</span>
              <div className="text-2xl font-black text-[#2563EB]">{stats.sent}</div>
              <p className="text-[0.68rem] font-bold text-[#2563EB]">Sent & Pending</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#D97706] block mb-1">Total Value</span>
              <div className="text-xl font-black text-[#B45309] truncate">
                LKR {formatAmount(stats.totalValue)}
              </div>
              <p className="text-[0.68rem] font-bold text-[#D97706]">Total Quotation Value</p>
            </div>
          </div>

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
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                }
                title="No quotations found"
                body="No quotation estimates match your current search or filter criteria."
              />
            </div>
          ) : viewMode === "GRID" ? (
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

                    <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="meta-label block">Total Valuation</span>
                        <span className="text-base font-black text-[#0B1220]">LKR {formatAmount(quotation.total)}</span>
                      </div>
                      <Link
                        href={`/quotations/${quotation.id}`}
                        className="btn btn-primary btn-sm rounded-xl py-2 px-3 shadow-md"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quotation #</th>
                    <th>Project</th>
                    <th>Date</th>
                    <th>Valid Until</th>
                    <th className="text-right">Total Amount</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-[#F7F9FC]">
                      <td>
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="font-bold text-[#2563EB] hover:underline"
                        >
                          {quotation.quotationNumber}
                        </Link>
                      </td>
                      <td>
                        <p className="font-semibold text-[#0B1220]">
                          {quotation.project.name}
                        </p>
                        <p className="text-xs text-[#667085]">
                          {quotation.project.projectCode}
                        </p>
                      </td>
                      <td className="text-xs text-[#667085]">
                        {formatDate(quotation.date)}
                      </td>
                      <td className="text-xs text-[#667085]">
                        {formatDate(quotation.validUntil)}
                      </td>
                      <td className="text-right font-bold text-[#0B1220]">
                        LKR {formatAmount(quotation.total)}
                      </td>
                      <td>
                        <StatusBadge status={quotation.status} />
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="btn btn-primary btn-sm hover-lift"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}