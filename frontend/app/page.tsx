"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "./components/StatusBadge";
import { PageLoading } from "./components/SkeletonLoader";
import { ErrorState } from "./components/EmptyState";
import { getActiveUserId, getActiveProjectId } from "./lib/auth";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy: string;
  attachment: string | null;
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(1, mins)}m ago`;
}

export default function Home() {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
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
    let isMounted = true;

    async function fetchProjectData() {
      try {
        const userId = getActiveUserId();
        const projectId = getActiveProjectId();

        if (!projectId || !userId) {
          setError(
            "Project configuration is missing. Please verify your access credentials."
          );
          return;
        }

        const headers = { "x-user-id": userId };

        const [projectResponse, updatesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, {
            headers,
            cache: "no-store",
          }),
          fetch(
            `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`,
            { headers, cache: "no-store" }
          ),
        ]);

        if (!projectResponse.ok) throw new Error("Failed to fetch project overview");
        if (!updatesResponse.ok) throw new Error("Failed to fetch project updates");

        const projectData: ProjectDetails = await projectResponse.json();
        const updatesData: ProjectUpdate[] = await updatesResponse.json();

        if (!isMounted) return;
        setProject(projectData);
        setUpdates(updatesData);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError("Unable to load project overview.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProjectData();
    return () => { isMounted = false; };
  }, [fetchKey]);

  const completedMilestones = project?.milestones.filter(
    (m) => m.status.toUpperCase() === "COMPLETED"
  ).length ?? 0;
  const nextMilestone = project?.milestones.find(
    (m) => m.status.toUpperCase() !== "COMPLETED"
  );

  if (loading) {
    return (
      <div className="page-shell">
        <div className="mb-8">
          <div className="skeleton skeleton-text mb-2 w-24" />
          <div className="skeleton skeleton-title w-64" />
        </div>
        <PageLoading message="Loading your project overview…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="page-kicker">Dashboard</p>
        <h1 className="page-title">
          {project?.customer?.contactName
            ? `Good day, ${project.customer.contactName.split(" ")[0]}.`
            : "Project Overview"}
        </h1>
        <p className="page-subtitle">
          Here is the latest overview of your construction project.
        </p>
      </div>

      {error && (
        <div className="mb-8">
          <ErrorState title="Unable to load dashboard" message={error} />
        </div>
      )}

      {!error && project && (
        <>
          {/* ── Main 2-col layout ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div className="flex flex-col gap-6">
              {/* Active Project Hero */}
              <div className="card overflow-hidden">
                {/* Hero banner */}
                <div
                  className="project-hero"
                  style={{
                    background:
                      "linear-gradient(135deg, #0B1220 0%, #1e3a5f 100%)",
                    minHeight: "13rem",
                  }}
                >
                  {/* Subtle grid texture */}
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
                    <StatusBadge
                      status={project.status}
                      className="mb-3 w-fit"
                    />
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                      {project.name}
                    </h2>
                    {project.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {project.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar row */}
                <div className="flex flex-col gap-4 border-t border-[rgba(15,23,42,0.06)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#475467]">
                      <span>Project Progress</span>
                      <span className="font-bold text-[#2563EB]">
                        {project.progress}% Complete
                      </span>
                    </div>
                    <div className="progress-track progress-track-lg">
                      <div
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="btn btn-primary shrink-0 sm:ml-6"
                  >
                    View Project
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Quick-access grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Documents",
                    count: project.documents?.length ?? 0,
                    href: `/projects/${project.id}/documents`,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    ),
                  },
                  {
                    label: "Photos",
                    count: project.photos?.length ?? 0,
                    href: `/projects/${project.id}/photos`,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    ),
                  },
                  {
                    label: "Milestones",
                    count: project.milestones?.length ?? 0,
                    href: `/projects/${project.id}/milestones`,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 11 12 14 22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                    ),
                  },
                  {
                    label: "Updates",
                    count: updates.length,
                    href: `/projects/${project.id}/updates`,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    ),
                  },
                ].map(({ label, count, href, icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="hub-card group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#2563EB] transition group-hover:bg-[#dfeeff]">
                        {icon}
                      </div>
                      <span className="text-lg font-bold text-[#0B1220]">
                        {count}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-[#344054]">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-[#2563EB]">
                        View all →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] px-6 py-4">
                  <h2 className="section-heading">Recent Activity</h2>
                  <Link
                    href={`/projects/${project.id}/updates`}
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    View all
                  </Link>
                </div>

                {updates.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-[#667085]">
                      No activity updates available yet.
                    </p>
                  </div>
                ) : (
                  <div className="px-6 py-4">
                    <div className="timeline">
                      {updates.slice(0, 4).map((item, idx) => (
                        <div key={item.id} className="timeline-item">
                          <div
                            className={`timeline-dot ${
                              idx === 0 ? "" : "timeline-dot-muted"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#667085]">
                              {timeAgo(item.createdAt)}
                            </p>
                            <h3 className="mt-0.5 text-sm font-bold text-[#0B1220]">
                              {item.title}
                            </h3>
                            <p className="mt-0.5 text-sm leading-relaxed text-[#475467] truncate-2">
                              {item.update}
                            </p>
                            {item.attachment && (
                              <a
                                href={item.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 text-xs font-semibold text-[#2563EB] hover:underline"
                              >
                                View attachment →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex flex-col gap-4">
              {/* Key stats */}
              <div className="card p-5">
                <h2 className="section-heading mb-4">Project Details</h2>
                <dl className="space-y-3.5">
                  {[
                    { label: "Project Code", value: project.projectCode },
                    {
                      label: "Current Phase",
                      value: project.currentPhase ?? "Not specified",
                    },
                    {
                      label: "Project Manager",
                      value: project.projectManagerName ?? "Not assigned",
                    },
                    {
                      label: "Milestones Done",
                      value: `${completedMilestones} / ${project.milestones.length}`,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-[rgba(15,23,42,0.06)] pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="meta-label shrink-0">{label}</dt>
                      <dd className="text-right text-sm font-semibold text-[#0B1220]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Next milestone */}
              {nextMilestone && (
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
                  }}
                >
                  <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white/70">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Next Milestone
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">
                    {nextMilestone.name}
                  </h3>
                  {nextMilestone.plannedDate && (
                    <p className="mt-1 text-sm text-white/80">
                      Target:{" "}
                      {new Date(nextMilestone.plannedDate).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </p>
                  )}
                  <div className="mt-4">
                    <div className="progress-track" style={{ background: "rgba(255,255,255,0.25)" }}>
                      <div
                        className="h-full rounded-full bg-white transition-all duration-500"
                        style={{ width: `${nextMilestone.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-right text-xs font-semibold text-white/80">
                      {nextMilestone.progress}% complete
                    </p>
                  </div>
                </div>
              )}

              {/* Recent update snippet */}
              {project.recentUpdate && (
                <div className="card p-5">
                  <h2 className="section-heading mb-3">Recent Update</h2>
                  <p className="text-sm leading-relaxed text-[#475467]">
                    {project.recentUpdate}
                  </p>
                  <p className="mt-3 text-xs font-medium text-[#667085]">
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              )}

              {/* Financial actions */}
              <div className="card p-5">
                <h2 className="section-heading mb-4">Financials</h2>
                <div className="flex flex-col gap-2">
                  <Link href="/invoices" className="btn btn-ghost w-full justify-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    View Invoices
                  </Link>
                  <Link href="/payments" className="btn btn-ghost w-full justify-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Payment History
                  </Link>
                  <Link href="/quotations" className="btn btn-ghost w-full justify-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Quotations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}