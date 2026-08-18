"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  paymentReference: string;
  paymentDate: string;
  paymentMethod: string;
  amount: string;
  status: string;
  receiptReference: string | null;
  invoice: {
    id: string;
    invoiceNumber: string;
  } | null;
};

type PaymentSummary = {
  totalPaid: number;
  totalInvoiced: number;
  totalOutstanding: number;
  paymentCount: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const USER_ID = process.env.NEXT_PUBLIC_USER_ID ?? "";

function formatCurrency(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPaymentsData() {
      try {
        if (!USER_ID) {
          throw new Error(
            "Customer configuration is missing. Set NEXT_PUBLIC_USER_ID in your environment."
          );
        }

        const headers = {
          "x-user-id": USER_ID,
        };

        const [paymentsResponse, summaryResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/payments`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/payments/summary`, {
            headers,
          }),
        ]);

        if (!paymentsResponse.ok) {
          throw new Error("Failed to load payment history.");
        }

        if (!summaryResponse.ok) {
          throw new Error("Failed to load payment summary.");
        }

        const paymentsData: Payment[] = await paymentsResponse.json();
        const summaryData: PaymentSummary = await summaryResponse.json();

        setPayments(paymentsData);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Unable to load payments."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentsData();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2563EB]">
            Neirah Construction OS
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#0B1220]">
            Payments
          </h1>

          <p className="mt-2 text-sm text-[#667085]">
            Track payment history and outstanding balances.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#667085]">Loading payments...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
            <h2 className="font-semibold text-[#B42318]">
              Unable to load payments
            </h2>

            <p className="mt-2 text-sm text-[#667085]">{error}</p>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Total Paid
              </p>

              <p className="mt-3 text-2xl font-bold text-[#0B1220]">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Total Invoiced
              </p>

              <p className="mt-3 text-2xl font-bold text-[#0B1220]">
                {formatCurrency(summary.totalInvoiced)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Outstanding
              </p>

              <p className="mt-3 text-2xl font-bold text-[#0B1220]">
                {formatCurrency(summary.totalOutstanding)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Payment Count
              </p>

              <p className="mt-3 text-2xl font-bold text-[#0B1220]">
                {summary.paymentCount}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-semibold text-[#0B1220]">
                Payment History
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-lg font-semibold text-[#0B1220]">
                  No payments recorded
                </p>

                <p className="mt-2 text-sm text-[#667085]">
                  Payment activity will appear here once it is available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-[#667085]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Payment Ref</th>
                      <th className="px-5 py-3 font-medium">Invoice</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Method</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Receipt</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="align-top">
                        <td className="px-5 py-4 font-medium text-[#0B1220]">
                          {payment.paymentReference}
                        </td>

                        <td className="px-5 py-4 text-[#0B1220]">
                          {payment.invoice?.invoiceNumber ?? "—"}
                        </td>

                        <td className="px-5 py-4 text-[#0B1220]">
                          {formatDate(payment.paymentDate)}
                        </td>

                        <td className="px-5 py-4 text-[#0B1220]">
                          {payment.paymentMethod}
                        </td>

                        <td className="px-5 py-4 font-semibold text-[#0B1220]">
                          {formatCurrency(payment.amount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                              payment.status
                            )}`}
                          >
                            {formatStatus(payment.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-[#0B1220]">
                          {payment.receiptReference ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
