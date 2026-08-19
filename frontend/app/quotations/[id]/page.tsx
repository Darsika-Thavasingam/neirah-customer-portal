"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../components/StatusBadge";
import { getActiveUserId } from '../../lib/auth';

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";


function formatAmount(value: string) {
  return `LKR ${Number(value).toLocaleString()}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
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
          setError(
            "Customer configuration is missing. Set NEXT_PUBLIC_USER_ID."
          );
          return;
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

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load quotation."
        );
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
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-[#667085]">Loading quotation...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !quotation) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-left">
            <h1 className="text-lg font-semibold text-[#B42318]">
              Unable to load quotation
            </h1>

            <p className="mt-2 text-sm text-[#B42318]">
              {error || "Quotation not found."}
            </p>

            <Link
              href="/quotations"
              className="mt-5 inline-block text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              ← Back to quotations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <header className="border-b border-[rgba(15,23,42,0.08)] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/quotations"
            className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            ← Back to quotations
          </Link>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">Quotation</p>
              <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
                {quotation.quotationNumber}
              </h1>
            </div>

            <StatusBadge status={quotation.status} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Section */}
        <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <h2 className="text-lg font-semibold text-[#0B1220]">
            Quotation Overview
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Quotation Number
              </p>

              <p className="mt-1 font-medium text-[#0B1220]">
                {quotation.quotationNumber}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Date
              </p>

              <p className="mt-1 font-medium text-[#0B1220]">
                {formatDate(quotation.date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Valid Until
              </p>

              <p className="mt-1 font-medium text-[#0B1220]">
                {formatDate(quotation.validUntil)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Project
              </p>

              <p className="mt-1 font-medium text-[#0B1220]">
                {quotation.project.name}
              </p>

              <p className="text-xs text-[#667085]">
                {quotation.project.projectCode}
              </p>
            </div>
          </div>
        </section>

        {/* Customer & Project Info */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-semibold text-[#0B1220]">
              Customer
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold text-[#0B1220]">
                {quotation.customer.companyName}
              </p>

              <p className="text-[#667085]">
                {quotation.customer.contactName}
              </p>

              <p className="text-[#667085]">
                {quotation.customer.email}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-semibold text-[#0B1220]">
              Project
            </h2>

            <div className="mt-4">
              <p className="font-semibold text-[#0B1220]">
                {quotation.project.name}
              </p>

              <p className="mt-1 text-sm text-[#667085]">
                {quotation.project.projectCode}
              </p>
            </div>
          </div>
        </section>

        {/* Line Items Table */}
        <section className="overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <div className="border-b border-[rgba(15,23,42,0.08)] p-6">
            <h2 className="text-lg font-semibold text-[#0B1220]">
              Line Items
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] text-xs font-semibold uppercase tracking-wider text-[#667085]">
                <tr>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Unit</th>
                  <th className="px-6 py-3.5 text-right">Unit Price</th>
                  <th className="px-6 py-3.5 text-right">Tax</th>
                  <th className="px-6 py-3.5 text-right">Discount</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[rgba(15,23,42,0.08)]">
                {quotation.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F9FC]/50">
                    <td className="px-6 py-4 font-medium text-[#0B1220]">
                      {item.description}
                    </td>

                    <td className="px-6 py-4 text-[#667085]">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-4 text-[#667085]">
                      {item.unit}
                    </td>

                    <td className="px-6 py-4 text-right text-[#0B1220]">
                      {formatAmount(item.unitPrice)}
                    </td>

                    <td className="px-6 py-4 text-right text-[#0B1220]">
                      {formatAmount(item.tax)}
                    </td>

                    <td className="px-6 py-4 text-right text-[#0B1220]">
                      {formatAmount(item.discount)}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-[#0B1220]">
                      {formatAmount(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals Summary */}
        <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <div className="ml-auto max-w-sm space-y-3 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-[#667085]">Subtotal</span>
              <span className="font-medium text-[#0B1220]">
                {formatAmount(quotation.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-[#667085]">Tax</span>
              <span className="font-medium text-[#0B1220]">
                {formatAmount(quotation.tax)}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-[#667085]">Discount</span>
              <span className="font-medium text-[#0B1220]">
                {formatAmount(quotation.discount)}
              </span>
            </div>

            <div className="flex justify-between gap-6 border-t border-[rgba(15,23,42,0.08)] pt-3">
              <span className="font-semibold text-[#0B1220]">Total</span>

              <span className="text-xl font-bold text-[#2563EB]">
                {formatAmount(quotation.total)}
              </span>
            </div>
          </div>
        </section>

        {/* Terms & Notes */}
        {(quotation.terms || quotation.notes) && (
          <section className="grid gap-6 md:grid-cols-2">
            {quotation.terms && (
              <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
                <h2 className="text-lg font-semibold text-[#0B1220]">
                  Terms
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-[#667085]">
                  {quotation.terms}
                </p>
              </div>
            )}

            {quotation.notes && (
              <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
                <h2 className="text-lg font-semibold text-[#0B1220]">
                  Notes
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-[#667085]">
                  {quotation.notes}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Document section */}
        {quotation.documentUrl && (
          <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-semibold text-[#0B1220]">
              Quotation Document
            </h2>

            <a
              href={quotation.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              View / Download Quotation Document
            </a>
          </section>
        )}
      </div>
    </main>
  );
}