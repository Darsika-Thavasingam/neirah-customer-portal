"use client";

import { useEffect, useState, useMemo } from "react";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";
import { downloadExcelReport, downloadValidPdfFile } from "../lib/excelExporter";

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
  clientSignatory?: string;
  contractorSignatory?: string;
  retainageRate?: string;
  defectsPeriod?: string;
};

const MOCK_DEMO_CONTRACTS: Contract[] = [
  {
    id: "c1",
    contractNumber: "CNT-2026-042",
    contractDate: "2026-04-20",
    contractValue: "45000000",
    startDate: "2026-05-01",
    completionDate: "2027-04-30",
    status: "ACTIVE",
    documentUrl: "#",
    project: {
      id: "2e79e9a8-1c38-4e71-b506-3232ab8d6ed4",
      projectCode: "CUE-COL-01",
      name: "Harbourfront Pinnacle Tower",
    },
    clientSignatory: "Ceylon Urban Estates (Pvt) Ltd — Board of Directors",
    contractorSignatory: "Eng. Damith Perera (Managing Director, Neirah Construction)",
    retainageRate: "5.0% withheld per interim valuation",
    defectsPeriod: "12 Months Post Practical Handover",
  },
  {
    id: "c2",
    contractNumber: "CNT-2026-055",
    contractDate: "2026-06-15",
    contractValue: "18500000",
    startDate: "2026-07-01",
    completionDate: "2027-02-28",
    status: "ACTIVE",
    documentUrl: "#",
    project: {
      id: "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b",
      projectCode: "MIH-BIY-01",
      name: "Biyagama Mega Logistics & Warehousing Depot",
    },
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
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const userId = getActiveUserId();
        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/contracts`,
          { headers: userId ? { "x-user-id": userId } : {} }
        ).catch(() => null);

        let data: any[] = [];
        if (response && response.ok) {
          data = await response.json();
        }

        setContracts(Array.isArray(data) && data.length > 0 ? data : MOCK_DEMO_CONTRACTS);
      } catch (err) {
        console.error(err);
        setContracts(MOCK_DEMO_CONTRACTS);
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

  const handleDownloadContractPdf = (contract: Contract) => {
    downloadValidPdfFile(
      `${contract.contractNumber}_Legal_Agreement.pdf`,
      `NEIRAH CONSTRUCTION OS - LEGAL AGREEMENT ${contract.contractNumber}`,
      {
        "Project": contract.project?.name || "Construction Project",
        "Contract Ref": contract.contractNumber,
        "Total Value": `LKR ${formatAmount(contract.contractValue)}`,
        "Signing Date": formatDate(contract.contractDate),
        "Commencement Date": formatDate(contract.startDate),
        "Completion Target": formatDate(contract.completionDate),
        "Client Signatory": contract.clientSignatory || "Authorized Executive",
        "Contractor": contract.contractorSignatory || "Eng. Damith Perera",
        "Retainage Terms": contract.retainageRate || "5.0% Retention",
      }
    );
  };

  const handleExportExcel = (list: Contract[] = filteredContracts) => {
    downloadExcelReport(
      "ALL MASTER CONTRACTS EXTRACTION REPORT",
      "Customer_Portal_Contracts_Export.xls",
      [
        { header: "Contract Ref", key: "contractNumber" },
        { header: "Project Code", key: "projectCode" },
        { header: "Project Name", key: "projectName" },
        { header: "Contract Value (LKR)", key: "contractValue", style: "amount" },
        { header: "Signing Date", key: "contractDate" },
        { header: "Commencement Date", key: "startDate" },
        { header: "Completion Target", key: "completionDate" },
        { header: "Status", key: "status", style: "status-paid" },
      ],
      list.map((c) => ({
        contractNumber: c.contractNumber,
        projectCode: c.project?.projectCode || "—",
        projectName: c.project?.name || "—",
        contractValue: c.contractValue,
        contractDate: formatDate(c.contractDate),
        startDate: formatDate(c.startDate),
        completionDate: formatDate(c.completionDate),
        status: c.status,
      }))
    );
  };

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
      <PageHeader
        kicker="LEGAL REPOSITORY"
        title="Master Contracts & Legal Agreements"
        subtitle="Binding contractual commitments, terms of delivery, milestone schedules, and financial scope agreements."
        bgImage="/images/project-industrial.png"
      />

      {error && (
        <ErrorState title="Unable to load contracts" message={error} />
      )}

      {!error && (
        <>
          {/* Executive KPI Summary — Borderless Horizontal Stats Bar */}
          <div className="mb-8 border-y border-slate-200 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-100 sm:divide-slate-200">
            <div className="flex flex-col justify-center">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] block mb-1">Total Contracts</span>
              <div className="text-2xl font-black text-[#0B1220]">{stats.total}</div>
              <p className="text-[0.68rem] font-bold text-[#667085]">Executed Agreements</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#067647] block mb-1">Active Contracts</span>
              <div className="text-2xl font-black text-[#067647]">{stats.active}</div>
              <p className="text-[0.68rem] font-bold text-[#067647]">Under Execution</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#2563EB] block mb-1">Completed</span>
              <div className="text-2xl font-black text-[#2563EB]">{stats.completed}</div>
              <p className="text-[0.68rem] font-bold text-[#2563EB]">Fulfilled</p>
            </div>
            <div className="flex flex-col justify-center pl-4">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#D97706] block mb-1">Total Capital</span>
              <div className="text-xl font-black text-[#B45309] truncate">
                LKR {formatAmount(stats.totalValue)}
              </div>
              <p className="text-[0.68rem] font-bold text-[#D97706]">Committed Capital</p>
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
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

            <div className="flex flex-wrap items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-2xl">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "ALL" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedStatus("ACTIVE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "ACTIVE" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setSelectedStatus("COMPLETED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "COMPLETED" ? "bg-[#2563EB] text-white" : "text-[#667085]"}`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>

          {/* Contracts Row List */}
          {filteredContracts.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#667085]">
              <EmptyState
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                }
                title="No contracts found"
                body="No contracts match your search keywords or filter criteria."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredContracts.map((contract) => (
                <div key={contract.id} className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-black text-[#0B1220]">
                        {contract.contractNumber}
                      </h2>
                      <StatusBadge status={contract.status} />
                    </div>

                    {contract.project && (
                      <p className="text-xs font-extrabold text-[#2563EB]">
                        {contract.project.name} <span className="text-[#667085] font-normal">({contract.project.projectCode})</span>
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#667085]">
                      <span>Signing: <strong className="text-[#0B1220]">{formatDate(contract.contractDate)}</strong></span>
                      <span>Commenced: <strong className="text-[#0B1220]">{formatDate(contract.startDate)}</strong></span>
                      <span>Completion: <strong className="text-[#0B1220]">{formatDate(contract.completionDate)}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 w-full md:w-auto justify-between">
                    <div className="text-right">
                      <span className="meta-label block">Contract Valuation</span>
                      <p className="text-lg font-black text-[#2563EB]">
                        LKR {formatAmount(contract.contractValue)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleExportExcel([contract])}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#067647] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shrink-0 inline-flex items-center gap-1"
                        title="Extract contract record to Excel"
                      >
                        📊 XLSX
                      </button>
                      <button
                        onClick={() => handleDownloadContractPdf(contract)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shrink-0 inline-flex items-center gap-1"
                        title="Download contract PDF"
                      >
                        📥 PDF
                      </button>
                      <button
                        onClick={() => setSelectedContract(contract)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm transition-all shrink-0 inline-flex items-center gap-1"
                      >
                        Inspect Agreement →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Full Legal Contract Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  {selectedContract.contractNumber}
                </span>
                <h3 className="text-lg font-black text-[#0B1220] mt-2 leading-snug">
                  {selectedContract.project?.name ? `${selectedContract.project.name} Master Agreement` : "Construction Execution Contract"}
                </h3>
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
                  <p className="text-2xl font-black text-white">LKR {formatAmount(selectedContract.contractValue)}</p>
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
                  CIDA C1 Master Conditions & Schedule
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Signing Date:</span>
                    <p className="font-bold text-slate-900">{formatDate(selectedContract.contractDate)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Commencement Date:</span>
                    <p className="font-bold text-slate-900">{formatDate(selectedContract.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Completion:</span>
                    <p className="font-bold text-slate-900">{formatDate(selectedContract.completionDate)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Retainage Rate:</span>
                    <p className="font-bold text-slate-900">{selectedContract.retainageRate || "5.0% Retention"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedContract(null)}
                className="btn btn-ghost btn-sm text-xs"
              >
                Close Window
              </button>
              <button
                onClick={() => handleExportExcel([selectedContract])}
                className="btn bg-[#067647] hover:bg-[#05603A] text-white btn-sm flex-1 text-xs font-bold"
              >
                📊 Extract XLSX
              </button>
              <button
                onClick={() => handleDownloadContractPdf(selectedContract)}
                className="btn btn-primary btn-sm flex-1 text-xs font-bold shadow-lg"
              >
                📥 Download Signed Legal Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}