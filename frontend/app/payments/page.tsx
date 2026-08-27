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
            <div className="mb-8 border-y border-slate-200 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-200">
              <div className="flex flex-col justify-center">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#067647] block mb-1">Total Settled</span>
                <div className="text-xl sm:text-2xl font-black text-[#067647]">{formatCurrency(summary.totalPaid)}</div>
                <p className="text-[0.68rem] font-semibold text-[#067647]">Verified Transfers</p>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085] block mb-1">Total Invoiced</span>
                <div className="text-xl sm:text-2xl font-black text-[#0B1220]">{formatCurrency(summary.totalInvoiced)}</div>
                <p className="text-[0.68rem] font-semibold text-[#667085]">Full Contract Billing</p>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#2563EB] block mb-1">Outstanding</span>
                <div className="text-xl sm:text-2xl font-black text-[#2563EB]">{formatCurrency(summary.totalOutstanding)}</div>
                <p className="text-[0.68rem] font-semibold text-[#2563EB]">Pending Remittance</p>
              </div>
              <div className="flex flex-col justify-center pl-4">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085] block mb-1">Transactions</span>
                <div className="text-xl sm:text-2xl font-black text-[#0B1220]">{summary.paymentCount}</div>
                <p className="text-[0.68rem] font-semibold text-[#667085]">Ledger Entries</p>
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
            <div className="divide-y-2 divide-slate-300 border-y-2 border-slate-300 overflow-hidden bg-transparent">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 hover:bg-blue-50/30 transition-all duration-200 group"
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#067647" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-black text-[#067647]">{payment.paymentReference}</span>
                        <StatusBadge status={payment.status} />
                      </div>
                      <div className="text-sm font-bold text-[#0B1220] flex items-center gap-2">
                        <span>{payment.paymentMethod}</span>
                        {payment.invoice && (
                          <>
                            <span className="text-[#667085] font-normal">for</span>
                            <Link href={`/invoices/${payment.invoice.id}`} className="font-semibold text-[#2563EB] hover:underline">
                              {payment.invoice.invoiceNumber}
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[0.7rem] text-[#98A2B3]">
                        <span>📅 {formatDate(payment.paymentDate)}</span>
                        {payment.receiptReference && (
                          <>
                            <span>•</span>
                            <span>Receipt: {payment.receiptReference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="flex items-center gap-4 shrink-0 md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#98A2B3] block">Amount Settled</span>
                      <span className="text-base font-black text-[#067647]">+{formatCurrency(payment.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
