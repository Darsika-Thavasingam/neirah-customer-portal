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

type Milestone = {
  id: string;
  name: string;
  description: string | null;
  plannedDate: string | null;
  actualCompletionDate: string | null;
  status: string;
  progress: number;
};

type Project = {
  id: string;
  projectCode: string;
  name: string;
  location?: string | null;
  status: string;
  progress: number;
  currentPhase?: string | null;
  milestones: Milestone[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_META: Record<string, { color: string; bg: string; border: string; label: string }> = {
  COMPLETED: { color: "#067647", bg: "#ECFDF5", border: "#A7F3D0", label: "Completed" },
  IN_PROGRESS: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", label: "In Progress" },
  "IN PROGRESS": { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", label: "In Progress" },
  ACTIVE: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", label: "Active" },
  DELAYED: { color: "#B42318", bg: "#FEF3F2", border: "#FECACA", label: "Delayed" },
  UPCOMING: { color: "#667085", bg: "#F8FAFC", border: "#E9EDF4", label: "Upcoming" },
  PENDING: { color: "#667085", bg: "#F8FAFC", border: "#E9EDF4", label: "Pending" },
};

function getStatusMeta(status: string) {
  return STATUS_META[status.toUpperCase()] || STATUS_META.PENDING;
}

/** Milestone status dot for timeline */
function MilestoneDot({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "COMPLETED") {
    return (
      <div className="w-8 h-8 rounded-full bg-[#067647] flex items-center justify-center shadow-md flex-shrink-0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (s === "IN_PROGRESS" || s === "IN PROGRESS" || s === "ACTIVE") {
    return (
      <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shadow-md flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-white animate-ping opacity-75" />
      </div>
    );
  }
  if (s === "DELAYED") {
    return (
      <div className="w-8 h-8 rounded-full bg-[#B42318] flex items-center justify-center shadow-md flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
      <div className="w-3 h-3 rounded-full bg-slate-400" />
    </div>
  );
}

/** SVG Donut Pie Chart */
function DonutPieChart({ milestones }: { milestones: Milestone[] }) {
  const total = milestones.length;
  if (total === 0) return null;

  const stats = [
    { label: "Completed", count: milestones.filter((m) => m.status.toUpperCase() === "COMPLETED").length, color: "#067647" },
    { label: "In Progress", count: milestones.filter((m) => ["IN_PROGRESS", "IN PROGRESS", "ACTIVE"].includes(m.status.toUpperCase())).length, color: "#2563EB" },
    { label: "Delayed", count: milestones.filter((m) => m.status.toUpperCase() === "DELAYED").length, color: "#B42318" },
    { label: "Upcoming", count: milestones.filter((m) => !["COMPLETED", "IN_PROGRESS", "IN PROGRESS", "ACTIVE", "DELAYED"].includes(m.status.toUpperCase())).length, color: "#94A3B8" },
  ].filter((s) => s.count > 0);

  const size = 130;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = stats.map((s) => {
    const pct = s.count / total;
    const dash = pct * circumference - 2; // small gap
    const seg = { ...s, dash: Math.max(dash, 0), gap: circumference - Math.max(dash, 0), offset };
    offset += pct * circumference;
    return seg;
  });

  const completedCount = milestones.filter((m) => m.status.toUpperCase() === "COMPLETED").length;
  const completedPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="py-2">
      <p className="text-xs font-black uppercase tracking-wider text-[#667085] mb-4">Milestone Status Distribution</p>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={-seg.offset}
                className="transition-all duration-700"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-[#0B1220]">{completedPct}%</span>
            <span className="text-[0.6rem] text-[#667085] font-bold leading-tight text-center">Complete</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-[#475467] flex-1">{s.label}</span>
              <span className="text-xs font-black text-[#0B1220]">{s.count}</span>
              <span className="text-[0.65rem] text-[#98A2B3] w-10 text-right">{Math.round((s.count / total) * 100)}%</span>
            </div>
          ))}
          <div className="pt-1 border-t border-slate-100">
            <div className="flex justify-between text-[0.65rem]">
              <span className="text-[#98A2B3] font-bold">TOTAL</span>
              <span className="font-black text-[#0B1220]">{total} milestones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Horizontal bar chart for phase progress */
function ProgressBarChart({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) return null;

  return (
    <div className="py-2">
      <p className="text-xs font-black uppercase tracking-wider text-[#667085] mb-4">Phase-by-Phase Progress</p>
      <div className="space-y-3">
        {milestones.map((m, idx) => {
          const meta = getStatusMeta(m.status);
          return (
            <div key={m.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#475467] font-medium truncate max-w-[60%]" title={m.name}>
                  <span className="text-[#98A2B3] mr-1.5">P{idx + 1}</span>
                  {m.name}
                </span>
                <span className="font-black text-[#0B1220] ml-2">{m.progress}%</span>
              </div>
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.progress}%`, background: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProjectMilestonesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const userId = getActiveUserId();
        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`,
          { headers: userId ? { "x-user-id": userId } : {}, cache: "no-store" }
        ).catch(() => null);

        if (response) {
          if (!response.ok) {
            setError("Access Denied: You do not have permission to view this project's milestones.");
            setProject(null);
            setLoading(false);
            return;
          }
          const data = await response.json();
          setProject(data);
        } else {
          setProject(getDemoProjectById(projectId) as any);
        }
      } catch (err) {
        console.error(err);
        setError("Access Denied: Unable to fetch project milestones.");
      } finally {
        setLoading(false);
      }
    }
    if (projectId) fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading milestones…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-shell">
        <Link href={`/projects/${projectId}`} className="back-link mb-6 inline-flex">← Back to Project</Link>
        <ErrorState title="Unable to load milestones" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
      </div>
    );
  }

  const completedCount = project.milestones.filter((m) => m.status.toUpperCase() === "COMPLETED").length;
  const completedPct = project.milestones.length > 0 ? Math.round((completedCount / project.milestones.length) * 100) : 0;

  const overallProgress = project.milestones.length > 0
    ? Math.round(project.milestones.reduce((sum, m) => sum + m.progress, 0) / project.milestones.length)
    : 0;

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project.projectCode} · MILESTONE SCHEDULE`}
        title={project.name}
        subtitle={`Sequential construction phases and milestone deliverables for ${project.name}.`}
        bgImage="/images/project-commercial.png"
        className="mb-0"
      />
      {project && <ProjectSubNav project={project} />}

      {/* KPI Strip */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 px-4 py-2 text-center border border-blue-100">
          <span className="text-[0.62rem] font-bold text-blue-600 uppercase block tracking-wider">Total</span>
          <span className="text-base font-black text-[#0B1220]">{project.milestones.length}</span>
        </div>
        <div className="rounded-xl bg-emerald-50 px-4 py-2 text-center border border-emerald-100">
          <span className="text-[0.62rem] font-bold text-emerald-600 uppercase block tracking-wider">Done</span>
          <span className="text-base font-black text-[#067647]">{completedCount}</span>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-2 text-center border border-slate-200">
          <span className="text-[0.62rem] font-bold text-[#667085] uppercase block tracking-wider">Progress</span>
          <span className="text-base font-black text-[#2563EB]">{overallProgress}%</span>
        </div>
      </div>

      {/* Charts Row */}
      {project.milestones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DonutPieChart milestones={project.milestones} />
          <ProgressBarChart milestones={project.milestones} />
        </div>
      )}

      {/* Timeline Section — Borderless Edge-to-Edge Layout */}
      <div className="border-t-2 border-slate-300 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-heading">Phase Milestones Timeline</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${completedPct}%` }} />
            </div>
            <span className="text-xs font-black text-[#2563EB]">{completedPct}%</span>
          </div>
        </div>

        {project.milestones.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-[#667085]">
            There are no milestones for this project yet.
          </div>
        ) : (
          <div className="space-y-0">
            {project.milestones.map((milestone, idx) => {
              const meta = getStatusMeta(milestone.status);
              return (
                <div key={milestone.id} className="relative flex gap-5">
                  {/* Timeline Connector */}
                  <div className="flex flex-col items-center">
                    <MilestoneDot status={milestone.status} />
                    {idx < project.milestones.length - 1 && (
                      <div className="w-0.5 flex-1 my-1 bg-slate-300 min-h-[24px]" />
                    )}
                  </div>

                  {/* Content Card with Hover Effect */}
                  <div
                    className={`flex-1 mb-4 rounded-xl border p-4 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ${milestone.status.toUpperCase() === "COMPLETED"
                      ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400"
                      : milestone.status.toUpperCase() === "DELAYED"
                        ? "bg-red-50/40 border-red-200 hover:border-red-400"
                        : milestone.status.toUpperCase() === "IN_PROGRESS" || milestone.status.toUpperCase() === "ACTIVE"
                          ? "bg-blue-50/40 border-blue-200 hover:border-blue-400"
                          : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[0.6rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-2xs"
                            style={{ color: meta.color, background: meta.bg }}
                          >
                            Phase {idx + 1}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-[#0B1220]">{milestone.name}</h3>
                        {milestone.description && (
                          <p className="mt-1 text-xs text-[#475467] leading-relaxed">{milestone.description}</p>
                        )}
                      </div>
                      <StatusBadge status={milestone.status} />
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[0.65rem] text-[#667085] mb-1">
                        <span className="font-bold">Phase Completion</span>
                        <span className="font-black" style={{ color: meta.color }}>{milestone.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden border border-slate-200/30">
                        <div
                          className="h-full rounded-full transition-all duration-700 shadow-2xs"
                          style={{ width: `${milestone.progress}%`, background: meta.color }}
                        />
                      </div>
                    </div>

                    {/* Dates Row */}
                    <div className="mt-3 flex flex-wrap gap-3 text-[0.7rem]">
                      <div>
                        <span className="text-[#667085] font-bold">Planned: </span>
                        <span className="font-semibold text-[#0B1220]">{formatDate(milestone.plannedDate)}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div>
                        <span className="text-[#667085] font-bold">Completed: </span>
                        <span className="font-semibold" style={{ color: milestone.actualCompletionDate ? "#059669" : "#667085" }}>
                          {formatDate(milestone.actualCompletionDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
