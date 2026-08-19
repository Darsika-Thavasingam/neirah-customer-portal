'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import StatusBadge from '../../components/StatusBadge';
import { getActiveUserId } from '../../lib/auth';

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export default function ContractDetailsPage() {
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadContract() {
      try {
        setLoading(true);
        setError('');

        if (!getActiveUserId()) {
          throw new Error('Customer portal user is not configured.');
        }

        const response = await fetch(
          `${API_URL}/api/v1/customer-portal/contracts/${contractId}`,
          {
            headers: {
              'x-user-id': getActiveUserId(),
            },
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Contract not found.');
          }

          throw new Error('Failed to load contract.');
        }

        const data = await response.json();
        setContract(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load contract.',
        );
      } finally {
        setLoading(false);
      }
    }

    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  function formatDate(date: string | null) {
    if (!date) return '—';

    return new Date(date).toLocaleDateString();
  }

  function formatAmount(value: string) {
    return Number(value).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <p className="text-sm text-[#667085]">Loading contract...</p>
        </div>
      </main>
    );
  }

  if (error || !contract) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/contracts"
            className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            ← Back to Contracts
          </Link>

          <div className="mt-6 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            <h1 className="font-bold">Unable to load contract</h1>
            <p className="mt-2 text-sm font-normal text-[#B42318]">
              {error || 'Contract not found.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/contracts"
          className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          ← Back to Contracts
        </Link>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Contract
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1220] sm:text-3xl">
                {contract.contractNumber}
              </h1>

              {contract.project && (
                <p className="mt-1 text-sm text-[#667085]">
                  {contract.project.name} · {contract.project.projectCode}
                </p>
              )}
            </div>

            <StatusBadge status={contract.status} />
          </div>
        </div>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">
              Contract Overview
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Contract Number
                </p>

                <p className="mt-1 font-semibold text-[#0B1220]">
                  {contract.contractNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Contract Date
                </p>

                <p className="mt-1 font-medium text-[#0B1220]">
                  {formatDate(contract.contractDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Contract Value
                </p>

                <p className="mt-1 text-xl font-bold text-[#2563EB]">
                  LKR {formatAmount(contract.contractValue)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Status
                </p>

                <div className="mt-1">
                  <StatusBadge status={contract.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">
              Contract Dates
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Start Date
                </p>

                <p className="mt-1 font-medium text-[#0B1220]">
                  {formatDate(contract.startDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Expected Completion
                </p>

                <p className="mt-1 font-medium text-[#0B1220]">
                  {formatDate(contract.completionDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Project
                </p>

                <p className="mt-1 font-semibold text-[#0B1220]">
                  {contract.project?.name || '—'}
                </p>

                {contract.project?.projectCode && (
                  <p className="mt-0.5 text-xs text-[#667085]">
                    {contract.project.projectCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <h2 className="text-lg font-bold text-[#0B1220]">
            Customer Details
          </h2>

          <div className="mt-5 grid gap-5 text-sm md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Company
              </p>

              <p className="mt-1 font-semibold text-[#0B1220]">
                {contract.customer.companyName || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Contact
              </p>

              <p className="mt-1 font-semibold text-[#0B1220]">
                {contract.customer.contactName}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Email
              </p>

              <p className="mt-1 font-semibold text-[#0B1220]">
                {contract.customer.email}
              </p>
            </div>
          </div>
        </section>

        {contract.documentUrl && (
          <section className="mt-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">
              Contract Document
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              A customer-visible contract document is available.
            </p>

            <a
              href={contract.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              View / Download Contract Document
            </a>
          </section>
        )}
      </div>
    </main>
  );
}