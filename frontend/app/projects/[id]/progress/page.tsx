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
  currentPhase: string | null;
  milestones: Milestone[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusColor(status: string) {
  const s = status.toUpperCase();
  if (s === "COMPLETED") return "#067647";
  if (s === "IN_PROGRESS" || s === "IN PROGRESS" || s === "ACTIVE") return "#2563EB";
  if (s === "DELAYED") return "#B42318";
  return "#94A3B8";
}

/** Overall progress ring */
function BigProgressRing({ progress }: { progress: number }) {
  const size = 160, sw = 18;
  const radius = (size - sw) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={progress >= 80 ? "#067647" : "#2563EB"} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-black text-[#0B1220]">{progress}%</span>
        <span className="block text-xs font-extrabold text-[#667085] uppercase tracking-wider mt-0.5">Complete</span>
      </div>
    </div>
  );
}

/** Horizontal stacked bar for milestone status */
function StackedBar({ milestones }: { milestones: Milestone[] }) {
  const total = milestones.length;
  if (total === 0) return null;
  const completed = milestones.filter(m => m.status.toUpperCase() === "COMPLETED").length;
  const inProgress = milestones.filter(m => ["IN_PROGRESS", "IN PROGRESS", "ACTIVE"].includes(m.status.toUpperCase())).length;
  const delayed = milestones.filter(m => m.status.toUpperCase() === "DELAYED").length;
  const upcoming = total - completed - inProgress - delayed;

  const segs = [
    { count: completed, color: "#067647", label: "Done" },
    { count: inProgress, color: "#2563EB", label: "Active" },
    { count: delayed, color: "#B42318", label: "Delayed" },
    { count: upcoming, color: "#CBD5E1", label: "Upcoming" },
  ].filter(s => s.count > 0);

  return (
    <div>
      <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
        {segs.map((s, i) => (
          <div key={i} className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(s.count / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {segs.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[0.65rem]">
            <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
            <span className="text-[#475467]">{s.label}</span>
            <span className="font-black text-[#0B1220]">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Graphical donut node indicating phase progress on a timeline */
function MilestoneGraphNode({ progress, status, phaseIndex }: { progress: number, status: string, phaseIndex: number }) {
  const size = 32;
  const sw = 3;
  const radius = (size - sw) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;
  const color = getStatusColor(status);

  return (
    <div className="relative flex items-center justify-center shrink-0 w-8 h-8">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute text-[0.62rem] font-black text-[#0B1220]">{phaseIndex}</span>
    </div>
  );
}

export default function ProjectProgressPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch_() {
      try {
        const uid = getActiveUserId();
        const res = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`,
          { headers: uid ? { "x-user-id": uid } : {}, cache: "no-store" }).catch(() => null);
        if (res) {
          if (!res.ok) {
            setError("Access Denied: You do not have permission to view this project's progress.");
            setProject(null);
            setLoading(false);
            return;
          }
          const data = await res.json();
          setProject(data);
        } else {
          setProject(getDemoProjectById(projectId) as any);
        }
      } catch {
        setError("Access Denied: Unable to fetch project progress.");
      } finally {
        setLoading(false);
      }
    }
    if (projectId) fetch_();
  }, [projectId]);

  if (loading) return <div className="page-shell"><PageLoading message="Loading project progress…" /></div>;
  if (error || !project) return (
    <div className="page-shell">
      <ErrorState title="Unable to load progress" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
    </div>
  );

  const completed = project.milestones.filter(m => m.status.toUpperCase() === "COMPLETED").length;
  const inProgress = project.milestones.filter(m => ["IN_PROGRESS", "IN PROGRESS", "ACTIVE"].includes(m.status.toUpperCase())).length;
  const delayed = project.milestones.filter(m => m.status.toUpperCase() === "DELAYED").length;
  const upcoming = project.milestones.length - completed - inProgress - delayed;

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project.projectCode} · PROGRESS TRACKER`}
        title={project.name}
        subtitle={`📍 ${project.location || "Site Development"} · Overall Construction Progress: ${project.progress}%`}
        bgImage="/images/project-facade.png"
        className="mb-0"
      />
      {project && <ProjectSubNav project={project} />}

      {/* Progress Hero Banner — Soft Light Blue Surface */}
      <div className="bg-[#EAF2FF] border border-blue-200 rounded-2xl p-6 mb-8 text-[#0B1220] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <BigProgressRing progress={project.progress} />
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Overall Completion</p>
                <p className="text-3xl font-black text-[#0B1220]">{project.progress}<span className="text-xl text-[#667085]">%</span></p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            {/* Fat progress bar */}
            <div className="h-4 bg-white/80 border border-blue-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-1000 shadow-xs"
                style={{ width: `${project.progress}%`, background: project.progress >= 80 ? "#067647" : "#2563EB" }}
              />
            </div>

            {/* Milestone bar */}
            <StackedBar milestones={project.milestones} />
          </div>
        </div>

        {/* KPI Strip — Transparent light blue surfaces with subtle hover scale */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Completed", count: completed, color: "#067647", bg: "rgba(255, 255, 255, 0.31)", border: "#D1FAE5" },
            { label: "In Progress", count: inProgress, color: "#2563EB", bg: "rgba(255, 255, 255, 0.31)", border: "#DBEAFE" },
            { label: "Upcoming", count: upcoming, color: "#667085", bg: "rgba(255, 255, 255, 0.31)", border: "#E2E8F0" },
            { label: "Delayed", count: delayed, color: "#B42318", bg: "rgba(255, 255, 255, 0.31)", border: "#FEE2E2" },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} className="rounded-xl p-4 text-center border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm" style={{ background: bg, borderColor: border }}>
              <p className="text-2xl font-black" style={{ color }}>{count}</p>
              <p className="mt-0.5 text-xs font-extrabold text-[#475467]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone detail list — Borderless with High Visibility Dividers */}
      <div className="pt-2 color-primary-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-heading">Milestone Progress Detail</h2>
          <Link href={`/projects/${project.id}/milestones`} className="text-xs font-bold text-[#1973EA] hover:underline flex items-center gap-1 transition-transform hover:translate-x-1">
            Full Timeline →
          </Link>
        </div>

        {project.milestones.length === 0 ? (
          <div className="rounded-2xl bg-slate-50/50 p-8 text-center text-sm text-[#667085] border border-slate-200">
            No milestone progress published yet.
          </div>
        ) : (
          <div className="relative pl-2 mt-6 space-y-6">
            {project.milestones.map((m, idx) => {
              const color = getStatusColor(m.status);
              const nextMilestone = project.milestones[idx + 1];
              const lineBg = (m.status.toUpperCase() === "COMPLETED" && nextMilestone && nextMilestone.status.toUpperCase() === "COMPLETED")
                ? "#067647"
                : (m.status.toUpperCase() === "COMPLETED")
                  ? "linear-gradient(to bottom, #067647, #E2E8F0)"
                  : "#E2E8F0";

              return (
                <div key={m.id} className="relative flex gap-6 group">
                  {/* Timeline node & connector column */}
                  <div className="relative flex flex-col items-center shrink-0">
                    <MilestoneGraphNode progress={m.progress} status={m.status} phaseIndex={idx + 1} />
                    {idx < project.milestones.length - 1 && (
                      <div 
                        className="w-0.5 absolute top-8 bottom-[-24px] left-1/2 -translate-x-1/2"
                        style={{ background: lineBg }}
                      />
                    )}
                  </div>

                  {/* Graph Data Section (completely borderless and backgroundless) */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.62rem] font-bold text-[#667085] uppercase tracking-wider">Phase {idx + 1}</span>
                        <h3 className="text-sm font-extrabold text-[#0B1220] group-hover:text-[#2563EB] transition-colors">
                          {m.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black" style={{ color }}>{m.progress}%</span>
                        <StatusBadge status={m.status} />
                      </div>
                    </div>

                    {m.description && (
                      <p className="text-xs text-[#667085] mb-3 leading-relaxed max-w-3xl">
                        {m.description}
                      </p>
                    )}

                    {/* Miniature Horizontal Graph line */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700" 
                          style={{ width: `${m.progress}%`, background: color }} 
                        />
                      </div>
                      <div className="flex gap-4 text-[0.68rem] text-[#98A2B3] shrink-0 font-medium">
                        <span>Planned: <span className="font-bold text-[#475467]">{formatDate(m.plannedDate)}</span></span>
                        {m.actualCompletionDate && (
                          <span>Completed: <span className="font-bold text-[#067647]">{formatDate(m.actualCompletionDate)}</span></span>
                        )}
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
