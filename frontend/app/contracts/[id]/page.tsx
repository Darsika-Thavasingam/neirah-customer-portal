"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import { PageLoading } from "../../components/SkeletonLoader";
import { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";

type Contract = {
  id: string;
  contractNumber: string;
  contractDate: string;
  contractValue: string;
  startDate: string | null;
  completionDate: string | null;
  status: string;
  documentUrl: string | null;

  customer: {
    id: string;
    companyName: string | null;
    contactName: string;
    email: string;
  };

  project: {
    id: string;
    projectCode: string;
    name: string;
  } | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value: string) {
  return Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ContractDetailsPage() {
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContract() {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_URL}/api/v1/customer-portal/contracts/${contractId}`,
          {
            headers: {
              "x-user-id": getActiveUserId(),
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Contract not found.");
          }
          throw new Error("Failed to load contract.");
        }

        const data = await response.json();
        setContract(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contract.");
      } finally {
        setLoading(false);
      }
    }

    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  if (loading) {
    return (
      <div className="page-shell">
        <Link href="/contracts" className="back-link mb-5 inline-flex">
          ← Back to Contracts
        </Link>
        <PageHeader kicker="Contract Details" title="Loading..." />
        <PageLoading message="Loading contract information…" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="page-shell">
        <Link href="/contracts" className="back-link mb-5 inline-flex">
          ← Back to Contracts
        </Link>
        <ErrorState
          title="Unable to load contract"
          message={error || "Contract not found."}
          backHref="/contracts"
          backLabel="Back to Contracts"
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Link href="/contracts" className="back-link mb-5 inline-flex">
        ← Back to Contracts
      </Link>

      <PageHeader
        kicker="Contract"
        title={contract.contractNumber}
        subtitle={
          contract.project
            ? `${contract.project.name} · ${contract.project.projectCode}`
            : undefined
        }
        actions={<StatusBadge status={contract.status} />}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Contract Overview */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Contract Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="meta-label">Contract Number</p>
              <p className="mt-1 font-bold text-[#0B1220]">
                {contract.contractNumber}
              </p>
            </div>
            <div>
              <p className="meta-label">Contract Date</p>
              <p className="mt-1 font-semibold text-[#0B1220]">
                {formatDate(contract.contractDate)}
              </p>
            </div>
            <div>
              <p className="meta-label">Contract Value</p>
              <p className="mt-1 text-2xl font-black" style={{ color: "var(--primary)" }}>
                LKR {formatAmount(contract.contractValue)}
              </p>
            </div>
            <div>
              <p className="meta-label">Status</p>
              <div className="mt-1.5">
                <StatusBadge status={contract.status} />
              </div>
            </div>
          </div>
        </section>

        {/* Contract Dates & Project Link */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Contract Dates</h2>
          <div className="space-y-4">
            <div>
              <p className="meta-label">Start Date</p>
              <p className="mt-1 font-semibold text-[#0B1220]">
                {formatDate(contract.startDate)}
              </p>
            </div>
            <div>
              <p className="meta-label">Expected Completion</p>
              <p className="mt-1 font-semibold text-[#0B1220]">
                {formatDate(contract.completionDate)}
              </p>
            </div>
            {contract.project && (
              <div>
                <p className="meta-label">Linked Project</p>
                <div className="mt-2 rounded-2xl bg-[#F7F9FC] p-4">
                  <p className="text-sm font-bold text-[#0B1220]">
                    {contract.project.name}
                  </p>
                  <p className="text-xs text-[#667085]">
                    {contract.project.projectCode}
                  </p>
                  <Link
                    href={`/projects/${contract.project.id}`}
                    className="mt-2.5 inline-flex text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    View Project Detail →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Customer Details */}
        <section className="card p-6 md:col-span-2">
          <h2 className="section-heading mb-5">Customer Details</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="meta-label">Company Name</p>
              <p className="mt-1 font-bold text-[#0B1220]">
                {contract.customer.companyName || "—"}
              </p>
            </div>
            <div>
              <p className="meta-label">Contact Person</p>
              <p className="mt-1 font-semibold text-[#0B1220]">
                {contract.customer.contactName}
              </p>
            </div>
            <div>
              <p className="meta-label">Email Address</p>
              <p className="mt-1 font-semibold text-[#0B1220]">
                {contract.customer.email}
              </p>
            </div>
          </div>
        </section>

        {/* Document section */}
        {contract.documentUrl && (
          <section className="card p-6 md:col-span-2">
            <h2 className="section-heading mb-3">Contract Document</h2>
            <p className="text-sm text-[#667085]">
              A customer-visible contract document is available for this agreement.
            </p>
            <div className="mt-5">
              <a
                href={contract.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                View / Download Contract Document
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}