"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import ProjectSubNav from "../../components/ProjectSubNav";
import { PageLoading } from "../../components/SkeletonLoader";
import { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";
import { getDemoProjectById } from "../../lib/demoData";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy?: string | null;
  attachment?: string | null;
  createdAt: string;
};

type Milestone = {
  id: string;
  name: string;
  description: string | null;
  plannedDate: string | null;
  actualCompletionDate: string | null;
  status: string;
  progress: number;
};

type ProjectDocument = {
  id: string;
  fileName: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
};

type ProjectPhoto = {
  id: string;
  photoUrl: string;
  caption: string | null;
  uploadedAt: string;
};

type CustomerSummary = {
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
};

type ProjectDetails = {
  id: string;
  projectCode: string;
  name: string;
  location: string | null;
  status: string;
  progress: number;
  currentPhase: string | null;
  projectManagerName: string | null;
  projectManagerContact: string | null;
  recentUpdate: string | null;
  updatedAt: string;
  customer?: CustomerSummary | null;
  milestones: Milestone[];
  documents: ProjectDocument[];
  photos: ProjectPhoto[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const PROJECT_IMAGES = [
  "/images/project-commercial.png",
  "/images/project-residential.png",
  "/images/project-industrial.png",
];

function getProjectCoverImage(project: ProjectDetails): string {
  if (
    project.photos &&
    project.photos.length > 0 &&
    project.photos[0].photoUrl &&
    !project.photos[0].photoUrl.includes("placehold.co")
  ) {
    return project.photos[0].photoUrl;
  }
  const nameLower = project.name.toLowerCase();
  if (nameLower.includes("tower") || nameLower.includes("hq") || nameLower.includes("commercial")) {
    return PROJECT_IMAGES[0];
  }
  if (nameLower.includes("residence") || nameLower.includes("villa") || nameLower.includes("apartment")) {
    return PROJECT_IMAGES[1];
  }
  return PROJECT_IMAGES[2];
}

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** SVG Circular Progress Ring */
function ProgressRing({ progress, size = 72, strokeWidth = 7 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2563EB"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center leading-none">
        <span className="text-sm font-black text-white">{progress}%</span>
      </div>
    </div>
  );
}

/** Slim Underline-Tab Sub-Nav with inline update count */
function SimpleSubNav({ project, updateCount }: { project: ProjectDetails; updateCount: number }) {
  const base = `/projects/${project.id}`;
  const tabs = [
    { href: `${base}/progress`, label: "Progress" },
    { href: `${base}/milestones`, label: "Milestones" },
    { href: `${base}/updates`, label: `Updates${updateCount > 0 ? ` (${updateCount})` : ""}` },
    { href: `${base}/documents`, label: "Documents" },
    { href: `${base}/photos`, label: "Photos" },
    { href: `${base}/quotations`, label: "Quotations" },
    { href: `${base}/contracts`, label: "Contracts" },
    { href: `${base}/payments`, label: "Payments" },
    { href: `${base}/invoices`, label: "Invoices" },
  ];

  return (
    <nav className="mb-6 border-b border-[rgba(15,23,42,0.08)]">
      <ul className="flex flex-wrap gap-6 text-xs font-semibold">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="inline-block pb-3 text-[#667085] hover:text-[#2563EB] border-b-2 border-transparent hover:border-[#2563EB] transition-colors"
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchProjectData() {
      try {
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};
        
        const projectResponse = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers }).catch(() => null);
        
        if (projectResponse) {
          if (!projectResponse.ok) {
            if (!isMounted) return;
            setError("Access Denied: You do not have permission to access this project or it does not exist.");
            setProject(null);
            setLoading(false);
            return;
          }
          const projectData = await projectResponse.json();
          const updatesResponse = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`, { headers }).catch(() => null);
          const updatesData = updatesResponse && updatesResponse.ok ? await updatesResponse.json() : [];

          if (!isMounted) return;
          setProject(projectData);
          setUpdates(updatesData);
        } else {
          // Backend server offline fallback
          const demo = getDemoProjectById(projectId);
          if (!isMounted) return;
          setProject(demo);
        }
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError("Access Denied: Unable to fetch project details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProjectData();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project details…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-shell">
        <Link href="/" className="back-link mb-6 inline-flex">← Back to Dashboard</Link>
        <ErrorState
          title="Unable to load project"
          message={error || "Project not found."}
          backHref="/"
          backLabel="Return to Dashboard"
        />
      </div>
    );
  }

  const completedMilestones = project.milestones.filter((m) => m.status.toUpperCase() === "COMPLETED").length;
  const coverImage = getProjectCoverImage(project);

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project.projectCode} · ${project.currentPhase || "ACTIVE"}`}
        title={project.name}
        subtitle={`📍 ${project.location || "Site Development"} · Overall Construction Progress: ${project.progress}% (${completedMilestones}/${project.milestones.length} milestones completed)`}
        bgImage={coverImage}
        className="mb-0"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
              {project.status.replace("_", " ")}
            </span>
            <Link href="/projects" className="btn btn-sm btn-ghost text-xs text-white hover:bg-white/10">
              ← All Projects
            </Link>
          </div>
        }
      />

      {/* Unified Sub Navigation */}
      <ProjectSubNav project={project} />

      {/* Inline Project Details Strip (Plain text & metadata, no cards) */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-[rgba(15,23,42,0.08)] pb-5 text-xs text-[#667085]">
        <div>
          <span className="font-bold text-[#0B1220]">Project Manager:</span>{" "}
          <span>{project.projectManagerName ?? "Unassigned"}</span>
          {project.projectManagerContact && (
            <span className="ml-1 text-[#98A2B3]">({project.projectManagerContact})</span>
          )}
        </div>

        <div>
          <span className="font-bold text-[#0B1220]">Client:</span>{" "}
          <span>{project.customer?.companyName ?? "Direct Client"}</span>
          {project.customer?.contactName && (
            <span className="ml-1 text-[#98A2B3]">({project.customer.contactName})</span>
          )}
        </div>

        <div>
          <span className="font-bold text-[#0B1220]">Last Update:</span>{" "}
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>

      {/* Milestone Timeline — Horizontal Line with Graphical Nodes (No Cards) */}
      {project.milestones.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1220]">Milestone Progress Timeline</h2>
            <Link href={`/projects/${project.id}/milestones`} className="text-xs font-bold text-[#2563EB] hover:underline">
              View all milestones →
            </Link>
          </div>

          <div className="relative pt-2">
            {/* Connecting Timeline Bar */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-[#E9EDF4] -z-0" />

            <div className="flex items-start justify-between gap-2 overflow-x-auto pb-4 relative z-10">
              {project.milestones.slice(0, 5).map((m) => {
                const isDone = m.status.toUpperCase() === "COMPLETED";
                const isActive = m.status.toUpperCase() === "IN_PROGRESS" || m.status.toUpperCase() === "ACTIVE";
                const isDelayed = m.status.toUpperCase() === "DELAYED";

                const dotBg = isDone ? "#067647" : isActive ? "#2563EB" : isDelayed ? "#B42318" : "#98A2B3";
                const statusLabel = isDone ? "Done" : isActive ? "Active" : isDelayed ? "Delayed" : "Upcoming";

                return (
                  <div key={m.id} className="flex flex-col items-center text-center min-w-[110px] flex-1 px-1">
                    {/* Node Dot */}
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center mb-2"
                      style={{ background: dotBg }}
                    >
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : isActive ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />
                      )}
                    </div>

                    <span className="text-[0.7rem] font-bold text-[#0B1220] line-clamp-1" title={m.name}>
                      {m.name}
                    </span>

                    {/* Inline Progress Indicator */}
                    <div className="mt-1 w-full max-w-[80px] h-1 bg-[#E9EDF4] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${m.progress}%`, background: dotBg }} />
                    </div>

                    <span className="text-[0.62rem] font-medium mt-1 text-[#667085]">
                      {statusLabel} • {m.progress}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Engineering Update Section (Clean quote line, no heavy boxed cards) */}
      {project.recentUpdate && (
        <div className="border-t border-[rgba(15,23,42,0.08)] pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">Latest Site Activity</h2>
          <p className="text-xs leading-relaxed text-[#475467] pl-3 border-l-2 border-[#2563EB] italic">
            "{project.recentUpdate}"
          </p>
        </div>
      )}
    </div>
  );
}