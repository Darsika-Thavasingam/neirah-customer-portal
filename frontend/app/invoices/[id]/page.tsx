"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { PageLoading } from "../../components/SkeletonLoader";
import { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";

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

        if (!getActiveUserId()) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/invoices/${invoiceId}`,
          {
            headers: {
              "x-user-id": getActiveUserId(),
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
      <div className="page-shell">
        <Link href="/invoices" className="back-link mb-5 inline-flex">
          ← Back to Invoices
        </Link>
        <PageHeader kicker="Invoice Details" title="Loading..." />
        <PageLoading message="Loading invoice details…" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="page-shell">
        <Link href="/invoices" className="back-link mb-5 inline-flex">
          ← Back to Invoices
        </Link>
        <ErrorState
          title="Unable to load invoice"
          message={error || "Invoice not found."}
          backHref="/invoices"
          backLabel="Back to Invoices"
        />
      </div>
    );
  }

  const balance = Math.max(Number(invoice.total ?? 0) - Number(invoice.paidAmount ?? 0), 0);

  return (
    <div className="page-shell">
      <Link href="/invoices" className="back-link mb-5 inline-flex">
        ← Back to Invoices
      </Link>

      <PageHeader
        kicker="Commercial"
        title={invoice.invoiceNumber}
        subtitle={
          invoice.project
            ? `${invoice.project.name} · ${invoice.project.projectCode}`
            : undefined
        }
        actions={<StatusBadge status={invoice.status} />}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Invoice Overview */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Invoice Overview</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="meta-label">Invoice Number</p>
              <p className="mt-1 font-bold text-[#0B1220]">{invoice.invoiceNumber}</p>
            </div>
            {invoice.project && (
              <div>
                <p className="meta-label">Project</p>
                <p className="mt-1 font-semibold text-[#2563EB] hover:underline">
                  <Link href={`/projects/${invoice.project.id}`}>
                    {invoice.project.name}
                  </Link>
                </p>
              </div>
            )}
            <div>
              <p className="meta-label">Contract Reference</p>
              <p className="mt-1 font-semibold text-[#0B1220]">{invoice.contractReference || "—"}</p>
            </div>
            <div>
              <p className="meta-label">Invoice Date</p>
              <p className="mt-1 font-semibold text-[#0B1220]">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="meta-label">Due Date</p>
              <p className="mt-1 font-semibold text-[#0B1220]">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </section>

        {/* Payment Summary */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="text-[#667085]">Subtotal</span>
              <span className="font-semibold text-[#0B1220]">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="text-[#667085]">Tax</span>
              <span className="font-semibold text-[#0B1220]">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="text-[#667085]">Discount</span>
              <span className="font-semibold text-[#0B1220]">{formatCurrency(invoice.discount)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="font-bold text-[#0B1220]">Total</span>
              <span className="font-black text-[#0B1220]">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="text-[#667085]">Paid Amount</span>
              <span className="font-bold text-[#067647]">{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-[#0B1220]">Outstanding Balance</span>
              <span className="text-lg font-black text-[#B42318]">{formatCurrency(balance)}</span>
            </div>
          </div>
        </section>

        {/* Line Items */}
        {invoice.items && invoice.items.length > 0 && (
          <section className="card overflow-hidden md:col-span-2">
            <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] px-6 py-4">
              <h2 className="section-heading">Line Items</h2>
              <span className="text-xs text-[#667085] md:hidden">Swipe table to view all columns</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Tax</th>
                    <th>Discount</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-bold text-[#0B1220]">{item.description}</td>
                      <td className="text-[#667085]">{item.quantity}</td>
                      <td>{formatCurrency(item.rate)}</td>
                      <td>{formatCurrency(item.tax)}</td>
                      <td>{formatCurrency(item.discount)}</td>
                      <td className="text-right font-bold text-[#0B1220]">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <section className="card overflow-hidden md:col-span-2">
            <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] px-6 py-4">
              <h2 className="section-heading">Payments Applied</h2>
              <span className="text-xs text-[#667085] md:hidden">Swipe table to view all columns</span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-bold text-[#0B1220]">{payment.paymentReference}</td>
                      <td className="text-[#667085]">{formatDate(payment.paymentDate)}</td>
                      <td>{payment.paymentMethod}</td>
                      <td className="font-bold text-[#067647]">{formatCurrency(payment.amount)}</td>
                      <td>
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="font-mono text-xs text-[#667085]">{payment.receiptReference || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Invoice Document / PDF Download */}
        {invoice.documentUrl && (
          <section className="card p-6 md:col-span-2">
            <h2 className="section-heading mb-3">Invoice PDF Document</h2>
            <p className="text-sm text-[#667085]">
              You can view or download the certified copy of this invoice document.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={invoice.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                View Invoice PDF
              </a>
              <a
                href={invoice.documentUrl}
                download
                className="btn btn-ghost"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Document
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
