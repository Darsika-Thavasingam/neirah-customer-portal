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
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

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
        if (selectedStatus === "IN_PROGRESS" && norm !== "IN_PROGRESS" && norm !== "ACTIVE") return false;
        if (selectedStatus === "COMPLETED" && norm !== "COMPLETED") return false;
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
      />

      {error && (
        <div className="mb-6">
          <ErrorState title="Unable to load projects" message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* Top KPI Metrics Bar */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="metric-card">
              <span className="metric-label">Total Projects</span>
              <div className="metric-value">{stats.total}</div>
              <p className="mt-1 text-xs text-[#667085]">Assigned Contracts</p>
            </div>
            <div className="metric-card">
              <span className="metric-label">In Progress</span>
              <div className="metric-value text-[#067647]">{stats.inProgress}</div>
              <p className="mt-1 text-xs text-[#067647]">Under Construction</p>
            </div>
            <div className="metric-card">
              <span className="metric-label">Completed</span>
              <div className="metric-value text-[#2563EB]">{stats.completed}</div>
              <p className="mt-1 text-xs text-[#2563EB]">Delivered Facilities</p>
            </div>
            <div className="metric-card">
              <span className="metric-label">Average Completion</span>
              <div className="metric-value">{stats.avgProgress}%</div>
              <p className="mt-1 text-xs text-[#667085]">Portfolio Health</p>
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="mb-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-2xs flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`tab-btn ${selectedStatus === "ALL" ? "tab-btn-active" : ""}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setSelectedStatus("IN_PROGRESS")}
                className={`tab-btn ${selectedStatus === "IN_PROGRESS" ? "tab-btn-active" : ""}`}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                onClick={() => setSelectedStatus("COMPLETED")}
                className={`tab-btn ${selectedStatus === "COMPLETED" ? "tab-btn-active" : ""}`}
              >
                Completed ({stats.completed})
              </button>
              <button
                onClick={() => setSelectedStatus("PLANNING")}
                className={`tab-btn ${selectedStatus === "PLANNING" ? "tab-btn-active" : ""}`}
              >
                Planning ({stats.planning})
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-[rgba(15,23,42,0.1)] p-0.5 bg-[#F8FAFC]">
              <button
                onClick={() => setViewMode("GRID")}
                className={`rounded-md p-1.5 text-xs font-semibold ${
                  viewMode === "GRID" ? "bg-white text-[#2563EB] shadow-xs" : "text-[#667085]"
                }`}
                title="Grid Visual View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("LIST")}
                className={`rounded-md p-1.5 text-xs font-semibold ${
                  viewMode === "LIST" ? "bg-white text-[#2563EB] shadow-xs" : "text-[#667085]"
                }`}
                title="Compact Table View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Project Content View */}
          {filteredProjects.length === 0 ? (
            <div className="card">
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
          ) : viewMode === "GRID" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, idx) => {
                const imgUrl = getProjectImage(project, idx);
                return (
                  <div key={project.id} className="card card-hover hover-lift shimmer-card flex flex-col overflow-hidden transition">
                    <div className="relative h-44 w-full bg-[#0B1220] overflow-hidden">
                      <img src={imgUrl} alt={project.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/20" />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <StatusBadge status={project.status} />
                        <span className="glass-badge rounded-md px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase">
                          {project.projectCode}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h2 className="text-base font-bold line-clamp-1">{project.name}</h2>
                        {project.location && (
                          <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {project.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs font-semibold text-[#475467] mb-1">
                            <span>{project.currentPhase || "Phase Progress"}</span>
                            <span className="font-bold text-[#2563EB]">{project.progress}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-[rgba(15,23,42,0.06)] pt-3 text-xs">
                          <div>
                            <span className="meta-label">Project Manager</span>
                            <p className="font-semibold text-[#0B1220] mt-0.5">{project.projectManagerName || "Unassigned"}</p>
                          </div>
                          <div>
                            <span className="meta-label">Completion Date</span>
                            <p className="font-semibold text-[#0B1220] mt-0.5">{formatDate(project.expectedCompletionDate)}</p>
                          </div>
                        </div>

                        {project.recentUpdate && (
                          <div className="mt-3 rounded-lg bg-[#F8FAFC] p-2.5 text-xs text-[#475467] line-clamp-2 italic border border-[rgba(15,23,42,0.05)]">
                            "{project.recentUpdate}"
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-[rgba(15,23,42,0.06)]">
                        <Link href={`/projects/${project.id}`} className="btn btn-primary btn-sm w-full">
                          Open Project Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project & Code</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Current Phase</th>
                    <th>Manager</th>
                    <th>Expected End</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-[#F7F9FC]">
                      <td className="font-semibold text-[#0B1220]">
                        <div className="flex items-center gap-3">
                          <img src={getProjectImage(p, idx)} alt={p.name} className="h-9 w-9 rounded-lg object-cover border" />
                          <div>
                            <Link href={`/projects/${p.id}`} className="font-bold text-[#0B1220] hover:text-[#2563EB]">
                              {p.name}
                            </Link>
                            <div className="text-xs text-[#667085]">{p.projectCode}</div>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <div className="w-28">
                          <span className="text-xs font-bold text-[#2563EB]">{p.progress}%</span>
                          <div className="progress-track mt-1"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                        </div>
                      </td>
                      <td className="text-xs font-medium text-[#344054]">{p.currentPhase || "—"}</td>
                      <td className="text-xs font-medium text-[#344054]">{p.projectManagerName || "—"}</td>
                      <td className="text-xs font-medium text-[#344054]">{formatDate(p.expectedCompletionDate)}</td>
                      <td className="text-right">
                        <Link href={`/projects/${p.id}`} className="btn btn-ghost btn-sm">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
