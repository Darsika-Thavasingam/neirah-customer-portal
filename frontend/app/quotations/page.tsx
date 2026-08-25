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
      {/* Hero Visual Header */}
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-3xl bg-[#0B1220] shadow-md">
        <img
          src="/images/project-industrial.png"
          alt="Commercial Proposals"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-white/90 px-2.5 py-1 rounded-md shadow-2xs">
              Commercial Estimations
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Project Quotations & BOQs
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Itemized cost estimates, structural bills of quantities, and formal commercial proposals for active engineering developments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("GRID")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "GRID" ? "bg-[#2563EB] text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "TABLE" ? "bg-[#2563EB] text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {error && (
        <ErrorState title="Unable to load quotations" message={error} />
      )}

      {!error && (
        <>
          {/* Executive KPI Summary */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Total Proposals</span>
              <div className="metric-value">{stats.total}</div>
              <p className="mt-1 text-xs text-[#667085]">Prepared Estimates</p>
            </div>
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Accepted</span>
              <div className="metric-value text-[#067647]">{stats.accepted}</div>
              <p className="mt-1 text-xs text-[#067647]">Approved Contracts</p>
            </div>
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Under Review</span>
              <div className="metric-value text-[#2563EB]">{stats.sent}</div>
              <p className="mt-1 text-xs text-[#2563EB]">Sent & Pending</p>
            </div>
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Total Quoted Value</span>
              <div className="metric-value text-sm sm:text-base text-[#0B1220] truncate">
                LKR {formatAmount(stats.totalValue)}
              </div>
              <p className="mt-1 text-xs text-[#667085]">Total Quotation Value</p>
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="mb-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-2xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`tab-btn ${selectedStatus === "ALL" ? "tab-btn-active" : ""}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedStatus("ACCEPTED")}
                className={`tab-btn ${selectedStatus === "ACCEPTED" ? "tab-btn-active" : ""}`}
              >
                Accepted ({stats.accepted})
              </button>
              <button
                onClick={() => setSelectedStatus("SENT")}
                className={`tab-btn ${selectedStatus === "SENT" ? "tab-btn-active" : ""}`}
              >
                Sent ({stats.sent})
              </button>
            </div>
          </div>

          {/* Quotations List / Cards */}
          {filteredQuotations.length === 0 ? (
            <div className="card">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuotations.map((quotation) => (
                <div key={quotation.id} className="card card-hover hover-lift shimmer-card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-[#2563EB] bg-[#EAF2FF] px-2.5 py-1 rounded-lg border border-blue-200">
                        {quotation.quotationNumber}
                      </span>
                      <StatusBadge status={quotation.status} />
                    </div>

                    <h3 className="text-sm font-bold text-[#0B1220]">{quotation.project.name}</h3>
                    <p className="text-xs text-[#667085] mt-0.5">{quotation.project.projectCode}</p>

                    <div className="mt-4 rounded-xl bg-[#F8FAFC] p-3 border border-[rgba(15,23,42,0.06)]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#667085]">Quoted Date:</span>
                        <span className="font-semibold text-[#0B1220]">{formatDate(quotation.date)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#667085]">Valid Until:</span>
                        <span className="font-semibold text-[#0B1220]">{formatDate(quotation.validUntil)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(15,23,42,0.08)] flex items-center justify-between">
                    <div>
                      <span className="meta-label block">Total Valuation</span>
                      <span className="text-sm font-bold text-[#0B1220]">LKR {formatAmount(quotation.total)}</span>
                    </div>
                    <Link
                      href={`/quotations/${quotation.id}`}
                      className="btn btn-primary btn-sm hover-lift"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
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