"use client";

import { useEffect, useState } from "react";

type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string | number;
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

const USER_ID =
  process.env.NEXT_PUBLIC_USER_ID ||
  "09e6e881-dcbb-42b9-ae4f-e62a0f2e598c";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/customer-portal/invoices`,
          {
            headers: {
              "x-user-id": USER_ID,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load invoices.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getAmount = (invoice: Invoice) => {
    const amount =
      invoice.totalAmount ??
      invoice.balanceAmount ??
      0;

    const numericAmount = Number(amount);

    return Number.isNaN(numericAmount)
      ? 0
      : numericAmount;
  };

  const outstandingInvoices = invoices.filter(
    (invoice) =>
      invoice.status !== "PAID" &&
      getAmount(invoice) > 0
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "PAID"
  );

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Invoices
          </h1>

          <p className="mt-2 text-gray-600">
            Loading invoices...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Invoices
          </h1>

          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Invoices
          </h1>

          <p className="mt-2 text-gray-600">
            View your project invoices and outstanding amounts.
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">
              Total Invoices
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {invoices.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">
              Outstanding
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {outstandingInvoices.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">
              Paid Invoices
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {paidInvoices.length}
            </p>
          </div>
        </div>

        {/* Invoice list */}
        <div className="mt-8 space-y-4">
          {invoices.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              No invoices found.
            </div>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">
                        {invoice.invoiceNumber}
                      </h2>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {invoice.status}
                      </span>
                    </div>

                    <p className="mt-2 text-gray-600">
                      {invoice.project?.name || "Project"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500">
                      Amount
                    </p>

                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount(getAmount(invoice))}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t pt-5 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Invoice Date
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {formatDate(invoice.invoiceDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Due Date
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Project
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {invoice.project?.projectCode || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}