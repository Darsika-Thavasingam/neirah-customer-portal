"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../../../components/StatusBadge";

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
  status: string;
  progress: number;
  currentPhase: string | null;
  recentUpdate: string | null;
  updatedAt: string;
  milestones: Milestone[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const USER_ID = process.env.NEXT_PUBLIC_USER_ID ?? "";

export default function ProjectProgressPage() {
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

        if (!USER_ID) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`,
          {
            headers: { "x-user-id": USER_ID },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load project progress.");
        }

        const data: Project = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load project progress.");
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
            <p className="text-sm text-[#667085]">Loading project progress...</p>
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
            {error || "Project progress is not available."}
          </div>
        </div>
      </main>
    );
  }

  const completedMilestones = project.milestones.filter((m) => m.status.toUpperCase() === "COMPLETED").length;
  const upcomingMilestones = project.milestones.filter((m) => m.status.toUpperCase() === "UPCOMING").length;
  const delayedMilestones = project.milestones.filter((m) => m.status.toUpperCase() === "DELAYED").length;

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/projects/${projectId}`} className="text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
            ← Back to Project
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">Project Progress</p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">{project.name}</h1>
          <p className="mt-1 text-sm text-[#667085]">{project.projectCode} · {project.currentPhase ?? "Current phase not set"}</p>
        </div>

        <section className="mb-8 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">Overall Completion</p>
              <h2 className="mt-1 text-3xl font-bold text-[#0B1220]">{project.progress}%</h2>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full rounded-full bg-[#2563EB] transition-all duration-500" style={{ width: `${project.progress}%` }} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#667085]">Completed</div>
              <div className="mt-2 text-2xl font-bold text-[#067647]">{completedMilestones}</div>
            </div>
            <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#667085]">Upcoming</div>
              <div className="mt-2 text-2xl font-bold text-[#2563EB]">{upcomingMilestones}</div>
            </div>
            <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#667085]">Delayed</div>
              <div className="mt-2 text-2xl font-bold text-[#B42318]">{delayedMilestones}</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <h2 className="text-lg font-bold text-[#0B1220]">Milestone Progress</h2>
          <div className="mt-5 space-y-4">
            {project.milestones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[rgba(15,23,42,0.12)] bg-[#F7F9FC] p-6 text-center text-sm text-[#667085]">
                No milestone progress has been published yet.
              </div>
            ) : (
              project.milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-[#0B1220]">{milestone.name}</h3>
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
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div className="h-full rounded-full bg-[#2563EB] transition-all duration-300" style={{ width: `${milestone.progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-[#667085]">
                    {milestone.plannedDate && <span>Planned: {new Date(milestone.plannedDate).toLocaleDateString("en-GB")}</span>}
                    {milestone.actualCompletionDate && <span>Completed: {new Date(milestone.actualCompletionDate).toLocaleDateString("en-GB")}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
