"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { PageLoading } from "../../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";

type OutstandingInvoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  outstandingAmount: number;
  daysOverdue: number;
  status: string;
  project: { id: string; projectCode: string; name: string };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function fmt(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function curr(n: number | null | undefined) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 2 }).format(Number(n) || 0);
}

export default function OutstandingPaymentsPage() {
  const [invoices, setInvoices] = useState<OutstandingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch_() {
      try {
        const uid = getActiveUserId();
        if (!uid) throw new Error("No user configured.");
        const res = await fetch(`${API_BASE_URL}/api/v1/customer-portal/invoices/outstanding`, {
          headers: { "x-user-id": uid }, cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch outstanding invoices.");
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (e: any) { setError(e.message || "Failed to load."); }
      finally { setLoading(false); }
    }
    fetch_();
  }, []);

  const totalOutstanding = invoices.reduce((s, i) => s + Number(i.outstandingAmount), 0);
  const overdueCount = invoices.filter(i => i.daysOverdue > 0).length;
  const overdueTotal = invoices.filter(i => i.daysOverdue > 0).reduce((s, i) => s + Number(i.outstandingAmount), 0);

  if (loading) return <div className="page-shell"><PageLoading message="Loading outstanding balances…" /></div>;

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/invoices" className="back-link mb-6 inline-flex">← Back to Invoices</Link>

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#0B1220] p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-[#0B1220]/80 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-wider text-red-300 mb-1">Balance Management</p>
            <h1 className="text-2xl font-black text-white">Outstanding Payments</h1>
            <p className="text-xs text-slate-300 mt-0.5">Invoices with outstanding balances requiring payment.</p>
          </div>
          {overdueCount > 0 && (
            <div className="shrink-0 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-black text-red-300">{overdueCount}</p>
              <p className="text-[0.65rem] font-bold text-red-400">Overdue</p>
            </div>
          )}
        </div>
      </div>

      {error && <ErrorState title="Unable to load" message={error} backHref="/invoices" backLabel="Back to Invoices" />}

      {!error && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-black text-[#0B1220]">{invoices.length}</p>
              <p className="text-[0.65rem] font-bold text-[#667085] mt-0.5">Unpaid Invoices</p>
            </div>
            <div className="card p-4 text-center border-red-100" style={{ background: "#FEF3F2" }}>
              <p className="text-2xl font-black text-[#B42318]">{curr(totalOutstanding)}</p>
              <p className="text-[0.65rem] font-bold text-[#667085] mt-0.5">Total Outstanding</p>
            </div>
            <div className="card p-4 text-center border-orange-100" style={{ background: "#FFFBEB" }}>
              <p className="text-2xl font-black text-[#B45309]">{curr(overdueTotal)}</p>
              <p className="text-[0.65rem] font-bold text-[#667085] mt-0.5">Overdue Amount</p>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="card p-10">
              <EmptyState
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 14l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>}
                title="No Outstanding Balances"
                body="All your invoices are fully paid. Great financial health!"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map(inv => {
                const isOverdue = inv.daysOverdue > 0;
                const pct = inv.total > 0 ? Math.min(Math.round((Number(inv.paidAmount) / Number(inv.total)) * 100), 100) : 0;
                return (
                  <div key={inv.id} className={`card p-5 card-hover ${isOverdue ? "bg-[#FEF3F2]/50 border-l-4 border-l-[#B42318]" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-xs font-mono font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                            {inv.invoiceNumber}
                          </span>
                          <StatusBadge status={inv.status} />
                          {isOverdue && (
                            <span className="text-[0.6rem] font-black bg-red-100 text-[#B42318] px-2 py-0.5 rounded-md">
                              {inv.daysOverdue}d OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-extrabold text-[#0B1220]">{inv.project.name}</p>
                        <p className="text-xs text-[#667085] mt-0.5">{inv.project.projectCode}</p>
                        <div className="flex gap-4 mt-2 text-xs text-[#98A2B3]">
                          <span>Invoice: <span className="font-bold text-[#475467]">{fmt(inv.invoiceDate)}</span></span>
                          <span className={`font-bold ${isOverdue ? "text-[#B42318]" : "text-[#475467]"}`}>Due: {fmt(inv.dueDate)}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[0.65rem] font-bold text-[#98A2B3] uppercase">Outstanding</p>
                        <p className={`text-lg font-black ${isOverdue ? "text-[#B42318]" : "text-[#0B1220]"}`}>{curr(inv.outstandingAmount)}</p>
                        <p className="text-xs text-[#667085]">of {curr(inv.total)}</p>
                      </div>
                    </div>

                    {/* Payment progress */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[0.65rem] mb-1">
                        <span className="text-[#667085]">Paid: {curr(inv.paidAmount)}</span>
                        <span className="font-bold text-[#0B1220]">{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#067647] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Link href={`/invoices/${inv.id}`} className="btn btn-primary btn-sm text-xs rounded-xl py-2 px-3">
                        View Invoice →
                      </Link>
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
