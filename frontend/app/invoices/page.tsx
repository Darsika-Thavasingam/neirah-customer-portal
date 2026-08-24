"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) {
          throw new Error("Customer configuration is missing.");
        }

        const response = await fetch(`${API_BASE}/customer-portal/invoices`, {
          headers: { "x-user-id": getActiveUserId() },
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

  const totalInvoiced = invoices.reduce((s, i) => s + getAmount(i), 0);
  const totalPaid = invoices.reduce((s, i) => s + getPaid(i), 0);
  const totalOutstanding = Math.max(totalInvoiced - totalPaid, 0);
  const outstandingCount = invoices.filter(
    (i) => i.status !== "PAID" && getAmount(i) > 0
  ).length;
  const paidCount = invoices.filter((i) => i.status === "PAID").length;

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader
          kicker="Billing & Invoices"
          title="Financial Overview"
        />
        <PageLoading message="Loading invoices…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Billing & Invoices"
        title="Financial Overview"
        subtitle="Manage your invoices and track payment history."
      />

      {error && (
        <div className="mb-6">
          <ErrorState title="Unable to load invoices" message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* Financial metrics — matching the approved 3-card layout */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {/* Total Invoiced */}
            <div className="metric-card">
              <div className="flex items-start justify-between">
                <p className="metric-label">Total Invoiced</p>
                <div className="metric-icon bg-[#EAF2FF] text-[#2563EB]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="15" x2="12" y2="15"/>
                  </svg>
                </div>
              </div>
              <p className="metric-value">{formatCurrency(totalInvoiced)}</p>
              <p className="mt-1 text-xs text-[#667085]">
                {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Total Paid */}
            <div className="metric-card">
              <div className="flex items-start justify-between">
                <p className="metric-label">Total Paid</p>
                <div className="metric-icon bg-[#ECFDF5] text-[#067647]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <p className="metric-value" style={{ color: "var(--success)" }}>
                {formatCurrency(totalPaid)}
              </p>
              <p className="mt-1 text-xs text-[#667085]">
                {paidCount} paid
              </p>
            </div>

            {/* Outstanding */}
            <div className="metric-card">
              <div className="flex items-start justify-between">
                <p className="metric-label">Outstanding Balance</p>
                <div
                  className="metric-icon"
                  style={{
                    background:
                      totalOutstanding > 0 ? "var(--danger-bg)" : "var(--success-bg)",
                    color:
                      totalOutstanding > 0 ? "var(--danger)" : "var(--success)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
              </div>
              <p
                className="metric-value"
                style={{
                  color:
                    totalOutstanding > 0
                      ? "var(--danger)"
                      : "var(--success)",
                }}
              >
                {formatCurrency(totalOutstanding)}
              </p>
              <p className="mt-1 text-xs text-[#667085]">
                {outstandingCount} outstanding
              </p>
            </div>
          </div>

          {/* Main two-col layout like approved design */}
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            {/* Invoice list */}
            <div>
              {invoices.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="15" x2="12" y2="15"/>
                      </svg>
                    }
                    title="No invoices found"
                    body="Your invoices will appear here once they have been issued."
                  />
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] px-6 py-4">
                    <h2 className="section-heading">Invoices</h2>
                    <Link
                      href="/payments/outstanding"
                      className="btn btn-primary btn-sm"
                    >
                      Outstanding
                    </Link>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Project</th>
                          <th>Date</th>
                          <th>Due Date</th>
                          <th className="text-right">Amount</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => {
                          const isOverdue =
                            invoice.status !== "PAID" &&
                            new Date(invoice.dueDate) < new Date();

                          return (
                            <tr key={invoice.id}>
                              <td className="font-bold text-[#0B1220]">
                                {invoice.invoiceNumber}
                              </td>
                              <td>
                                <p className="text-sm font-medium text-[#0B1220]">
                                  {invoice.project?.name || "—"}
                                </p>
                                {invoice.project?.projectCode && (
                                  <p className="text-xs text-[#667085]">
                                    {invoice.project.projectCode}
                                  </p>
                                )}
                              </td>
                              <td className="text-[#667085]">
                                {formatDate(invoice.invoiceDate)}
                              </td>
                              <td
                                className={
                                  isOverdue
                                    ? "font-semibold text-[#B42318]"
                                    : "text-[#667085]"
                                }
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
                                  className="text-xs font-semibold text-[#2563EB] hover:underline"
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

                  {/* Mobile cards */}
                  <div className="flex flex-col gap-3 p-4 md:hidden">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="card-inner p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#0B1220]">
                              {invoice.invoiceNumber}
                            </p>
                            <p className="mt-0.5 text-xs text-[#667085]">
                              {invoice.project?.name || "—"}
                            </p>
                          </div>
                          <StatusBadge status={invoice.status} />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-[#667085]">
                            Due {formatDate(invoice.dueDate)}
                          </p>
                          <p className="text-sm font-bold text-[#2563EB]">
                            LKR {formatAmount(getAmount(invoice))}
                          </p>
                        </div>
                        <div className="mt-3">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="btn btn-primary btn-sm w-full"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: actions */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <h2 className="section-heading mb-4">Quick Actions</h2>
                <div className="flex flex-col gap-2">
                  <Link href="/payments/outstanding" className="btn btn-ghost w-full justify-start">
                    View Outstanding
                  </Link>
                  <Link href="/payments" className="btn btn-ghost w-full justify-start">
                    Payment History
                  </Link>
                  <Link href="/quotations" className="btn btn-ghost w-full justify-start">
                    View Quotations
                  </Link>
                </div>
              </div>

              <div className="card p-5">
                <p className="meta-label mb-3">Summary</p>
                <dl className="space-y-3">
                  {[
                    {
                      label: "Total Invoices",
                      value: invoices.length,
                      color: "text-[#0B1220]",
                    },
                    {
                      label: "Paid",
                      value: paidCount,
                      color: "text-[#067647]",
                    },
                    {
                      label: "Outstanding",
                      value: outstandingCount,
                      color: outstandingCount > 0 ? "text-[#B42318]" : "text-[#0B1220]",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5 last:border-0 last:pb-0">
                      <dt className="text-xs font-medium text-[#667085]">{label}</dt>
                      <dd className={`text-lg font-bold ${color}`}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}