"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number | string;
  rate: number | string;
  tax: number | string;
  discount: number | string;
  total: number | string;
};

type InvoicePayment = {
  id: string;
  paymentReference: string;
  paymentDate: string;
  paymentMethod: string;
  amount: number | string;
  status: string;
  receiptReference?: string | null;
};

type InvoiceDetails = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  contractReference?: string | null;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  total: number | string;
  paidAmount: number | string;
  status: string;
  documentUrl?: string | null;
  project?: {
    id: string;
    projectCode: string;
    name: string;
  } | null;
  customer?: {
    id: string;
    companyName?: string | null;
    contactName?: string | null;
    email?: string | null;
  } | null;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const USER_ID = process.env.NEXT_PUBLIC_USER_ID ?? "";

function formatCurrency(value: number | string | null | undefined) {
  const raw = Number(value ?? 0);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(raw) ? raw : 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        if (!USER_ID) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/invoices/${invoiceId}`,
          {
            headers: {
              "x-user-id": USER_ID,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Invoice not found or you do not have access.");
          }
          throw new Error("Failed to load invoice details.");
        }

        const data: InvoiceDetails = await response.json();
        setInvoice(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load invoice details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <p className="text-sm text-[#667085]">Loading invoice details...</p>
        </div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/invoices" className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
            ← Back to Invoices
          </Link>

          <div className="mt-6 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            <h1 className="font-bold">Unable to load invoice</h1>
            <p className="mt-2 text-sm font-normal text-[#B42318]">{error || "Invoice not found."}</p>
          </div>
        </div>
      </main>
    );
  }

  const balance = Math.max(Number(invoice.total ?? 0) - Number(invoice.paidAmount ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/invoices" className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
          ← Back to Invoices
        </Link>

        <div className="mt-4 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">Invoice Detail</p>
              <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">{invoice.invoiceNumber}</h1>
              {invoice.project && (
                <p className="mt-1 text-sm text-[#667085]">
                  {invoice.project.name} · {invoice.project.projectCode}
                </p>
              )}
            </div>

            <StatusBadge status={invoice.status} />
          </div>
        </div>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">Invoice Overview</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Invoice Number</dt>
                <dd className="mt-1 font-semibold text-[#0B1220]">{invoice.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Project</dt>
                <dd className="mt-1 font-semibold text-[#0B1220]">
                  {invoice.project ? (
                    <Link href={`/projects/${invoice.project.id}`} className="text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
                      {invoice.project.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Contract Reference</dt>
                <dd className="mt-1 font-medium text-[#0B1220]">{invoice.contractReference || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Invoice Date</dt>
                <dd className="mt-1 font-medium text-[#0B1220]">{formatDate(invoice.invoiceDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Due Date</dt>
                <dd className="mt-1 font-medium text-[#0B1220]">{formatDate(invoice.dueDate)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">Payment Summary</h2>
            <dl className="mt-5 space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                <dt className="text-[#667085]">Subtotal</dt>
                <dd className="font-medium text-[#0B1220]">{formatCurrency(invoice.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                <dt className="text-[#667085]">Tax</dt>
                <dd className="font-medium text-[#0B1220]">{formatCurrency(invoice.tax)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                <dt className="text-[#667085]">Discount</dt>
                <dd className="font-medium text-[#0B1220]">{formatCurrency(invoice.discount)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                <dt className="font-semibold text-[#0B1220]">Total</dt>
                <dd className="font-bold text-[#0B1220]">{formatCurrency(invoice.total)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                <dt className="text-[#667085]">Paid Amount</dt>
                <dd className="font-medium text-[#067647]">{formatCurrency(invoice.paidAmount)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <dt className="font-bold text-[#0B1220]">Outstanding Balance</dt>
                <dd className="text-lg font-bold text-[#B42318]">{formatCurrency(balance)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Line Items section - Responsive Table */}
        {(invoice.items && invoice.items.length > 0) && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className="border-b border-[rgba(15,23,42,0.08)] p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B1220]">Line Items</h2>
              <span className="text-xs text-[#667085] sm:hidden">Scroll table horizontally →</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] text-xs font-bold uppercase tracking-wider text-[#667085]">
                  <tr>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Qty</th>
                    <th className="px-6 py-3.5">Rate</th>
                    <th className="px-6 py-3.5">Tax</th>
                    <th className="px-6 py-3.5">Discount</th>
                    <th className="px-6 py-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(15,23,42,0.08)] bg-white">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F7F9FC]/50">
                      <td className="px-6 py-4 font-medium text-[#0B1220]">{item.description}</td>
                      <td className="px-6 py-4 text-[#667085]">{item.quantity}</td>
                      <td className="px-6 py-4 text-[#0B1220]">{formatCurrency(item.rate)}</td>
                      <td className="px-6 py-4 text-[#0B1220]">{formatCurrency(item.tax)}</td>
                      <td className="px-6 py-4 text-[#0B1220]">{formatCurrency(item.discount)}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#0B1220]">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Payment History section - Responsive Table */}
        {invoice.payments && invoice.payments.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className="border-b border-[rgba(15,23,42,0.08)] p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B1220]">Payment History</h2>
              <span className="text-xs text-[#667085] sm:hidden">Scroll table horizontally →</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] text-xs font-bold uppercase tracking-wider text-[#667085]">
                  <tr>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(15,23,42,0.08)] bg-white">
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#F7F9FC]/50">
                      <td className="px-6 py-4 font-semibold text-[#0B1220]">{payment.paymentReference}</td>
                      <td className="px-6 py-4 text-[#667085]">{formatDate(payment.paymentDate)}</td>
                      <td className="px-6 py-4 text-[#0B1220]">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 font-bold text-[#067647]">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-6 py-4 text-[#667085]">{payment.receiptReference || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {invoice.documentUrl && (
          <section className="mt-8 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">Invoice Document</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={invoice.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
                View Document
              </a>
              <a href={invoice.documentUrl} download className="inline-flex items-center rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B1220] transition hover:bg-[#F7F9FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
                Download
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
