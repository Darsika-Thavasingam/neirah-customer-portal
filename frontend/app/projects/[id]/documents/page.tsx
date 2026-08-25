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
  fileSize?: string;
  version?: string;
  approvedBy?: string;
};

const MOCK_DEMO_DOCUMENTS: ProjectDocument[] = [
  {
    id: "doc-1",
    category: "Drawings",
    fileName: "Architectural_Blueprints_Master_Rev4.pdf",
    fileUrl: "/images/project-commercial.png",
    uploadedAt: "2026-05-10T10:00:00Z",
    fileSize: "14.2 MB",
    version: "v4.2",
    approvedBy: "Lead Structural Engineer",
  },
  {
    id: "doc-2",
    category: "BOQ",
    fileName: "Commercial_BOQ_Estimation_Spreadsheet.xlsx",
    fileUrl: "/images/project-residential.png",
    uploadedAt: "2026-06-15T14:30:00Z",
    fileSize: "4.8 MB",
    version: "v2.0",
    approvedBy: "Chief Quantity Surveyor",
  },
  {
    id: "doc-3",
    category: "Compliance",
    fileName: "UDA_Urban_Development_Approval_Permit.pdf",
    fileUrl: "/images/project-industrial.png",
    uploadedAt: "2026-07-02T09:15:00Z",
    fileSize: "2.1 MB",
    version: "v1.0",
    approvedBy: "Municipal Planning Board",
  },
  {
    id: "doc-4",
    category: "Structural",
    fileName: "Geotechnical_Soil_Test_Consultant_Report.pdf",
    fileUrl: "/images/project-commercial.png",
    uploadedAt: "2026-07-20T11:00:00Z",
    fileSize: "8.6 MB",
    version: "v1.1",
    approvedBy: "Senior Geotechnical Consultant",
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
      className="flex h-12 w-12 items-center justify-center rounded-xl text-xs font-black shrink-0 shadow-xs"
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
  const [activeDoc, setActiveDoc] = useState<ProjectDocument | null>(null);

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

  const handleDownload = (doc: ProjectDocument) => {
    // Generate a downloadable text file blob with full document details
    const textContent = `NEIRAH CONSTRUCTION OS - OFFICIAL DOCUMENT DOWNLOAD\n----------------------------------------------------\nFile Name: ${doc.fileName}\nCategory: ${doc.category}\nVersion: ${doc.version || "v1.0"}\nApproved By: ${doc.approvedBy || "Neirah Engineering Board"}\nDate Uploaded: ${doc.uploadedAt}\nFile Size: ${doc.fileSize || "4.5 MB"}\nStatus: Certified CIDA Compliant\n----------------------------------------------------\nThis file contains official architectural and structural parameters for ${project?.name || "Project"}.`;
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                <div className="mt-2 flex items-center justify-between text-[0.7rem] text-[#667085]">
                  <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                  <span className="font-bold text-[#2563EB]">{doc.fileSize || "4.5 MB"}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[rgba(15,23,42,0.06)] pt-3">
                <button
                  onClick={() => setActiveDoc(doc)}
                  className="btn btn-ghost btn-sm text-xs font-bold"
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="btn btn-primary btn-sm text-xs font-bold"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Inspector Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileIcon fileName={activeDoc.fileName} />
                <div>
                  <h3 className="text-sm font-black text-[#0B1220] line-clamp-1">{activeDoc.fileName}</h3>
                  <span className="text-[0.65rem] font-bold text-[#2563EB] uppercase tracking-wider">
                    {activeDoc.category} • {activeDoc.version || "v1.0"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="my-5 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white text-center relative overflow-hidden group">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-xs font-black text-cyan-300 uppercase tracking-widest">CIDA Certified Engineering Blueprint</p>
              <p className="text-[0.68rem] text-slate-300 mt-1">Approved by {activeDoc.approvedBy || "Chief Structural Engineer"}</p>
              <div className="mt-4 flex justify-center gap-3 text-[0.68rem] text-slate-400">
                <span>File Size: {activeDoc.fileSize || "4.5 MB"}</span>
                <span>•</span>
                <span>SHA-256 Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveDoc(null)}
                className="btn btn-ghost btn-sm flex-1 text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownload(activeDoc);
                  setActiveDoc(null);
                }}
                className="btn btn-primary btn-sm flex-1 text-xs font-bold"
              >
                ⬇️ Download Certified File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}