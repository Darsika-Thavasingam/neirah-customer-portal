"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";

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
    `LKR ${Number(amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Contracts
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
            My Contracts
          </h1>

          <p className="mt-1 text-sm text-[#667085]">
            View binding contracts and legal terms related to your construction projects.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading contracts...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && contracts.length === 0 && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">
              No contracts available
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              There are currently no customer-visible contracts.
            </p>
          </div>
        )}

        {!loading && !error && contracts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                      Contract Number
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#0B1220]">
                      {contract.contractNumber}
                    </h2>
                  </div>

                  <StatusBadge status={contract.status} />
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Project</p>
                    <p className="font-semibold text-[#0B1220]">
                      {contract.project.name}
                    </p>
                    <p className="text-xs text-[#667085]">
                      {contract.project.projectCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-[rgba(15,23,42,0.08)] pt-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Contract Date</p>
                      <p className="mt-0.5 font-medium text-[#0B1220]">
                        {formatDate(contract.contractDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Contract Value</p>
                      <p className="mt-0.5 font-bold text-[#2563EB]">
                        {formatAmount(contract.contractValue)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-[rgba(15,23,42,0.08)] pt-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Start Date</p>
                      <p className="mt-0.5 font-medium text-[#0B1220]">
                        {formatDate(contract.startDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Completion Date</p>
                      <p className="mt-0.5 font-medium text-[#0B1220]">
                        {formatDate(contract.completionDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/contracts/${contract.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  >
                    View Contract →
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