"use client";

import { useEffect, useState } from "react";

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

    case "DRAFT":
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
}

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
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Neirah Customer Portal
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Quotations
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            My Quotations
          </h2>

          <p className="mt-2 text-gray-500">
            View quotations related to your projects.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border p-8">
            <p className="text-gray-500">
              Loading quotations...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && quotations.length === 0 && (
          <div className="bg-white rounded-xl border p-8">
            <h3 className="text-lg font-semibold text-gray-900">
              No quotations available
            </h3>

            <p className="mt-2 text-gray-500">
              There are no customer-visible quotations available at the
              moment.
            </p>
          </div>
        )}

        {!loading && !error && quotations.length > 0 && (
          <div className="space-y-5">
            {quotations.map((quotation) => (
              <article
                key={quotation.id}
                className="bg-white rounded-xl border shadow-sm p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {quotation.quotationNumber}
                      </h3>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                          quotation.status
                        )}`}
                      >
                        {formatStatus(quotation.status)}
                      </span>
                    </div>

                    <p className="mt-2 font-medium text-gray-800">
                      {quotation.project.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {quotation.project.projectCode}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      LKR {formatAmount(quotation.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
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
                      Tax
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      LKR {formatAmount(quotation.tax)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Discount
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      LKR {formatAmount(quotation.discount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`/quotations/${quotation.id}`}
                    className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    View quotation
                  </a>

                  {quotation.documentUrl && (
                    <a
                      href={quotation.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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