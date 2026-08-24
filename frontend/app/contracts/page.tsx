"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

type Contract = {
  id: string;
  contractNumber: string;
  contractDate: string;
  contractValue: string;
  startDate: string | null;
  completionDate: string | null;
  status: string;
  documentUrl: string | null;
  project: {
    id: string;
    projectCode: string;
    name: string;
  } | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: string) {
  return Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const userId = getActiveUserId();
        if (!userId) throw new Error("Customer portal user is not configured.");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/contracts`,
          { headers: { "x-user-id": userId } }
        );

        if (!response.ok) throw new Error("Failed to load contracts.");

        const data = await response.json();
        setContracts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contracts.");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Contracts" title="My Contracts" />
        <PageLoading message="Loading contracts…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Contracts"
        title="My Contracts"
        subtitle="View binding contracts and legal terms related to your construction projects."
      />

      {error && (
        <ErrorState title="Unable to load contracts" message={error} />
      )}

      {!error && contracts.length === 0 && (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            }
            title="No contracts available"
            body="There are currently no customer-visible contracts. Contracts will appear here once agreed upon with your project team."
          />
        </div>
      )}

      {!error && contracts.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {contracts.map((contract) => (
            <div key={contract.id} className="card card-hover p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="meta-label">Contract Number</p>
                  <h2 className="mt-1 text-xl font-bold text-[#0B1220]">
                    {contract.contractNumber}
                  </h2>
                </div>
                <StatusBadge status={contract.status} />
              </div>

              {/* Project */}
              {contract.project && (
                <div className="mt-4 rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#F7F9FC] p-3.5">
                  <p className="meta-label">Project</p>
                  <p className="mt-0.5 text-sm font-bold text-[#0B1220]">
                    {contract.project.name}
                  </p>
                  <p className="text-xs text-[#667085]">
                    {contract.project.projectCode}
                  </p>
                </div>
              )}

              {/* Financials */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="meta-label">Contract Value</p>
                  <p className="mt-1 text-lg font-bold" style={{ color: "var(--primary)" }}>
                    LKR {formatAmount(contract.contractValue)}
                  </p>
                </div>
                <div>
                  <p className="meta-label">Contract Date</p>
                  <p className="meta-value">{formatDate(contract.contractDate)}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[rgba(15,23,42,0.06)] pt-4">
                <div>
                  <p className="meta-label">Start Date</p>
                  <p className="meta-value">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="meta-label">Completion</p>
                  <p className="meta-value">{formatDate(contract.completionDate)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[rgba(15,23,42,0.06)] pt-4">
                <Link
                  href={`/contracts/${contract.id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Contract →
                </Link>
                {contract.documentUrl && (
                  <a
                    href={contract.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    View Document
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}