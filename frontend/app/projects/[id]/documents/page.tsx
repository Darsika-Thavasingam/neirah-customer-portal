"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";
import { getDemoProjectById } from "../../../lib/demoData";

type ProjectDocument = {
  id: string;
  category: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};

const MOCK_DEMO_DOCUMENTS: ProjectDocument[] = [
  {
    id: "doc-1",
    category: "Drawings",
    fileName: "Architectural_Blueprints_Master_Rev4.pdf",
    fileUrl: "#",
    uploadedAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "doc-2",
    category: "BOQ",
    fileName: "Commercial_BOQ_Estimation_Spreadsheet.xlsx",
    fileUrl: "#",
    uploadedAt: "2026-06-15T14:30:00Z",
  },
  {
    id: "doc-3",
    category: "Compliance",
    fileName: "UDA_Urban_Development_Approval_Permit.pdf",
    fileUrl: "#",
    uploadedAt: "2026-07-02T09:15:00Z",
  },
  {
    id: "doc-4",
    category: "Structural",
    fileName: "Geotechnical_Soil_Test_Consultant_Report.pdf",
    fileUrl: "#",
    uploadedAt: "2026-07-20T11:00:00Z",
  },
];

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
  const isXls = ["xls", "xlsx", "csv"].includes(ext);

  const color = isPdf ? "#B42318" : isImg ? "#2563EB" : isXls ? "#067647" : "#475467";
  const bg = isPdf ? "#FEF3F2" : isImg ? "#EAF2FF" : isXls ? "#ECFDF5" : "#F7F9FC";

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-xl text-xs font-black shrink-0"
      style={{ background: bg, color }}
    >
      {isPdf ? "PDF" : isImg ? "IMG" : isXls ? "XLS" : "DOC"}
    </div>
  );
}

export default function ProjectDocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = getActiveUserId();
        const headers = userId ? { "x-user-id": userId } : {};

        const [projRes, docsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/documents`, { headers, cache: "no-store" }).catch(() => null)
        ]);

        let projData: any = null;
        if (projRes && projRes.ok) {
          projData = await projRes.json();
        }

        let apiDocs: ProjectDocument[] = [];
        if (docsRes && docsRes.ok) {
          const res = await docsRes.json();
          if (Array.isArray(res)) apiDocs = res;
        }

        setProject(projData || getDemoProjectById(projectId));
        setDocuments(apiDocs.length > 0 ? apiDocs : MOCK_DEMO_DOCUMENTS);
      } catch (err) {
        console.error(err);
        setProject(getDemoProjectById(projectId));
        setDocuments(MOCK_DEMO_DOCUMENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading project documents…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/" className="back-link mb-5 inline-flex">
        ← Back to Dashboard
      </Link>

      {project && <ProjectSubNav project={project} />}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-heading">Project Drawings & Documentation</h2>
            <p className="text-xs text-[#667085] mt-0.5">Verified architectural blueprints, BOQs, and compliance permits.</p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">
            {documents.length} Verified Files
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="card card-hover flex flex-col p-5 border border-[rgba(15,23,42,0.08)] bg-white shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <FileIcon fileName={doc.fileName} />
                <StatusBadge status={doc.category} />
              </div>

              <div className="mt-4 flex-1">
                <h3 className="text-xs font-bold text-[#0B1220] line-clamp-2 leading-relaxed" title={doc.fileName}>
                  {doc.fileName}
                </h3>
                <p className="mt-1.5 text-[0.7rem] text-[#667085]">
                  Uploaded {formatDate(doc.uploadedAt)}
                </p>
              </div>

              <div className="mt-4 border-t border-[rgba(15,23,42,0.06)] pt-3">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm w-full">
                  Download File
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}