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

function milestoneIcon(status: string) {
  const s = status.toUpperCase();
  if (s === "COMPLETED") {
    return (
      <div className="milestone-dot bg-[#067647] text-white">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    );
  }
  if (s === "IN_PROGRESS" || s === "IN PROGRESS") {
    return (
      <div className="milestone-dot bg-[#2563EB] text-white">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor"/>
        </svg>
      </div>
    );
  }
  if (s === "DELAYED") {
    return (
      <div className="milestone-dot bg-[#B42318] text-white">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="milestone-dot bg-[#E5E7EB] text-[#667085]">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
      </svg>
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

        let data: Project | null = null;
        if (response && response.ok) {
          data = await response.json();
        }

        setProject(data || (getDemoProjectById(projectId) as any));
      } catch (err) {
        console.error(err);
        setProject(getDemoProjectById(projectId) as any);
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

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/" className="back-link mb-5 inline-flex">← Back to Dashboard</Link>

      <ProjectSubNav project={project} />

      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-heading">Milestone Schedule</h2>
          <span className="text-xs font-bold text-[#667085]">{project.milestones.length} milestone{project.milestones.length !== 1 ? "s" : ""}</span>
        </div>

        {project.milestones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[rgba(15,23,42,0.12)] bg-[#F7F9FC] p-8 text-center text-sm text-[#667085]">
            There are no milestones for this project yet.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(15,23,42,0.06)]">
            {project.milestones.map((milestone, idx) => (
              <div key={milestone.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                {/* Status icon */}
                <div className="flex flex-col items-center gap-1">
                  {milestoneIcon(milestone.status)}
                  {idx < project.milestones.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-[rgba(15,23,42,0.08)]" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#0B1220]">{milestone.name}</h3>
                      {milestone.description && (
                        <p className="mt-0.5 text-xs text-[#475467]">{milestone.description}</p>
                      )}
                    </div>
                    <StatusBadge status={milestone.status} />
                  </div>

                  {/* Dates */}
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-3">
                      <p className="meta-label">Planned</p>
                      <p className="mt-0.5 text-xs font-semibold text-[#0B1220]">{formatDate(milestone.plannedDate)}</p>
                    </div>
                    <div className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-3">
                      <p className="meta-label">Completed</p>
                      <p className="mt-0.5 text-xs font-semibold text-[#067647]">{formatDate(milestone.actualCompletionDate)}</p>
                    </div>
                    <div className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-3">
                      <p className="meta-label">Progress</p>
                      <p className="mt-0.5 text-xs font-bold text-[#2563EB]">{milestone.progress}%</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
