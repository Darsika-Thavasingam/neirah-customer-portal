"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { getActiveUserId } from "../../../lib/auth";
import { getDemoProjectById } from "../../../lib/demoData";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy?: string | null;
  attachment?: string | null;
  createdAt: string;
};

const MOCK_DEMO_UPDATES: ProjectUpdate[] = [
  {
    id: "up-1",
    title: "Concrete Pouring Complete for Upper Level Structural Slab",
    update: "Engineers have successfully completed the 12th-floor slab casting. Inspection signoff obtained from structural consultant Eng. Damith Perera.",
    postedBy: "Eng. Damith Perera (Project Lead)",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "up-2",
    title: "Aluminium Façade Delivery & Glazing Rigging Approved",
    update: "Curtain wall glass panels delivered to site. Tower crane rigging scheduled for weekend window to avoid street traffic interference.",
    postedBy: "Site Supervisor Nimal Silva",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

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
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(1, mins)}m ago`;
}

export default function ProjectUpdatesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getActiveUserId();
        const headers = userId ? { "x-user-id": userId } : {};

        const [projRes, updatesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`, { headers, cache: "no-store" }).catch(() => null)
        ]);

        let projData: any = null;
        if (projRes && projRes.ok) {
          projData = await projRes.json();
        }

        let apiUpdates: ProjectUpdate[] = [];
        if (updatesRes && updatesRes.ok) {
          const data = await updatesRes.json();
          if (Array.isArray(data)) apiUpdates = data;
        }

        setProject(projData || getDemoProjectById(projectId));
        setUpdates(apiUpdates.length > 0 ? apiUpdates : MOCK_DEMO_UPDATES);
      } catch (err) {
        console.error(err);
        setProject(getDemoProjectById(projectId));
        setUpdates(MOCK_DEMO_UPDATES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading site execution updates…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/" className="back-link mb-5 inline-flex">
        ← Back to Dashboard
      </Link>

      {project && <ProjectSubNav project={project} />}

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-heading">Site Logs & Progress Announcements</h2>
            <p className="text-xs text-[#667085] mt-0.5">Chronological site updates and engineering notifications.</p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">
            {updates.length} Updates Logged
          </span>
        </div>

        <div className="space-y-4">
          {updates.map((item, idx) => (
            <article key={item.id} className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] p-5 shadow-2xs">
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-0.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white font-bold text-xs"
                    style={{ background: idx === 0 ? "#2563EB" : "#94A3B8" }}
                  >
                    ✓
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-sm font-bold text-[#0B1220]">{item.title}</h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold text-[#667085]">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-[0.68rem] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-[#475467]">
                    {item.update}
                  </p>

                  {item.postedBy && (
                    <p className="mt-3 text-[0.72rem] font-medium text-[#667085]">
                      Posted by: <strong className="font-semibold text-[#0B1220]">{item.postedBy}</strong>
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
