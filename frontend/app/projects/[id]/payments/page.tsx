"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/PageHeader";
import StatusBadge from "../../../components/StatusBadge";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";
import { getDemoProjectById } from "../../../lib/demoData";

type Payment = {
  id: string;
  paymentReference: string;
  paymentDate: string;
  amount: string | number;
  paymentMethod: string;
  status: string;
  bankAccount?: string;
  verifiedBy?: string;
};

const MOCK_DEMO_PAYMENTS: Payment[] = [
  {
    id: "pay1",
    paymentReference: "PAY-SL-9921",
    paymentDate: "2026-05-15",
    amount: 15000000,
    paymentMethod: "Commercial Bank Wire Transfer",
    status: "CONFIRMED",
    bankAccount: "Commercial Bank LK-7728109283",
    verifiedBy: "Chief Financial Controller",
  },
  {
    id: "pay2",
    paymentReference: "PAY-SL-9984",
    paymentDate: "2026-07-20",
    amount: 20000000,
    paymentMethod: "Sampath Bank Wire Transfer",
    status: "CONFIRMED",
    bankAccount: "Sampath Bank LK-8812003921",
    verifiedBy: "Senior Accounting Officer",
  },
  {
    id: "pay3",
    paymentReference: "PAY-SL-0127",
    paymentDate: "2026-09-10",
    amount: 8500000,
    paymentMethod: "HNB Bank Transfer",
    status: "PENDING",
    bankAccount: "HNB LK-4490012837",
    verifiedBy: "Finance Department",
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(n || 0);
}

function formatAmountShort(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(0)}K`;
  return formatAmount(n);
}

/** Payment Bar Chart */
function PaymentBarChart({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) return null;

  const maxAmount = Math.max(...payments.map((p) => typeof p.amount === "string" ? parseFloat(p.amount) : Number(p.amount)));

  const barColors: Record<string, string> = {
    CONFIRMED: "#067647",
    VERIFIED: "#067647",
    PAID: "#067647",
    PENDING: "#B45309",
    PROCESSING: "#2563EB",
  };

  return (
    <div className="bg-[#EAF2FF] border border-[#BFDBFE] p-5 rounded-2xl">
      <p className="text-xs font-black uppercase tracking-wider text-[#667085] mb-4">Payment Amounts by Transaction</p>
      <div className="space-y-3">
        {payments.map((p, idx) => {
          const amount = typeof p.amount === "string" ? parseFloat(p.amount) : Number(p.amount);
          const widthPct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
          const color = barColors[p.status.toUpperCase()] || "#2563EB";
          return (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#475467] truncate max-w-[55%]">{p.paymentReference}</span>
                <span className="font-black text-[#0B1220] ml-2">{formatAmountShort(p.amount)}</span>
              </div>
              <div className="h-6 bg-[#F1F5F9] rounded-lg overflow-hidden relative">
                <div
                  className="h-full rounded-lg transition-all duration-700 flex items-center px-2"
                  style={{ width: `${widthPct}%`, background: color, minWidth: "48px" }}
                >
                  <span className="text-[0.6rem] font-black text-white whitespace-nowrap truncate">
                    {formatDate(p.paymentDate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-3 text-[0.65rem]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#067647]" />
          <span className="text-[#475467]">Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#B45309]" />
          <span className="text-[#475467]">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
          <span className="text-[#475467]">Processing</span>
        </div>
      </div>
    </div>
  );
}

/** Payment Status Donut */
function PaymentStatusChart({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) return null;

  const stats = [
    { label: "Confirmed", count: payments.filter((p) => ["CONFIRMED", "VERIFIED", "PAID"].includes(p.status.toUpperCase())).length, color: "#067647" },
    { label: "Pending", count: payments.filter((p) => p.status.toUpperCase() === "PENDING").length, color: "#B45309" },
    { label: "Processing", count: payments.filter((p) => p.status.toUpperCase() === "PROCESSING").length, color: "#2563EB" },
  ].filter((s) => s.count > 0);

  const total = payments.length;
  const size = 110;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = stats.map((s) => {
    const pct = s.count / total;
    const dash = Math.max(pct * circumference - 1, 0);
    const seg = { ...s, dash, gap: circumference - dash, offset };
    offset += pct * circumference;
    return seg;
  });

  const confirmedAmt = payments
    .filter((p) => ["CONFIRMED", "VERIFIED", "PAID"].includes(p.status.toUpperCase()))
    .reduce((sum, p) => sum + (typeof p.amount === "string" ? parseFloat(p.amount) : Number(p.amount)), 0);

  return (
    <div className="bg-[#EAF2FF] border border-[#BFDBFE] p-5 rounded-2xl">
      <p className="text-xs font-black uppercase tracking-wider text-[#667085] mb-4">Payment Status Overview</p>
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={-seg.offset}
                className="transition-all duration-700"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-black text-[#0B1220]">{total}</span>
            <span className="text-[0.6rem] text-[#667085] font-bold">Payments</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[#475467] flex-1">{s.label}</span>
              <span className="font-black text-[#0B1220]">{s.count}</span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-slate-100">
            <p className="text-[0.65rem] text-[#98A2B3] font-bold">CONFIRMED TOTAL</p>
            <p className="text-sm font-black text-[#067647]">{formatAmountShort(confirmedAmt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPaymentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePayment, setActivePayment] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};

        const projRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null);
        if (projRes) {
          if (!projRes.ok) {
            setError("Access Denied: You do not have permission to view this project's payments.");
            setProject(null);
            setLoading(false);
            return;
          }
          const projData = await projRes.json();
          setProject(projData);

          const payRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/payments`, { headers, cache: "no-store" }).catch(() => null);
          const payData = payRes && payRes.ok ? await payRes.json() : [];
          setPayments(Array.isArray(payData) && payData.length > 0 ? payData : MOCK_DEMO_PAYMENTS);
        } else {
          setProject(getDemoProjectById(projectId));
          setPayments(MOCK_DEMO_PAYMENTS);
        }
      } catch (err) {
        console.error(err);
        setError("Access Denied: Unable to fetch project payments.");
      } finally {
        setLoading(false);
      }
    }
    if (projectId) fetchData();
  }, [projectId]);

  const totalPaid = useMemo(() => {
    return payments
      .filter((p) => ["CONFIRMED", "VERIFIED", "PAID"].includes(p.status.toUpperCase()))
      .reduce((sum, p) => sum + (typeof p.amount === "string" ? parseFloat(p.amount) : Number(p.amount)), 0);
  }, [payments]);

  const totalAll = useMemo(() => {
    return payments.reduce((sum, p) => sum + (typeof p.amount === "string" ? parseFloat(p.amount) : Number(p.amount)), 0);
  }, [payments]);

  const downloadReceipt = (p: Payment) => {
    const textContent = `NEIRAH CONSTRUCTION OS - OFFICIAL PAYMENT REMITTANCE RECEIPT\n----------------------------------------------------\nReceipt Ref: ${p.paymentReference}\nPayment Date: ${formatDate(p.paymentDate)}\nRemitted Amount: ${formatAmount(p.amount)}\nMethod: ${p.paymentMethod}\nBank Account: ${p.bankAccount || "Commercial Bank Escrow"}\nVerified By: ${p.verifiedBy || "Chief Accounting Officer"}\nStatus: VERIFIED & CONFIRMED\n----------------------------------------------------\nOfficial electronic receipt generated for project ${project?.name || "Customer Project"}.`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.paymentReference}_Receipt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading payment transactions…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-shell">
        <ErrorState title="Unable to load payments" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project?.projectCode || ""} · REMITTANCES`}
        title={project?.name || "Project Payments"}
        subtitle={`Verified bank wire receipts and escrow payment confirmations.`}
        bgImage="/images/project-villa.png"
        className="mb-0"
      />
      {project && <ProjectSubNav project={project} />}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <PaymentStatusChart payments={payments} />
        <PaymentBarChart payments={payments} />
      </div>

      {/* Payment Ledger List with High-Visibility Dividers & Hover Effects */}
      <div className="divide-y-2 divide-slate-300 border-y-2 border-slate-300 overflow-hidden bg-transparent">
        <div className="px-5 py-3.5 bg-slate-100/40 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#0B1220]">Transaction Ledger</h3>
          <span className="text-xs font-bold text-[#667085]">{payments.length} records</span>
        </div>
        {payments.map((p) => (
          <div
            key={p.id}
            onClick={() => setActivePayment(p)}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-blue-50/60 hover:pl-7 transition-all duration-200 group"
          >
            {/* Left: Reference + Info */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#067647" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono font-black text-[#067647]">{p.paymentReference}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm font-bold text-[#0B1220] truncate group-hover:text-[#067647] transition-colors">
                  {p.paymentMethod}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[0.7rem] text-[#98A2B3]">
                  <span>📅 {formatDate(p.paymentDate)}</span>
                  {p.bankAccount && (
                    <>
                      <span>•</span>
                      <span className="hidden sm:inline truncate max-w-[200px]">🏦 {p.bankAccount}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Amount + Button */}
            <div className="flex items-center gap-4 shrink-0 md:justify-end">
              <div className="text-left md:text-right">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#98A2B3] block">Amount</span>
                <span className="text-base font-black text-[#067647]">{formatAmount(p.amount)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePayment(p);
                }}
                className="btn btn-sm text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
              >
                View →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Receipt Modal */}
      {activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧾</span>
                <div>
                  <h3 className="text-sm font-black text-[#0B1220]">{activePayment.paymentReference}</h3>
                  <span className="text-[0.65rem] font-bold text-emerald-600 uppercase">Confirmed Bank Remittance</span>
                </div>
              </div>
              <button
                onClick={() => setActivePayment(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-widest block">Remitted Amount</span>
              <p className="text-2xl font-black text-emerald-900 mt-0.5">{formatAmount(activePayment.amount)}</p>
              <span className="text-[0.68rem] text-emerald-700 font-medium mt-1 block">Date: {formatDate(activePayment.paymentDate)}</span>
            </div>

            <div className="space-y-2 text-xs mb-6">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-900">{activePayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Bank Account:</span>
                <span className="font-mono font-semibold text-blue-600">{activePayment.bankAccount || "Commercial Bank LK-7728109283"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Verified By:</span>
                <span className="font-semibold text-slate-900">{activePayment.verifiedBy || "Chief Accounting Officer"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Status:</span>
                <StatusBadge status={activePayment.status} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setActivePayment(null)} className="btn btn-ghost btn-sm flex-1 text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  downloadReceipt(activePayment);
                  setActivePayment(null);
                }}
                className="btn btn-primary btn-sm flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              >
                ⬇️ Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
