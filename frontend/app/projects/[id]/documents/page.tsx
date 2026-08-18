"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ProjectDocument = {
  id: string;
  category: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  project: {
    id: string;
    projectCode: string;
    name: string;
  };
};

export default function ProjectDocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const userId = process.env.NEXT_PUBLIC_USER_ID;

  useEffect(() => {
    if (!projectId) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${apiUrl}/api/v1/customer-portal/projects/${projectId}/documents`,
          {
            headers: {
              "x-user-id": userId,
            },
          }
        );

        if (!response.ok) {
          const body = await response.json().catch(() => null);

          throw new Error(
            body?.message || "Failed to fetch project documents."
          );
        }

        const data = await response.json();

        setDocuments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch project documents."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, apiUrl, userId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case "contract":
        return "bg-blue-50 text-blue-700";
      case "progress report":
        return "bg-green-50 text-green-700";
      case "approved drawings":
        return "bg-purple-50 text-purple-700";
      case "invoice":
        return "bg-orange-50 text-orange-700";
      case "certificate":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-700"
          >
            ← Back to Project
          </Link>

          <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(30,64,175,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Project Documents
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {documents.length > 0
                ? documents[0].project.name
                : "Project Documents"}
            </h1>

            {documents.length > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                {documents[0].project.projectCode}
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-[0_8px_30px_rgba(30,64,175,0.08)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading project documents...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load documents
            </h2>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && documents.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-[0_8px_30px_rgba(30,64,175,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <span className="text-2xl">📄</span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No documents available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No customer-visible documents have been uploaded for this
              project yet.
            </p>
          </div>
        )}

        {/* Documents */}
        {!loading && !error && documents.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Available Documents
                </h2>

                <p className="text-sm text-slate-500">
                  {documents.length} document
                  {documents.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,64,175,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(30,64,175,0.12)]"
                >
                  {/* Document icon */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                      📄
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryStyle(
                        document.category
                      )}`}
                    >
                      {document.category}
                    </span>
                  </div>

                  {/* File information */}
                  <div className="mt-5">
                    <h3
                      className="truncate font-semibold text-slate-900"
                      title={document.fileName}
                    >
                      {document.fileName}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Uploaded {formatDate(document.uploadedAt)}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="mt-5">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}