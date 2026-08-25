"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

function HubCard({
  href,
  title,
  description,
  icon,
  count,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  count?: number;
}) {
  return (
    <Link href={href} className="card card-hover hover-lift shimmer-card p-5 transition flex flex-col justify-between group">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2563EB] transition group-hover:bg-[#2563EB] group-hover:text-white">
          {icon}
        </div>
        {count !== undefined && (
          <span className="text-xl font-bold text-[#0B1220]">{count}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold text-[#0B1220]">{title}</p>
        <p className="mt-1 text-xs text-[#667085]">{description}</p>
        <p className="mt-2 text-xs font-semibold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Explore Section →
        </p>
      </div>
    </Link>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatesError, setUpdatesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProjectData() {
      try {
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};

        const [projectResponse, updatesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`, { headers }).catch(() => null),
        ]);

        let projectData: ProjectDetails | null = null;
        if (projectResponse && projectResponse.ok) {
          projectData = await projectResponse.json();
        }

        if (!projectData) {
          // Fall back to demo project data so no project card ever fails to load
          projectData = getDemoProjectById(projectId);
        }

        let updatesData: ProjectUpdate[] = [];
        if (updatesResponse && updatesResponse.ok) {
          updatesData = await updatesResponse.json();
        }

        if (!isMounted) return;
        setProject(projectData);
        setUpdates(updatesData);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setProject(getDemoProjectById(projectId));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProjectData();
    return () => { isMounted = false; };
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project command center…" />
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
          backHref="/projects"
          backLabel="Return to Portfolio"
        />
      </div>
    );
  }

  const completedMilestones = project.milestones.filter(
    (m) => m.status.toUpperCase() === "COMPLETED"
  ).length;

  const coverImage = getProjectCoverImage(project);

  return (
    <div className="page-shell animate-fade-in-up">
      {/* Back to Portfolio Header */}
      <Link href="/" className="back-link mb-5 inline-flex">
        ← Back to Dashboard
      </Link>

      {/* Project Sub-Nav Header */}
      <ProjectSubNav project={project} />

      {/* Hero Cover Banner with Construction Image & High-Visual Overlay */}
      <div className="relative mb-8 h-64 w-full overflow-hidden rounded-3xl bg-[#0B1220] shadow-md">
        <img
          src={coverImage}
          alt={project.name}
          className="h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <StatusBadge status={project.status} />
          <span className="glass-badge rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {project.projectCode}
          </span>
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] bg-white/90 px-2.5 py-1 rounded-md shadow-2xs">
            {project.currentPhase || "Structural Execution Phase"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2 drop-shadow-md">
            {project.name}
          </h1>
          {project.location && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {project.location}
            </p>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card">
          <span className="metric-label">Execution Status</span>
          <div className="mt-1.5"><StatusBadge status={project.status} /></div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Active Phase</span>
          <p className="metric-value text-base font-bold text-[#0B1220] mt-1">
            {project.currentPhase ?? "In Progress"}
          </p>
        </div>

        <div className="metric-card">
          <span className="metric-label">Completion Progress</span>
          <div className="flex items-center justify-between mt-1">
            <span className="metric-value text-xl font-bold text-[#2563EB]">{project.progress}%</span>
          </div>
          <div className="progress-track mt-2">
            <div className="progress-fill" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Project Manager</span>
          <p className="metric-value text-base font-bold text-[#0B1220] mt-1">
            {project.projectManagerName ?? "Unassigned"}
          </p>
        </div>
      </div>

      {/* Navigation Hub Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HubCard
          href={`/projects/${project.id}/progress`}
          title="Progress & S-Curve"
          description="Track site progress charts and physical delivery milestones"
          count={project.progress}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/milestones`}
          title="Delivery Milestones"
          description="Contractual target dates and completion statuses"
          count={project.milestones.length}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/updates`}
          title="Site Updates"
          description="Engineering logs, notices, and site announcements"
          count={updates.length}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/documents`}
          title="Project Documents"
          description="Blueprints, structural drawings, and compliance files"
          count={project.documents?.length ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/photos`}
          title="Site Photo Gallery"
          description="High-resolution site inspection and progress photos"
          count={project.photos?.length ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          }
        />
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <span className="meta-label block mb-2">Commercial Navigation</span>
            <p className="text-xs text-[#667085] mb-3">Quick access to project contracts & financial statements.</p>
            <div className="flex flex-col gap-2">
              <Link href={`/projects/${project.id}/quotations`} className="text-xs font-bold text-[#2563EB] hover:underline flex items-center justify-between">
                <span>📄 Commercial Quotations</span> <span>→</span>
              </Link>
              <Link href={`/projects/${project.id}/contracts`} className="text-xs font-bold text-[#2563EB] hover:underline flex items-center justify-between">
                <span>📜 Executed Contracts</span> <span>→</span>
              </Link>
              <Link href={`/projects/${project.id}/invoices`} className="text-xs font-bold text-[#2563EB] hover:underline flex items-center justify-between">
                <span>💳 Billing & Invoices</span> <span>→</span>
              </Link>
              <Link href={`/projects/${project.id}/payments`} className="text-xs font-bold text-[#2563EB] hover:underline flex items-center justify-between">
                <span>💵 Payment Status</span> <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Details Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="card p-6">
          <h2 className="section-heading mb-5">Project Specifications</h2>
          <dl className="space-y-3.5 text-xs">
            {[
              { label: "PM Contact Direct", value: project.projectManagerContact ?? "Not provided" },
              { label: "Client Organization", value: project.customer?.companyName ?? "Not provided" },
              { label: "Client Representative", value: project.customer?.contactName ?? "Not provided" },
              { label: "Milestone Completion Rate", value: `${completedMilestones} of ${project.milestones.length} Delivered` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 border-b border-[rgba(15,23,42,0.06)] pb-3 last:border-0 last:pb-0">
                <dt className="meta-label shrink-0">{label}</dt>
                <dd className="text-right text-xs font-bold text-[#0B1220]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="section-heading mb-4">Latest Engineering Update</h2>
          <p className="text-xs leading-relaxed text-[#475467] bg-[#F8FAFC] p-4 rounded-xl border border-[rgba(15,23,42,0.06)] italic">
            "{project.recentUpdate ?? "No recent update posted for this project."}"
          </p>
          <p className="mt-4 text-xs font-medium text-[#667085]">
            Last updated: {formatDate(project.updatedAt)}
          </p>
        </div>
      </div>

      {/* Milestones Summary */}
      {project.milestones.length > 0 && (
        <div className="card p-6 mb-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-heading">Active Target Milestones</h2>
            <Link
              href={`/projects/${project.id}/milestones`}
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              View Full Schedule →
            </Link>
          </div>
          <div className="space-y-3">
            {project.milestones.slice(0, 3).map((milestone) => (
              <div key={milestone.id} className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-2xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1220]">
                      {milestone.name}
                    </h3>
                    {milestone.description && (
                      <p className="mt-0.5 text-xs text-[#475467]">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={milestone.status} />
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-xs font-semibold text-[#667085]">
                    <span>Progress</span>
                    <span className="text-[#0B1220]">{milestone.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${milestone.progress}%`,
                        background:
                          milestone.status.toUpperCase() === "COMPLETED"
                            ? "var(--success)"
                            : "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}