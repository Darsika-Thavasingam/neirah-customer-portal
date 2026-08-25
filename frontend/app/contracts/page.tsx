"use client";

import { useEffect, useState, useMemo } from "react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: string | number) {
  return Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

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

  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status.toUpperCase() === "ACTIVE" || c.status.toUpperCase() === "IN_PROGRESS").length;
    const completed = contracts.filter((c) => c.status.toUpperCase() === "COMPLETED").length;
    const totalValue = contracts.reduce((acc, c) => acc + (parseFloat(c.contractValue) || 0), 0);
    return { total, active, completed, totalValue };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.contractNumber.toLowerCase().includes(q) ||
        (c.project && c.project.name.toLowerCase().includes(q)) ||
        (c.project && c.project.projectCode.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedStatus !== "ALL") {
        const norm = c.status.toUpperCase();
        if (selectedStatus === "ACTIVE" && norm !== "ACTIVE" && norm !== "IN_PROGRESS") return false;
        if (selectedStatus === "COMPLETED" && norm !== "COMPLETED") return false;
      }
      return true;
    });
  }, [contracts, searchQuery, selectedStatus]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Commercial" title="Master Contracts" />
        <PageLoading message="Loading contract agreements…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      {/* Hero Visual Header Banner */}
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-3xl bg-[#0B1220] shadow-md">
        <img
          src="/images/project-commercial.png"
          alt="Master Contracts"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-white/90 px-2.5 py-1 rounded-md shadow-2xs">
              Legal Repository
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Master Contracts & Legal Agreements
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Binding contractual commitments, terms of delivery, milestone schedules, and financial scope agreements.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <ErrorState title="Unable to load contracts" message={error} />
      )}

      {!error && (
        <>
          {/* Executive KPI Summary */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Total Contracts</span>
              <div className="metric-value">{stats.total}</div>
              <p className="mt-1 text-xs text-[#667085]">Executed Agreements</p>
            </div>
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Active Contracts</span>
              <div className="metric-value text-[#067647]">{stats.active}</div>
              <p className="mt-1 text-xs text-[#067647]">Under Execution</p>
            </div>
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Completed</span>
              <div className="metric-value text-[#2563EB]">{stats.completed}</div>
              <p className="mt-1 text-xs text-[#2563EB]">Fulfilled</p>
            </div>
            <div className="metric-card card-hover hover-lift shimmer-card">
              <span className="metric-label">Total Contracted Capital</span>
              <div className="metric-value text-sm sm:text-base text-[#0B1220] truncate">
                LKR {formatAmount(stats.totalValue)}
              </div>
              <p className="mt-1 text-xs text-[#667085]">Committed Capital</p>
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="mb-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-2xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search by contract number or project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs py-2.5 pl-4 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#667085] hover:text-[#0B1220]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`tab-btn ${selectedStatus === "ALL" ? "tab-btn-active" : ""}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedStatus("ACTIVE")}
                className={`tab-btn ${selectedStatus === "ACTIVE" ? "tab-btn-active" : ""}`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setSelectedStatus("COMPLETED")}
                className={`tab-btn ${selectedStatus === "COMPLETED" ? "tab-btn-active" : ""}`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>

          {/* Contracts Grid */}
          {filteredContracts.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                }
                title="No contracts found"
                body="No contracts match your search keywords or filter criteria."
              />
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredContracts.map((contract) => (
                <div key={contract.id} className="card card-hover hover-lift shimmer-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085]">
                          Contract Reference
                        </span>
                        <h2 className="mt-0.5 text-xl font-bold text-[#0B1220]">
                          {contract.contractNumber}
                        </h2>
                      </div>
                      <StatusBadge status={contract.status} />
                    </div>

                    {contract.project && (
                      <div className="mt-4 rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#F8FAFC] p-3.5">
                        <span className="meta-label">Associated Project</span>
                        <p className="mt-0.5 text-sm font-bold text-[#0B1220]">
                          {contract.project.name}
                        </p>
                        <p className="text-xs text-[#667085]">
                          {contract.project.projectCode}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="meta-label">Contract Valuation</span>
                        <p className="mt-1 text-lg font-bold text-[#2563EB]">
                          LKR {formatAmount(contract.contractValue)}
                        </p>
                      </div>
                      <div>
                        <span className="meta-label">Signing Date</span>
                        <p className="mt-1 text-xs font-semibold text-[#0B1220]">{formatDate(contract.contractDate)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[rgba(15,23,42,0.06)] pt-4 text-xs">
                      <div>
                        <span className="meta-label">Commencement Date</span>
                        <p className="font-semibold text-[#0B1220] mt-0.5">{formatDate(contract.startDate)}</p>
                      </div>
                      <div>
                        <span className="meta-label">Completion Date</span>
                        <p className="font-semibold text-[#0B1220] mt-0.5">{formatDate(contract.completionDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-[rgba(15,23,42,0.06)] pt-4">
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="btn btn-primary btn-sm flex-1 text-center hover-lift"
                    >
                      View Full Agreement →
                    </Link>
                    {contract.documentUrl && (
                      <a
                        href={contract.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        Document PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}