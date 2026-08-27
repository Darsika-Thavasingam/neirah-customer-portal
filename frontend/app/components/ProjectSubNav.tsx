"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    { label: "Overview", href: `/projects/${project.id}` },
    { label: "Progress", href: `/projects/${project.id}/progress` },
    { label: "Milestones", href: `/projects/${project.id}/milestones` },
    { label: "Updates", href: `/projects/${project.id}/updates` },
    { label: "Documents", href: `/projects/${project.id}/documents` },
    { label: "Photos", href: `/projects/${project.id}/photos` },
    { label: "Quotations", href: `/projects/${project.id}/quotations` },
    { label: "Contracts", href: `/projects/${project.id}/contracts` },
    { label: "Payments", href: `/projects/${project.id}/payments` },
    { label: "Invoices", href: `/projects/${project.id}/invoices` },
  ];

  return (
    <div className="mb-6 overflow-x-auto rounded-b-2xl bg-[#0B1220] border-t border-white/10 shadow-lg px-2 pt-1 pb-2">
      <nav className="flex items-center min-w-max">
        {/* Back link — inline as first item */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl whitespace-nowrap transition-all"
        >
          ← Projects
        </Link>

        {/* Vertical divider */}
        <span className="w-px h-4 bg-white/20 mx-1 flex-shrink-0" />

        {/* Tab links */}
        {tabs.map((t) => {
          const isActive = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`inline-block py-2 px-3 text-xs font-semibold transition-all rounded-xl whitespace-nowrap ${
                isActive
                  ? "bg-[#2563EB] text-white font-bold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
