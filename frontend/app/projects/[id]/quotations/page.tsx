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

type Quotation = {
  id: string;
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  total: string;
  status: string;
  scopeSummary?: string;
};

const MOCK_DEMO_QUOTATIONS: Quotation[] = [
  {
    id: "q1",
    quotationNumber: "QT-2026-088",
    issueDate: "2026-04-15",
    validUntil: "2026-05-15",
    total: "45000000",
    status: "APPROVED",
    scopeSummary: "12-Story Structural Reinforced Concrete Superstructure & Façade Works",
  },
  {
    id: "q2",
    quotationNumber: "QT-2026-102",
    issueDate: "2026-06-10",
    validUntil: "2026-07-10",
    total: "18500000",
    status: "SENT",
    scopeSummary: "MEP Central HVAC, Fire Suppression & Electrical First Fix Package",
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(date: string) {
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

export default function ProjectQuotationsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};

        const [projRes, quotRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/quotations`, { headers, cache: "no-store" }).catch(() => null),
        ]);

        let projData: any = null;
        if (projRes && projRes.ok) {
          projData = await projRes.json();
        }

        const quotData = quotRes && quotRes.ok ? await quotRes.json() : [];

        setProject(projData || getDemoProjectById(projectId));
        setQuotations(Array.isArray(quotData) && quotData.length > 0 ? quotData : MOCK_DEMO_QUOTATIONS);
      } catch (err) {
        console.error(err);
        setProject(getDemoProjectById(projectId));
        setQuotations(MOCK_DEMO_QUOTATIONS);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project quotations…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/" className="back-link mb-5 inline-flex">← Back to Dashboard</Link>

      {project && <ProjectSubNav project={project} />}

      <div className="card p-[#1.5rem]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-heading">Commercial Quotations & BOQ Estimates</h2>
            <p className="text-xs text-[#667085] mt-0.5">Approved commercial proposals and itemized BOQ estimates.</p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">
            {quotations.length} Quotation Proposals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>Scope Summary</th>
                <th>Issue Date</th>
                <th>Valid Until</th>
                <th className="text-right">Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-[#F7F9FC]">
                  <td className="font-bold text-[#2563EB]">{q.quotationNumber}</td>
                  <td className="text-xs text-[#344054] font-medium max-w-xs">{q.scopeSummary || "Commercial Work Package BOQ"}</td>
                  <td className="text-xs text-[#667085]">{formatDate(q.issueDate)}</td>
                  <td className="text-xs text-[#667085]">{formatDate(q.validUntil)}</td>
                  <td className="text-right font-bold text-[#0B1220]">{formatAmount(q.total)}</td>
                  <td><StatusBadge status={q.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
