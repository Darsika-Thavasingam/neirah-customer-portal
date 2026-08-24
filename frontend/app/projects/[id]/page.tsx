"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StatusBadge from "../../components/StatusBadge";
import { PageLoading } from "../../components/SkeletonLoader";
import { ErrorState } from "../../components/EmptyState";
import { getActiveUserId } from "../../lib/auth";

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
    <Link href={href} className="hub-card group">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#2563EB] transition group-hover:bg-[#dfeeff]">
          {icon}
        </div>
        {count !== undefined && (
          <span className="text-lg font-bold text-[#0B1220]">{count}</span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-bold text-[#0B1220]">{title}</p>
        <p className="mt-0.5 text-xs text-[#667085]">{description}</p>
        <p className="mt-1 text-xs font-semibold text-[#2563EB]">Open →</p>
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
        if (!projectId || !getActiveUserId()) {
          throw new Error("Customer configuration is missing.");
        }

        const headers = { "x-user-id": getActiveUserId() };

        const [projectResponse, updatesResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`,
            { headers }
          ),
          fetch(
            `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`,
            { headers }
          ),
        ]);

        if (!projectResponse.ok)
          throw new Error("Failed to fetch project overview.");

        const projectData: ProjectDetails = await projectResponse.json();

        let updatesData: ProjectUpdate[] = [];
        if (updatesResponse.ok) {
          updatesData = await updatesResponse.json();
        } else {
          setUpdatesError("Could not load project updates.");
        }

        if (!isMounted) return;
        setProject(projectData);
        setUpdates(updatesData);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load project overview."
        );
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
        <PageLoading message="Loading project details…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-shell">
        <Link href="/" className="back-link mb-6 inline-flex">← Dashboard</Link>
        <ErrorState
          title="Unable to load project"
          message={error || "Project not found."}
          backHref="/"
          backLabel="Return to Dashboard"
        />
      </div>
    );
  }

  const completedMilestones = project.milestones.filter(
    (m) => m.status.toUpperCase() === "COMPLETED"
  ).length;

  return (
    <div className="page-shell">
      {/* Back link */}
      <Link href="/" className="back-link mb-5 inline-flex">← Dashboard</Link>

      {/* Project Hero */}
      <div className="card mb-6 overflow-hidden">
        <div
          className="project-hero"
          style={{
            background: "linear-gradient(135deg, #0B1220 0%, #1e3a5f 100%)",
            minHeight: "12rem",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="project-hero-content">
            <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white/60">
              Project Hub
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-1.5 text-sm text-white/70">
              {project.projectCode}
              {project.location ? ` · ${project.location}` : ""}
            </p>
          </div>
        </div>

        {/* Progress row */}
        <div className="border-t border-[rgba(15,23,42,0.06)] px-6 py-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#475467]">
            <span>Construction Progress</span>
            <span className="font-bold text-[#2563EB]">{project.progress}%</span>
          </div>
          <div className="progress-track progress-track-lg">
            <div
              className="progress-fill"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Status", value: <StatusBadge status={project.status} /> },
          {
            label: "Current Phase",
            value: (
              <span className="text-sm font-semibold text-[#0B1220]">
                {project.currentPhase ?? "Not specified"}
              </span>
            ),
          },
          {
            label: "Progress",
            value: (
              <span className="text-xl font-bold text-[#2563EB]">
                {project.progress}%
              </span>
            ),
          },
          {
            label: "Project Manager",
            value: (
              <span className="text-sm font-semibold text-[#0B1220]">
                {project.projectManagerName ?? "Not assigned"}
              </span>
            ),
          },
        ].map(({ label, value }) => (
          <div key={label} className="card-inner p-4">
            <p className="meta-label">{label}</p>
            <div className="mt-1.5">{value}</div>
          </div>
        ))}
      </div>

      {/* Navigation hub */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HubCard
          href={`/projects/${project.id}/progress`}
          title="Progress"
          description="Overall completion and activity"
          count={project.progress}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/milestones`}
          title="Milestones"
          description="Key delivery milestones"
          count={project.milestones.length}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/updates`}
          title="Updates"
          description="Announcements and notes"
          count={updates.length}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/documents`}
          title="Documents"
          description="Records, reports and plans"
          count={project.documents?.length ?? 0}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          }
        />
        <HubCard
          href={`/projects/${project.id}/photos`}
          title="Photos"
          description="Progress gallery"
          count={project.photos?.length ?? 0}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          }
        />
        <div className="card p-5">
          <p className="meta-label mb-3">Quick Links</p>
          <div className="flex flex-col gap-2">
            <Link href="/quotations" className="text-sm font-semibold text-[#2563EB] hover:underline">
              View Quotations →
            </Link>
            <Link href="/invoices" className="text-sm font-semibold text-[#2563EB] hover:underline">
              View Invoices →
            </Link>
            <Link href="/contracts" className="text-sm font-semibold text-[#2563EB] hover:underline">
              View Contracts →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom two-col: Key Details + Recent Update */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-heading mb-5">Key Details</h2>
          <dl className="space-y-3.5">
            {[
              { label: "PM Contact", value: project.projectManagerContact ?? "Not provided" },
              { label: "Client", value: project.customer?.companyName ?? "Not provided" },
              { label: "Contact Person", value: project.customer?.contactName ?? "Not provided" },
              { label: "Milestones Completed", value: `${completedMilestones} of ${project.milestones.length}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 border-b border-[rgba(15,23,42,0.06)] pb-3 last:border-0 last:pb-0">
                <dt className="meta-label shrink-0">{label}</dt>
                <dd className="text-right text-sm font-semibold text-[#0B1220]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="section-heading mb-4">Recent Update</h2>
          <p className="text-sm leading-relaxed text-[#475467]">
            {project.recentUpdate ?? "No recent update available."}
          </p>
          <p className="mt-4 text-xs font-medium text-[#667085]">
            Last updated: {formatDate(project.updatedAt)}
          </p>
        </div>
      </div>

      {/* Milestones summary */}
      {project.milestones.length > 0 && (
        <div className="card mt-6 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-heading">Project Milestones</h2>
            <Link
              href={`/projects/${project.id}/milestones`}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {project.milestones.slice(0, 3).map((milestone) => (
              <div key={milestone.id} className="card-inner p-4">
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

      {/* Latest updates */}
      {(updates.length > 0 || updatesError) && (
        <div className="card mt-6 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-heading">Latest Updates</h2>
            <Link
              href={`/projects/${project.id}/updates`}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View all →
            </Link>
          </div>

          {updatesError && (
            <ErrorState title="Could not load updates" message={updatesError} />
          )}

          <div className="space-y-3">
            {updates.slice(0, 3).map((update) => (
              <div
                key={update.id}
                className="card-inner p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-[#0B1220]">
                    {update.title}
                  </h3>
                  <span className="shrink-0 text-xs font-medium text-[#667085]">
                    {new Date(update.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#475467]">
                  {update.update}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}