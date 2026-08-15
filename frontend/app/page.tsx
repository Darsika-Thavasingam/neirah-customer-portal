"use client";

import { useEffect, useState } from "react";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy: string;
  attachment: string | null;
  createdAt: string;
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
};

const PROJECT_ID = "8f2d9dbe-9d3c-4d1b-a73a-7e1d2a1b4a23";
const USER_ID = "cb87a213-f633-4659-84c8-e356f8a145d8";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Home() {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatesError, setUpdatesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProjectData() {
      try {
        const headers = {
          "x-user-id": USER_ID,
        };

        const [projectResponse, updatesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${PROJECT_ID}`, {
            headers,
          }),
          fetch(
            `${API_BASE_URL}/api/v1/customer-portal/projects/${PROJECT_ID}/updates`,
            {
              headers,
            }
          ),
        ]);

        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project overview");
        }

        if (!updatesResponse.ok) {
          throw new Error("Failed to fetch project updates");
        }

        const projectData: ProjectDetails = await projectResponse.json();
        const updatesData: ProjectUpdate[] = await updatesResponse.json();

        if (!isMounted) {
          return;
        }

        setProject(projectData);
        setUpdates(updatesData);
      } catch (err) {
        console.error(err);

        if (!isMounted) {
          return;
        }

        setError("Unable to load project overview.");
        setUpdatesError("Unable to load project updates.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProjectData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Neirah Customer Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Construction project progress and updates
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          {loading && (
            <div className="py-4">
              <p className="text-gray-500">Loading project overview...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && project && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">Current Project</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {project.name}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Project Code
                  </p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {project.projectCode}
                  </p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Location
                  </p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {project.location ?? "Not specified"}
                  </p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatStatus(project.status)}
                  </p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Project ID
                  </p>
                  <p className="mt-2 font-semibold text-gray-900 break-all">
                    {project.id}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50 p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Construction Progress
                  </p>
                  <span className="text-sm font-semibold text-gray-900">
                    {project.progress}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-white p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Key Details
                  </h3>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b pb-2">
                      <dt className="text-gray-500">Current Phase</dt>
                      <dd className="font-medium text-gray-900 text-right">
                        {project.currentPhase ?? "Not specified"}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4 border-b pb-2">
                      <dt className="text-gray-500">Project Manager</dt>
                      <dd className="font-medium text-gray-900 text-right">
                        {project.projectManagerName ?? "Not assigned"}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4 border-b pb-2">
                      <dt className="text-gray-500">Contact</dt>
                      <dd className="font-medium text-gray-900 text-right">
                        {project.projectManagerContact ?? "Not provided"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border bg-white p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Update
                  </h3>

                  <p className="mt-4 text-gray-700 leading-7">
                    {project.recentUpdate ?? "No recent update available."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Project Updates
            </h2>

            <p className="text-gray-500 mt-1">
              Latest progress updates from the project team.
            </p>
          </div>

          {updatesError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-700">{updatesError}</p>
            </div>
          )}

          {!updatesError && updates.length === 0 && !loading && (
            <div className="bg-white rounded-xl border p-6">
              <p className="text-gray-500">
                No project updates are available yet.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {updates.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-xl border shadow-sm p-6"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 leading-7">{item.update}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                    <span>
                      Posted by:{" "}
                      <strong className="text-gray-700">
                        {item.postedBy}
                      </strong>
                    </span>

                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.attachment && (
                    <a
                      href={item.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2"
                    >
                      View attachment
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}