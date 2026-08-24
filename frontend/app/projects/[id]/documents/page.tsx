"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import { PageLoading } from "../../../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FileIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  const isImg = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  const isDoc = ["doc", "docx"].includes(ext);
  const isXls = ["xls", "xlsx", "csv"].includes(ext);

  const color = isPdf
    ? "#B42318"
    : isImg
      ? "#2563EB"
      : isDoc
        ? "#1D4ED8"
        : isXls
          ? "#067647"
          : "#475467";
  const bg = isPdf
    ? "#FEF3F2"
    : isImg
      ? "#EAF2FF"
      : isDoc
        ? "#EAF2FF"
        : isXls
          ? "#ECFDF5"
          : "#F7F9FC";

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black"
      style={{ background: bg, color }}
      aria-hidden="true"
    >
      {isPdf
        ? "PDF"
        : isImg
          ? "IMG"
          : isDoc
            ? "DOC"
            : isXls
              ? "XLS"
              : ext.toUpperCase() || "FILE"}
    </div>
  );
}

export default function ProjectDocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (!projectId) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) throw new Error("Customer portal user is not configured.");

        const response = await fetch(
          `${apiUrl}/api/v1/customer-portal/projects/${projectId}/documents`,
          { headers: { "x-user-id": getActiveUserId() } }
        );

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.message || "Failed to fetch project documents.");
        }

        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch project documents.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, apiUrl]);

  const projectName =
    documents.length > 0 ? documents[0].project.name : "Project Documents";
  const projectCode =
    documents.length > 0 ? documents[0].project.projectCode : "";

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading documents…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Link href={`/projects/${projectId}`} className="back-link mb-5 inline-flex">
        ← Back to Project
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">Project Documents</p>
          <h1 className="page-title">{projectName}</h1>
          {projectCode && <p className="page-subtitle">{projectCode}</p>}
        </div>
        {!error && documents.length > 0 && (
          <span className="shrink-0 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 py-1.5 text-xs font-bold text-[#667085]">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <ErrorState
          title="Unable to load documents"
          message={error}
          backHref={`/projects/${projectId}`}
          backLabel="Back to Project"
        />
      )}

      {!error && documents.length === 0 && (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            }
            title="No documents available"
            body="No customer-visible documents have been uploaded for this project yet."
          />
        </div>
      )}

      {!error && documents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="card card-hover flex flex-col p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <FileIcon fileName={document.fileName} />
                <StatusBadge status={document.category} />
              </div>

              {/* File info */}
              <div className="mt-4 flex-1">
                <h3
                  className="text-sm font-bold text-[#0B1220]"
                  title={document.fileName}
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {document.fileName}
                </h3>
                <p className="mt-1 text-xs text-[#667085]">
                  Uploaded {formatDate(document.uploadedAt)}
                </p>
              </div>

              {/* Action */}
              <div className="mt-4 border-t border-[rgba(15,23,42,0.06)] pt-4">
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm w-full"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  View / Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}