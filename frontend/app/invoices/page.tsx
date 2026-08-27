"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  balanceAmount?: string | number;
  status: string;
  project?: {
    id: string;
    projectCode: string;
    name: string;
  };
};

const API_BASE = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return apiUrl.endsWith("/api/v1")
    ? apiUrl
    : `${apiUrl.replace(/\/$/, "")}/api/v1`;
})();

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getActiveUserId();
        if (!userId) {
          throw new Error("Customer configuration is missing.");
        }

        const response = await fetch(`${API_BASE}/customer-portal/invoices`, {
          headers: { "x-user-id": userId },
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to fetch invoices");

        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load invoices."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getAmount = (invoice: Invoice) => {
    const amount = invoice.totalAmount ?? invoice.balanceAmount ?? 0;
    const n = Number(amount);
    return Number.isNaN(n) ? 0 : n;
  };

  const getPaid = (invoice: Invoice) => {
    const n = Number(invoice.paidAmount ?? 0);
    return Number.isNaN(n) ? 0 : n;
  };

  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((s, i) => s + getAmount(i), 0);
    const totalPaid = invoices.reduce((s, i) => s + getPaid(i), 0);
    const totalOutstanding = Math.max(totalInvoiced - totalPaid, 0);
    const outstandingCount = invoices.filter(
      (i) => i.status !== "PAID" && getAmount(i) > 0
    ).length;
    const paidCount = invoices.filter((i) => i.status === "PAID").length;
    return { totalInvoiced, totalPaid, totalOutstanding, outstandingCount, paidCount };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.project && inv.project.name.toLowerCase().includes(q)) ||
        (inv.project && inv.project.projectCode.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedStatus !== "ALL") {
        const norm = inv.status.toUpperCase();
        if (selectedStatus === "PAID" && norm !== "PAID") return false;
        if (selectedStatus === "UNPAID" && norm === "PAID") return false;
        if (selectedStatus === "OVERDUE" && norm !== "OVERDUE") return false;
      }
      return true;
    });
  }, [invoices, searchQuery, selectedStatus]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader
          kicker="Billing & Financials"
          title="Financial Overview"
        />
        <PageLoading message="Loading billing statements…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      {/* Hero Visual Header Banner */}
      <PageHeader
        kicker="BILLING LEDGER"
        title="Financial Overview & Invoices"
        subtitle="Commercial billing statements, interim valuation certificates, and real-time payment history across your active construction projects."
        bgImage="/images/project-residential.png"
        actions={
          <Link
            href="/payments/outstanding"
            className="btn btn-primary btn-sm shrink-0 shadow-lg py-2 px-3.5 rounded-xl font-bold text-xs"
          >
            ⚠️ Outstanding Balances ({stats.outstandingCount})
          </Link>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorState title="Unable to load invoices" message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* Executive KPI Summary — Borderless Horizontal Stats Bar */}
          <div className="mb-8 border-y border-slate-200 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-x divide-slate-100 sm:divide-slate-200 mb-4">
              <div className="flex flex-col justify-center">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] block mb-1">Total Invoiced</span>
                <span className="text-xl sm:text-2xl font-black text-[#0B1220]">{formatCurrency(stats.totalInvoiced)}</span>
                <span className="text-[0.68rem] font-bold text-[#667085]">{invoices.length} statement{invoices.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#067647] block mb-1">Paid</span>
                <span className="text-xl sm:text-2xl font-black text-[#067647]">{formatCurrency(stats.totalPaid)}</span>
                <span className="text-[0.68rem] font-bold text-[#067647]">{stats.paidCount} fully paid</span>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#B42318] block mb-1">Balance Due</span>
                <span className="text-xl sm:text-2xl font-black" style={{ color: stats.totalOutstanding > 0 ? "#B42318" : "#067647" }}>{formatCurrency(stats.totalOutstanding)}</span>
                <span className="text-[0.68rem] font-bold text-[#667085]">{stats.outstandingCount} pending</span>
              </div>
            </div>
            {/* Stacked bar */}
            {stats.totalInvoiced > 0 && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-slate-100">
                  <div className="h-full bg-[#10B981] transition-all duration-700" style={{ width: `${Math.round((stats.totalPaid / stats.totalInvoiced) * 100)}%` }} />
                  <div className="h-full bg-[#EF4444] transition-all duration-700" style={{ width: `${Math.round((stats.totalOutstanding / stats.totalInvoiced) * 100)}%` }} />
                </div>
                <span className="text-[0.68rem] font-extrabold text-[#667085] whitespace-nowrap">
                  {Math.round((stats.totalPaid / stats.totalInvoiced) * 100)}% settled
                </span>
              </div>
            )}
          </div>

          {/* Controls Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search by invoice number or project..."
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
                All ({invoices.length})
              </button>
              <button
                onClick={() => setSelectedStatus("PAID")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "PAID" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                Paid ({stats.paidCount})
              </button>
              <button
                onClick={() => setSelectedStatus("UNPAID")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "UNPAID" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                Unpaid ({stats.outstandingCount})
              </button>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
            <div>
              {filteredInvoices.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#667085]">
                  <EmptyState
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    }
                    title="No matching invoices found"
                    body="Try adjusting your search query or filter selection."
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredInvoices.map((invoice) => {
                    const isOverdue =
                      invoice.status !== "PAID" &&
                      new Date(invoice.dueDate) < new Date();

                    return (
                      <div
                        key={invoice.id}
                        className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Left: Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[0.68rem] font-mono font-bold text-[#2563EB] bg-[#EAF2FF] px-2 py-0.5 rounded-md">
                                {invoice.invoiceNumber}
                              </span>
                              <StatusBadge status={invoice.status} />
                              {isOverdue && (
                                <span className="rounded-md bg-red-50 border border-red-200 px-1.5 py-0.5 text-[0.65rem] font-bold text-red-700">OVERDUE</span>
                              )}
                            </div>
                            <h3 className="text-base font-extrabold text-[#0B1220] hover:text-[#2563EB] transition-colors truncate">
                              {invoice.project?.name || "—"}
                            </h3>
                            <p className="text-xs text-[#667085]">
                              {invoice.project?.projectCode} · Issued: {formatDate(invoice.invoiceDate)} · Due: {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                        </div>

                        {/* Right: Amount & Action */}
                        <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-left sm:text-right">
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#98A2B3] block">Amount Due</span>
                            <span className="text-base font-black text-[#0B1220]">LKR {formatAmount(getAmount(invoice))}</span>
                          </div>
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="btn btn-primary btn-sm rounded-xl py-2 px-3 shadow-md"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Controls */}
            <div className="flex flex-col gap-4">
              <div className="py-2">
                <h2 className="section-heading mb-3">Financial Shortcuts</h2>
                <div className="flex flex-col gap-2">
                  <Link href="/payments/outstanding" className="btn btn-primary btn-sm w-full text-center">
                    ⚠️ Outstanding Balances
                  </Link>
                  <Link href="/payments" className="btn btn-ghost btn-sm w-full text-center border border-slate-200">
                    💳 Payment History
                  </Link>
                  <Link href="/quotations" className="btn btn-ghost btn-sm w-full text-center border border-slate-200">
                    📄 Quotations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}