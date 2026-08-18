"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy?: string | null;
  attachment?: string | null;
  createdAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

const USER_ID =
  process.env.NEXT_PUBLIC_USER_ID ||
  process.env.NEXT_PUBLIC_DEMO_USER_ID ||
  "";

export default function ProjectUpdatesPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/customer-portal/projects/${projectId}/updates`,
          {
            headers: {
              "x-user-id": USER_ID,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project updates.");
        }

        const data = await response.json();
        setUpdates(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch project updates."
        );
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchUpdates();
  }, [projectId]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="mb-6 text-sm font-medium text-blue-700"
        >
          ← Back to Project
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
          Project Updates
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Latest updates shared with you.
        </p>

        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            Loading updates...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && updates.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold text-slate-900">
              No updates yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              There are currently no project updates available.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {updates.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <h2 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h2>

                <span className="text-sm text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {item.update}
              </p>

              {item.postedBy && (
                <p className="mt-4 text-xs text-slate-500">
                  Posted by {item.postedBy}
                </p>
              )}

              {item.attachment && (
                <a
                  href={item.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-blue-700"
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