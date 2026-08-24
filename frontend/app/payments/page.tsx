"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

type Payment = {
  id: string;
  paymentReference: string;
  paymentDate: string;
  paymentMethod: string;
  amount: string;
  status: string;
  receiptReference: string | null;
  invoice: {
    id: string;
    invoiceNumber: string;
  } | null;
};

type PaymentSummary = {
  totalPaid: number;
  totalInvoiced: number;
  totalOutstanding: number;
  paymentCount: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatCurrency(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const METHOD_ICONS: Record<string, React.ReactNode> = {
  "Wire Transfer": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  "Credit Card": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPaymentsData() {
      try {
        if (!getActiveUserId()) {
          throw new Error("Customer configuration is missing.");
        }

        const headers = { "x-user-id": getActiveUserId() };

        const [paymentsRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/payments`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/payments/summary`, { headers }),
        ]);

        if (!paymentsRes.ok) throw new Error("Failed to load payment history.");
        if (!summaryRes.ok) throw new Error("Failed to load payment summary.");

        const paymentsData: Payment[] = await paymentsRes.json();
        const summaryData: PaymentSummary = await summaryRes.json();

        setPayments(paymentsData);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load payments.");
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentsData();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Financials" title="Payments" />
        <PageLoading message="Loading payment data…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Financials"
        title="Payments"
        subtitle="Track payment history, receipts, and outstanding balances."
        actions={
          <Link href="/payments/outstanding" className="btn btn-primary">
            Outstanding Payments →
          </Link>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorState title="Unable to load payments" message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* Summary metrics */}
          {summary && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Paid",
                  value: formatCurrency(summary.totalPaid),
                  color: "var(--success)",
                  iconBg: "var(--success-bg)",
                  iconColor: "var(--success)",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ),
                },
                {
                  label: "Total Invoiced",
                  value: formatCurrency(summary.totalInvoiced),
                  color: "var(--navy)",
                  iconBg: "var(--primary-soft)",
                  iconColor: "var(--primary)",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  ),
                },
                {
                  label: "Outstanding",
                  value: formatCurrency(summary.totalOutstanding),
                  color: summary.totalOutstanding > 0 ? "var(--danger)" : "var(--success)",
                  iconBg: summary.totalOutstanding > 0 ? "var(--danger-bg)" : "var(--success-bg)",
                  iconColor: summary.totalOutstanding > 0 ? "var(--danger)" : "var(--success)",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  ),
                },
                {
                  label: "Transactions",
                  value: summary.paymentCount.toString(),
                  color: "var(--primary)",
                  iconBg: "var(--primary-soft)",
                  iconColor: "var(--primary)",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  ),
                },
              ].map(({ label, value, color, iconBg, iconColor, icon }) => (
                <div key={label} className="metric-card">
                  <div className="flex items-start justify-between">
                    <p className="metric-label">{label}</p>
                    <div
                      className="metric-icon"
                      style={{ background: iconBg, color: iconColor }}
                    >
                      {icon}
                    </div>
                  </div>
                  <p className="metric-value" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Payment History Table */}
          {payments.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                }
                title="No payments recorded"
                body="Payment activity will appear here once transactions are processed."
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="card hidden overflow-hidden md:block">
                <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] px-6 py-4">
                  <h2 className="section-heading">Payment History</h2>
                  <span className="text-xs text-[#667085]">
                    {payments.length} transaction{payments.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment Ref</th>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th className="text-right">Amount</th>
                        <th>Status</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="font-bold text-[#0B1220]">
                            {payment.paymentReference}
                          </td>
                          <td>
                            {payment.invoice ? (
                              <Link
                                href={`/invoices/${payment.invoice.id}`}
                                className="font-semibold text-[#2563EB] hover:underline"
                              >
                                {payment.invoice.invoiceNumber}
                              </Link>
                            ) : (
                              <span className="text-[#667085]">—</span>
                            )}
                          </td>
                          <td className="text-[#667085]">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td>
                            <span className="flex items-center gap-1.5 text-[#344054]">
                              <span className="text-[#667085]">
                                {METHOD_ICONS[payment.paymentMethod] ?? null}
                              </span>
                              {payment.paymentMethod}
                            </span>
                          </td>
                          <td className="text-right font-bold" style={{ color: "var(--success)" }}>
                            +{formatCurrency(payment.amount)}
                          </td>
                          <td>
                            <StatusBadge status={payment.status} />
                          </td>
                          <td className="font-mono text-xs text-[#667085]">
                            {payment.receiptReference ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {payments.map((payment) => (
                  <div key={payment.id} className="card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#0B1220]">
                          {payment.paymentReference}
                        </p>
                        {payment.invoice && (
                          <Link
                            href={`/invoices/${payment.invoice.id}`}
                            className="mt-0.5 text-xs font-semibold text-[#2563EB] hover:underline"
                          >
                            {payment.invoice.invoiceNumber}
                          </Link>
                        )}
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-[#667085]">
                        {payment.paymentMethod} · {formatDate(payment.paymentDate)}
                      </p>
                      <p className="text-base font-bold" style={{ color: "var(--success)" }}>
                        +{formatCurrency(payment.amount)}
                      </p>
                    </div>
                    {payment.receiptReference && (
                      <p className="mt-2 text-xs font-mono text-[#667085]">
                        Ref: {payment.receiptReference}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
