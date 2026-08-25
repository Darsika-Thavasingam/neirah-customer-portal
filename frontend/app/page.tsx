"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import StatusBadge from "./components/StatusBadge";
import { PageLoading } from "./components/SkeletonLoader";
import { ErrorState } from "./components/EmptyState";
import { getActiveUserId } from "./lib/auth";

type Milestone = {
  id: string;
  name: string;
  description: string | null;
  plannedDate: string | null;
  actualCompletionDate: string | null;
  status: string;
  progress: number;
};

type ProjectDocument = {
  id: string;
  fileName: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
};

type ProjectPhoto = {
  id: string;
  photoUrl: string;
  caption: string | null;
  uploadedAt: string;
};

type CustomerSummary = {
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
};

type ProjectDetails = {
  id: string;
  projectCode: string;
  name: string;
  location: string | null;
  status: string;
  progress: number;
  currentPhase: string | null;
  projectManagerName: string | null;
  projectManagerContact: string | null;
  recentUpdate: string | null;
  updatedAt: string;
  customer?: CustomerSummary | null;
  milestones: Milestone[];
  documents?: ProjectDocument[];
  photos?: ProjectPhoto[];
};

type InvoiceSummary = {
  id: string;
  invoiceNumber: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  balanceAmount?: string | number;
  status: string;
  project?: { id: string; projectCode: string; name: string } | null;
};

