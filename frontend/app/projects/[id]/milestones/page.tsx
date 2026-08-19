"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../../../components/StatusBadge";
import { getActiveUserId } from '../../../lib/auth';

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
  milestones: Milestone[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function ProjectMilestonesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`,
          {
            headers: { "x-user-id": getActiveUserId() },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load milestones.");
        }

        const data: Project = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load milestones.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading milestones...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href={`/projects/${projectId}`} className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
            ← Back to Project
          </Link>
          <div className="mt-6 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            {error || "Milestones are not available."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/projects/${projectId}`} className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
            ← Back to Project
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">Project Milestones</p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">{project.name}</h1>
          <p className="mt-1 text-sm text-[#667085]">{project.projectCode}</p>
        </div>

        <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0B1220]">Milestone Schedule</h2>
            <span className="text-xs font-bold text-[#667085]">{project.milestones.length} milestone(s)</span>
          </div>

          {project.milestones.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[rgba(15,23,42,0.12)] bg-[#F7F9FC] p-8 text-center text-sm text-[#667085]">
              There are no milestones for this project yet.
            </div>
          ) : (
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#0B1220]">{milestone.name}</h3>
                      {milestone.description && <p className="mt-1 text-sm text-[#475467]">{milestone.description}</p>}
                    </div>
                    <StatusBadge status={milestone.status} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#667085]">Planned Date</div>
                      <div className="mt-1 text-sm font-semibold text-[#0B1220]">{milestone.plannedDate ? new Date(milestone.plannedDate).toLocaleDateString("en-GB") : "—"}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#667085]">Completed</div>
                      <div className="mt-1 text-sm font-semibold text-[#067647]">{milestone.actualCompletionDate ? new Date(milestone.actualCompletionDate).toLocaleDateString("en-GB") : "—"}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#667085]">Progress</div>
                      <div className="mt-1 text-sm font-bold text-[#2563EB]">{milestone.progress}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
