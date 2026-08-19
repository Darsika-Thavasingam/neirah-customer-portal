"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";

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
  project: {
    id: string;
    projectCode: string;
    name: string;
  };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const USER_ID = process.env.NEXT_PUBLIC_USER_ID ?? "";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function formatAmount(amount: string) {
  return Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuotations() {
      try {
        if (!USER_ID) {
          setError(
            "Customer configuration is missing. Set NEXT_PUBLIC_USER_ID in your environment."
          );
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/quotations`,
          {
            headers: {
              "x-user-id": USER_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch quotations");
        }

        const data: Quotation[] = await response.json();
        setQuotations(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load quotations.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuotations();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Quotations
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
            My Quotations
          </h1>
          <p className="mt-1.5 text-sm text-[#667085]">
            View quotations related to your construction projects.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading quotations...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6">
            <p className="text-sm font-semibold text-[#B42318]">{error}</p>
          </div>
        )}

        {!loading && !error && quotations.length === 0 && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-semibold text-[#0B1220]">
              No quotations available
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              There are no customer-visible quotations available at the moment.
            </p>
          </div>
        )}

        {!loading && !error && quotations.length > 0 && (
          <div className="space-y-5">
            {quotations.map((quotation) => (
              <article
                key={quotation.id}
                className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-[#0B1220]">
                        {quotation.quotationNumber}
                      </h2>
                      <StatusBadge status={quotation.status} />
                    </div>

                    <p className="mt-2 text-base font-semibold text-[#0B1220]">
                      {quotation.project.name}
                    </p>

                    <p className="mt-0.5 text-xs text-[#667085]">
                      {quotation.project.projectCode}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                      Total
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#2563EB]">
                      LKR {formatAmount(quotation.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t border-[rgba(15,23,42,0.08)] pt-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                      Date
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0B1220]">
                      {formatDate(quotation.date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                      Valid Until
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0B1220]">
                      {formatDate(quotation.validUntil)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                      Tax
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0B1220]">
                      LKR {formatAmount(quotation.tax)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                      Discount
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0B1220]">
                      LKR {formatAmount(quotation.discount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/quotations/${quotation.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  >
                    View quotation →
                  </Link>

                  {quotation.documentUrl && (
                    <a
                      href={quotation.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition hover:bg-[#F7F9FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                    >
                      View document
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}