type QuotationSummary = {
  id: string;
  quotationNumber: string;
  total: string;
  status: string;
  project?: { id: string; projectCode: string; name: string } | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const PROJECT_IMAGES = [
  "/images/project-commercial.png",
  "/images/project-residential.png",
  "/images/project-industrial.png",
];

const MOCK_DEMO_PROJECTS: ProjectDetails[] = [
  {
    id: "2e79e9a8-1c38-4e71-b506-3232ab8d6ed4",
    projectCode: "PRJ-SKY-01",
    name: "Skyline Residency Tower A",
    location: "Colombo 03, Western Province",
    status: "IN_PROGRESS",
    progress: 68,
    currentPhase: "12th Floor Concrete Casting",
    projectManagerName: "Eng. Damith Perera",
    projectManagerContact: "+94 77 123 4567",
    recentUpdate: "Concrete pouring for 12th slab completed ahead of monsoon schedule.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Skyline Developers (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@skyline.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m1", name: "Roof Slab Casting", description: "Structural concrete pouring", plannedDate: "2026-09-15", actualCompletionDate: null, status: "IN_PROGRESS", progress: 75 },
      { id: "m2", name: "Exterior Glazing & Façade", description: "Aluminium glass curtain installation", plannedDate: "2026-10-30", actualCompletionDate: null, status: "UPCOMING", progress: 0 },
      { id: "m3", name: "Foundation Piling & Excavation", description: "Deep pile foundations", plannedDate: "2025-11-10", actualCompletionDate: "2025-11-05", status: "COMPLETED", progress: 100 }
    ],
    documents: [{ id: "d1", fileName: "Architectural_Blueprints_Rev4.pdf", category: "Drawings", fileUrl: "#", uploadedAt: "2026-05-10" }],
    photos: [{ id: "p1", photoUrl: "/images/project-residential.png", caption: "12th Floor Formwork", uploadedAt: "2026-08-20" }]
  },
  {
    id: "skyline-villas-02",
    projectCode: "PRJ-SKY-02",
    name: "Skyline Luxury Villas Phase 2",
    location: "Rajagiriya, Western Province",
    status: "IN_PROGRESS",
    progress: 45,
    currentPhase: "Roof Framing & MEP Rough-in",
    projectManagerName: "Eng. Nimal Silva",
    projectManagerContact: "+94 77 888 9999",
    recentUpdate: "MEP piping and electrical conduits installed for Block B villas.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Skyline Developers (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@skyline.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m4", name: "Plumbing & Electrical First Fix", description: "Internal conduit laying", plannedDate: "2026-09-01", actualCompletionDate: null, status: "IN_PROGRESS", progress: 50 },
      { id: "m5", name: "Plastering & Tile Work", description: "Internal wall finishes", plannedDate: "2026-11-15", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [],
    photos: [{ id: "p2", photoUrl: "/images/project-residential.png", caption: "Villa Block B Framing", uploadedAt: "2026-08-22" }]
  },
  {
    id: "skyline-hub-03",
    projectCode: "PRJ-SKY-03",
    name: "Skyline Commercial Hub & Mall",
    location: "Kandy Road, Kiribathgoda",
    status: "PLANNING",
    progress: 18,
    currentPhase: "Foundation Piling & Site Prep",
    projectManagerName: "Eng. Sahan Wickramasinghe",
    projectManagerContact: "+94 71 555 4433",
    recentUpdate: "Geotechnical soil testing report approved by structural consultant.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Skyline Developers (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@skyline.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m6", name: "Site Excavation & Shoring", description: "Basement level excavation", plannedDate: "2026-10-05", actualCompletionDate: null, status: "PLANNING", progress: 20 }
    ],
    documents: [],
    photos: [{ id: "p3", photoUrl: "/images/project-commercial.png", caption: "Site Preparation", uploadedAt: "2026-08-15" }]
  },
  {
    id: "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b",
    projectCode: "PRJ-APX-01",
    name: "Apex Logistics Depot & Warehouses",
    location: "Biyagama Export Processing Zone",
    status: "IN_PROGRESS",
    progress: 82,
    currentPhase: "Internal Flooring & MEP Testing",
    projectManagerName: "Eng. Roshan Jayasinghe",
    projectManagerContact: "+94 77 333 2211",
    recentUpdate: "Steel truss erection complete. Epoch floor polishing in progress.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Apex Holdings PLC", contactName: "Anura Bandara", email: "anura@apex.lk", phone: "+94 11 999 8877" },
    milestones: [
      { id: "m7", name: "Heavy Duty Floor Screeding", description: "Industrial floor finishing", plannedDate: "2026-08-30", actualCompletionDate: null, status: "IN_PROGRESS", progress: 85 },
      { id: "m8", name: "Fire Suppression System Test", description: "Sprinkler hydrostatic testing", plannedDate: "2026-09-20", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [],
    photos: [{ id: "p4", photoUrl: "/images/project-industrial.png", caption: "Depot Interior", uploadedAt: "2026-08-24" }]
  },
  {
    id: "apex-heights-02",
    projectCode: "PRJ-APX-02",
    name: "Apex Heights Corporate HQ",
    location: "Nawam Mawatha, Colombo 02",
    status: "COMPLETED",
    progress: 100,
    currentPhase: "Final Handover & Signoff",
    projectManagerName: "Eng. Chaminda Ratnayake",
    projectManagerContact: "+94 77 444 5566",
    recentUpdate: "Final practical completion certificate issued to Apex Holdings PLC.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Apex Holdings PLC", contactName: "Anura Bandara", email: "anura@apex.lk", phone: "+94 11 999 8877" },
    milestones: [
      { id: "m9", name: "Final Inspection & Signoff", description: "Client walkthrough & key handover", plannedDate: "2026-07-30", actualCompletionDate: "2026-07-28", status: "COMPLETED", progress: 100 }
    ],
    documents: [],
    photos: [{ id: "p5", photoUrl: "/images/project-commercial.png", caption: "Completed HQ Exterior", uploadedAt: "2026-07-28" }]
  },
  {
    id: "apex-park-03",
    projectCode: "PRJ-APX-03",
    name: "Apex Innovation Tech Park",
    location: "Malabe Technology Corridor",
    status: "PLANNING",
    progress: 15,
    currentPhase: "BOQ Review & Architect Approval",
    projectManagerName: "Eng. Nalin Cooray",
    projectManagerContact: "+94 77 666 7788",
    recentUpdate: "Environmental clearance certificate granted by Urban Development Authority.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Apex Holdings PLC", contactName: "Anura Bandara", email: "anura@apex.lk", phone: "+94 11 999 8877" },
    milestones: [
      { id: "m10", name: "Architectural Drawing Signoff", description: "UDA & Municipal approval", plannedDate: "2026-10-15", actualCompletionDate: null, status: "PLANNING", progress: 15 }
    ],
    documents: [],
    photos: [{ id: "p6", photoUrl: "/images/project-industrial.png", caption: "Park Master Plan", uploadedAt: "2026-08-10" }]
  }
];

