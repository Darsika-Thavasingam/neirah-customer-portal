"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import { getActiveUserId } from '../../../lib/auth';

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


  useEffect(() => {
    if (!projectId) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${apiUrl}/api/v1/customer-portal/projects/${projectId}/documents`,
          {
            headers: {
              "x-user-id": getActiveUserId(),
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
  }, [projectId, apiUrl]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="mb-4 inline-flex items-center text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            ← Back to Project
          </Link>

          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
              Project Documents
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
              {documents.length > 0
                ? documents[0].project.name
                : "Project Documents"}
            </h1>

            {documents.length > 0 && (
              <p className="mt-1 text-sm text-[#667085]">
                {documents[0].project.projectCode}
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-10 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">
              Loading project documents...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            <h2 className="font-bold">
              Unable to load documents
            </h2>

            <p className="mt-2 text-sm font-normal text-[#B42318]">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-[#B42318] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#912018] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B42318]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && documents.length === 0 && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-12 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-2xl text-[#2563EB]">
              📄
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#0B1220]">
              No documents available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#667085]">
              No customer-visible documents have been uploaded for this project yet.
            </p>
          </div>
        )}

        {/* Documents Grid */}
        {!loading && !error && documents.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B1220]">
                  Available Documents
                </h2>

                <p className="text-sm text-[#667085]">
                  {documents.length} document
                  {documents.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition hover:shadow-md"
                >
                  {/* Document icon */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF] text-2xl text-[#2563EB]">
                      📄
                    </div>

                    <StatusBadge status={document.category} />
                  </div>

                  {/* File information */}
                  <div className="mt-5">
                    <h3
                      className="truncate text-base font-bold text-[#0B1220]"
                      title={document.fileName}
                    >
                      {document.fileName}
                    </h3>

                    <p className="mt-1 text-xs text-[#667085]">
                      Uploaded {formatDate(document.uploadedAt)}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="mt-5">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl bg-[#2563EB] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
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