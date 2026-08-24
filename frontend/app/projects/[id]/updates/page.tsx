"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageLoading } from "../../../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy?: string | null;
  attachment?: string | null;
  createdAt: string;
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
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(1, mins)}m ago`;
}

export default function ProjectUpdatesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        if (!projectId) throw new Error("Project ID is missing.");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`,
          {
            headers: { "x-user-id": getActiveUserId() },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message || "Failed to fetch project updates.");
        }

        const data = await response.json();
        setUpdates(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch project updates."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell" style={{ maxWidth: "56rem" }}>
        <PageLoading message="Loading project updates…" />
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ maxWidth: "56rem" }}>
      <Link href={`/projects/${projectId}`} className="back-link mb-5 inline-flex">
        ← Back to Project
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">Announcements</p>
          <h1 className="page-title">Project Updates</h1>
          <p className="page-subtitle">
            Latest updates and notifications shared by the project team.
          </p>
        </div>
        {!loading && !error && updates.length > 0 && (
          <span className="shrink-0 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 py-1.5 text-xs font-bold text-[#667085]">
            {updates.length} update{updates.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <ErrorState
          title="Unable to load updates"
          message={error}
          backHref={`/projects/${projectId}`}
          backLabel="Back to Project"
        />
      )}

      {!error && updates.length === 0 && (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            }
            title="No updates yet"
            body="There are currently no project updates. Check back once the project team posts new announcements."
          />
        </div>
      )}

      {!error && updates.length > 0 && (
        <div className="space-y-4">
          {updates.map((item, idx) => (
            <article key={item.id} className="card card-hover p-6">
              {/* Timeline dot */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-0.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                    style={{
                      background:
                        idx === 0
                          ? "var(--primary)"
                          : "var(--slate-300)",
                    }}
                    aria-hidden="true"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-base font-bold text-[#0B1220]">{item.title}</h2>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <span className="text-xs font-semibold text-[#667085]">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-[0.7rem] text-[#94A3B8]">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#475467]">
                    {item.update}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {item.postedBy && (
                      <p className="text-xs font-medium text-[#667085]">
                        Posted by{" "}
                        <strong className="font-semibold text-[#344054]">
                          {item.postedBy}
                        </strong>
                      </p>
                    )}

                    {item.attachment && (
                      <a
                        href={item.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        View attachment
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
