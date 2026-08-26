"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";
import { getDemoProjectById } from "../../../lib/demoData";

type ProjectUpdate = {
  id: string;
  title: string;
  update: string;
  postedBy?: string | null;
  createdAt: string;
};

const MOCK_DEMO_UPDATES: ProjectUpdate[] = [
  {
    id: "up-1",
    title: "Concrete Pouring Complete — Upper Level Structural Slab",
    update: "Engineers have successfully completed the 12th-floor slab casting. Inspection signoff obtained from structural consultant. Curing period initiated; next phase commences in 72 hours pending weather clearance.",
    postedBy: "Eng. Damith Perera (Project Lead)",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "up-2",
    title: "Aluminium Façade Delivery & Glazing Rigging Approved",
    update: "Curtain wall glass panels delivered to site. Tower crane rigging scheduled for weekend window to avoid street traffic interference. Safety perimeter established per OSHA site guidelines.",
    postedBy: "Site Supervisor Nimal Silva",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "up-3",
    title: "MEP Rough-In Inspection Passed",
    update: "Mechanical, Electrical, and Plumbing rough-in installations on floors 5–8 have cleared the municipal inspection. Certificates issued and filed with site documentation.",
    postedBy: "MEP Coordinator Priya Jayawardena",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "up-4",
    title: "Foundation Earthworks Phase Signed Off",
    update: "All excavation and foundation earthworks certified by the geotechnical consultant. Compaction test results exceed minimum bearing capacity requirements by 18%.",
    postedBy: "Eng. Kasun Perera (Site Engineer)",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const TAG_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  structural: { label: "Structural", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  mep: { label: "MEP", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  logistics: { label: "Logistics", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  inspection: { label: "Inspection", color: "#067647", bg: "#ECFDF5", border: "#A7F3D0" },
  compliance: { label: "Compliance", color: "#B42318", bg: "#FEF3F2", border: "#FECACA" },
  civil: { label: "Civil", color: "#475467", bg: "#F8FAFC", border: "#E9EDF4" },
};

function getTag(title: string) {
  const t = title.toLowerCase();
  if (t.includes("concrete") || t.includes("slab") || t.includes("foundation") || t.includes("earthwork")) return TAG_MAP.structural;
  if (t.includes("mep") || t.includes("electrical") || t.includes("plumbing")) return TAG_MAP.mep;
  if (t.includes("delivery") || t.includes("crane") || t.includes("rigging")) return TAG_MAP.logistics;
  if (t.includes("inspection") || t.includes("signoff") || t.includes("signed")) return TAG_MAP.inspection;
  if (t.includes("permit") || t.includes("approval")) return TAG_MAP.compliance;
  return TAG_MAP.civil;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(v: string) {
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(v: string) {
  const d = Math.floor((Date.now() - new Date(v).getTime()) / 86400000);
  const h = Math.floor((Date.now() - new Date(v).getTime()) / 3600000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

export default function ProjectUpdatesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const uid = getActiveUserId();
        const h: Record<string, string> = uid ? { "x-user-id": uid } : {};
        const pR = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers: h, cache: "no-store" }).catch(() => null);
        if (pR) {
          if (!pR.ok) {
            setError("Access Denied: You do not have permission to view this project's updates.");
            setProject(null);
            setLoading(false);
            return;
          }
          const p = await pR.json();
          const uR = await fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/updates`, { headers: h, cache: "no-store" }).catch(() => null);
          const u = uR && uR.ok ? await uR.json() : [];
          setProject(p);
          setUpdates(Array.isArray(u) && u.length > 0 ? u : MOCK_DEMO_UPDATES);
        } else {
          setProject(getDemoProjectById(projectId));
          setUpdates(MOCK_DEMO_UPDATES);
        }
      } catch {
        setError("Access Denied: Unable to fetch project updates.");
      } finally { setLoading(false); }
    };
    fetch_();
  }, [projectId]);

  if (loading) return <div className="page-shell"><PageLoading message="Loading site updates…" /></div>;
  if (error || !project) return (
    <div className="page-shell">
      <ErrorState title="Unable to load updates" message={error} backHref={`/projects/${projectId}`} backLabel="Back to Project" />
    </div>
  );

  return (
    <div className="page-shell animate-fade-in-up">
      <PageHeader
        kicker={`PROJECT ${project?.projectCode || ""} · SITE UPDATES`}
        title="Site Logs & Progress Announcements"
        subtitle={`Chronological engineering updates for ${project?.name || "this project"}.`}
        bgImage="/images/project-highrise.png"
        actions={
          <span className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-xs font-black text-white">
            {updates.length} Updates
          </span>
        }
      />
      {project && <ProjectSubNav project={project} />}

      <div className="space-y-0">
        {updates.map((item, idx) => {
          const tag = getTag(item.title);
          const isFirst = idx === 0;
          return (
            <div key={item.id} className="relative flex gap-5">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md flex-shrink-0 z-10 ${isFirst ? "bg-[#2563EB]" : "bg-slate-400"}`}>
                  {idx + 1}
                </div>
                {idx < updates.length - 1 && <div className="w-0.5 flex-1 my-1 bg-slate-200 min-h-[24px]" />}
              </div>

              <div className={`flex-1 mb-5 rounded-2xl border p-5 transition-all hover:shadow-md ${isFirst ? "bg-blue-50/40 border-blue-100" : "bg-white border-[rgba(15,23,42,0.08)]"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.6rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border" style={{ color: tag.color, background: tag.bg, borderColor: tag.border }}>
                      {tag.label}
                    </span>
                    {isFirst && (
                      <span className="flex items-center gap-1 text-[0.6rem] font-black text-[#2563EB] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />Latest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[0.7rem] text-[#98A2B3] shrink-0">
                    <span>{formatDate(item.createdAt)}</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{timeAgo(item.createdAt)}</span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-[#0B1220] mb-2 leading-snug">{item.title}</h3>
                <p className="text-xs leading-relaxed text-[#475467]">{item.update}</p>

                {item.postedBy && (
                  <div className="mt-4 pt-3 border-t border-[rgba(15,23,42,0.06)] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[0.6rem] font-black text-slate-600">
                      {item.postedBy.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[0.7rem] text-[#667085]">
                      Posted by <span className="font-bold text-[#344054]">{item.postedBy}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
