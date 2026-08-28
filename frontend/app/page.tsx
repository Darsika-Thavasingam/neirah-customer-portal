"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import StatusBadge from "./components/StatusBadge";
import { PageLoading } from "./components/SkeletonLoader";
import { ErrorState } from "./components/EmptyState";
import GlobalHeader from "./components/GlobalHeader";
import { getActiveUserId } from "./lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function fmt(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function curr(n: number) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function timeAgo(v: string) {
  const d = Math.floor((Date.now() - new Date(v).getTime()) / 86400000);
  if (d === 0) return "Today"; if (d === 1) return "Yesterday"; return `${d}d ago`;
}

function StatusDonut({ projects }: { projects: any[] }) {
  const total = projects.length;
  if (!total) return null;
  const active = projects.filter(p => ["IN_PROGRESS", "ACTIVE", "ON_HOLD", "HANDOVER"].includes(p.status.toUpperCase())).length;
  const done = projects.filter(p => p.status.toUpperCase() === "COMPLETED").length;
  const other = total - active - done;
  const segs = [{ n: active, color: "#2563EB", label: "Active" }, { n: done, color: "#067647", label: "Completed" }, { n: other, color: "#667085", label: "Other" }].filter(s => s.n > 0);
  const size = 160, sw = 22, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#CBD5E1" strokeWidth={sw} />
          {segs.map((s, i) => {
            const dash = (s.n / total) * circ;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={sw}
                strokeDasharray={`${Math.max(dash - 2, 0)} ${circ}`}
                strokeDashoffset={-off}
                strokeLinecap="round"
              />
            );
            off += dash;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-[#0B1220] tracking-tight">{total}</span>
          <span className="text-xs font-bold text-[#667085] uppercase tracking-widest mt-0.5">Projects</span>
        </div>
      </div>
      <div className="space-y-2 min-w-[140px]">
        {segs.map(s => (
          <div key={s.label} className="flex items-center justify-between gap-3 text-xs py-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-2xs" style={{ background: s.color }} />
              <span className="font-semibold text-[#0B1220]">{s.label}</span>
            </div>
            <span className="font-extrabold text-sm" style={{ color: s.color }}>{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressRing({ p }: { p: number }) {
  const size = 48, stroke = 5, r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c - (p / 100) * c;
  const color = p >= 100 ? "#067647" : p >= 50 ? "#2563EB" : "#D97706";
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E2E8F0" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute text-[0.65rem] font-black text-[#0B1220]">{p}%</span>
    </div>
  );
}

function FinancialBarChart() {
  const bars = [
    { label: "Billed", amount: "LKR 1.9M", h: "75%", color: "#2563EB" },
    { label: "Paid", amount: "LKR 4.0M", h: "100%", color: "#067647" },
    { label: "Due", amount: "LKR 1.9M", h: "45%", color: "#B42318" },
  ];
  return (
    <div className="flex items-end justify-between gap-4 h-32 pt-3 px-2 border-t border-blue-200/60 mt-4">
      {bars.map((b) => (
        <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
          <span className="text-[0.65rem] font-bold text-[#0B1220]">{b.amount}</span>
          <div className="w-full max-w-[42px] bg-blue-100/60 rounded-t-lg overflow-hidden flex items-end h-full p-0.5">
            <div
              className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-110"
              style={{ height: b.h, backgroundColor: b.color }}
            />
          </div>
          <span className="text-[0.68rem] font-semibold text-[#667085]">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchKey, setFetchKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const cb = () => { setLoading(true); setError(""); setFetchKey(k => k + 1); };
    window.addEventListener("storage", cb);
    window.addEventListener("neirah:userswitch", cb);
    return () => { window.removeEventListener("storage", cb); window.removeEventListener("neirah:userswitch", cb); };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const uid = getActiveUserId();
        const headers: Record<string, string> = uid ? { "x-user-id": uid } : {};
        const res = await fetch(`${API}/api/v1/customer-portal/dashboard`, { headers, cache: "no-store" }).catch(() => null);
        if (!mounted) return;
        if (res && res.ok) {
          const json = await res.json();
          const dashData = json?.data ?? json;
          setDash(dashData);
        } else if (res && res.status === 401) {
          window.location.href = "/login";
        } else {
          const body = await res?.json().catch(() => null);
          setError(body?.message || "Unable to load dashboard data. Please check connection to backend.");
        }
      } catch {
        if (mounted) setError("Network error connecting to backend.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [fetchKey]);

  const projects: any[] = dash?.projects ?? [];
  const summary = dash?.summary ?? {};
  const pendingQuotations: any[] = dash?.pendingQuotations ?? [];
  const outstandingInvoices: any[] = dash?.outstandingInvoices ?? [];
  const recentPayments: any[] = dash?.recentPayments ?? [];
  const latestDocuments: any[] = dash?.latestDocuments ?? [];
  const notifications: any[] = dash?.notifications ?? [];

  const totalPaid = useMemo(() => {
    const inv = dash?.outstandingInvoices ?? [];
    const all = inv.reduce((s: number, i: any) => s + Number(i.total || 0), 0);
    const out = inv.reduce((s: number, i: any) => s + Number(i.outstandingAmount || 0), 0);
    return { all, out, paid: Math.max(all - out, 0) };
  }, [dash]);

  const filteredProjects = useMemo(() => projects.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.projectCode.toLowerCase().includes(q) && !(p.location || "").toLowerCase().includes(q)) return false;
    if (statusFilter !== "ALL") {
      const s = p.status.toUpperCase();
      if (statusFilter === "ACTIVE" && !["IN_PROGRESS", "ACTIVE", "ON_HOLD", "HANDOVER"].includes(s)) return false;
      if (statusFilter === "COMPLETED" && s !== "COMPLETED") return false;
    }
    return true;
  }), [projects, search, statusFilter]);

  if (loading) return <div className="page-shell"><PageLoading message="Loading your dashboard…" /></div>;
  if (error) return <div className="page-shell"><ErrorState title="Dashboard Unavailable" message={error} /></div>;

  return (
    <div className="page-shell animate-fade-in-up">
      {/* Single Welcome Hero Banner */}
      <GlobalHeader
        kicker="NEIRAH CUSTOMER PORTAL"
        title={`Welcome, ${dash?.customer?.contactName || "Darsika Thavasingam"}`}
        subtitle={`${dash?.customer?.companyName || "Apex Construction Services"} · Last login: Portal session active`}
        unreadNotifications={summary.unreadNotifications}
        className="mb-6"
      />

      {/* Borderless Metric Strip with High Visibility Dividers */}
      <div className="my-6 border-y-2 border-slate-300 py-4 grid grid-cols-2 lg:grid-cols-4 gap-y-5">
        {[
          { label: "Total Projects", value: summary.totalProjects ?? projects.length, color: "#0B1220" },
          { label: "Active Sites", value: summary.activeProjects ?? 0, color: "#2563EB" },
          { label: "Avg. Progress", value: `${summary.avgProgress ?? 0}%`, color: "#067647" },
          { label: "Completed", value: summary.completedProjects ?? 0, color: "#7C3AED" },
          { label: "Pending Quotes", value: summary.pendingQuotations ?? pendingQuotations.length, color: "#3B82F6" },
          { label: "Unpaid Invoices", value: summary.outstandingInvoices ?? outstandingInvoices.length, color: "#D97706" },
          { label: "Total Outstanding", value: curr(summary.totalOutstanding ?? 0), color: "#2563EB" },
          { label: "Notifications", value: summary.unreadNotifications ?? 0, color: "#667085" },
        ].map((k, idx) => {
          const isMobileCol1 = idx % 2 === 0;
          const isDesktopCol1 = idx % 4 === 0;
          const isDesktopLastCol = idx % 4 === 3;

          const itemClasses = [
            "flex flex-col justify-center min-w-0",
            isMobileCol1 ? "pl-0 pr-3 sm:pr-4 border-r-2 border-slate-300" : "pl-3 sm:pl-4 pr-0 border-r-0",
            isDesktopCol1
              ? "lg:pl-0 lg:pr-4 lg:border-r-2 lg:border-slate-300"
              : isDesktopLastCol
              ? "lg:pl-4 lg:pr-0 lg:border-r-0"
              : "lg:pl-4 lg:pr-4 lg:border-r-2 lg:border-slate-300",
            idx >= 4 ? "pt-3 sm:pt-0" : "",
          ].join(" ");

          return (
            <div key={k.label} className={itemClasses}>
              <span className="text-[0.65rem] font-bold text-[#667085] uppercase tracking-wider block truncate">{k.label}</span>
              <span className="text-lg sm:text-xl font-black tracking-tight mt-1 block truncate" style={{ color: k.color }} title={String(k.value)}>
                {k.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Single Light-Theme Soft Blue Analytics Panel */}
      <div className="mb-8 bg-[#EAF2FF] border border-blue-200 text-[#0B1220] rounded-2xl p-6 shadow-sm relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x-2 divide-blue-200">

        {/* Project Status Distribution Column */}
        <div className="pr-0 lg:pr-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-[#0B1220] text-base font-semibold">Project Status Distribution</h3>
            <span className="bg-[#2563EB] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {projects.length > 0 ? projects.length : 3} Projects
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4 py-2 border-b border-blue-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span className="text-xs font-semibold text-[#667085]">Active</span>
              <span className="text-sm font-bold text-[#0B1220] ml-1">{summary.activeProjects ?? 2}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              <span className="text-xs font-semibold text-[#667085]">Completed</span>
              <span className="text-sm font-bold text-[#0B1220] ml-1">{summary.completedProjects ?? 1}</span>
            </div>
          </div>

          <StatusDonut projects={projects} />
        </div>

        {/* Financial Overview Column */}
        <div className="lg:pl-8 pt-6 lg:pt-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#0B1220] text-base font-semibold">Financial Overview</h3>
          </div>

          <div className="space-y-3.5">
            {[
              { label: "Total Billed", val: "LKR 1,900,000", color: "#2563EB", pct: 100 },
              { label: "Paid", val: "LKR 4,000,000", color: "#067647", pct: 68 },
              { label: "Outstanding", val: "LKR 1,900,000", color: "#B42318", pct: 32 },
            ].map(r => (
              <div key={r.label} className="py-1">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-[#667085]">{r.label}</span>
                  <span className="font-bold text-sm" style={{ color: r.color }}>{r.val}</span>
                </div>
                <div className="h-2.5 bg-blue-100/70 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>

          <FinancialBarChart />
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">

        {/* LEFT — Borderless My Projects Row List with Hover Effects */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b-2 border-slate-300 pb-3">
            <h2 className="section-heading">My Projects</h2>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)}
                className="form-input text-xs py-2 w-44 rounded-xl border-slate-300" />
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {(["ALL", "ACTIVE", "COMPLETED"] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[0.68rem] font-bold transition-all duration-200 active:scale-95 ${statusFilter === s ? "bg-[#2563EB] text-white shadow-xs" : "text-[#667085] hover:text-[#0B1220]"}`}>
                    {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Done"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredProjects.length === 0 && (
              <div className="py-10 text-center text-sm text-[#667085] rounded-2xl bg-white border border-slate-200">No projects found.</div>
            )}
            {filteredProjects.map((p, i) => {
              const imgs = ["/images/project-commercial.png", "/images/project-residential.png", "/images/project-industrial.png"];
              const img = imgs[i % imgs.length];
              const latestUpdate = p.updates?.[0];
              return (
                <div key={p.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30 group">
                  <div className="flex items-start gap-4">
                    <img src={img} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300" />
                    <div className="flex-1 min-w-0">
                      {/* Name, Code, Status */}
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <StatusBadge status={p.status} />
                        <span className="text-[0.68rem] font-bold text-[#98A2B3]">{p.projectCode}</span>
                      </div>
                      <Link href={`/projects/${p.id}`} className="text-base font-extrabold text-[#0B1220] group-hover:text-[#2563EB] transition-colors block truncate">{p.name}</Link>

                      {/* Location & Phase */}
                      <div className="flex flex-wrap gap-4 mt-1 text-xs text-[#667085]">
                        {p.location && <span>📍 {p.location}</span>}
                        {p.currentPhase && <span>🏗 {p.currentPhase}</span>}
                        {p.projectManagerName && <span>👤 {p.projectManagerName}</span>}
                      </div>

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 mt-1 text-[0.68rem] text-[#667085]">
                        <span>Start: <strong className="text-[#0B1220]">{fmt(p.startDate)}</strong></span>
                        <span>Est. Completion: <strong className="text-[#0B1220]">{fmt(p.expectedCompletionDate)}</strong></span>
                      </div>

                      {/* Recent update */}
                      {latestUpdate && (
                        <p className="mt-1.5 text-[0.68rem] text-[#667085] truncate bg-[#F8FAFC] px-2.5 py-0.5 rounded-lg inline-block border border-slate-200">
                          💬 <strong>{latestUpdate.title}</strong> · {timeAgo(latestUpdate.createdAt)}
                        </p>
                      )}
                    </div>

                    {/* Progress ring */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <ProgressRing p={p.progress} />
                      <span className="text-[0.6rem] font-bold text-[#667085] uppercase tracking-wider">Progress</span>
                    </div>
                  </div>

                  {/* Soft Quick Nav Container */}
                  <div className="mt-3 flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                    {[["Progress", "progress"], ["Milestones", "milestones"], ["Updates", "updates"], ["Documents", "documents"], ["Invoices", "invoices"], ["Payments", "payments"]].map(([label, slug]) => (
                      <Link key={slug} href={`/projects/${p.id}/${slug}`}
                        className="py-1 px-2.5 text-[0.68rem] font-semibold text-[#667085] hover:text-[#2563EB] hover:bg-[#EAF2FF] active:scale-95 rounded-md transition-all whitespace-nowrap">
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT sidebar — Single Unified Container resting directly on App Background (#F7F9FC) */}
        <div className="divide-y divide-[#E2E8F0]">

          {/* 1. Pending Quotations Section */}
          <div className="pb-5">
            <div className="flex items-center justify-between py-3">
              <h3 className="text-base font-semibold text-[#0B1220]">Pending Quotations</h3>
              <Link href="/quotations" className="text-xs font-semibold text-[#2563EB] hover:text-[#3B82F6] transition-colors">
                View all →
              </Link>
            </div>
            {pendingQuotations.length === 0 ? (
              <p className="text-xs text-[#667085] py-2">No pending quotations</p>
            ) : (
              <div className="divide-y divide-slate-200/60">
                {pendingQuotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between py-2.5 group hover:bg-blue-50/40 px-1 rounded-lg transition-colors">
                    <div>
                      <p className="text-xs font-bold text-[#0B1220] group-hover:text-[#2563EB] transition-colors">{q.quotationNumber}</p>
                      <p className="text-xs text-[#667085] mt-0.5">{q.project?.name || "—"}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={q.status} />
                      <p className="text-xs font-bold text-[#0B1220] mt-1">
                        LKR {Number(q.total || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Outstanding Invoices Section */}
          <div className="py-5">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-semibold text-[#0B1220]">Outstanding Invoices</h3>
              <Link href="/payments/outstanding" className="text-xs font-semibold text-[#2563EB] hover:text-[#3B82F6] transition-colors">
                View all →
              </Link>
            </div>
            {outstandingInvoices.length === 0 ? (
              <p className="text-xs text-[#667085] py-2">✅ No outstanding balances</p>
            ) : (
              <div className="divide-y divide-slate-200/60">
                {outstandingInvoices.map((inv: any) => (
                  <div key={inv.id} className={`flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors ${inv.isOverdue ? "bg-[#FEF2F2]" : "hover:bg-blue-50/40"}`}>
                    <div>
                      <p className="text-xs font-bold text-[#0B1220]">{inv.invoiceNumber}</p>
                      <p className="text-xs text-[#667085] mt-0.5">Due: {fmt(inv.dueDate)}</p>
                      {inv.isOverdue && <span className="text-[0.65rem] font-bold text-[#B42318] uppercase tracking-wider block mt-0.5">OVERDUE</span>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#2563EB]">
                        {curr(inv.outstandingAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Recent Payments Section */}
          <div className="py-5">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-semibold text-[#0B1220]">Recent Payments</h3>
              <Link href="/payments" className="text-xs font-semibold text-[#2563EB] hover:text-[#3B82F6] transition-colors">
                View all →
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-xs text-[#667085] py-2">No payments recorded</p>
            ) : (
              <div className="divide-y divide-slate-200/60">
                {recentPayments.map((pay: any) => (
                  <div key={pay.id} className="flex items-center justify-between py-2.5 group hover:bg-blue-50/40 px-1 rounded-lg transition-colors">
                    <div>
                      <p className="text-xs font-bold text-[#0B1220] group-hover:text-[#2563EB] transition-colors">{pay.paymentReference}</p>
                      <p className="text-xs text-[#667085] mt-0.5">{pay.paymentMethod} · {fmt(pay.paymentDate)}</p>
                    </div>
                    <p className="text-xs font-bold text-[#059669]">{curr(Number(pay.amount))}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Latest Documents Section */}
          <div className="py-5">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-semibold text-[#0B1220]">Latest Documents</h3>
            </div>
            {latestDocuments.length === 0 ? (
              <p className="text-xs text-[#667085] py-2">No documents uploaded</p>
            ) : (
              <div className="divide-y divide-slate-200/60">
                {latestDocuments.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between py-2.5 group hover:bg-blue-50/40 px-1 rounded-lg transition-colors">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-[#0B1220] truncate group-hover:text-[#2563EB] transition-colors">{doc.fileName}</p>
                      <p className="text-xs text-[#667085] mt-0.5">{doc.category} · {fmt(doc.uploadedAt)}</p>
                    </div>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold text-[#2563EB] hover:text-[#3B82F6] transition-colors shrink-0">
                        Download ↓
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Recent Notifications Section */}
          <div className="py-5">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-semibold text-[#0B1220]">Notifications</h3>
              <Link href="/notifications" className="text-xs font-semibold text-[#2563EB] hover:text-[#3B82F6] transition-colors">
                View all →
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-[#667085] py-2">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 4).map((n: any) => (
                  <div key={n.id} className={`flex gap-3 p-2 rounded-xl transition-colors ${!n.isRead ? "bg-[#EAF2FF] border border-blue-200" : "hover:bg-slate-200/40"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0B1220] truncate">{n.title}</p>
                      <p className="text-xs text-[#667085] truncate mt-0.5">{n.message}</p>
                      <p className="text-[0.7rem] text-[#667085] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0 animate-pulse" />}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}