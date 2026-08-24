"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

type Project = {
  id: string;
  projectCode: string;
  name: string;
  location: string | null;
  startDate: string | null;
  expectedCompletionDate: string | null;
  status: string;
  progress: number;
  currentPhase: string | null;
  projectManagerName: string | null;
  projectManagerContact: string | null;
  recentUpdate: string | null;
  updatedAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    const handleSwitch = () => {
      setLoading(true);
      setError("");
      setFetchKey((k) => k + 1);
    };
    window.addEventListener("storage", handleSwitch);
    window.addEventListener("neirah:userswitch", handleSwitch);
    return () => {
      window.removeEventListener("storage", handleSwitch);
      window.removeEventListener("neirah:userswitch", handleSwitch);
    };
  }, []);

  useEffect(() => {
    async function loadProjects() {
      try {
        const userId = getActiveUserId();
        if (!userId) throw new Error("Customer portal user is not configured.");

        const response = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects`, {
          headers: { "x-user-id": userId },
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to load projects.");

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [fetchKey]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Projects" title="My Projects" />
        <PageLoading message="Loading your projects…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        kicker="Projects"
        title="My Projects"
        subtitle="Track active contracts, schedules, and delivery progress for all your construction projects."
      />

      {error && (
        <div className="mb-6">
          <ErrorState title="Unable to load projects" message={error} />
        </div>
      )}

      {!error && projects.length === 0 && (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            }
            title="No projects found"
            body="There are no active or historical projects linked to your customer profile."
          />
        </div>
      )}

      {!error && projects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id} className="card card-hover flex flex-col p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#667085]">
                    {project.projectCode}
                  </span>
                  <h2 className="mt-0.5 text-lg font-bold text-[#0B1220] hover:text-[#2563EB]">
                    <Link href={`/projects/${project.id}`}>{project.name}</Link>
                  </h2>
                  {project.location && (
                    <p className="mt-1 text-xs text-[#667085] flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {project.location}
                    </p>
                  )}
                </div>
                <StatusBadge status={project.status} />
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#667085] mb-1.5">
                  <span>Current Progress</span>
                  <span className="font-bold text-[#2563EB]">{project.progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Grid of meta */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[rgba(15,23,42,0.06)] pt-4 text-xs">
                <div>
                  <p className="meta-label">Start Date</p>
                  <p className="font-semibold text-[#0B1220] mt-0.5">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="meta-label">Expected Completion</p>
                  <p className="font-semibold text-[#0B1220] mt-0.5">{formatDate(project.expectedCompletionDate)}</p>
                </div>
                <div>
                  <p className="meta-label">Current Phase</p>
                  <p className="font-semibold text-[#0B1220] mt-0.5">{project.currentPhase || "—"}</p>
                </div>
                <div>
                  <p className="meta-label">Project Manager</p>
                  <p className="font-semibold text-[#0B1220] mt-0.5" title={project.projectManagerContact || ""}>
                    {project.projectManagerName || "Not assigned"}
                  </p>
                </div>
              </div>

              {/* Recent Update snippet */}
              {project.recentUpdate && (
                <div className="mt-4 rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#F7F9FC] p-3 text-xs">
                  <p className="meta-label font-bold">Latest Update</p>
                  <p className="text-[#475467] mt-1 leading-relaxed truncate-2">{project.recentUpdate}</p>
                </div>
              )}

              {/* Action */}
              <div className="mt-auto pt-5">
                <Link href={`/projects/${project.id}`} className="btn btn-primary btn-sm w-full">
                  View Project Portal →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
