"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import StatusBadge from "./StatusBadge";

type ProjectSubNavProps = {
  project: {
    id: string;
    projectCode: string;
    name: string;
    location?: string | null;
    status: string;
    progress: number;
    currentPhase?: string | null;
  };
};

export default function ProjectSubNav({ project }: ProjectSubNavProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: `/projects/${project.id}`, icon: "📊" },
    { label: "Progress", href: `/projects/${project.id}/progress`, icon: "📈" },
    { label: "Milestones", href: `/projects/${project.id}/milestones`, icon: "🎯" },
    { label: "Quotations", href: `/projects/${project.id}/quotations`, icon: "📋" },
    { label: "Contracts", href: `/projects/${project.id}/contracts`, icon: "📜" },
    { label: "Documents", href: `/projects/${project.id}/documents`, icon: "📁" },
    { label: "Invoices", href: `/projects/${project.id}/invoices`, icon: "💳" },
    { label: "Payments", href: `/projects/${project.id}/payments`, icon: "💰" },
    { label: "Updates", href: `/projects/${project.id}/updates`, icon: "📣" },
    { label: "Photos", href: `/projects/${project.id}/photos`, icon: "🖼️" },
  ];

  return (
    <div className="mb-8 rounded-3xl border-2 border-blue-500/40 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0F172A] p-6 sm:p-7 text-white shadow-[0_10px_35px_rgba(37,99,235,0.2)] relative overflow-hidden group">
      {/* Real High-Definition Interactive Construction Background */}
      <img
        src="/images/project-commercial.png"
        alt={project.name}
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Animated Laser Blueprint Grid & Shimmer Sheen */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-cyan-500/30 opacity-70 animate-pulse pointer-events-none" />

      {/* Top Header Information Row */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="rounded-lg bg-blue-500/30 px-3 py-1 text-[0.7rem] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-md">
              {project.projectCode}
            </span>
            <StatusBadge status={project.status} />
            <span className="rounded-lg bg-white/10 px-3 py-1 text-[0.7rem] font-bold text-slate-200 backdrop-blur-md">
              Project Command Center
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg">
            {project.name}
          </h1>

          {project.location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-cyan-200 font-semibold drop-shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {project.location}
            </p>
          )}
        </div>

        {/* Live Progress Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md min-w-[240px] shadow-xl shrink-0">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-200 uppercase tracking-wider text-[0.68rem]">
                {project.currentPhase || "Structural Execution"}
              </span>
              <span className="text-cyan-300 text-sm font-black">{project.progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/40 border border-white/10 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-700"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── HIGH-VISIBILITY INTERACTIVE NAVIGATION BAR ── */}
      <div className="mt-6 pt-5 border-t border-white/15 relative z-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-300 shrink-0 ${isActive
                    ? "bg-gradient-to-r from-[#2563EB] to-cyan-600 text-white shadow-xl shadow-blue-500/40 border-2 border-cyan-300 scale-105"
                    : "bg-white/10 text-white hover:bg-white/25 hover:border-white/30 border border-white/15 backdrop-blur-md hover:scale-102"
                  }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
