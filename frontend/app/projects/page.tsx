"use client";

import { useEffect, useState, useMemo } from "react";
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
  photos?: { photoUrl: string }[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const PROJECT_IMAGES = [
  "/images/project-commercial.png",
  "/images/project-residential.png",
  "/images/project-industrial.png",
];

function getProjectImage(project: Project, index: number): string {
  if (project.photos && project.photos.length > 0 && project.photos[0].photoUrl && !project.photos[0].photoUrl.includes("placehold.co")) {
    return project.photos[0].photoUrl;
  }
  const nameLower = project.name.toLowerCase();
  if (nameLower.includes("tower") || nameLower.includes("hq") || nameLower.includes("commercial")) {
    return PROJECT_IMAGES[0];
  }
  if (nameLower.includes("residence") || nameLower.includes("villa") || nameLower.includes("apartment")) {
    return PROJECT_IMAGES[1];
  }
  if (nameLower.includes("park") || nameLower.includes("hub") || nameLower.includes("logistics")) {
    return PROJECT_IMAGES[2];
  }
  return PROJECT_IMAGES[index % PROJECT_IMAGES.length];
}

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

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

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

  // Aggregate stats
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status.toUpperCase() === "IN_PROGRESS" || p.status.toUpperCase() === "ACTIVE").length;
    const completed = projects.filter((p) => p.status.toUpperCase() === "COMPLETED").length;
    const planning = projects.filter((p) => p.status.toUpperCase() === "PLANNING" || p.status.toUpperCase() === "UPCOMING").length;
    const avgProgress = total > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / total) : 0;
    return { total, inProgress, completed, planning, avgProgress };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.projectManagerName && p.projectManagerName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedStatus !== "ALL") {
        const norm = p.status.toUpperCase();
        if (selectedStatus === "IN_PROGRESS" && ![
          "IN_PROGRESS","ACTIVE","ON_HOLD","HANDOVER"
        ].includes(norm)) return false;
        if (selectedStatus === "COMPLETED" && ![
          "COMPLETED","CLOSED"
        ].includes(norm)) return false;
        if (selectedStatus === "PLANNING" && norm !== "PLANNING" && norm !== "UPCOMING") return false;
      }
      return true;
    });
  }, [projects, searchQuery, selectedStatus]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageHeader kicker="Projects Hub" title="Construction Projects" />
        <PageLoading message="Loading active projects…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker="Projects Hub"
        title="Construction Projects"
        subtitle="Comprehensive management, schedules, and active delivery progress across all your construction developments."
        bgImage="/images/project-facade.png"
      />

      {error && (
        <div className="mb-6">
          <ErrorState title="Unable to load projects" message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* Borderless horizontal stats bar */}
          <div className="mb-8 border-y border-slate-200 py-4 grid grid-cols-2 sm:grid-cols-4 gap-y-4">
            {[
              { label: "My Projects", value: String(stats.total), sub: "Assigned contracts", accent: "#2563EB" },
              { label: "Under Construction", value: String(stats.inProgress), sub: "Currently active", accent: "#067647" },
              { label: "Completed", value: String(stats.completed), sub: "Delivered facilities", accent: "#7C3AED" },
              { label: "Avg. Progress", value: `${stats.avgProgress}%`, sub: "Portfolio health", accent: "#F59E0B" },
            ].map((s, idx) => {
              const isMobileCol1 = idx % 2 === 0;
              const isDesktopCol1 = idx === 0;
              const isDesktopLastCol = idx === 3;

              const itemClasses = [
                "flex flex-col justify-center min-w-0",
                isMobileCol1 ? "pl-0 pr-3 sm:pr-4 border-r border-slate-200" : "pl-3 sm:pl-4 pr-0 border-r-0",
                isDesktopCol1
                  ? "sm:pl-0 sm:pr-4 sm:border-r sm:border-slate-200"
                  : isDesktopLastCol
                  ? "sm:pl-4 sm:pr-0 sm:border-r-0"
                  : "sm:pl-4 sm:pr-4 sm:border-r sm:border-slate-200",
              ].join(" ");

              return (
                <div key={s.label} className={itemClasses}>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#98A2B3] block">{s.label}</span>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight my-1 block" style={{ color: s.accent }}>{s.value}</span>
                  <span className="text-[0.68rem] font-semibold text-[#667085]">{s.sub}</span>
                </div>
              );
            })}
          </div>

          {/* Controls Toolbar */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search projects by code, title, location, or manager..."
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

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#F1F5F9] rounded-2xl p-1">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "ALL" ? "bg-[#2563EB] text-white" : "text-[#667085] hover:text-[#0B1220]"}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedStatus("IN_PROGRESS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "IN_PROGRESS" ? "bg-[#2563EB] text-white" : "text-[#667085] hover:text-[#0B1220]"}`}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                onClick={() => setSelectedStatus("COMPLETED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "COMPLETED" ? "bg-[#2563EB] text-white" : "text-[#667085] hover:text-[#0B1220]"}`}
              >
                Completed ({stats.completed})
              </button>
              <button
                onClick={() => setSelectedStatus("PLANNING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === "PLANNING" ? "bg-[#2563EB] text-white" : "text-[#667085] hover:text-[#0B1220]"}`}
              >
                Planning ({stats.planning})
              </button>
            </div>


          </div>

          {/* Project Content View */}
          {filteredProjects.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#667085]">
              <EmptyState
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                }
                title="No matching projects found"
                body="Try adjusting your search keywords or switching your filter tabs."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredProjects.map((project, idx) => {
                const imgUrl = getProjectImage(project, idx);
                return (
                  <div key={project.id} className="py-6 flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="flex gap-4 items-start flex-1 min-w-0">
                      <img src={imgUrl} alt={project.name} className="h-20 w-24 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={project.status} />
                          <span className="text-xs font-bold text-[#98A2B3]">{project.projectCode}</span>
                        </div>
                        <h2 className="text-lg font-extrabold text-[#0B1220]">{project.name}</h2>
                        {project.location && (
                          <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">📍 {project.location}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#667085]">
                          <span>Manager: <strong className="text-[#0B1220]">{project.projectManagerName || "Unassigned"}</strong></span>
                          <span>Phase: <strong className="text-[#0B1220]">{project.currentPhase || "—"}</strong></span>
                          <span>Completion: <strong className="text-[#0B1220]">{formatDate(project.expectedCompletionDate)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-56 shrink-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs font-extrabold text-[#475467] mb-1">
                          <span>Progress</span>
                          <span className="font-black text-[#2563EB]">{project.progress}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-xs hover:shadow-md transition-all group/btn"
                      >
                        <span>Open Project Details</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-200 group-hover/btn:translate-x-1"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