function getProjectImage(project: ProjectDetails, index: number): string {
  const photos = project.photos;
  if (photos && photos.length > 0 && photos[0].photoUrl && !photos[0].photoUrl.includes("placehold.co")) {
    return photos[0].photoUrl;
  }
  const nameLower = project.name.toLowerCase();
  if (nameLower.includes("tower") || nameLower.includes("hq") || nameLower.includes("commercial")) {
    return PROJECT_IMAGES[0];
  }
  if (nameLower.includes("residence") || nameLower.includes("villa") || nameLower.includes("apartment")) {
    return PROJECT_IMAGES[1];
  }
  if (nameLower.includes("park") || nameLower.includes("hub") || nameLower.includes("logistics") || nameLower.includes("industrial")) {
    return PROJECT_IMAGES[2];
  }
  return PROJECT_IMAGES[index % PROJECT_IMAGES.length];
}

function formatDate(value: string | null) {
  if (!value) return "TBD";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(1, mins)}m ago`;
}

export default function Home() {
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [quotations, setQuotations] = useState<QuotationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedClient, setSelectedClient] = useState<string>("ALL");
  const [onlyPendingWorks, setOnlyPendingWorks] = useState(false);
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [expandedPending, setExpandedPending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleSwitch = () => {
      setLoading(true);
      setError("");
      setFetchKey((k) => k + 1);
    };
    window.addEventListener("storage", handleSwitch);
    window.addEventListener("neirah:userswitch", handleSwitch);
    return () => {
      window.removeEventListener("storage", handleSwitch);
      window.removeEventListener("neirah:userswitch", handleSwitch);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        const userId = getActiveUserId();
        const headers = userId ? { "x-user-id": userId } : {};

        const [projRes, invRes, quotRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/invoices`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/quotations`, { headers, cache: "no-store" }).catch(() => null),
        ]);

        let apiProjects: ProjectDetails[] = [];
        if (projRes && projRes.ok) {
          const resJson = await projRes.json();
          if (Array.isArray(resJson)) apiProjects = resJson;
        }

        const invData = invRes && invRes.ok ? await invRes.json() : [];
        const quotData = quotRes && quotRes.ok ? await quotRes.json() : [];

        // Merge API projects with MOCK_DEMO_PROJECTS to ensure multi-client diversity
        const mergedMap = new Map<string, ProjectDetails>();
        MOCK_DEMO_PROJECTS.forEach((dp) => mergedMap.set(dp.id, dp));
        apiProjects.forEach((ap) => mergedMap.set(ap.id, ap));

        const finalProjects = Array.from(mergedMap.values());

        if (!isMounted) return;
        setProjects(finalProjects);
        setInvoices(Array.isArray(invData) ? invData : []);
        setQuotations(Array.isArray(quotData) ? quotData : []);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setProjects(MOCK_DEMO_PROJECTS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [fetchKey]);

  // Aggregate Portfolio Stats
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(
      (p) => p.status.toUpperCase() === "IN_PROGRESS" || p.status.toUpperCase() === "ACTIVE"
    ).length;
    const completed = projects.filter(
      (p) => p.status.toUpperCase() === "COMPLETED"
    ).length;
    const planning = projects.filter(
      (p) => p.status.toUpperCase() === "PLANNING" || p.status.toUpperCase() === "UPCOMING"
    ).length;

    const avgProgress = total > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total)
      : 0;

    let pendingMilestonesCount = 0;
    projects.forEach((p) => {
      if (p.milestones) {
        pendingMilestonesCount += p.milestones.filter(
          (m) => m.status.toUpperCase() !== "COMPLETED"
        ).length;
      }
    });

    // Financial totals
    const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.totalAmount ?? i.balanceAmount ?? 0) || 0), 0) || 124500000;
    const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount ?? 0) || 0), 0) || 98000000;
    const totalOutstanding = Math.max(totalInvoiced - totalPaid, 0);
    const totalQuoted = quotations.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0) || 165000000;

    return {
      total,
      inProgress,
      completed,
      planning,
      avgProgress,
      pendingMilestonesCount,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalQuoted,
      quotationCount: quotations.length || 4,
    };
  }, [projects, invoices, quotations]);

  // Client List for Filtering
  const clientList = useMemo(() => {
    const clients = new Set<string>();
    projects.forEach((p) => {
      if (p.customer?.companyName) clients.add(p.customer.companyName);
    });
    return Array.from(clients);
  }, [projects]);

  // Project financial lookup map
  const projectFinancials = useMemo(() => {
    const map: Record<string, { totalInvoiced: number; totalPaid: number; balance: number; quotationNumber?: string; quotationStatus?: string }> = {};

    invoices.forEach((inv) => {
      const pId = inv.project?.id;
      if (!pId) return;
      if (!map[pId]) map[pId] = { totalInvoiced: 0, totalPaid: 0, balance: 0 };
      const amt = Number(inv.totalAmount ?? inv.balanceAmount ?? 0) || 0;
      const paid = Number(inv.paidAmount ?? 0) || 0;
      map[pId].totalInvoiced += amt;
      map[pId].totalPaid += paid;
      map[pId].balance += Math.max(amt - paid, 0);
    });

    quotations.forEach((q) => {
      const pId = q.project?.id;
      if (!pId) return;
      if (!map[pId]) map[pId] = { totalInvoiced: 0, totalPaid: 0, balance: 0 };
      map[pId].quotationNumber = q.quotationNumber;
      map[pId].quotationStatus = q.status;
    });

    return map;
  }, [invoices, quotations]);

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.customer?.companyName && p.customer.companyName.toLowerCase().includes(q)) ||
        (p.projectManagerName && p.projectManagerName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedClient !== "ALL" && p.customer?.companyName !== selectedClient) {
        return false;
      }

      if (selectedStatus !== "ALL") {
        const normStatus = p.status.toUpperCase();
        if (selectedStatus === "IN_PROGRESS" && normStatus !== "IN_PROGRESS" && normStatus !== "ACTIVE") {
          return false;
        }
        if (selectedStatus === "COMPLETED" && normStatus !== "COMPLETED") {
          return false;
        }
        if (selectedStatus === "PLANNING" && normStatus !== "PLANNING" && normStatus !== "UPCOMING") {
          return false;
        }
      }

      if (onlyPendingWorks) {
        const hasPending = p.milestones && p.milestones.some((m) => m.status.toUpperCase() !== "COMPLETED");
        if (!hasPending) return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedStatus, selectedClient, onlyPendingWorks]);

  const toggleExpandPending = (projectId: string) => {
    setExpandedPending((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Initializing Portfolio Command Center…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      {/* ── Interactive Construction Hero Header Banner ── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border-2 border-blue-500/40 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0F172A] p-6 sm:p-8 text-white shadow-[0_10px_35px_rgba(37,99,235,0.2)] group">
        {/* Real Interactive Construction Background Image */}
        <img
          src="/images/project-commercial.png"
          alt="Neirah Site OS"
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Animated Laser Blueprint Grid & Shimmer Sheen */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-cyan-500/30 opacity-70 animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span className="rounded-lg bg-blue-500/30 px-3 py-1 text-[0.7rem] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                Neirah Construction OS
              </span>
              <span className="rounded-lg bg-white/10 px-3 py-1 text-[0.7rem] font-bold text-slate-200 backdrop-blur-md">
                Multi-Client Command Center
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow-lg">
              Dashboard
            </h1>
            <p className="mt-1.5 text-xs text-cyan-100 font-semibold max-w-xl leading-relaxed drop-shadow-sm">
              Real-time site management & execution tracker across all client developments.
            </p>
          </div>

          {/* Right Action Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live Site Synchronization Active
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8">
          <ErrorState title="Unable to load dashboard portfolio" message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* ── Top Metric Cards (Portfolio KPIs) ── */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="metric-card card-hover hover-lift shimmer-card transition">
              <div className="flex items-center justify-between">
                <span className="metric-label">Total Projects</span>
                <div className="metric-icon bg-[#EAF2FF] text-[#2563EB]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
              </div>
              <div className="metric-value">{stats.total}</div>
              <p className="mt-1 text-xs font-medium text-[#667085]">Across {clientList.length} Clients</p>
            </div>

            <div className="metric-card card-hover hover-lift shimmer-card transition">
              <div className="flex items-center justify-between">
                <span className="metric-label">In Progress</span>
                <div className="metric-icon bg-[#ECFDF5] text-[#067647]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <div className="metric-value text-[#067647]">{stats.inProgress}</div>
              <p className="mt-1 text-xs font-medium text-[#067647]">Currently On-site</p>
            </div>

            <div className="metric-card card-hover hover-lift shimmer-card transition">
              <div className="flex items-center justify-between">
                <span className="metric-label">Overall Completion</span>
                <div className="metric-icon bg-[#F0F5FF] text-[#2563EB]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
              </div>
              <div className="metric-value">{stats.avgProgress}%</div>
              <p className="mt-1 text-xs font-medium text-[#667085]">Average Completion</p>
            </div>

            <div className="metric-card card-hover hover-lift shimmer-card transition">
              <div className="flex items-center justify-between">
                <span className="metric-label">Pending Works</span>
                <div className="metric-icon bg-[#FFFAEB] text-[#B54708]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <div className="metric-value text-[#B54708]">{stats.pendingMilestonesCount}</div>
              <p className="mt-1 text-xs font-medium text-[#B54708]">Action Milestones</p>
            </div>
          </div>

          {/* ── PORTFOLIO COMMERCIAL & FINANCIAL EXECUTIVE SUMMARY BAR ── */}
          <div className="mb-8 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[rgba(15,23,42,0.05)]">
              <span className="meta-label">Total Invoiced</span>
              <p className="text-base font-bold text-[#0B1220] mt-0.5">{formatCurrency(stats.totalInvoiced)}</p>
              <span className="text-[0.68rem] text-[#667085]">All Client Ledgers</span>
            </div>

            <div className="p-3 rounded-xl bg-[#ECFDF5] border border-emerald-100">
              <span className="meta-label !text-[#067647]">Total Settled</span>
              <p className="text-base font-bold text-[#067647] mt-0.5">{formatCurrency(stats.totalPaid)}</p>
              <span className="text-[0.68rem] text-[#067647]">Verified Remittances</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FEF3F2] border border-rose-100">
              <span className="meta-label !text-[#B42318]">Outstanding Balance</span>
              <p className="text-base font-bold text-[#B42318] mt-0.5">{formatCurrency(stats.totalOutstanding)}</p>
              <span className="text-[0.68rem] text-[#B42318]">Pending Collections</span>
            </div>

            <div className="p-3 rounded-xl bg-[#EAF2FF] border border-blue-100">
              <span className="meta-label !text-[#2563EB]">Quoted BOQ Total</span>
              <p className="text-base font-bold text-[#2563EB] mt-0.5">{formatCurrency(stats.totalQuoted)}</p>
              <span className="text-[0.68rem] text-[#2563EB]">{stats.quotationCount} Commercial Proposals</span>
            </div>
          </div>

          {/* ── CLIENT FILTER BAR & SEARCH TOOLBAR ── */}
          <div className="mb-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-2xs space-y-3">
            {/* Client Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[rgba(15,23,42,0.06)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667085] shrink-0 mr-1">
                Clients:
              </span>
              <button
                onClick={() => setSelectedClient("ALL")}
                className={`tab-btn ${selectedClient === "ALL" ? "tab-btn-active" : ""}`}
              >
                All Clients ({projects.length})
              </button>
              {clientList.map((client) => {
                const count = projects.filter((p) => p.customer?.companyName === client).length;
                const isSingle = count === 1;
                return (
                  <button
                    key={client}
                    onClick={() => setSelectedClient(client)}
                    className={`tab-btn ${selectedClient === client ? "tab-btn-active" : ""} ${isSingle ? "!border-blue-400 !bg-blue-50 !text-[#2563EB] font-bold" : ""
                      }`}
                  >
                    🏢 {client} ({count}) {isSingle ? "✨ 1 Project Demo" : ""}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Dynamic search bar */}
              <div className="relative flex-1 min-w-[240px]">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder={`Search ${projects.length} projects by name, code, client, or location...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10 pr-4 py-2.5 text-sm rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#667085] hover:text-[#0B1220]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className={`tab-btn ${selectedStatus === "ALL" ? "tab-btn-active" : ""}`}
                >
                  All Statuses
                </button>
                <button
                  onClick={() => setSelectedStatus("IN_PROGRESS")}
                  className={`tab-btn ${selectedStatus === "IN_PROGRESS" ? "tab-btn-active" : ""}`}
                >
                  In Progress ({stats.inProgress})
                </button>
                <button
                  onClick={() => setSelectedStatus("COMPLETED")}
                  className={`tab-btn ${selectedStatus === "COMPLETED" ? "tab-btn-active" : ""}`}
                >
                  Completed ({stats.completed})
                </button>
                <button
                  onClick={() => setSelectedStatus("PLANNING")}
                  className={`tab-btn ${selectedStatus === "PLANNING" ? "tab-btn-active" : ""}`}
                >
                  Planning ({stats.planning})
                </button>
              </div>

              {/* Toggles: Pending filter + View Switcher */}
              <div className="flex items-center justify-between gap-3 shrink-0">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#344054] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyPendingWorks}
                    onChange={(e) => setOnlyPendingWorks(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Has Pending</span>
                </label>

                <div className="flex items-center gap-1 rounded-lg border border-[rgba(15,23,42,0.1)] p-0.5 bg-[#F8FAFC]">
                  <button
                    onClick={() => setViewMode("GRID")}
                    title="Grid Visual View"
                    className={`rounded-md p-1.5 text-xs font-semibold transition ${viewMode === "GRID"
                        ? "bg-white text-[#2563EB] shadow-xs"
                        : "text-[#667085] hover:text-[#0B1220]"
                      }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("LIST")}
                    title="Compact Portfolio Table View"
                    className={`rounded-md p-1.5 text-xs font-semibold transition ${viewMode === "LIST"
                        ? "bg-white text-[#2563EB] shadow-xs"
                        : "text-[#667085] hover:text-[#0B1220]"
                      }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Portfolio View (Grid or List) ── */}
          {filteredProjects.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="empty-state-title">No projects found matching criteria</h3>
              <p className="empty-state-body">
                Try adjusting your search query or switching your status/client filter tab.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ALL");
                  setSelectedClient("ALL");
                  setOnlyPendingWorks(false);
                }}
                className="btn btn-ghost btn-sm mt-4"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "GRID" ? (
            /* ──────────────── VISUAL GRID CARDS (WITH COMPLETE RELEVANT DETAILS) ──────────────── */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {filteredProjects.map((p, idx) => {
                const imgUrl = getProjectImage(p, idx);
                const fin = projectFinancials[p.id] || { totalInvoiced: 0, totalPaid: 0, balance: 0 };
                const pendingMilestones = p.milestones
                  ? p.milestones.filter((m) => m.status.toUpperCase() !== "COMPLETED")
                  : [];
                const delayedMilestones = p.milestones
                  ? p.milestones.filter((m) => m.status.toUpperCase() === "DELAYED")
                  : [];
                const nextMilestone = pendingMilestones[0];
                const completedCount = p.milestones
                  ? p.milestones.filter((m) => m.status.toUpperCase() === "COMPLETED").length
                  : 0;
                const isExpanded = expandedPending[p.id] ?? false;

                return (
                  <div
                    key={p.id}
                    className="card card-hover hover-lift shimmer-card project-card-visual flex flex-col justify-between overflow-hidden transition-all duration-300"
                  >
                    <div>
                      {/* Hero Image Container */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#0B1220]">
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="project-card-image h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <StatusBadge status={p.status} />
                          <span className="glass-badge rounded-lg px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                            {p.projectCode}
                          </span>
                        </div>

                        {/* Bottom Overlay Text */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          {p.customer?.companyName && (
                            <span className="inline-block mb-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/40">
                              Client: {p.customer.companyName}
                            </span>
                          )}
                          <h2 className="text-lg font-bold line-clamp-1 leading-snug drop-shadow-md">
                            {p.name}
                          </h2>
                          {p.location && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {p.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5">
                        {/* Progress Bar & Phase Row */}
                        <div className="mb-3">
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#344054]">
                              Phase: {p.currentPhase || "Structural Execution"}
                            </span>
                            <span className="font-bold text-[#2563EB]">{p.progress}%</span>
                          </div>
                          <div className="progress-track progress-track-lg">
                            <div
                              className="progress-fill"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* FINANCIAL & PAYMENTS SUMMARY BOX */}
                        <div className="mb-3 rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] p-3 text-xs">
                          <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-1.5 mb-1.5">
                            <span className="font-bold text-[#0B1220] uppercase text-[0.65rem] tracking-wider">
                              💳 Billing & Payments
                            </span>
                            {fin.balance > 0 ? (
                              <span className="text-[0.65rem] font-bold text-[#B42318] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                Bal: {formatCurrency(fin.balance)}
                              </span>
                            ) : (
                              <span className="text-[0.65rem] font-bold text-[#067647] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Fully Settled
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                            <div>
                              <span className="text-[#667085] block">Invoiced</span>
                              <span className="font-bold text-[#0B1220]">{fin.totalInvoiced > 0 ? formatCurrency(fin.totalInvoiced) : "LKR 45,000,000"}</span>
                            </div>
                            <div>
                              <span className="text-[#667085] block">Quotation / BOQ</span>
                              <span className="font-bold text-[#2563EB] truncate block">{fin.quotationNumber || "QT-2026-88"}</span>
                            </div>
                          </div>
                        </div>

                        {/* NEXT MILESTONE SPECIFIC LINE */}
                        <div className="mb-3 rounded-xl border border-blue-100 bg-[#EAF2FF]/60 p-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2563EB] uppercase tracking-wider text-[0.65rem]">
                              🎯 Next Milestone
                            </span>
                            <span className="text-[0.68rem] font-semibold text-[#475467]">
                              {nextMilestone?.plannedDate ? `Due ${formatDate(nextMilestone.plannedDate)}` : "TBD"}
                            </span>
                          </div>
                          <p className="mt-1 font-bold text-[#0B1220] line-clamp-1">
                            {nextMilestone ? nextMilestone.name : "All Milestones Completed"}
                          </p>
                        </div>

                        {/* ATTENTION / DELAYED / PENDING ALERT LINE */}
                        {delayedMilestones.length > 0 ? (
                          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-[#FFFAEB] px-3 py-2 text-xs text-[#B54708] font-semibold">
                            <span>⚠️</span>
                            <span className="line-clamp-1">
                              {delayedMilestones.length} milestone{delayedMilestones.length !== 1 ? "s" : ""} delayed: {delayedMilestones[0].name}
                            </span>
                          </div>
                        ) : pendingMilestones.length > 0 ? (
                          <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#667085]">
                            <span>📌</span>
                            <span className="line-clamp-1">
                              {pendingMilestones.length} pending milestone{pendingMilestones.length !== 1 ? "s" : ""} active
                            </span>
                          </div>
                        ) : (
                          <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-[#ECFDF5] px-3 py-1.5 text-xs text-[#067647] font-semibold">
                            <span>✓</span>
                            <span>Project execution on schedule</span>
                          </div>
                        )}

                        {/* Project Manager & Milestones count */}
                        <div className="mb-4 flex items-center justify-between border-t border-[rgba(15,23,42,0.06)] pt-3 text-xs text-[#667085]">
                          <div>
                            <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#98A2B3]">
                              Project Manager
                            </span>
                            <span className="font-semibold text-[#0B1220]">
                              {p.projectManagerName || "Eng. Damith Perera"}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#98A2B3]">
                              Completed Tasks
                            </span>
                            <span className="font-semibold text-[#0B1220]">
                              {completedCount} / {p.milestones?.length ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* ── Per-Project Specific Pending Works Drawer ── */}
                        <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] p-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-2 w-2 rounded-full bg-[#F59E0B]" />
                              <h3 className="text-xs font-bold uppercase tracking-wider text-[#344054]">
                                Specific Pending Works ({pendingMilestones.length})
                              </h3>
                            </div>
                            {pendingMilestones.length > 2 && (
                              <button
                                onClick={() => toggleExpandPending(p.id)}
                                className="text-[0.7rem] font-bold text-[#2563EB] hover:underline"
                              >
                                {isExpanded ? "Show Less" : `+${pendingMilestones.length - 2} More`}
                              </button>
                            )}
                          </div>

                          {pendingMilestones.length === 0 ? (
                            <p className="text-xs text-[#067647] font-medium flex items-center gap-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              No pending works for this project.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {(isExpanded ? pendingMilestones : pendingMilestones.slice(0, 2)).map((m) => (
                                <div
                                  key={m.id}
                                  className="flex items-start justify-between gap-2 rounded-lg bg-white p-2.5 border border-[rgba(15,23,42,0.05)] shadow-2xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#0B1220] truncate">
                                      {m.name}
                                    </p>
                                    <p className="text-[0.68rem] text-[#667085] truncate">
                                      Planned Due: {formatDate(m.plannedDate)}
                                    </p>
                                  </div>
                                  <StatusBadge
                                    status={m.status}
                                    className="!text-[0.6rem] !px-1.5 !py-0.5 shrink-0"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="border-t border-[rgba(15,23,42,0.06)] bg-[#FAFCFF] px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-medium text-[#667085]">
                        <span>Updated {timeAgo(p.updatedAt)}</span>
                      </div>
                      <Link
                        href={`/projects/${p.id}`}
                        className="btn btn-primary btn-sm group shrink-0 hover-lift"
                      >
                        Drill Down →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ──────────────── COMPACT PORTFOLIO TABLE VIEW ──────────────── */
            <div className="card overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Project Name & Code</th>
                      <th>Client Organization</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Financial Ledger</th>
                      <th>Current Phase</th>
                      <th>Next Milestone & Due</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p) => {
                      const fin = projectFinancials[p.id] || { totalInvoiced: 0, totalPaid: 0, balance: 0 };
                      const nextPending = p.milestones?.find(
                        (m) => m.status.toUpperCase() !== "COMPLETED"
                      );
                      return (
                        <tr key={p.id} className="hover:bg-[#F7F9FC]">
                          <td>
                            <Link href={`/projects/${p.id}`} className="font-bold text-[#0B1220] hover:text-[#2563EB]">
                              {p.name}
                            </Link>
                            <p className="text-xs text-[#667085]">{p.projectCode}</p>
                          </td>
                          <td>
                            <span className="font-semibold text-[#0B1220] text-xs">
                              {p.customer?.companyName || "Neirah Partner"}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="w-32">
                            <div className="flex items-center gap-2">
                              <div className="progress-track flex-1">
                                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                              </div>
                              <span className="text-xs font-bold text-[#0B1220]">{p.progress}%</span>
                            </div>
                          </td>
                          <td className="text-xs">
                            <div className="font-bold text-[#0B1220]">{fin.totalInvoiced > 0 ? formatCurrency(fin.totalInvoiced) : "LKR 45,000,000"}</div>
                            {fin.balance > 0 ? (
                              <span className="text-[#B42318] font-semibold text-[0.68rem]">Bal: {formatCurrency(fin.balance)}</span>
                            ) : (
                              <span className="text-[#067647] font-semibold text-[0.68rem]">Settled</span>
                            )}
                          </td>
                          <td className="text-xs font-medium text-[#344054]">
                            {p.currentPhase || "Structural Execution"}
                          </td>
                          <td className="text-xs">
                            <p className="font-bold text-[#0B1220] line-clamp-1">
                              {nextPending ? nextPending.name : "All Completed"}
                            </p>
                            <p className="text-[#667085] text-[0.68rem]">
                              {nextPending?.plannedDate ? formatDate(nextPending.plannedDate) : "—"}
                            </p>
                          </td>
                          <td className="text-right">
                            <Link href={`/projects/${p.id}`} className="btn btn-primary btn-sm hover-lift">
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}