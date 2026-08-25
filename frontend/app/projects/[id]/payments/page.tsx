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

type Payment = {
  id: string;
  paymentReference: string;
  paymentDate: string;
  amount: string | number;
  paymentMethod: string;
  status: string;
};

const MOCK_DEMO_PAYMENTS: Payment[] = [
  {
    id: "pay1",
    paymentReference: "PAY-SL-9921",
    paymentDate: "2026-05-15",
    amount: 15000000,
    paymentMethod: "Commercial Bank Wire Transfer",
    status: "CONFIRMED",
  },
  {
    id: "pay2",
    paymentReference: "PAY-SL-9984",
    paymentDate: "2026-07-20",
    amount: 20000000,
    paymentMethod: "Sampath Bank Wire Transfer",
    status: "CONFIRMED",
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

export default function ProjectPaymentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers = userId ? { "x-user-id": userId } : {};

        const [projRes, payRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/payments`, { headers, cache: "no-store" }).catch(() => null),
        ]);

        let projData: any = null;
        if (projRes && projRes.ok) {
          projData = await projRes.json();
        }

        const payData = payRes && payRes.ok ? await payRes.json() : [];

        setProject(projData || getDemoProjectById(projectId));
        setPayments(Array.isArray(payData) && payData.length > 0 ? payData : MOCK_DEMO_PAYMENTS);
      } catch (err) {
        console.error(err);
        setProject(getDemoProjectById(projectId));
        setPayments(MOCK_DEMO_PAYMENTS);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading payment transactions…" />
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
            <h2 className="section-heading">Payment Receipts & Bank Remittances</h2>
            <p className="text-xs text-[#667085] mt-0.5">Verified bank wire receipts and escrow payment confirmations.</p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-[#067647]">
            {payments.length} Verified Remittances
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
                <th className="text-right">Remitted Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#F7F9FC]">
                  <td className="font-bold text-[#0B1220]">{p.paymentReference}</td>
                  <td className="text-xs text-[#667085]">{formatDate(p.paymentDate)}</td>
                  <td className="text-xs text-[#344054] font-medium">{p.paymentMethod || "Bank Transfer"}</td>
                  <td className="text-right font-bold text-[#067647]">{formatAmount(p.amount)}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
