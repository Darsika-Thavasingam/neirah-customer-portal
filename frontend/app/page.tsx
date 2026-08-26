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

function ProgressRing({ p, size = 52 }: { p: number; size?: number }) {
  const sw = 5, r = (size - sw) / 2, c = 2 * Math.PI * r;
  const color = p >= 80 ? "#067647" : "#2563EB";
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="#E9EDF4" strokeWidth={sw} fill="transparent" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="transparent"
          strokeDasharray={c} strokeDashoffset={c - (p/100)*c} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[0.62rem] font-black text-[#0B1220]">{p}%</span>
    </div>
  );
}

function StatusDonut({ projects }: { projects: any[] }) {
  const total = projects.length;
  if (!total) return null;
  const active = projects.filter(p => ["IN_PROGRESS","ACTIVE","ON_HOLD","HANDOVER"].includes(p.status.toUpperCase())).length;
  const done = projects.filter(p => p.status.toUpperCase() === "COMPLETED").length;
  const other = total - active - done;
  const segs = [{ n: active, color: "#2563EB", label: "Active" }, { n: done, color: "#067647", label: "Completed" }, { n: other, color: "#94A3B8", label: "Other" }].filter(s => s.n > 0);
  const size = 96, sw = 16, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
          {segs.map((s, i) => { const dash = (s.n / total) * circ; const seg = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={sw} strokeDasharray={`${Math.max(dash-1,0)} ${circ}`} strokeDashoffset={-off} />; off += dash; return seg; })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black text-[#0B1220]">{total}</span>
          <span className="text-[0.5rem] font-bold text-[#667085]">Projects</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {segs.map(s => <div key={s.label} className="flex items-center gap-2 text-[0.7rem]"><div className="w-2 h-2 rounded-sm" style={{ background: s.color }} /><span className="text-[#475467]">{s.label}</span><span className="font-black text-[#0B1220] ml-1">{s.n}</span></div>)}
      </div>
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
          setDash(await res.json());
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
      if (statusFilter === "ACTIVE" && !["IN_PROGRESS","ACTIVE","ON_HOLD","HANDOVER"].includes(s)) return false;
      if (statusFilter === "COMPLETED" && s !== "COMPLETED") return false;
    }
    return true;
  }), [projects, search, statusFilter]);

  if (loading) return <div className="page-shell"><PageLoading message="Loading your dashboard…" /></div>;
  if (error) return <div className="page-shell"><ErrorState title="Dashboard Unavailable" message={error} /></div>;

  return (
    <div className="page-shell animate-fade-in-up">
      {/* Welcome Hero Banner */}
      <GlobalHeader
        kicker="NEIRAH CUSTOMER PORTAL"
        title={`Welcome, ${dash?.customer?.contactName || "Darsika Thavasingam"}`}
        subtitle={`${dash?.customer?.companyName || "Apex Construction Services"} · Last login: Portal session active`}
        unreadNotifications={summary.unreadNotifications}
      />

      {/* Top Stat Metrics Bar — Borderless Horizontal Stats Bar */}
      <div className="border-y border-slate-200 py-4 mb-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 divide-x divide-slate-100 sm:divide-slate-200">
        {[
          { label: "Total Projects", value: summary.totalProjects ?? projects.length, color: "#0B1220" },
          { label: "Active Sites", value: summary.activeProjects ?? 0, color: "#2563EB" },
          { label: "Avg. Progress", value: `${summary.avgProgress ?? 0}%`, color: "#067647" },
          { label: "Completed", value: summary.completedProjects ?? 0, color: "#7C3AED" },
          { label: "Pending Quotes", value: summary.pendingQuotations ?? pendingQuotations.length, color: "#B45309" },
          { label: "Unpaid Invoices", value: summary.outstandingInvoices ?? outstandingInvoices.length, color: "#B42318" },
          { label: "Total Outstanding", value: curr(summary.totalOutstanding ?? 0), color: "#B42318" },
          { label: "Notifications", value: summary.unreadNotifications ?? 0, color: "#667085" },
        ].map((k, idx) => (
          <div key={k.label} className={`flex flex-col justify-center ${idx !== 0 ? "pl-3" : ""}`}>
            <p className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[0.65rem] font-bold text-[#667085] uppercase tracking-wider mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row — Borderless Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 border-b border-slate-200 pb-8">
        <div className="py-2">
          <p className="text-[0.65rem] font-black uppercase tracking-wider text-[#667085] mb-4">Project Status Distribution</p>
          <StatusDonut projects={projects} />
        </div>
        <div className="py-2">
          <p className="text-[0.65rem] font-black uppercase tracking-wider text-[#667085] mb-4">Financial Overview</p>
          <div className="space-y-4">
            {[
              { label: "Total Billed", val: curr(summary.totalOutstanding ?? 0), color: "#0B1220", pct: 100 },
              { label: "Paid", val: curr(totalPaid.paid), color: "#067647", pct: totalPaid.all > 0 ? (totalPaid.paid / totalPaid.all) * 100 : 0 },
              { label: "Outstanding", val: curr(summary.totalOutstanding ?? 0), color: "#B42318", pct: totalPaid.all > 0 ? (totalPaid.out / totalPaid.all) * 100 : 0 },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold" style={{ color: r.color }}>{r.label}</span>
                  <span className="font-black text-[#0B1220]">{r.val}</span>
                </div>
                <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">

        {/* LEFT — My Projects Row List */}
        <div>
          <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
            <h2 className="section-heading">My Projects</h2>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)}
                className="form-input text-xs py-2 w-44" />
              <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1">
                {(["ALL","ACTIVE","COMPLETED"] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[0.68rem] font-bold transition-all ${statusFilter === s ? "bg-[#2563EB] text-white" : "text-[#667085] hover:text-[#0B1220]"}`}>
                    {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Done"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredProjects.length === 0 && (
              <div className="py-10 text-center text-sm text-[#667085]">No projects found.</div>
            )}
            {filteredProjects.map((p, i) => {
              const imgs = ["/images/project-commercial.png", "/images/project-residential.png", "/images/project-industrial.png"];
              const img = imgs[i % imgs.length];
              const latestUpdate = p.updates?.[0];
              return (
                <div key={p.id} className="py-5 transition-colors hover:bg-slate-50/50">
                  <div className="flex items-start gap-5">
                    <img src={img} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      {/* Name, Code, Status */}
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <StatusBadge status={p.status} />
                        <span className="text-[0.68rem] font-bold text-[#98A2B3]">{p.projectCode}</span>
                      </div>
                      <Link href={`/projects/${p.id}`} className="text-base font-extrabold text-[#0B1220] hover:text-[#2563EB] transition-colors block truncate">{p.name}</Link>

                      {/* Location & Phase */}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#667085]">
                        {p.location && <span>📍 {p.location}</span>}
                        {p.currentPhase && <span>🏗 {p.currentPhase}</span>}
                        {p.projectManagerName && <span>👤 {p.projectManagerName}</span>}
                      </div>

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 mt-2 text-[0.68rem] text-[#98A2B3]">
                        <span>Start: <strong className="text-[#475467]">{fmt(p.startDate)}</strong></span>
                        <span>Est. Completion: <strong className="text-[#475467]">{fmt(p.expectedCompletionDate)}</strong></span>
                      </div>

                      {/* Recent update */}
                      {latestUpdate && (
                        <p className="mt-2 text-[0.68rem] text-[#667085] truncate bg-[#F8FAFC] px-3 py-1.5 rounded-lg inline-block">
                          💬 <strong>{latestUpdate.title}</strong> · {timeAgo(latestUpdate.createdAt)}
                        </p>
                      )}
                    </div>

                    {/* Progress ring */}
                    <div className="shrink-0 flex flex-col items-center gap-1.5">
                      <ProgressRing p={p.progress} />
                      <span className="text-[0.6rem] font-bold text-[#98A2B3] uppercase tracking-wider">Progress</span>
                    </div>
                  </div>

                  {/* Soft Quick Nav Container */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {[["Progress", "progress"],["Milestones","milestones"],["Updates","updates"],["Documents","documents"],["Invoices","invoices"],["Payments","payments"]].map(([label, slug]) => (
                      <Link key={slug} href={`/projects/${p.id}/${slug}`}
                        className="py-1 px-2.5 text-[0.68rem] font-bold text-[#667085] hover:text-[#2563EB] hover:bg-slate-100 rounded-md transition-all whitespace-nowrap">
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT sidebar — Borderless Row Lists */}
        <div className="space-y-6 divide-y divide-slate-200">

          {/* Pending Quotations */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#0B1220]">Pending Quotations</h3>
              <Link href="/quotations" className="text-[0.68rem] font-bold text-[#2563EB] hover:underline">View all →</Link>
            </div>
            {pendingQuotations.length === 0 ? (
              <p className="text-xs text-[#98A2B3] py-2">No pending quotations</p>
            ) : pendingQuotations.map(q => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-xs font-bold text-[#0B1220]">{q.quotationNumber}</p>
                  <p className="text-[0.65rem] text-[#667085]">{q.project?.name || "—"}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={q.status} />
                  <p className="text-[0.68rem] font-bold text-[#0B1220] mt-0.5">
                    LKR {Number(q.total || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Outstanding Invoices */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#0B1220]">Outstanding Invoices</h3>
              <Link href="/payments/outstanding" className="text-[0.68rem] font-bold text-[#2563EB] hover:underline">View all →</Link>
            </div>
            {outstandingInvoices.length === 0 ? (
              <p className="text-xs text-[#98A2B3] py-2">✅ No outstanding balances</p>
            ) : outstandingInvoices.map((inv: any) => (
              <div key={inv.id} className={`flex items-center justify-between py-2 border-b border-slate-100 last:border-0 ${inv.isOverdue ? "bg-[#FEF2F2] px-2 rounded-md" : ""}`}>
                <div>
                  <p className="text-xs font-bold text-[#0B1220]">{inv.invoiceNumber}</p>
                  <p className="text-[0.65rem] text-[#667085]">Due: {fmt(inv.dueDate)}</p>
                  {inv.isOverdue && <span className="text-[0.6rem] font-black text-[#B42318]">OVERDUE</span>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#B42318]">
                    {curr(inv.outstandingAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Payments */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#0B1220]">Recent Payments</h3>
              <Link href="/payments" className="text-[0.68rem] font-bold text-[#2563EB] hover:underline">View all →</Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-xs text-[#98A2B3] py-2">No payments recorded</p>
            ) : recentPayments.map((pay: any) => (
              <div key={pay.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-xs font-bold text-[#0B1220]">{pay.paymentReference}</p>
                  <p className="text-[0.65rem] text-[#667085]">{pay.paymentMethod} · {fmt(pay.paymentDate)}</p>
                </div>
                <p className="text-xs font-black text-[#067647]">{curr(Number(pay.amount))}</p>
              </div>
            ))}
          </div>

          {/* Latest Documents */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#0B1220]">Latest Documents</h3>
            </div>
            {latestDocuments.length === 0 ? (
              <p className="text-xs text-[#98A2B3] py-2">No documents uploaded</p>
            ) : latestDocuments.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B1220] truncate">{doc.fileName}</p>
                  <p className="text-[0.65rem] text-[#667085]">{doc.category} · {fmt(doc.uploadedAt)}</p>
                </div>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                    className="ml-2 text-[0.65rem] font-bold text-[#2563EB] hover:underline shrink-0">Download ↓</a>
                )}
              </div>
            ))}
          </div>

          {/* Recent Notifications */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#0B1220]">Notifications</h3>
              <Link href="/notifications" className="text-[0.68rem] font-bold text-[#2563EB] hover:underline">View all →</Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-[#98A2B3] py-2">No notifications</p>
            ) : notifications.slice(0, 4).map((n: any) => (
              <div key={n.id} className={`flex gap-3 py-2 border-b border-slate-100 last:border-0 ${!n.isRead ? "bg-[#EFF6FF] px-2 rounded-md" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0B1220] truncate">{n.title}</p>
                  <p className="text-[0.65rem] text-[#667085] truncate">{n.message}</p>
                  <p className="text-[0.6rem] text-[#98A2B3] mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}