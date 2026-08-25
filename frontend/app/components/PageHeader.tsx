import React from "react";

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border-2 border-blue-500/40 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0F172A] p-6 sm:p-7 text-white shadow-[0_10px_35px_rgba(37,99,235,0.2)] group">
      {/* Real Construction Background Image */}
      <img
        src="/images/project-commercial.png"
        alt="Header Background"
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Animated Laser Blueprint Grid & Shimmer Sheen */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-cyan-500/30 opacity-70 animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {kicker && (
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <span className="rounded-md bg-blue-500/30 px-2.5 py-0.5 text-[0.68rem] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                {kicker}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-xs text-cyan-100 font-semibold max-w-2xl drop-shadow-sm">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 relative z-10">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
