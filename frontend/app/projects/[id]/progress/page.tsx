"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../../../components/StatusBadge";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";

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
  status: string;
  progress: number;
  currentPhase: string | null;
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

export default function ProjectProgressPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!getActiveUserId()) throw new Error("Customer portal user is not configured.");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`,
          { headers: { "x-user-id": getActiveUserId() }, cache: "no-store" }
        );

        if (!response.ok) throw new Error("Failed to load project progress.");

        const data: Project = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load project progress.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project progress…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-shell">
        <Link href={`/projects/${projectId}`} className="back-link mb-6 inline-flex">← Back to Project</Link>
        <ErrorState title="Unable to load progress" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
      </div>
    );
  }

  const completed = project.milestones.filter((m) => m.status.toUpperCase() === "COMPLETED").length;
  const upcoming = project.milestones.filter((m) => m.status.toUpperCase() === "UPCOMING").length;
  const delayed = project.milestones.filter((m) => m.status.toUpperCase() === "DELAYED").length;
  const inProgress = project.milestones.filter((m) => m.status.toUpperCase() === "IN_PROGRESS" || m.status.toUpperCase() === "IN PROGRESS").length;

  return (
    <div className="page-shell">
      <Link href={`/projects/${projectId}`} className="back-link mb-5 inline-flex">← Back to Project</Link>

      <div className="mb-6">
        <p className="page-kicker">Project Progress</p>
        <h1 className="page-title">{project.name}</h1>
        <p className="page-subtitle">{project.projectCode}{project.currentPhase ? ` · ${project.currentPhase}` : ""}</p>
      </div>

      {/* Overall progress */}
      <div className="card mb-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="meta-label mb-1">Overall Completion</p>
            <p className="text-4xl font-black text-[#0B1220]">{project.progress}<span className="text-2xl text-[#667085]">%</span></p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-5">
          <div className="progress-track progress-track-lg">
            <div className="progress-fill" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {/* Stat pills */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Completed", count: completed, color: "var(--success)", bg: "var(--success-bg)" },
            { label: "In Progress", count: inProgress, color: "var(--primary)", bg: "var(--primary-soft)" },
            { label: "Upcoming", count: upcoming, color: "var(--warning)", bg: "var(--warning-bg)" },
            { label: "Delayed", count: delayed, color: "var(--danger)", bg: "var(--danger-bg)" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className="rounded-xl p-4 text-center" style={{ background: bg }}>
              <p className="text-2xl font-black" style={{ color }}>{count}</p>
              <p className="mt-0.5 text-xs font-bold text-[#344054]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone progress list */}
      <div className="card p-6">
        <h2 className="section-heading mb-5">Milestone Progress</h2>

        {project.milestones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[rgba(15,23,42,0.12)] bg-[#F7F9FC] p-8 text-center text-sm text-[#667085]">
            No milestone progress has been published yet.
          </div>
        ) : (
          <div className="space-y-4">
            {project.milestones.map((milestone) => (
              <div key={milestone.id} className="card-inner p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1220]">{milestone.name}</h3>
                    {milestone.description && (
                      <p className="mt-0.5 text-xs text-[#475467]">{milestone.description}</p>
                    )}
                  </div>
                  <StatusBadge status={milestone.status} />
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#667085]">
                    <span>Progress</span>
                    <span className="font-bold text-[#0B1220]">{milestone.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${milestone.progress}%`,
                        background:
                          milestone.status.toUpperCase() === "COMPLETED"
                            ? "var(--success)"
                            : milestone.status.toUpperCase() === "DELAYED"
                              ? "var(--danger)"
                              : "var(--primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-[#667085]">
                  {milestone.plannedDate && (
                    <span>Planned: {formatDate(milestone.plannedDate)}</span>
                  )}
                  {milestone.actualCompletionDate && (
                    <span className="text-[#067647]">Completed: {formatDate(milestone.actualCompletionDate)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
