"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../../../components/StatusBadge";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";
import { getDemoProjectById } from "../../../lib/demoData";

type Contract = {
  id: string;
  contractNumber: string;
  title: string;
  contractValue: string;
  signedDate: string | null;
  status: string;
};

const MOCK_DEMO_CONTRACTS: Contract[] = [
  {
    id: "c1",
    contractNumber: "CNT-2026-042",
    title: "Main Construction Structural Execution Contract (CIDA C1 Standard)",
    contractValue: "45000000",
    signedDate: "2026-04-20",
    status: "ACTIVE",
  },
  {
    id: "c2",
    contractNumber: "CNT-2026-055",
    title: "Sub-Contract Agreement: High-Rise Aluminium Façade & Glazing",
    contractValue: "18500000",
    signedDate: "2026-06-15",
    status: "ACTIVE",
  },
];

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
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(n || 0);
}

export default function ProjectContractsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers = userId ? { "x-user-id": userId } : {};

        const [projRes, contRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/contracts`, { headers, cache: "no-store" }).catch(() => null),
        ]);

        let projData: any = null;
        if (projRes && projRes.ok) {
          projData = await projRes.json();
        }

        const contData = contRes && contRes.ok ? await contRes.json() : [];

        setProject(projData || getDemoProjectById(projectId));
        setContracts(Array.isArray(contData) && contData.length > 0 ? contData : MOCK_DEMO_CONTRACTS);
      } catch (err) {
        console.error(err);
        setProject(getDemoProjectById(projectId));
        setContracts(MOCK_DEMO_CONTRACTS);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project contracts…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/" className="back-link mb-5 inline-flex">← Back to Dashboard</Link>

      {project && <ProjectSubNav project={project} />}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-heading">Master Legal Contracts & Agreements</h2>
            <p className="text-xs text-[#667085] mt-0.5">Signed construction agreements and sub-contract binding documents.</p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-[#067647]">
            {contracts.length} Active Contracts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contract # & Title</th>
                <th>Signed Date</th>
                <th className="text-right">Contract Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F9FC]">
                  <td>
                    <p className="font-bold text-[#0B1220]">{c.title}</p>
                    <p className="text-xs text-[#2563EB]">{c.contractNumber}</p>
                  </td>
                  <td className="text-xs text-[#667085]">{formatDate(c.signedDate)}</td>
                  <td className="text-right font-bold text-[#0B1220]">{formatAmount(c.contractValue)}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
