"use client";

import { useState, useMemo } from "react";
import StatusBadge from "./StatusBadge";
import { downloadExcelReport } from "../lib/excelExporter";

export type Milestone = {
  id: string;
  name: string;
  description: string | null;
  plannedDate: string | null;
  actualCompletionDate: string | null;
  status: string;
  progress: number;
  criticalPath?: boolean;
  dependencies?: string[];
};

interface GanttTimelineViewProps {
  milestones: Milestone[];
  projectName: string;
  projectCode: string;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const MONTH_HEADER = [
  { code: "M1", label: "Jan '26" },
  { code: "M2", label: "Feb '26" },
  { code: "M3", label: "Mar '26" },
  { code: "M4", label: "Apr '26" },
  { code: "M5", label: "May '26" },
  { code: "M6", label: "Jun '26" },
  { code: "M7", label: "Jul '26" },
  { code: "M8", label: "Aug '26" },
];

export default function GanttTimelineView({
  milestones,
  projectName,
  projectCode,
}: GanttTimelineViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showCriticalOnly, setShowCriticalOnly] = useState<boolean>(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      if (showCriticalOnly && !m.criticalPath && idxIsCritical(m, milestones)) {
        return false;
      }
      if (selectedStatus !== "ALL") {
        const norm = m.status.toUpperCase();
        if (selectedStatus === "COMPLETED" && norm !== "COMPLETED") return false;
        if (
          selectedStatus === "IN_PROGRESS" &&
          !["IN_PROGRESS", "IN PROGRESS", "ACTIVE"].includes(norm)
        )
          return false;
        if (selectedStatus === "DELAYED" && norm !== "DELAYED") return false;
        if (
          selectedStatus === "UPCOMING" &&
          ["COMPLETED", "IN_PROGRESS", "IN PROGRESS", "ACTIVE", "DELAYED"].includes(norm)
        )
          return false;
      }
      return true;
    });
  }, [milestones, selectedStatus, showCriticalOnly]);

  function idxIsCritical(m: Milestone, all: Milestone[]): boolean {
    const idx = all.findIndex((x) => x.id === m.id);
    return idx === 0 || idx === 1 || m.criticalPath === true;
  }

  // Export Gantt data to Excel
  const handleExportGanttExcel = () => {
    const columns = [
      { header: "Phase / Sequence", key: "seq" },
      { header: "Milestone Deliverable", key: "name" },
      { header: "Description", key: "description" },
      { header: "Status", key: "status" },
      { header: "Progress (%)", key: "progress" },
      { header: "Target Planned Date", key: "plannedDate" },
      { header: "Actual Completion Date", key: "actualDate" },
      { header: "Critical Path", key: "critical" },
    ];

    const data = filteredMilestones.map((m, idx) => ({
      seq: `Phase ${idx + 1}`,
      name: m.name,
      description: m.description || "N/A",
      status: m.status,
      progress: `${m.progress}%`,
      plannedDate: formatDate(m.plannedDate),
      actualDate: formatDate(m.actualCompletionDate),
      critical: idxIsCritical(m, milestones) ? "YES (CRITICAL)" : "Standard",
    }));

    downloadExcelReport(
      `GANTT TIMELINE SCHEDULE — ${projectCode} (${projectName})`,
      `${projectCode}_Gantt_Schedule.xls`,
      columns,
      data
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-[#667085] tracking-wider mr-1">Filter:</span>
          {["ALL", "COMPLETED", "IN_PROGRESS", "DELAYED", "UPCOMING"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? "bg-[#2563EB] text-white shadow-2xs"
                  : "bg-white text-[#475467] hover:bg-slate-200/60 border border-slate-200"
              }`}
            >
              {st === "ALL"
                ? "All Phases"
                : st === "IN_PROGRESS"
                ? "In Progress"
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Critical Path Toggle & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              showCriticalOnly
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-300"
            }`}
          >
            ⚡ {showCriticalOnly ? "Showing Critical Path Only" : "Highlight Critical Path"}
          </button>
          <button
            onClick={handleExportGanttExcel}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#067647] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all inline-flex items-center gap-1 shrink-0"
            title="Export Gantt Schedule to Excel"
          >
            📊 Export XLSX Timeline
          </button>
        </div>
      </div>

      {/* Interactive Gantt Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#0B1220] text-white text-[0.7rem] uppercase tracking-wider font-extrabold">
                <th className="py-3 px-4 w-72 border-r border-slate-800">Phase & Deliverable</th>
                <th className="py-3 px-3 w-28 text-center border-r border-slate-800">Progress</th>
                {MONTH_HEADER.map((m) => (
                  <th key={m.code} className="py-3 px-2 text-center border-r border-slate-800/80 min-w-[70px]">
                    <div>{m.code}</div>
                    <div className="text-[0.6rem] font-bold text-blue-300 normal-case">{m.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMilestones.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#667085]">
                    No milestones match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMilestones.map((m, idx) => {
                  const isCritical = idxIsCritical(m, milestones);
                  const startCol = Math.max(0, Math.min(idx, 5));
                  const spanCols = Math.max(2, Math.min(8 - startCol, 3));
                  const isCompleted = m.status.toUpperCase() === "COMPLETED";
                  const isDelayed = m.status.toUpperCase() === "DELAYED";
                  const isActive = ["IN_PROGRESS", "IN PROGRESS", "ACTIVE"].includes(m.status.toUpperCase());

                  const barBg = isCompleted
                    ? "bg-[#067647]"
                    : isDelayed
                    ? "bg-[#B42318]"
                    : isActive
                    ? "bg-[#2563EB]"
                    : "bg-slate-400";

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMilestone(m)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                        isCritical ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Milestone Title Column */}
                      <td className="py-3 px-4 border-r border-slate-100 font-medium">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-[#475467]">
                            Phase {idx + 1}
                          </span>
                          {isCritical && (
                            <span className="text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                              ⚡ Critical Path
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-[#0B1220] group-hover:text-[#2563EB] transition-colors truncate max-w-[250px]">
                          {m.name}
                        </h4>
                        <span className="text-[0.68rem] text-[#667085] block mt-0.5">
                          Target: {formatDate(m.plannedDate)}
                        </span>
                      </td>

                      {/* Progress Gauge Column */}
                      <td className="py-3 px-3 border-r border-slate-100 text-center">
                        <StatusBadge status={m.status} />
                        <div className="mt-1.5 font-black text-[0.72rem] text-[#0B1220]">{m.progress}%</div>
                      </td>

                      {/* Month Gantt Grid Columns */}
                      {MONTH_HEADER.map((mHeader, mIdx) => {
                        const isInRange = mIdx >= startCol && mIdx < startCol + spanCols;
                        const isBarStart = mIdx === startCol;
                        const isBarEnd = mIdx === startCol + spanCols - 1;

                        return (
                          <td
                            key={mHeader.code}
                            className="py-3 px-1 border-r border-slate-100/80 relative align-middle"
                          >
                            {isInRange && (
                              <div
                                className={`h-7 rounded-lg ${barBg} text-white flex items-center justify-between px-2 shadow-xs transition-transform duration-200 group-hover:scale-[1.02] ${
                                  isBarStart ? "rounded-l-lg" : ""
                                } ${isBarEnd ? "rounded-r-lg" : ""}`}
                              >
                                {isBarStart && (
                                  <span className="text-[0.65rem] font-black truncate max-w-[90px]">
                                    {m.progress}%
                                  </span>
                                )}
                                {isBarEnd && (
                                  <span className="text-[0.6rem] opacity-90">➔</span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Milestone Detail Popover / Modal */}
      {selectedMilestone && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedMilestone(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.65rem] font-black uppercase text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    Project Deliverable Breakdown
                  </span>
                  <StatusBadge status={selectedMilestone.status} />
                </div>
                <h3 className="text-lg font-black text-[#0B1220]">{selectedMilestone.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-[#475467] leading-relaxed">
              {selectedMilestone.description ||
                "Structural engineering milestone phase governing technical execution, material compliance, and site inspection sign-offs."}
            </p>

            {/* Progress Meter */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-[#0B1220]">Delivery Completion Gauge</span>
                <span className="font-black text-[#2563EB] text-sm">{selectedMilestone.progress}%</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                  style={{ width: `${selectedMilestone.progress}%` }}
                />
              </div>
            </div>

            {/* Dates & Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[0.65rem] font-bold text-[#98A2B3] uppercase block">Target Start / Plan</span>
                <span className="font-black text-[#0B1220]">{formatDate(selectedMilestone.plannedDate)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[0.65rem] font-bold text-[#98A2B3] uppercase block">Actual Sign-Off</span>
                <span
                  className="font-black"
                  style={{ color: selectedMilestone.actualCompletionDate ? "#067647" : "#667085" }}
                >
                  {formatDate(selectedMilestone.actualCompletionDate)}
                </span>
              </div>
            </div>

            {/* Milestone Tasks Checklist */}
            <div className="space-y-2">
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-[#667085]">
                Technical Deliverables & Sign-offs
              </span>
              <div className="space-y-1.5 text-xs text-[#334155]">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>CIDA Standard Structural Engineering Approval</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>On-site Quality Assurance Inspection & Testing</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                  <span className="text-blue-600 font-bold">⏱</span>
                  <span>Contractor Sign-off Certificate & Valuation Log</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-all shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
