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
    <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <nav className="flex items-center min-w-max">
        {/* Back link — inline as first item with right divider */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold text-[#667085] hover:text-[#2563EB] hover:bg-[#F0F6FF] rounded-xl my-1.5 ml-1 whitespace-nowrap transition-all"
        >
          ← Projects
        </Link>

        {/* Vertical divider */}
        <span className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />

        {/* Tab links */}
        {tabs.map((t) => {
          const isActive = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`inline-block py-3.5 px-4 text-xs font-bold transition-all rounded-xl my-1.5 whitespace-nowrap ${
                isActive
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "text-[#667085] hover:text-[#0B1220] hover:bg-[#F8FAFC]"
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
