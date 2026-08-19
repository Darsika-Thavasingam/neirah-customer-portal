"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StatusBadge from "../../components/StatusBadge";
import { getActiveUserId } from '../../lib/auth';

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

function formatCustomerContact(customer: CustomerSummary | null | undefined) {
  if (!customer) return "Not provided";

  const contactName = customer.contactName?.trim();
  const phone = customer.phone?.trim();

  if (contactName && phone) return `${contactName} • ${phone}`;
  if (contactName) return contactName;
  if (phone) return phone;

  return "Not provided";
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
          throw new Error(
            "Customer configuration is missing. Set NEXT_PUBLIC_USER_ID in your environment."
          );
        }

        const headers = { "x-user-id": getActiveUserId() };

        const [projectResponse, updatesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`, {
            headers,
          }),
        ]);

        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project overview.");
        }

        if (!updatesResponse.ok) {
          throw new Error("Failed to fetch project updates.");
        }

        const projectData: ProjectDetails = await projectResponse.json();
        const updatesData: ProjectUpdate[] = await updatesResponse.json();

        if (!isMounted) return;

        setProject(projectData);
        setUpdates(updatesData);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;

        setError(
          err instanceof Error ? err.message : "Unable to load project overview."
        );
        setUpdatesError(
          err instanceof Error ? err.message : "Unable to load project updates."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProjectData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          {loading && (
            <div className="py-4 text-center">
              <p className="text-sm text-[#667085]">Loading project overview...</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
              <p>{error}</p>
            </div>
          )}

          {!loading && project && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">Project Hub</p>
                  <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">{project.name}</h1>
                  <p className="mt-1 text-sm text-[#667085]">
                    {project.projectCode} · {project.location ?? "Location not provided"}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={project.status} />
                  </div>
                </div>

                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">Current Phase</p>
                  <p className="mt-1 font-semibold text-[#0B1220]">
                    {project.currentPhase ?? "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">Progress</p>
                  <p className="mt-1 text-lg font-bold text-[#2563EB]">{project.progress}%</p>
                </div>

                <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">Project Manager</p>
                  <p className="mt-1 font-semibold text-[#0B1220]">
                    {project.projectManagerName ?? "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#475467]">Construction Progress</p>
                  <span className="text-sm font-bold text-[#2563EB]">{project.progress}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <HubCard href={`/projects/${project.id}`} title="Overview" description="Project summary and status" />
                <HubCard href={`/projects/${project.id}/progress`} title="Progress" description="Overall completion and activity" />
                <HubCard href={`/projects/${project.id}/milestones`} title="Milestones" description="Key delivery milestones" />
                <HubCard href={`/projects/${project.id}/updates`} title="Updates" description="Announcements and notes" />
                <HubCard href={`/projects/${project.id}/documents`} title="Documents" description="Records, reports and plans" />
                <HubCard href={`/projects/${project.id}/photos`} title="Photos" description="Progress gallery" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-xs">
                  <h3 className="text-lg font-bold text-[#0B1220]">Key Details</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                      <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Project Manager Contact</dt>
                      <dd className="text-right font-semibold text-[#0B1220]">
                        {project.projectManagerContact ?? "Not provided"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                      <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Client</dt>
                      <dd className="text-right font-semibold text-[#0B1220]">
                        {project.customer?.companyName ?? "Not provided"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[rgba(15,23,42,0.08)] pb-2.5">
                      <dt className="text-xs font-bold uppercase tracking-wider text-[#667085]">Contact</dt>
                      <dd className="text-right font-semibold text-[#0B1220]">
                        {formatCustomerContact(project.customer)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-xs">
                  <h3 className="text-lg font-bold text-[#0B1220]">Recent Update</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#475467]">
                    {project.recentUpdate ?? "No recent update available."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {!loading && project && (
          <>
            <section id="milestones" className="mb-8 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
              <h3 className="text-xl font-bold text-[#0B1220]">Milestones</h3>
              <div className="mt-5 space-y-4">
                {project.milestones.length === 0 ? (
                  <p className="text-sm text-[#667085]">No milestones available yet.</p>
                ) : (
                  project.milestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="font-bold text-[#0B1220]">{milestone.name}</h4>
                          {milestone.description && (
                            <p className="mt-1 text-sm text-[#475467]">{milestone.description}</p>
                          )}
                        </div>
                        <StatusBadge status={milestone.status} />
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#667085]">
                          <span>Progress</span>
                          <span className="text-[#0B1220]">{milestone.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                          <div
                            className="h-full rounded-full bg-[#067647] transition-all duration-300"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section id="updates" className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-[#0B1220]">Latest Updates</h3>
                <Link
                  href={`/projects/${project.id}/updates`}
                  className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  View all updates →
                </Link>
              </div>

              {updatesError && (
                <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-4 text-sm font-semibold text-[#B42318]">
                  {updatesError}
                </div>
              )}

              {!updatesError && updates.length === 0 && (
                <p className="text-sm text-[#667085]">No updates available for this project.</p>
              )}

              <div className="space-y-4">
                {updates.slice(0, 3).map((update) => (
                  <div key={update.id} className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-bold text-[#0B1220]">{update.title}</h4>
                      <span className="text-xs font-medium text-[#667085]">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#475467]">{update.update}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function HubCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-28 flex-col justify-between rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-xs transition hover:border-[#2563EB]/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
    >
      <div>
        <p className="text-base font-bold text-[#0B1220]">{title}</p>
        <p className="mt-1 text-xs text-[#667085]">{description}</p>
      </div>
      <span className="mt-4 text-xs font-bold text-[#2563EB]">Open →</span>
    </Link>
  );
}