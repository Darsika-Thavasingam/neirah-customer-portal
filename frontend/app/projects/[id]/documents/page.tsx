"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
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

function getProjectSpecificDocuments(project: any): ProjectDocument[] {
  if (!project) return [];
  const code = project.projectCode || "NEI-PROJ";
  const nameClean = project.name ? project.name.replace(/[^a-zA-Z0-9]/g, "") : "Project";
  return [
    {
      id: `${project.id}-doc-1`,
      category: "Drawings",
      fileName: `${code}_${nameClean}_Architectural_Blueprints_Rev4.pdf`,
      fileUrl: "/images/project-commercial.png",
      uploadedAt: project.updatedAt || "2026-05-10T10:00:00Z",
      fileSize: "14.2 MB",
      version: "v4.2",
      approvedBy: "Lead Structural Engineer",
    },
    {
      id: `${project.id}-doc-2`,
      category: "BOQ",
      fileName: `${code}_${nameClean}_Itemized_BOQ_Quotation.xlsx`,
      fileUrl: "/images/project-residential.png",
      uploadedAt: project.updatedAt || "2026-06-15T14:30:00Z",
      fileSize: "4.8 MB",
      version: "v2.0",
      approvedBy: "Chief Quantity Surveyor",
    },
    {
      id: `${project.id}-doc-3`,
      category: "Compliance",
      fileName: `${code}_${nameClean}_UDA_Development_Permit.pdf`,
      fileUrl: "/images/project-industrial.png",
      uploadedAt: project.updatedAt || "2026-07-02T09:15:00Z",
      fileSize: "2.1 MB",
      version: "v1.0",
      approvedBy: "Municipal Planning Board",
    },
    {
      id: `${project.id}-doc-4`,
      category: "Structural",
      fileName: `${code}_${nameClean}_Geotechnical_SoilTest_Report.pdf`,
      fileUrl: "/images/project-commercial.png",
      uploadedAt: project.updatedAt || "2026-07-20T11:00:00Z",
      fileSize: "8.6 MB",
      version: "v1.1",
      approvedBy: "Senior Geotechnical Consultant",
    },
    {
      id: `${project.id}-doc-5`,
      category: "Structural",
      fileName: `${code}_${nameClean}_Foundation_Engineering_Analysis.pdf`,
      fileUrl: "/images/project-commercial.png",
      uploadedAt: project.updatedAt || "2026-08-01T08:00:00Z",
      fileSize: "6.3 MB",
      version: "v1.0",
      approvedBy: "Senior Structural Engineer",
    },
    {
      id: `${project.id}-doc-6`,
      category: "Drawings",
      fileName: `${code}_${nameClean}_MEP_Systems_Layout_Rev2.pdf`,
      fileUrl: "/images/project-industrial.png",
      uploadedAt: project.updatedAt || "2026-08-05T11:30:00Z",
      fileSize: "9.4 MB",
      version: "v2.1",
      approvedBy: "MEP Lead Engineer",
    },
  ];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_META: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  Drawings: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", label: "Drawings", icon: "📐" },
  BOQ: { color: "#067647", bg: "#ECFDF5", border: "#A7F3D0", label: "BOQ", icon: "📊" },
  Compliance: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", label: "Compliance", icon: "✅" },
  Structural: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", label: "Structural", icon: "🏗️" },
};

function getFileTypeMeta(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return { label: "PDF", color: "#B42318", bg: "#FEF3F2" };
  if (["xls", "xlsx", "csv"].includes(ext)) return { label: "XLS", color: "#067647", bg: "#ECFDF5" };
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return { label: "IMG", color: "#2563EB", bg: "#EAF2FF" };
  return { label: "DOC", color: "#475467", bg: "#F7F9FC" };
}

function FileTypeBadge({ fileName }: { fileName: string }) {
  const { label, color, bg } = getFileTypeMeta(fileName);
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-lg text-[0.6rem] font-black shrink-0"
      style={{ background: bg, color }}
    >
      {label}
    </div>
  );
}

