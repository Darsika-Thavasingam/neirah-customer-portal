"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { getActiveUserId } from '../../lib/auth';

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
    day: "2-digit",
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
          throw new Error("Customer configuration is missing. Set NEXT_PUBLIC_USER_ID in your environment.");
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

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/payments" className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
            ← Back to Payments
          </Link>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Due Balances
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">Outstanding Payments</h1>
          <p className="mt-1 text-sm text-[#667085]">
            Invoices with remaining balances and overdue amounts.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading outstanding payments...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            <h2 className="font-bold">Unable to load outstanding payments</h2>
            <p className="mt-2 text-sm font-normal text-[#B42318]">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <section className="overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className="border-b border-[rgba(15,23,42,0.08)] p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B1220]">Invoices Due</h2>
              <span className="text-xs text-[#667085] sm:hidden">Scroll table horizontally →</span>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-lg font-bold text-[#0B1220]">No outstanding invoices</p>
                <p className="mt-2 text-sm text-[#667085]">
                  There are no invoices currently requiring payment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] text-xs font-bold uppercase tracking-wider text-[#667085]">
                    <tr>
                      <th className="px-6 py-3.5">Invoice</th>
                      <th className="px-6 py-3.5">Due Date</th>
                      <th className="px-6 py-3.5">Total</th>
                      <th className="px-6 py-3.5">Paid</th>
                      <th className="px-6 py-3.5">Outstanding</th>
                      <th className="px-6 py-3.5">Overdue Days</th>
                      <th className="px-6 py-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(15,23,42,0.08)] bg-white">
                    {invoices.map((invoice) => {
                      const outstanding = Number(invoice.outstandingAmount ?? Math.max(Number(invoice.total) - Number(invoice.paidAmount), 0));

                      return (
                        <tr key={invoice.id} className="hover:bg-[#F7F9FC]/50">
                          <td className="px-6 py-4">
                            <Link href={`/invoices/${invoice.id}`} className="font-bold text-[#0B1220] hover:text-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
                              {invoice.invoiceNumber}
                            </Link>
                            {invoice.project && (
                              <div className="mt-0.5 text-xs text-[#667085]">{invoice.project.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#667085]">{formatDate(invoice.dueDate)}</td>
                          <td className="px-6 py-4 font-semibold text-[#0B1220]">{formatCurrency(invoice.total)}</td>
                          <td className="px-6 py-4 text-[#067647]">{formatCurrency(invoice.paidAmount)}</td>
                          <td className="px-6 py-4 font-bold text-[#B42318]">{formatCurrency(outstanding)}</td>
                          <td className="px-6 py-4">
                            {invoice.daysOverdue && invoice.daysOverdue > 0 ? (
                              <StatusBadge status="OVERDUE" label={`${invoice.daysOverdue} days`} />
                            ) : (
                              <StatusBadge status="PENDING" label="Due soon" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/invoices/${invoice.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
