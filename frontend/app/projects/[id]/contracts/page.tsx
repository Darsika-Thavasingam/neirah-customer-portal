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
  clientSignatory?: string;
  contractorSignatory?: string;
  retainageRate?: string;
  defectsPeriod?: string;
};

const MOCK_DEMO_CONTRACTS: Contract[] = [
  {
    id: "c1",
    contractNumber: "CNT-2026-042",
    title: "Harbourfront Pinnacle Tower — Main Structural Execution Contract (CIDA C1 Standard)",
    contractValue: "45000000",
    signedDate: "2026-04-20",
    status: "ACTIVE",
    clientSignatory: "Ceylon Urban Estates (Pvt) Ltd — Board of Directors",
    contractorSignatory: "Eng. Damith Perera (Managing Director, Neirah Construction)",
    retainageRate: "5.0% withheld per interim valuation",
    defectsPeriod: "12 Months Post Practical Handover",
  },
  {
    id: "c2",
    contractNumber: "CNT-2026-055",
    title: "Biyagama Mega Depot — Sub-Contract: Structural Steel & Fire Suppression Systems",
    contractValue: "18500000",
    signedDate: "2026-06-15",
    status: "ACTIVE",
    clientSignatory: "Meridian Industrial Holdings PLC — Executive Committee",
    contractorSignatory: "Eng. Roshan Jayasinghe (Project Lead, Neirah Construction)",
    retainageRate: "2.5% withheld per interim valuation",
    defectsPeriod: "24 Months Industrial Warranty",
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
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

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

  const handleDownloadContractPdf = (contract: Contract) => {
    const textContent = `NEIRAH CONSTRUCTION OS - MASTER LEGAL AGREEMENT\n----------------------------------------------------\nContract Ref: ${contract.contractNumber}\nTitle: ${contract.title}\nTotal Agreed Value: LKR ${formatAmount(contract.contractValue)}\nSigning Date: ${formatDate(contract.signedDate)}\nClient Signatory: ${contract.clientSignatory || "Authorized Client Representative"}\nContractor Signatory: ${contract.contractorSignatory || "Eng. Damith Perera (Managing Director)"}\nRetainage Terms: ${contract.retainageRate || "5% Retention"}\nDefect Liability Period: ${contract.defectsPeriod || "12 Months"}\nStandard: CIDA C1 Construction Conditions of Contract (2026 Rev)\n----------------------------------------------------\nTHIS AGREEMENT IS BINDING UNDER THE LAWS OF SRI LANKA.`;
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contract.contractNumber}_Legal_Agreement.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            <p className="text-xs text-[#667085] mt-0.5">Click any contract row to inspect full legal clauses, signatories, and retainage terms.</p>
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
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedContract(c)}
                  className="cursor-pointer hover:bg-blue-50/60 transition group"
                >
                  <td>
                    <p className="font-bold text-[#0B1220] group-hover:text-[#2563EB] transition">{c.title}</p>
                    <p className="text-xs font-mono text-[#2563EB]">{c.contractNumber}</p>
                  </td>
                  <td className="text-xs text-[#667085]">{formatDate(c.signedDate)}</td>
                  <td className="text-right font-black text-[#0B1220]">{formatAmount(c.contractValue)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContract(c);
                      }}
                      className="btn btn-ghost btn-sm text-xs font-bold"
                    >
                      🔍 Inspect Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Legal Contract Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  {selectedContract.contractNumber}
                </span>
                <h3 className="text-lg font-black text-[#0B1220] mt-2 leading-snug">{selectedContract.title}</h3>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-6 space-y-4">
              {/* Financial Highlight */}
              <div className="rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] p-5 text-white shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-cyan-300">Total Contract Value</span>
                  <p className="text-2xl font-black text-white">{formatAmount(selectedContract.contractValue)}</p>
                </div>
                <StatusBadge status={selectedContract.status} />
              </div>

              {/* Signatories & Terms */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="meta-label">Client Signatory</span>
                  <p className="font-bold text-[#0B1220] mt-1">{selectedContract.clientSignatory || "Authorized Client Executive"}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="meta-label">Contractor Signatory</span>
                  <p className="font-bold text-[#0B1220] mt-1">{selectedContract.contractorSignatory || "Eng. Damith Perera (Managing Director)"}</p>
                </div>
              </div>

              {/* Key Clauses */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-3">
                <h4 className="font-black text-[#0B1220] uppercase text-[0.7rem] tracking-wider border-b border-slate-200 pb-2">
                  CIDA C1 Master Conditions & Clauses
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Signing Date:</span>
                    <p className="font-bold text-slate-900">{formatDate(selectedContract.signedDate)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Retainage Rate:</span>
                    <p className="font-bold text-slate-900">{selectedContract.retainageRate || "5% Retention"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Defect Liability:</span>
                    <p className="font-bold text-slate-900">{selectedContract.defectsPeriod || "12 Months"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Dispute Jurisdiction:</span>
                    <p className="font-bold text-slate-900">Colombo Arbitration Center</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedContract(null)}
                className="btn btn-ghost btn-sm flex-1 text-xs"
              >
                Close Window
              </button>
              <button
                onClick={() => handleDownloadContractPdf(selectedContract)}
                className="btn btn-primary btn-sm flex-1 text-xs font-bold shadow-lg"
              >
                📥 Download Signed Contract (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
