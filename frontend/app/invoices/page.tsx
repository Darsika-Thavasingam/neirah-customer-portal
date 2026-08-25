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
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-3xl bg-[#0B1220] shadow-md">
        <img
          src="/images/project-residential.png"
          alt="Financial Statements"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-white/90 px-2.5 py-1 rounded-md shadow-2xs">
              Billing Ledger
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Financial Overview & Invoices
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Commercial billing statements, interim valuation certificates, and real-time payment history across your active construction projects.
            </p>
          </div>
          <Link
            href="/payments/outstanding"
            className="btn btn-primary btn-sm hover-lift shrink-0 shadow-lg"
          >
            ⚠️ Outstanding Balances ({stats.outstandingCount})
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState title="Unable to load invoices" message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* Executive Metric Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="metric-card card-hover hover-lift shimmer-card">
              <div className="flex items-start justify-between">
                <span className="metric-label">Total Invoiced</span>
                <div className="metric-icon bg-[#EAF2FF] text-[#2563EB]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              </div>
              <div className="metric-value">{formatCurrency(stats.totalInvoiced)}</div>
              <p className="mt-1 text-xs text-[#667085]">
                {invoices.length} Total Statement{invoices.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="metric-card card-hover hover-lift shimmer-card">
              <div className="flex items-start justify-between">
                <span className="metric-label">Total Settled</span>
                <div className="metric-icon bg-[#ECFDF5] text-[#067647]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <div className="metric-value text-[#067647]">
                {formatCurrency(stats.totalPaid)}
              </div>
              <p className="mt-1 text-xs text-[#067647]">
                {stats.paidCount} Fully Paid Invoices
              </p>
            </div>

            <div className="metric-card card-hover hover-lift shimmer-card">
              <div className="flex items-start justify-between">
                <span className="metric-label">Outstanding Balance</span>
                <div className="metric-icon bg-[#FEF3F2] text-[#B42318]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  </svg>
                </div>
              </div>
              <div className="metric-value text-[#B42318]">
                {formatCurrency(stats.totalOutstanding)}
              </div>
              <p className="mt-1 text-xs text-[#B42318]">
                {stats.outstandingCount} Pending Collections
              </p>
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="mb-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-2xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`tab-btn ${selectedStatus === "ALL" ? "tab-btn-active" : ""}`}
              >
                All ({invoices.length})
              </button>
              <button
                onClick={() => setSelectedStatus("PAID")}
                className={`tab-btn ${selectedStatus === "PAID" ? "tab-btn-active" : ""}`}
              >
                Paid ({stats.paidCount})
              </button>
              <button
                onClick={() => setSelectedStatus("UNPAID")}
                className={`tab-btn ${selectedStatus === "UNPAID" ? "tab-btn-active" : ""}`}
              >
                Unpaid ({stats.outstandingCount})
              </button>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div>
              {filteredInvoices.length === 0 ? (
                <div className="card">
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
                <div className="card overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Project</th>
                        <th>Issue Date</th>
                        <th>Due Date</th>
                        <th className="text-right">Total Amount</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => {
                        const isOverdue =
                          invoice.status !== "PAID" &&
                          new Date(invoice.dueDate) < new Date();

                        return (
                          <tr key={invoice.id} className="hover:bg-[#F7F9FC]">
                            <td className="font-bold text-[#2563EB]">
                              <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                                {invoice.invoiceNumber}
                              </Link>
                            </td>
                            <td>
                              <p className="text-sm font-semibold text-[#0B1220]">
                                {invoice.project?.name || "—"}
                              </p>
                              {invoice.project?.projectCode && (
                                <p className="text-xs text-[#667085]">
                                  {invoice.project.projectCode}
                                </p>
                              )}
                            </td>
                            <td className="text-xs text-[#667085]">
                              {formatDate(invoice.invoiceDate)}
                            </td>
                            <td
                              className={`text-xs ${
                                isOverdue
                                  ? "font-semibold text-[#B42318]"
                                  : "text-[#667085]"
                              }`}
                            >
                              {formatDate(invoice.dueDate)}
                            </td>
                            <td className="text-right font-bold text-[#0B1220]">
                              LKR {formatAmount(getAmount(invoice))}
                            </td>
                            <td>
                              <StatusBadge status={invoice.status} />
                            </td>
                            <td className="text-right">
                              <Link
                                href={`/invoices/${invoice.id}`}
                                className="btn btn-primary btn-sm hover-lift"
                              >
                                View →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar Controls */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <h2 className="section-heading mb-4">Financial Shortcuts</h2>
                <div className="flex flex-col gap-2">
                  <Link href="/payments/outstanding" className="btn btn-primary btn-sm w-full text-center hover-lift">
                    ⚠️ View Outstanding Receivables
                  </Link>
                  <Link href="/payments" className="btn btn-ghost btn-sm w-full text-center hover-lift">
                    💳 Payment Ledger History
                  </Link>
                  <Link href="/quotations" className="btn btn-ghost btn-sm w-full text-center hover-lift">
                    📄 Commercial Quotations
                  </Link>
                </div>
              </div>

              <div className="card p-5">
                <span className="meta-label mb-3 block">Billing Summary</span>
                <dl className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-2">
                    <dt className="text-[#667085]">Total Invoices</dt>
                    <dd className="font-bold text-[#0B1220]">{invoices.length}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-2">
                    <dt className="text-[#667085]">Fully Settled</dt>
                    <dd className="font-bold text-[#067647]">{stats.paidCount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#667085]">Pending Action</dt>
                    <dd className="font-bold text-[#B42318]">{stats.outstandingCount}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}