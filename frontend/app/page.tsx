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

type Milestone = {
  id: string;
  name: string;
  description: string | null;
  plannedDate: string | null;
  actualCompletionDate: string | null;
  status: string;
  progress: number;
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
  milestones: Milestone[];
};

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";
const USER_ID = process.env.NEXT_PUBLIC_USER_ID ?? "";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusBadgeStyle(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "DELAYED":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "UPCOMING":
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
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
        if (!PROJECT_ID || !USER_ID) {
          setError(
            "Project configuration is missing. Set NEXT_PUBLIC_PROJECT_ID and NEXT_PUBLIC_USER_ID in your environment."
          );
          setUpdatesError(
            "Project configuration is missing. Set NEXT_PUBLIC_PROJECT_ID and NEXT_PUBLIC_USER_ID in your environment."
          );
          return;
        }

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

              {/* Day 5 Step 1: Project Milestones */}
              <div className="rounded-xl border bg-white p-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Milestones
                </h3>

                <div className="mt-5 space-y-4">
                  {!project.milestones || project.milestones.length === 0 ? (
                    <p className="text-gray-500">No milestones are available yet.</p>
                  ) : (
                    project.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="rounded-lg border bg-gray-50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {milestone.name}
                            </h4>
                            {milestone.description && (
                              <p className="mt-1 text-sm text-gray-600">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeStyle(
                              milestone.status
                            )}`}
                          >
                            {formatStatus(milestone.status)}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-semibold text-gray-900">
                              {milestone.progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                        </div>

                        {(milestone.plannedDate || milestone.actualCompletionDate) && (
                          <div className="mt-3 flex flex-wrap gap-4 border-t pt-3 text-xs text-gray-500">
                            {milestone.plannedDate && (
                              <span>
                                Planned:{" "}
                                <strong className="text-gray-700">
                                  {new Date(milestone.plannedDate).toLocaleDateString()}
                                </strong>
                              </span>
                            )}
                            {milestone.actualCompletionDate && (
                              <span>
                                Completed:{" "}
                                <strong className="text-gray-700">
                                  {new Date(milestone.actualCompletionDate).toLocaleDateString()}
                                </strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
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