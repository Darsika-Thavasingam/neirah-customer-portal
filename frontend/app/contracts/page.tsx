"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Contract = {
  id: string;
  contractNumber: string;
  contractDate: string;
  contractValue: string;
  startDate: string;
  completionDate: string;
  status: string;
  documentUrl: string | null;
  project: {
    id: string;
    projectCode: string;
    name: string;
  };
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const userId = process.env.NEXT_PUBLIC_USER_ID;

        if (!userId) {
          throw new Error("Customer user ID is not configured");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customer-portal/contracts`,
          {
            headers: {
              "x-user-id": userId,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load contracts");
        }

        const data = await response.json();
        setContracts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load contracts"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString();

  const formatAmount = (amount: string) =>
    `LKR ${Number(amount).toLocaleString()}`;

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2563EB]">
            Neirah Construction OS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0B1220]">
            Contracts
          </h1>

          <p className="mt-2 text-[#667085]">
            View contracts related to your projects.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-[#667085]">Loading contracts...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-8">
            <p className="font-medium text-[#B42318]">{error}</p>
          </div>
        )}

        {!loading && !error && contracts.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B1220]">
              No contracts available
            </h2>

            <p className="mt-2 text-[#667085]">
              There are currently no customer-visible contracts.
            </p>
          </div>
        )}

        {!loading && !error && contracts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(37,99,235,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#667085]">
                      Contract Number
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-[#0B1220]">
                      {contract.contractNumber}
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                    {contract.status}
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div>
                    <p className="text-[#667085]">Project</p>
                    <p className="font-medium text-[#0B1220]">
                      {contract.project.name}
                    </p>
                    <p className="text-xs text-[#667085]">
                      {contract.project.projectCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#667085]">Contract Date</p>
                      <p className="font-medium text-[#0B1220]">
                        {formatDate(contract.contractDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#667085]">Contract Value</p>
                      <p className="font-medium text-[#0B1220]">
                        {formatAmount(contract.contractValue)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#667085]">Start Date</p>
                      <p className="font-medium text-[#0B1220]">
                        {formatDate(contract.startDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#667085]">Completion Date</p>
                      <p className="font-medium text-[#0B1220]">
                        {formatDate(contract.completionDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/contracts/${contract.id}`}
                    className="inline-flex rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6]"
                  >
                    View Contract
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}