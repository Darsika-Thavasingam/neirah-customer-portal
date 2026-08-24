"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
        if (!getActiveUserId()) {
          setError("Customer configuration is missing.");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/quotations`,
          { headers: { "x-user-id": getActiveUserId() } }
        );

        if (!response.ok) throw new Error("Failed to fetch quotations");

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

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Quotations" title="My Quotations" />
        <PageLoading message="Loading quotations…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Quotations"
        title="My Quotations"
        subtitle="Manage and review your project estimates."
      />

      {error && (
        <ErrorState title="Unable to load quotations" message={error} />
      )}

      {!error && quotations.length === 0 && (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            }
            title="No quotations available"
            body="There are no customer-visible quotations at the moment. Quotations will appear here once your project team prepares them."
          />
        </div>
      )}

      {!error && quotations.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quotation #</th>
                    <th>Project</th>
                    <th>Date</th>
                    <th>Valid Until</th>
                    <th className="text-right">Total Amount</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((quotation) => (
                    <tr key={quotation.id}>
                      <td>
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="font-bold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                        >
                          {quotation.quotationNumber}
                        </Link>
                      </td>
                      <td>
                        <p className="font-medium text-[#0B1220]">
                          {quotation.project.name}
                        </p>
                        <p className="text-xs text-[#667085]">
                          {quotation.project.projectCode}
                        </p>
                      </td>
                      <td className="text-[#667085]">
                        {formatDate(quotation.date)}
                      </td>
                      <td className="text-[#667085]">
                        {formatDate(quotation.validUntil)}
                      </td>
                      <td className="text-right font-bold text-[#0B1220]">
                        LKR {formatAmount(quotation.total)}
                      </td>
                      <td>
                        <StatusBadge status={quotation.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/quotations/${quotation.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View
                          </Link>
                          {quotation.documentUrl && (
                            <a
                              href={quotation.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-sm"
                            >
                              Document
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-4 md:hidden">
            {quotations.map((quotation) => (
              <div key={quotation.id} className="card card-hover p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#2563EB]">
                      {quotation.quotationNumber}
                    </p>
                    <h2 className="mt-0.5 text-base font-bold text-[#0B1220]">
                      {quotation.project.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#667085]">
                      {quotation.project.projectCode}
                    </p>
                  </div>
                  <StatusBadge status={quotation.status} />
                </div>

                <div className="my-4 divider" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="meta-label">Date</p>
                    <p className="meta-value">{formatDate(quotation.date)}</p>
                  </div>
                  <div>
                    <p className="meta-label">Valid Until</p>
                    <p className="meta-value">
                      {formatDate(quotation.validUntil)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="meta-label">Total</p>
                    <p className="text-lg font-bold text-[#2563EB]">
                      LKR {formatAmount(quotation.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/quotations/${quotation.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Quotation →
                  </Link>
                  {quotation.documentUrl && (
                    <a
                      href={quotation.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                    >
                      View Document
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-[#667085]">
            Showing {quotations.length} quotation
            {quotations.length !== 1 ? "s" : ""}
          </p>
        </>
      )}
    </div>
  );
}