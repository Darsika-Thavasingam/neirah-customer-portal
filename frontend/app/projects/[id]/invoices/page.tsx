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

type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  balanceAmount?: string | number;
  status: string;
};

const MOCK_DEMO_INVOICES: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2026-001",
    issueDate: "2026-05-01",
    dueDate: "2026-05-31",
    totalAmount: 15000000,
    paidAmount: 15000000,
    balanceAmount: 0,
    status: "PAID",
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2026-002",
    issueDate: "2026-07-01",
    dueDate: "2026-07-31",
    totalAmount: 30000000,
    paidAmount: 20000000,
    balanceAmount: 10000000,
    status: "PARTIALLY_PAID",
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
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(n || 0);
}

export default function ProjectInvoicesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers = userId ? { "x-user-id": userId } : {};

        const [projRes, invRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/invoices`, { headers, cache: "no-store" }).catch(() => null),
        ]);

        let projData: any = null;
        if (projRes && projRes.ok) {
          projData = await projRes.json();
        }

        const invData = invRes && invRes.ok ? await invRes.json() : [];

        setProject(projData || getDemoProjectById(projectId));
        setInvoices(Array.isArray(invData) && invData.length > 0 ? invData : MOCK_DEMO_INVOICES);
      } catch (err) {
        console.error(err);
        setProject(getDemoProjectById(projectId));
        setInvoices(MOCK_DEMO_INVOICES);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project invoices…" />
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
            <h2 className="section-heading">Project Billing & Progress Invoices</h2>
            <p className="text-xs text-[#667085] mt-0.5">Itemized interim billing statements and progress claims.</p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">
            {invoices.length} Issued Invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th className="text-right">Total Amount</th>
                <th className="text-right">Paid Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const total = inv.totalAmount ?? inv.balanceAmount ?? 0;
                const paid = inv.paidAmount ?? 0;
                return (
                  <tr key={inv.id} className="hover:bg-[#F7F9FC]">
                    <td className="font-bold text-[#2563EB]">{inv.invoiceNumber}</td>
                    <td className="text-xs text-[#667085]">{formatDate(inv.issueDate)}</td>
                    <td className="text-xs text-[#667085]">{formatDate(inv.dueDate)}</td>
                    <td className="text-right font-bold text-[#0B1220]">{formatAmount(total)}</td>
                    <td className="text-right font-bold text-[#067647]">{formatAmount(paid)}</td>
                    <td><StatusBadge status={inv.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
