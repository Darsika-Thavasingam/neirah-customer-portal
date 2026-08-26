"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
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

const RECORD_IMAGES = [
  "/images/project-commercial.png",
  "/images/project-residential.png",
  "/images/project-industrial.png",
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};

        const projRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null);
        if (projRes) {
          if (!projRes.ok) {
            setError("Access Denied: You do not have permission to view this project's contracts.");
            setProject(null);
            setLoading(false);
            return;
          }
          const projData = await projRes.json();
          setProject(projData);

          const contRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/contracts`, { headers, cache: "no-store" }).catch(() => null);
          const contData = contRes && contRes.ok ? await contRes.json() : [];
          setContracts(Array.isArray(contData) && contData.length > 0 ? contData : MOCK_DEMO_CONTRACTS);
        } else {
          setProject(getDemoProjectById(projectId));
          setContracts(MOCK_DEMO_CONTRACTS);
        }
      } catch (err) {
        console.error(err);
        setError("Access Denied: Unable to fetch project contracts.");
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

  if (error || !project) {
    return (
      <div className="page-shell">
        <ErrorState title="Unable to load contracts" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project?.projectCode || ""} · LEGAL CONTRACTS`}
        title="Master Legal Contracts & Agreements"
        subtitle={`CIDA C1 binding construction agreements and signatories for ${project?.name || "this project"}.`}
        bgImage="/images/project-industrial.png"
        actions={
          <span className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-xs font-bold text-emerald-300 shrink-0">
            {contracts.length} Binding Contracts
          </span>
        }
      />
      {project && <ProjectSubNav project={project} />}

      {/* Animated Visual Record Cards with Side Image Thumbnails */}
      <div className="space-y-4">
        {contracts.map((c, idx) => {
          const sideImg = RECORD_IMAGES[idx % RECORD_IMAGES.length];
          return (
            <div
              key={c.id}
              onClick={() => setSelectedContract(c)}
              className="card p-5 cursor-pointer card-hover flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Side Image Thumbnail */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#0B1220]">
                  <img
                    src={sideImg}
                    alt={c.contractNumber}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[0.6rem] font-black text-white uppercase tracking-wider">
                    CIDA C1
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.68rem] font-mono font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                      {c.contractNumber}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="text-sm font-black text-[#0B1220] hover:text-[#2563EB] transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[#667085]">
                    <span>📜 Signed: {formatDate(c.signedDate)}</span>
                    <span>•</span>
                    <span>🛡️ {c.defectsPeriod || "12 Months Warranty"}</span>
                  </div>
                </div>
              </div>

              {/* Value & Action */}
              <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Contract Value</span>
                  <span className="text-lg font-black text-[#0B1220]">{formatAmount(c.contractValue)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedContract(c);
                  }}
                  className="btn btn-primary btn-sm text-xs font-bold shadow-md rounded-xl py-2 px-3"
                >
                  Inspect Agreement →
                </button>
              </div>
            </div>
          );
        })}
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
