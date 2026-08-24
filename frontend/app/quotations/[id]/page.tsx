"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { PageLoading } from "../../components/SkeletonLoader";
import { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";

type QuotationItem = {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  tax: string;
  discount: string;
  total: string;
};

type Quotation = {
  id: string;
  quotationNumber: string;
  date: string;
  validUntil: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  status: string;
  documentUrl: string | null;
  terms: string | null;
  notes: string | null;

  customer: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
  };

  project: {
    id: string;
    projectCode: string;
    name: string;
  };

  items: QuotationItem[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatAmount(value: string) {
  return `LKR ${Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function QuotationDetailPage() {
  const params = useParams();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuotation() {
      try {
        if (!getActiveUserId()) {
          throw new Error("Customer configuration is missing.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/quotations/${quotationId}`,
          {
            headers: {
              "x-user-id": getActiveUserId(),
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Quotation not found.");
          }
          throw new Error("Failed to fetch quotation.");
        }

        const data: Quotation = await response.json();
        setQuotation(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load quotation.");
      } finally {
        setLoading(false);
      }
    }

    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId]);

  if (loading) {
    return (
      <div className="page-shell">
        <Link href="/quotations" className="back-link mb-5 inline-flex">
          ← Back to Quotations
        </Link>
        <PageHeader kicker="Quotation Details" title="Loading..." />
        <PageLoading message="Loading quotation details…" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="page-shell">
        <Link href="/quotations" className="back-link mb-5 inline-flex">
          ← Back to Quotations
        </Link>
        <ErrorState
          title="Unable to load quotation"
          message={error || "Quotation not found."}
          backHref="/quotations"
          backLabel="Back to Quotations"
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Link href="/quotations" className="back-link mb-5 inline-flex">
        ← Back to Quotations
      </Link>

      <PageHeader
        kicker="Commercial"
        title={quotation.quotationNumber}
        subtitle={
          quotation.project
            ? `${quotation.project.name} · ${quotation.project.projectCode}`
            : undefined
        }
        actions={<StatusBadge status={quotation.status} />}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Overview Section */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Quotation Overview</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="meta-label">Quotation Number</p>
              <p className="mt-1 font-bold text-[#0B1220]">{quotation.quotationNumber}</p>
            </div>
            <div>
              <p className="meta-label">Date Issued</p>
              <p className="mt-1 font-semibold text-[#0B1220]">{formatDate(quotation.date)}</p>
            </div>
            <div>
              <p className="meta-label">Valid Until</p>
              <p className="mt-1 font-semibold text-[#B42318]">{formatDate(quotation.validUntil)}</p>
            </div>
            {quotation.project && (
              <div>
                <p className="meta-label">Project</p>
                <p className="mt-1 font-semibold text-[#2563EB] hover:underline">
                  <Link href={`/projects/${quotation.project.id}`}>
                    {quotation.project.name}
                  </Link>
                </p>
                <p className="text-xs text-[#667085]">{quotation.project.projectCode}</p>
              </div>
            )}
          </div>
        </section>

        {/* Customer Info */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Customer & Billing Details</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="meta-label">Company Name</p>
              <p className="mt-1 font-bold text-[#0B1220]">{quotation.customer.companyName}</p>
            </div>
            <div>
              <p className="meta-label">Contact Person</p>
              <p className="mt-1 font-semibold text-[#0B1220]">{quotation.customer.contactName}</p>
            </div>
            <div>
              <p className="meta-label">Email Address</p>
              <p className="mt-1 font-semibold text-[#0B1220]">{quotation.customer.email}</p>
            </div>
          </div>
        </section>

        {/* Line Items Table */}
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
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Tax</th>
                  <th className="text-right">Discount</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-[#0B1220]">{item.description}</td>
                    <td className="text-[#667085]">{item.quantity}</td>
                    <td className="text-[#667085]">{item.unit}</td>
                    <td className="text-right text-[#0B1220]">{formatAmount(item.unitPrice)}</td>
                    <td className="text-right text-[#0B1220]">{formatAmount(item.tax)}</td>
                    <td className="text-right text-[#0B1220]">{formatAmount(item.discount)}</td>
                    <td className="text-right font-bold text-[#0B1220]">{formatAmount(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals Summary */}
        <section className="card p-6 md:col-span-2">
          <div className="ml-auto max-w-sm space-y-3 text-sm">
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="text-[#667085]">Subtotal</span>
              <span className="font-semibold text-[#0B1220]">{formatAmount(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="text-[#667085]">Tax</span>
              <span className="font-semibold text-[#0B1220]">{formatAmount(quotation.tax)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
              <span className="text-[#667085]">Discount</span>
              <span className="font-semibold text-[#0B1220]">{formatAmount(quotation.discount)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-[#0B1220]">Total</span>
              <span className="text-xl font-black text-[#2563EB]">{formatAmount(quotation.total)}</span>
            </div>
          </div>
        </section>

        {/* Terms & Notes */}
        {(quotation.terms || quotation.notes) && (
          <section className="grid gap-6 md:col-span-2 md:grid-cols-2">
            {quotation.terms && (
              <div className="card p-6">
                <h2 className="section-heading mb-4">Terms & Conditions</h2>
                <p className="text-sm leading-relaxed text-[#667085] whitespace-pre-line">{quotation.terms}</p>
              </div>
            )}
            {quotation.notes && (
              <div className="card p-6">
                <h2 className="section-heading mb-4">Notes & Remarks</h2>
                <p className="text-sm leading-relaxed text-[#667085] whitespace-pre-line">{quotation.notes}</p>
              </div>
            )}
          </section>
        )}

        {/* Document section */}
        {quotation.documentUrl && (
          <section className="card p-6 md:col-span-2">
            <h2 className="section-heading mb-3">Quotation Document</h2>
            <p className="text-sm text-[#667085]">
              A customer-visible quotation PDF is available. You can view or download it directly.
            </p>
            <div className="mt-5">
              <a
                href={quotation.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                View / Download Quotation PDF
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}