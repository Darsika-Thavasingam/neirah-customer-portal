"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchPaymentsData() {
      try {
        const userId = getActiveUserId();
        if (!userId) throw new Error("Customer configuration is missing.");

        const headers = { "x-user-id": userId };

        const [paymentsRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/payments`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/payments/summary`, { headers }),
        ]);

        if (!paymentsRes.ok) throw new Error("Failed to load payment history.");
        if (!summaryRes.ok) throw new Error("Failed to load payment summary.");

        const paymentsData: Payment[] = await paymentsRes.json();
        const summaryData: PaymentSummary = await summaryRes.json();

        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
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

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        p.paymentReference.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q) ||
        (p.invoice && p.invoice.invoiceNumber.toLowerCase().includes(q)) ||
        (p.receiptReference && p.receiptReference.toLowerCase().includes(q))
      );
    });
  }, [payments, searchQuery]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Financial Ledger" title="Payment Transactions" />
        <PageLoading message="Loading payment transactions…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      {/* Hero Visual Header Banner */}
      <PageHeader
        kicker="REMITTANCE HISTORY"
        title="Payment Ledger & Receipts"
        subtitle="Audit verified bank wire transfers, electronic receipts, and settled invoices across all project accounts."
        bgImage="/images/project-villa.png"
        actions={
          <Link href="/payments/outstanding" className="btn btn-primary btn-sm shrink-0 shadow-lg py-2 px-3.5 rounded-xl font-bold text-xs">
            ⚠️ Outstanding Balances →
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
          {summary && (
            <div className="mb-8 border-y border-slate-200 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-100 sm:divide-slate-200">
              <div className="flex flex-col justify-center">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#067647] block mb-1">Total Settled</span>
                <div className="text-xl sm:text-2xl font-black text-[#067647]">{formatCurrency(summary.totalPaid)}</div>
                <p className="text-[0.68rem] font-bold text-[#067647]">Verified Transfers</p>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] block mb-1">Total Invoiced</span>
                <div className="text-xl sm:text-2xl font-black text-[#0B1220]">{formatCurrency(summary.totalInvoiced)}</div>
                <p className="text-[0.68rem] font-bold text-[#667085]">Full Contract Billing</p>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#B42318] block mb-1">Outstanding</span>
                <div className="text-xl sm:text-2xl font-black text-[#B42318]">{formatCurrency(summary.totalOutstanding)}</div>
                <p className="text-[0.68rem] font-bold text-[#B42318]">Pending Remittance</p>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#2563EB] block mb-1">Transactions</span>
                <div className="text-xl sm:text-2xl font-black text-[#2563EB]">{summary.paymentCount}</div>
                <p className="text-[0.68rem] font-bold text-[#2563EB]">Ledger Entries</p>
              </div>
            </div>
          )}

          {/* Controls Toolbar */}
          <div className="mb-6 border-b border-slate-200 pb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by payment reference, receipt number, or invoice..."
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
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#667085]">
              <EmptyState
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                }
                title="No payments found"
                body="No transaction records match your search query."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment Ref</th>
                    <th>Invoice Reference</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th className="text-right">Amount Settled</th>
                    <th>Status</th>
                    <th>Receipt Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#F7F9FC]">
                      <td className="font-bold text-[#0B1220]">{payment.paymentReference}</td>
                      <td>
                        {payment.invoice ? (
                          <Link href={`/invoices/${payment.invoice.id}`} className="font-semibold text-[#2563EB] hover:underline">
                            {payment.invoice.invoiceNumber}
                          </Link>
                        ) : (
                          <span className="text-[#667085]">—</span>
                        )}
                      </td>
                      <td className="text-xs text-[#667085]">{formatDate(payment.paymentDate)}</td>
                      <td className="text-xs font-semibold text-[#0B1220]">{payment.paymentMethod}</td>
                      <td className="text-right font-bold text-[#067647]">+{formatCurrency(payment.amount)}</td>
                      <td><StatusBadge status={payment.status} /></td>
                      <td className="font-mono text-xs text-[#667085]">{payment.receiptReference ?? "—"}</td>
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