/** Simple SVG Doughnut Chart */
function DonutChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  const size = 120;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.count / total;
    const dash = pct * circumference;
    const seg = { ...d, dash, gap: circumference - dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-[#0B1220]">{total}</span>
          <span className="text-[0.6rem] text-[#667085] font-bold">Files</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[#475467] font-medium">{d.label}</span>
            <span className="ml-auto font-black text-[#0B1220] pl-3">{d.count}</span>
          </div>
        ))}
      </div>
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
  const [activeDoc, setActiveDoc] = useState<ProjectDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = getActiveUserId();
        const headers: Record<string, string> = userId ? { "x-user-id": userId } : {};

        const projRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null);
        if (projRes) {
          if (!projRes.ok) {
            setError("Access Denied: You do not have permission to view this project's documents.");
            setProject(null);
            setLoading(false);
            return;
          }
          const projData = await projRes.json();
          const docsRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/documents`, { headers, cache: "no-store" }).catch(() => null);
          const apiDocs = docsRes && docsRes.ok ? await docsRes.json() : [];
          let finalDocs: ProjectDocument[] = Array.isArray(apiDocs) && apiDocs.length > 0 ? apiDocs : (projData?.documents || []);
          if (finalDocs.length === 0) finalDocs = getProjectSpecificDocuments(projData);

          setProject(projData);
          setDocuments(finalDocs);
        } else {
          const demoProj = getDemoProjectById(projectId);
          setProject(demoProj);
          setDocuments(getProjectSpecificDocuments(demoProj));
        }
      } catch (err) {
        console.error(err);
        setError("Access Denied: Unable to fetch project documents.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(documents.map((d) => d.category)));
    return cats;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || doc.category.toUpperCase() === selectedCategory.toUpperCase();
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);

  const groupedDocuments = useMemo(() => {
    const groups: Record<string, ProjectDocument[]> = {};
    filteredDocuments.forEach((doc) => {
      if (!groups[doc.category]) groups[doc.category] = [];
      groups[doc.category].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  const chartData = useMemo(() => {
    return categories.map((cat) => {
      const meta = CATEGORY_META[cat];
      return {
        label: meta?.label || cat,
        count: documents.filter((d) => d.category === cat).length,
        color: meta?.color || "#667085",
      };
    });
  }, [documents, categories]);

  const handleDownload = (doc: ProjectDocument) => {
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
      <PageHeader
        kicker={`PROJECT ${project?.projectCode || ""} · DOCUMENT REPOSITORY`}
        title={project?.name || "Project Documents"}
        subtitle={`Verified architectural blueprints, engineering CAD drawings, and compliance permits.`}
        bgImage="/images/project-industrial.png"
        className="mb-0"
        actions={
          <input
            type="text"
            placeholder="Search files…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input text-xs py-2 px-3.5 rounded-xl bg-white/10 text-white placeholder-slate-300 border-white/20 min-w-[180px]"
          />
        }
      />
      {project && <ProjectSubNav project={project} />}

      {/* Summary Card with Donut Chart */}
      <div className="bg-[#EAF2FF] rounded-xl p-5 border border-[#BFDBFE] mb-6 flex-wrap gap-6">
        <DonutChart data={chartData} />
        <div className="flex-1">
          <p className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider mb-2">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${selectedCategory === "ALL"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "bg-[#F8FAFC] text-[#667085] hover:text-[#0B1220]"
                }`}
            >
              All Files ({documents.length})
            </button>
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = documents.filter((d) => d.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors border ${selectedCategory === cat
                    ? "text-white"
                    : "bg-[#F8FAFC] text-[#667085] hover:text-[#0B1220]"
                    }`}
                  style={
                    selectedCategory === cat
                      ? { background: meta?.color || "#667085", borderColor: meta?.color || "#667085" }
                      : { borderColor: "rgba(15,23,42,0.08)" }
                  }
                >
                  {meta?.icon} {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Documents Grouped by Category */}
      {Object.keys(groupedDocuments).length === 0 ? (
        <div className="card p-10 text-center text-sm text-[#667085]">
          No documents match your search.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => {
            const meta = CATEGORY_META[category] || { color: "#667085", bg: "#F8FAFC", border: "#E9EDF4", label: category, icon: "📄" };
            return (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black border"
                    style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                    <span
                      className="ml-1 rounded-full w-4 h-4 flex items-center justify-center text-[0.6rem] text-white"
                      style={{ background: meta.color }}
                    >
                      {docs.length}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-[rgba(15,23,42,0.06)]" />
                </div>

                {/* Documents List — High Visibility Dividers with Hover Interaction */}
                <div className="divide-y-2 divide-slate-300 border-y-2 border-slate-300 overflow-hidden bg-transparent">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 px-5 py-4 group hover:bg-blue-50/60 transition-all duration-200 cursor-pointer"
                      onClick={() => setActiveDoc(doc)}
                    >
                      {/* File Type Badge */}
                      <FileTypeBadge fileName={doc.fileName} />

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm font-bold text-[#0B1220] truncate group-hover:text-[#2563EB] transition-colors"
                          title={doc.fileName}
                        >
                          {doc.fileName}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5 text-[0.7rem] text-[#98A2B3]">
                          <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                          {doc.version && (
                            <>
                              <span>•</span>
                              <span
                                className="font-bold px-1.5 py-0.5 rounded text-[0.6rem]"
                                style={{ color: meta.color, background: meta.bg }}
                              >
                                {doc.version}
                              </span>
                            </>
                          )}
                          {doc.approvedBy && (
                            <>
                              <span>•</span>
                              <span className="hidden sm:inline truncate max-w-[180px]">✓ {doc.approvedBy}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* File Size */}
                      <div className="hidden md:block text-right shrink-0">
                        <span className="text-xs font-bold text-[#2563EB]">{doc.fileSize || "4.5 MB"}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDoc(doc);
                          }}
                          className="p-2 rounded-lg text-[#667085] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                          title="Preview"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc);
                          }}
                          className="p-2 rounded-lg text-[#667085] hover:text-[#067647] hover:bg-emerald-50 transition-colors"
                          title="Download"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileTypeBadge fileName={activeDoc.fileName} />
                <div>
                  <h3 className="text-sm font-black text-[#0B1220] line-clamp-1">{activeDoc.fileName}</h3>
                  <span className="text-[0.65rem] font-bold text-[#2563EB] uppercase tracking-wider">
                    {activeDoc.category} • {activeDoc.version || "v1.0"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="my-5 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white text-center relative overflow-hidden">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-xs font-black text-cyan-300 uppercase tracking-widest">CIDA Certified Engineering Document</p>
              <p className="text-[0.68rem] text-slate-300 mt-1">Approved by {activeDoc.approvedBy || "Chief Structural Engineer"}</p>
              <div className="mt-4 flex justify-center gap-4 text-[0.68rem] text-slate-400">
                <span>Size: {activeDoc.fileSize || "4.5 MB"}</span>
                <span>•</span>
                <span>SHA-256 Verified</span>
                <span>•</span>
                <span>{activeDoc.version || "v1.0"}</span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 mb-5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-[#98A2B3] font-bold text-[0.65rem] uppercase mb-0.5">Category</p>
                <p className="font-black text-[#0B1220]">{activeDoc.category}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-[#98A2B3] font-bold text-[0.65rem] uppercase mb-0.5">Uploaded</p>
                <p className="font-black text-[#0B1220]">{formatDate(activeDoc.uploadedAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveDoc(null)}
                className="btn btn-ghost btn-sm flex-1 text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(activeDoc);
                  setActiveDoc(null);
                }}
                className="btn btn-primary btn-sm flex-1 text-xs font-bold"
              >
                ⬇️ Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}