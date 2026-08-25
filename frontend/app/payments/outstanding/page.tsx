"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { PageLoading } from "../../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";

type OutstandingInvoice = {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  total: number | string;
  paidAmount: number | string;
  outstandingAmount?: number | string;
  daysOverdue?: number;
  status?: string;
  project?: {
    id: string;
    projectCode: string;
    name: string;
  } | null;
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
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OutstandingPaymentsPage() {
  const [invoices, setInvoices] = useState<OutstandingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOutstanding = async () => {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) {
          throw new Error("Customer configuration is missing.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/invoices/outstanding`,
          {
            headers: {
              "x-user-id": getActiveUserId(),
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load outstanding payments.");
        }

        const data: OutstandingInvoice[] = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load outstanding payments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOutstanding();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <Link href="/payments" className="back-link mb-5 inline-flex">
          ← Back to Payments
        </Link>
        <PageHeader kicker="Due Balances" title="Outstanding Payments" />
        <PageLoading message="Loading outstanding payments…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/payments" className="back-link mb-5 inline-flex">
        ← Back to Payments
      </Link>

      <PageHeader
        kicker="Due Balances"
        title="Outstanding Payments"
        subtitle="Invoices with remaining balances and overdue amounts."
      />

      {error && (
        <ErrorState
          title="Unable to load outstanding payments"
          message={error}
          backHref="/payments"
          backLabel="Back to Payments"
        />
      )}

      {!error && invoices.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            }
            title="All caught up!"
            body="There are no outstanding invoices requiring payment at this time."
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="card hidden overflow-hidden md:block">
            <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] px-6 py-4">
              <h2 className="section-heading">Invoices Due</h2>
              <span className="text-xs text-[#667085]">
                {invoices.length} outstanding invoice{invoices.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Due Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Outstanding</th>
                    <th>Overdue Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const outstanding = Number(
                      invoice.outstandingAmount ??
                        Math.max(Number(invoice.total) - Number(invoice.paidAmount), 0)
                    );

                    return (
                      <tr key={invoice.id}>
                        <td>
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-bold text-[#0B1220] hover:text-[#2563EB]"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                          {invoice.project && (
                            <div className="mt-0.5 text-xs text-[#667085]">
                              {invoice.project.name}
                            </div>
                          )}
                        </td>
                        <td className="text-[#667085]">{formatDate(invoice.dueDate)}</td>
                        <td className="font-semibold text-[#0B1220]">{formatCurrency(invoice.total)}</td>
                        <td className="text-[#067647]">{formatCurrency(invoice.paidAmount)}</td>
                        <td className="font-bold text-[#B42318]">{formatCurrency(outstanding)}</td>
                        <td>
                          {invoice.daysOverdue && invoice.daysOverdue > 0 ? (
                            <StatusBadge
                              status="OVERDUE"
                              label={`${invoice.daysOverdue} days overdue`}
                            />
                          ) : (
                            <StatusBadge status="PENDING" label="Due soon" />
                          )}
                        </td>
                        <td className="text-right">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="flex flex-col gap-3 md:hidden">
            {invoices.map((invoice) => {
              const outstanding = Number(
                invoice.outstandingAmount ??
                  Math.max(Number(invoice.total) - Number(invoice.paidAmount), 0)
              );

              return (
                <div key={invoice.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-sm font-bold text-[#0B1220] hover:text-[#2563EB]"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      {invoice.project && (
                        <p className="mt-0.5 text-xs text-[#667085]">
                          {invoice.project.name}
                        </p>
                      )}
                    </div>
                    {invoice.daysOverdue && invoice.daysOverdue > 0 ? (
                      <StatusBadge status="OVERDUE" label={`${invoice.daysOverdue} days`} />
                    ) : (
                      <StatusBadge status="PENDING" label="Due soon" />
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[rgba(15,23,42,0.06)] py-3 text-center">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085]">
                        Total
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-[#0B1220]">
                        {formatCurrency(invoice.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085]">
                        Paid
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-[#067647]">
                        {formatCurrency(invoice.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085]">
                        Outstanding
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[#B42318]">
                        {formatCurrency(outstanding)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[#667085]">
                      Due: {formatDate(invoice.dueDate)}
                    </p>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-xs font-bold text-[#2563EB] hover:underline"
                    >
                      View Invoice →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
