"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy?: string | null;
  attachment?: string | null;
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const USER_ID =
  process.env.NEXT_PUBLIC_USER_ID ||
  "";

export default function ProjectUpdatesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        if (!projectId) {
          throw new Error("Project ID is missing.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`,
          {
            headers: {
              "x-user-id": USER_ID,
            },
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

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/projects/${projectId}`}
          className="mb-4 inline-flex items-center text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          ← Back to Project
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Announcements
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">Project Updates</h1>
          <p className="mt-1 text-sm text-[#667085]">
            Latest updates and project notifications shared by the project team.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading updates...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            {error}
          </div>
        )}

        {!loading && !error && updates.length === 0 && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-12 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <h2 className="text-lg font-bold text-[#0B1220]">No updates yet</h2>
            <p className="mt-2 text-sm text-[#667085]">
              There are currently no project updates available.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {updates.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <h2 className="text-lg font-bold text-[#0B1220]">
                  {item.title}
                </h2>

                <span className="text-xs font-medium text-[#667085]">
                  {new Date(item.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#475467]">
                {item.update}
              </p>

              {item.postedBy && (
                <p className="mt-4 text-xs font-medium text-[#667085]">
                  Posted by <strong className="text-[#0B1220]">{item.postedBy}</strong>
                </p>
              )}

              {item.attachment && (
                <a
                  href={item.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  View attachment →
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
