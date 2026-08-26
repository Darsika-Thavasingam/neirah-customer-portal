"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { PageLoading } from "../../components/SkeletonLoader";
import { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  tax?: number;
  discount?: number;
  total: number;
};

type InvoicePayment = {
  id: string;
  paymentReference: string;
  paymentDate: string;
  paymentMethod: string;
  amount: number;
  status: string;
  receiptReference?: string | null;
};

type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  contractReference?: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  status: string;
  documentUrl?: string | null;
  customer: { id: string; companyName: string; contactName: string; email: string };
  project: { id: string; projectCode: string; name: string };
  items: InvoiceItem[];
  payments: InvoicePayment[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function fmt(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function curr(n: number | null | undefined) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 2 }).format(Number(n) || 0);
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch_() {
      try {
        const uid = getActiveUserId();
        if (!uid) throw new Error("No user configured.");
        const res = await fetch(`${API_BASE_URL}/api/v1/customer-portal/invoices/${invoiceId}`, {
          headers: { "x-user-id": uid }, cache: "no-store",
        });
        if (!res.ok) throw new Error("Invoice not found or access denied.");
        setInvoice(await res.json());
      } catch (e: any) { setError(e.message || "Failed to load invoice."); }
      finally { setLoading(false); }
    }
    if (invoiceId) fetch_();
  }, [invoiceId]);

  if (loading) return <div className="page-shell max-w-4xl"><PageLoading message="Loading invoice details…" /></div>;
  if (error || !invoice) return (
    <div className="page-shell max-w-4xl">
      <Link href="/invoices" className="back-link mb-6 inline-flex">← Back to Invoices</Link>
      <ErrorState title="Invoice Not Found" message={error} backHref="/invoices" backLabel="Back to Invoices" />
    </div>
  );

  const balance = Math.max(Number(invoice.total) - Number(invoice.paidAmount), 0);
  const isOverdue = invoice.status !== "PAID" && new Date(invoice.dueDate) < new Date();

  return (
    <div className="page-shell max-w-4xl animate-fade-in-up">
      <Link href="/invoices" className="back-link mb-6 inline-flex">← Back to Invoices</Link>

      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0B1220] p-6 mb-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-wider text-cyan-300 mb-1">Invoice Detail</p>
            <h1 className="text-2xl font-black text-white">{invoice.invoiceNumber}</h1>
            <p className="text-xs text-slate-300 mt-1">{invoice.project.name} · {invoice.project.projectCode}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={invoice.status} />
            {isOverdue && (
              <span className="text-[0.65rem] font-black bg-red-500/20 border border-red-400/30 text-red-300 px-2 py-0.5 rounded-md">
                OVERDUE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Invoice Info */}
        <div className="card p-5 col-span-2">
          <h2 className="section-heading mb-4">Invoice Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Invoice Date", value: fmt(invoice.invoiceDate) },
              { label: "Due Date", value: fmt(invoice.dueDate) },
              { label: "Contract Ref", value: invoice.contractReference || "—" },
              { label: "Customer", value: invoice.customer.companyName },
              { label: "Contact", value: invoice.customer.contactName },
              { label: "Email", value: invoice.customer.email },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[0.65rem] font-black uppercase tracking-wider text-[#98A2B3]">{f.label}</p>
                <p className="font-semibold text-[#0B1220] mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card p-5 flex flex-col justify-between">
          <h2 className="section-heading mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#667085]">Subtotal</span>
              <span className="font-bold">{curr(invoice.subtotal)}</span>
            </div>
            {Number(invoice.tax) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#667085]">Tax</span>
                <span className="font-bold">{curr(invoice.tax)}</span>
              </div>
            )}
            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#667085]">Discount</span>
                <span className="font-bold text-green-600">−{curr(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-3 border-slate-100">
              <span className="font-black text-[#0B1220]">Total</span>
              <span className="font-black text-[#0B1220]">{curr(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#067647]">Paid</span>
              <span className="font-bold text-[#067647]">{curr(invoice.paidAmount)}</span>
            </div>
            <div className={`flex justify-between text-sm rounded-xl px-3.5 py-2.5 ${balance > 0 ? "bg-red-50 text-[#B42318]" : "bg-green-50 text-[#067647]"}`}>
              <span className="font-black">Balance Due</span>
              <span className="font-black">{curr(balance)}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-[0.65rem] mb-1">
              <span className="text-[#667085]">Payment Progress</span>
              <span className="font-black text-[#0B1220]">
                {invoice.total > 0 ? Math.round((Number(invoice.paidAmount) / Number(invoice.total)) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#067647] rounded-full" style={{ width: `${invoice.total > 0 ? Math.min(Math.round((Number(invoice.paidAmount) / Number(invoice.total)) * 100), 100) : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="card p-5 mb-5">
          <h2 className="section-heading mb-4">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Rate (LKR)</th>
                  <th className="text-right">Tax</th>
                  <th className="text-right">Discount</th>
                  <th className="text-right">Total (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.description}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{Number(item.rate).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                    <td className="text-right">{Number(item.tax || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                    <td className="text-right">{Number(item.discount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                    <td className="text-right font-bold">{Number(item.total).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="card p-5 mb-5">
          <h2 className="section-heading mb-4">Payment History</h2>
          <div className="space-y-3">
            {invoice.payments.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                <div>
                  <p className="text-sm font-bold text-[#0B1220]">{p.paymentReference}</p>
                  <p className="text-xs text-[#667085] mt-0.5">{p.paymentMethod} · {fmt(p.paymentDate)}</p>
                  {p.receiptReference && <p className="text-xs text-[#98A2B3]">Receipt: {p.receiptReference}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#067647]">{curr(p.amount)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/invoices" className="btn btn-ghost btn-sm">← Back to Invoices</Link>
        {invoice.documentUrl && (
          <a href={invoice.documentUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
            📥 Download Invoice PDF
          </a>
        )}
      </div>
    </div>
  );
}
