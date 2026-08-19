"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";

type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  balanceAmount?: string | number;
  status: string;
  project?: {
    id: string;
    projectCode: string;
    name: string;
  };
};

const API_BASE = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return apiUrl.endsWith("/api/v1")
    ? apiUrl
    : `${apiUrl.replace(/\/$/, "")}/api/v1`;
})();

const USER_ID = process.env.NEXT_PUBLIC_USER_ID ?? "";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        if (!USER_ID) {
          throw new Error("Customer configuration is missing. Set NEXT_PUBLIC_USER_ID in your environment.");
        }

        const response = await fetch(`${API_BASE}/customer-portal/invoices`, {
          headers: {
            "x-user-id": USER_ID,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load invoices.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getAmount = (invoice: Invoice) => {
    const amount = invoice.totalAmount ?? invoice.balanceAmount ?? 0;
    const numericAmount = Number(amount);
    return Number.isNaN(numericAmount) ? 0 : numericAmount;
  };

  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status !== "PAID" && getAmount(invoice) > 0
  );

  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading invoices...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Billing & Invoices
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">Invoices</h1>
          <p className="mt-1 text-sm text-[#667085]">View your project invoices and outstanding amounts.</p>
        </div>

        {/* Metrics Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Total Invoices</p>
            <p className="mt-2 text-3xl font-bold text-[#0B1220]">{invoices.length}</p>
          </div>

          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Outstanding</p>
            <p className="mt-2 text-3xl font-bold text-[#B42318]">{outstandingInvoices.length}</p>
          </div>

          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Paid Invoices</p>
            <p className="mt-2 text-3xl font-bold text-[#067647]">{paidInvoices.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center text-sm text-[#667085] shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
              No invoices found.
            </div>
          ) : (
            invoices.map((invoice) => (
              <article key={invoice.id} className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition hover:shadow-md">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-[#0B1220]">{invoice.invoiceNumber}</h2>
                      <StatusBadge status={invoice.status} />
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#0B1220]">{invoice.project?.name || "Project"}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Amount</p>
                    <p className="text-2xl font-bold text-[#2563EB]">LKR {formatAmount(getAmount(invoice))}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t border-[rgba(15,23,42,0.08)] pt-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Invoice Date</p>
                    <p className="mt-1 text-sm font-medium text-[#0B1220]">{formatDate(invoice.invoiceDate)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Due Date</p>
                    <p className="mt-1 text-sm font-medium text-[#0B1220]">{formatDate(invoice.dueDate)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Project Code</p>
                    <p className="mt-1 text-sm font-medium text-[#0B1220]">{invoice.project?.projectCode || "-"}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  >
                    View Details →
                  </Link>

                  {invoice.project?.id && (
                    <Link
                      href={`/projects/${invoice.project.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition hover:bg-[#F7F9FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                    >
                      View Project
                    </Link>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}