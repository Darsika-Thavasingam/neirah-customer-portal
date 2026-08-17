"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

const USER_ID = process.env.NEXT_PUBLIC_USER_ID ?? "";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";

    case "SENT":
      return "bg-blue-100 text-blue-800 border-blue-200";

    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";

    case "EXPIRED":
      return "bg-gray-100 text-gray-700 border-gray-200";

    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
}

function formatAmount(value: string) {
  return `Rs. ${Number(value).toLocaleString()}`;
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
        if (!USER_ID) {
          setError(
            "Customer configuration is missing. Set NEXT_PUBLIC_USER_ID."
          );
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/quotations/${quotationId}`,
          {
            headers: {
              "x-user-id": USER_ID,
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
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-white rounded-xl border p-6">
            <p className="text-gray-500">Loading quotation...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !quotation) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Unable to load quotation
            </h1>

            <p className="mt-2 text-red-700">
              {error || "Quotation not found."}
            </p>

            <Link
              href="/quotations"
              className="inline-block mt-5 text-sm font-medium text-blue-700 hover:underline"
            >
              ← Back to quotations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <Link
            href="/quotations"
            className="text-sm text-blue-700 hover:underline"
          >
            ← Back to quotations
          </Link>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Quotation</p>

              <h1 className="text-2xl font-bold text-gray-900">
                {quotation.quotationNumber}
              </h1>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusStyle(
                quotation.status
              )}`}
            >
              {formatStatus(quotation.status)}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <section className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Quotation Overview
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Quotation Number
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {quotation.quotationNumber}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Date
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {formatDate(quotation.date)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Valid Until
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {formatDate(quotation.validUntil)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Project
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {quotation.project.name}
              </p>

              <p className="text-xs text-gray-500">
                {quotation.project.projectCode}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Customer
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {quotation.customer.companyName}
              </p>

              <p className="text-gray-600">
                {quotation.customer.contactName}
              </p>

              <p className="text-gray-600">
                {quotation.customer.email}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Project
            </h2>

            <div className="mt-4">
              <p className="font-medium text-gray-900">
                {quotation.project.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {quotation.project.projectCode}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Line Items
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Description
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Unit
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Unit Price
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Tax
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Discount
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {quotation.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.description}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.unit}
                    </td>

                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatAmount(item.unitPrice)}
                    </td>

                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatAmount(item.tax)}
                    </td>

                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatAmount(item.discount)}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatAmount(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-xl border shadow-sm p-6">
          <div className="ml-auto max-w-sm space-y-3 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">
                {formatAmount(quotation.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">Tax</span>
              <span className="font-medium text-gray-900">
                {formatAmount(quotation.tax)}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">Discount</span>
              <span className="font-medium text-gray-900">
                {formatAmount(quotation.discount)}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between gap-6">
              <span className="font-semibold text-gray-900">Total</span>

              <span className="text-xl font-bold text-gray-900">
                {formatAmount(quotation.total)}
              </span>
            </div>
          </div>
        </section>

        {(quotation.terms || quotation.notes) && (
          <section className="grid gap-6 md:grid-cols-2">
            {quotation.terms && (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Terms
                </h2>

                <p className="mt-4 text-sm text-gray-600 leading-7">
                  {quotation.terms}
                </p>
              </div>
            )}

            {quotation.notes && (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notes
                </h2>

                <p className="mt-4 text-sm text-gray-600 leading-7">
                  {quotation.notes}
                </p>
              </div>
            )}
          </section>
        )}

        {quotation.documentUrl && (
          <section className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Quotation Document
            </h2>

            <a
              href={quotation.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              View / Download Quotation
            </a>
          </section>
        )}
      </div>
    </main>
  );
}