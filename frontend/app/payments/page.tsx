"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";

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
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
              Financials
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
              Payments
            </h1>
            <p className="mt-1 text-sm text-[#667085]">
              Track payment history, receipts, and outstanding balances.
            </p>
          </div>

          {!loading && !error && (
            <Link
              href="/payments/outstanding"
              className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              View Outstanding Payments →
            </Link>
          )}
        </div>

        {loading && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading payments...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            <h2 className="font-bold">Unable to load payments</h2>
            <p className="mt-2 text-sm font-normal text-[#B42318]">{error}</p>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Total Paid
              </p>

              <p className="mt-2 text-2xl font-bold text-[#067647]">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Total Invoiced
              </p>

              <p className="mt-2 text-2xl font-bold text-[#0B1220]">
                {formatCurrency(summary.totalInvoiced)}
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Outstanding
              </p>

              <p className="mt-2 text-2xl font-bold text-[#B42318]">
                {formatCurrency(summary.totalOutstanding)}
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Payment Transactions
              </p>

              <p className="mt-2 text-2xl font-bold text-[#2563EB]">
                {summary.paymentCount}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <section className="overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className="border-b border-[rgba(15,23,42,0.08)] p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B1220]">
                Payment History
              </h2>
              <span className="text-xs text-[#667085] sm:hidden">Scroll table horizontally →</span>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-lg font-bold text-[#0B1220]">
                  No payments recorded
                </p>

                <p className="mt-2 text-sm text-[#667085]">
                  Payment activity will appear here once it is available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] text-xs font-bold uppercase tracking-wider text-[#667085]">
                    <tr>
                      <th className="px-6 py-3.5">Payment Ref</th>
                      <th className="px-6 py-3.5">Invoice</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Method</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Receipt</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[rgba(15,23,42,0.08)] bg-white">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#F7F9FC]/50">
                        <td className="px-6 py-4 font-semibold text-[#0B1220]">
                          {payment.paymentReference}
                        </td>

                        <td className="px-6 py-4 text-[#0B1220]">
                          {payment.invoice?.invoiceNumber ? (
                            <Link href={`/invoices/${payment.invoice.id}`} className="text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
                              {payment.invoice.invoiceNumber}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-6 py-4 text-[#667085]">
                          {formatDate(payment.paymentDate)}
                        </td>

                        <td className="px-6 py-4 text-[#0B1220]">
                          {payment.paymentMethod}
                        </td>

                        <td className="px-6 py-4 font-bold text-[#067647]">
                          {formatCurrency(payment.amount)}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={payment.status} />
                        </td>

                        <td className="px-6 py-4 text-[#667085]">
                          {payment.receiptReference ?? "—"}
                        </td>
                      </tr>
                    ))}
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
