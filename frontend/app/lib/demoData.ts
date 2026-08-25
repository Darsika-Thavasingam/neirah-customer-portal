export type Milestone = {
  id: string;
  name: string;
  description: string | null;
  plannedDate: string | null;
  actualCompletionDate: string | null;
  status: string;
  progress: number;
};

export type ProjectDocument = {
  id: string;
  fileName: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
};

export type ProjectPhoto = {
  id: string;
  photoUrl: string;
  caption: string | null;
  uploadedAt: string;
};

export type CustomerSummary = {
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
};

export type ProjectDetails = {
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
  documents: ProjectDocument[];
  photos: ProjectPhoto[];
};

export const MOCK_DEMO_PROJECTS: ProjectDetails[] = [
  // ── CEYLON URBAN ESTATES (Pvt) Ltd — 3 diverse projects ──
  {
    id: "2e79e9a8-1c38-4e71-b506-3232ab8d6ed4",
    projectCode: "CUE-COL-01",
    name: "Harbourfront Pinnacle Tower",
    location: "Colombo Port City, Colombo 01",
    status: "IN_PROGRESS",
    progress: 68,
    currentPhase: "12th Floor Concrete Casting",
    projectManagerName: "Eng. Damith Perera",
    projectManagerContact: "+94 77 123 4567",
    recentUpdate: "Concrete pouring for 12th slab completed ahead of monsoon schedule. Steel rebar delivery secured.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Ceylon Urban Estates (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@ceylonurban.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m1", name: "Roof Slab Casting — Level 12", description: "Structural concrete pouring for main slab", plannedDate: "2026-09-15", actualCompletionDate: null, status: "IN_PROGRESS", progress: 75 },
      { id: "m2", name: "Curtain Wall Glazing & Façade", description: "High-performance aluminium glass curtain installation", plannedDate: "2026-10-30", actualCompletionDate: null, status: "UPCOMING", progress: 0 },
      { id: "m3", name: "Foundation Piling & Excavation", description: "Deep pile foundations — 32 bored piles", plannedDate: "2025-11-10", actualCompletionDate: "2025-11-05", status: "COMPLETED", progress: 100 }
    ],
    documents: [
      { id: "d1", fileName: "HarbourPinnacle_Architectural_Blueprints_Rev4.pdf", category: "Drawings", fileUrl: "#", uploadedAt: "2026-05-10" },
      { id: "d2", fileName: "HarbourPinnacle_BOQ_Approved_Quotation.xlsx", category: "BOQ", fileUrl: "#", uploadedAt: "2026-04-12" }
    ],
    photos: [
      { id: "p1", photoUrl: "/images/project-commercial.png", caption: "Level 12 Formwork Reinforcement", uploadedAt: "2026-08-20" },
      { id: "p2", photoUrl: "/images/project-residential.png", caption: "Glass Façade Installation Progress", uploadedAt: "2026-08-18" }
    ]
  },
  {
    id: "ceylon-villas-02",
    projectCode: "CUE-RAJ-02",
    name: "Rajagiriya Garden Villas — Phase 2",
    location: "Rajagiriya, Western Province",
    status: "IN_PROGRESS",
    progress: 45,
    currentPhase: "Roof Framing & MEP Rough-in",
    projectManagerName: "Eng. Nimal Silva",
    projectManagerContact: "+94 77 888 9999",
    recentUpdate: "MEP piping and electrical conduits installed for Block B cluster. Roof trusses erected.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Ceylon Urban Estates (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@ceylonurban.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m4", name: "Plumbing & Electrical First Fix", description: "Internal conduit laying and pipe routes", plannedDate: "2026-09-01", actualCompletionDate: null, status: "IN_PROGRESS", progress: 50 },
      { id: "m5", name: "Internal Plastering & Tile Finishes", description: "Wall and floor finishes across all units", plannedDate: "2026-11-15", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [
      { id: "d3", fileName: "Rajagiriya_Villas_Structural_Details.pdf", category: "Drawings", fileUrl: "#", uploadedAt: "2026-06-01" }
    ],
    photos: [
      { id: "p3", photoUrl: "/images/project-residential.png", caption: "Villa Block B Roof Framing", uploadedAt: "2026-08-22" }
    ]
  },
  {
    id: "ceylon-hub-03",
    projectCode: "CUE-KIR-03",
    name: "Kiribathgoda Integrated Trade Centre",
    location: "Kandy Road, Kiribathgoda",
    status: "PLANNING",
    progress: 18,
    currentPhase: "Foundation Piling & Site Prep",
    projectManagerName: "Eng. Sahan Wickramasinghe",
    projectManagerContact: "+94 71 555 4433",
    recentUpdate: "Geotechnical soil testing approved. UDA planning permit submitted for retail commercial zoning.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Ceylon Urban Estates (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@ceylonurban.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m6", name: "Site Excavation & Basement Shoring", description: "Basement level 2 excavation and retaining walls", plannedDate: "2026-10-05", actualCompletionDate: null, status: "PLANNING", progress: 20 }
    ],
    documents: [],
    photos: [
      { id: "p4", photoUrl: "/images/project-commercial.png", caption: "Trade Centre Site Preparation", uploadedAt: "2026-08-15" }
    ]
  },

  // ── MERIDIAN INDUSTRIAL HOLDINGS PLC — 3 industrial/commercial projects ──
  {
    id: "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b",
    projectCode: "MIH-BIY-01",
    name: "Biyagama Mega Logistics & Warehousing Depot",
    location: "Biyagama Export Processing Zone, Kelaniya",
    status: "IN_PROGRESS",
    progress: 82,
    currentPhase: "Internal Flooring & MEP Systems Testing",
    projectManagerName: "Eng. Roshan Jayasinghe",
    projectManagerContact: "+94 77 333 2211",
    recentUpdate: "Steel truss erection complete. Epoxy floor polishing in final bay. Fire suppression test scheduled.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Meridian Industrial Holdings PLC", contactName: "Anura Bandara", email: "anura@meridian.lk", phone: "+94 11 999 8877" },
    milestones: [
      { id: "m7", name: "Heavy Duty Epoxy Floor Screeding", description: "Industrial hardwear floor coating system", plannedDate: "2026-08-30", actualCompletionDate: null, status: "IN_PROGRESS", progress: 85 },
      { id: "m8", name: "Fire Suppression System Hydrostatic Test", description: "Full system wet commissioning test", plannedDate: "2026-09-20", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [
      { id: "d4", fileName: "Biyagama_Depot_Fire_Safety_Engineering_Plan.pdf", category: "Compliance", fileUrl: "#", uploadedAt: "2026-07-10" }
    ],
    photos: [
      { id: "p5", photoUrl: "/images/project-industrial.png", caption: "Depot Interior Steel Truss Span", uploadedAt: "2026-08-24" }
    ]
  },
  {
    id: "meridian-hq-02",
    projectCode: "MIH-COL-02",
    name: "Meridian Nawam Corporate Headquarters",
    location: "Nawam Mawatha, Colombo 02",
    status: "COMPLETED",
    progress: 100,
    currentPhase: "Final Handover & Practical Completion",
    projectManagerName: "Eng. Chaminda Ratnayake",
    projectManagerContact: "+94 77 444 5566",
    recentUpdate: "Final practical completion certificate issued. CofO granted by Colombo Municipal Council.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Meridian Industrial Holdings PLC", contactName: "Anura Bandara", email: "anura@meridian.lk", phone: "+94 11 999 8877" },
    milestones: [
      { id: "m9", name: "Final Inspection & Key Handover", description: "Client walkthrough, defect log, and key handover", plannedDate: "2026-07-30", actualCompletionDate: "2026-07-28", status: "COMPLETED", progress: 100 }
    ],
    documents: [
      { id: "d5", fileName: "Meridian_HQ_Completion_Certificate.pdf", category: "Legal", fileUrl: "#", uploadedAt: "2026-07-28" }
    ],
    photos: [
      { id: "p6", photoUrl: "/images/project-commercial.png", caption: "Meridian Corporate HQ — Completed", uploadedAt: "2026-07-28" }
    ]
  },
  {
    id: "meridian-techpark-03",
    projectCode: "MIH-MAL-03",
    name: "Malabe Innovation & Technology Campus",
    location: "Malabe Technology Corridor, Colombo East",
    status: "PLANNING",
    progress: 15,
    currentPhase: "BOQ Review & Master Plan Architect Approval",
    projectManagerName: "Eng. Nalin Cooray",
    projectManagerContact: "+94 77 666 7788",
    recentUpdate: "Environmental Impact Assessment cleared by Central Environment Authority. UDA permit applied.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Meridian Industrial Holdings PLC", contactName: "Anura Bandara", email: "anura@meridian.lk", phone: "+94 11 999 8877" },
    milestones: [
      { id: "m10", name: "Architectural Drawing Signoff & UDA Approval", description: "Municipal and Urban Development Authority building permit", plannedDate: "2026-10-15", actualCompletionDate: null, status: "PLANNING", progress: 15 }
    ],
    documents: [],
    photos: [
      { id: "p7", photoUrl: "/images/project-industrial.png", caption: "Malabe Campus Master Plan Site", uploadedAt: "2026-08-10" }
    ]
  },

  // ── VANGUARD PROPERTIES LTD — 1 exclusive luxury project ──
  {
    id: "vanguard-residence-01",
    projectCode: "VPL-GAL-01",
    name: "Galle Face Ocean Residences — Penthouse Collection",
    location: "Galle Face, Colombo 01",
    status: "IN_PROGRESS",
    progress: 74,
    currentPhase: "Luxury Interior Fit-outs & Smart Home Integration",
    projectManagerName: "Eng. Priyantha Silva",
    projectManagerContact: "+94 77 999 1122",
    recentUpdate: "Italian marble flooring and Crestron smart home wiring completed for Suites 01–08 oceanfront block.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Vanguard Properties Ltd", contactName: "Dinesh De Silva", email: "dinesh@vanguardprops.lk", phone: "+94 11 555 7777" },
    milestones: [
      { id: "m11", name: "Penthouse Glass Enclosure & Sky Terrace", description: "Panoramic curtain wall glass — Level 32 penthouse", plannedDate: "2026-09-05", actualCompletionDate: null, status: "IN_PROGRESS", progress: 80 },
      { id: "m12", name: "Infinity Pool & Rooftop Deck Waterproofing", description: "Rooftop deck pool structure and waterproofing membrane", plannedDate: "2026-10-12", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [
      { id: "d6", fileName: "GalleFace_PenthouseCollection_LuxurySpecs.pdf", category: "Drawings", fileUrl: "#", uploadedAt: "2026-06-20" }
    ],
    photos: [
      { id: "p8", photoUrl: "/images/project-residential.png", caption: "Oceanfront Façade Inspection — Level 28", uploadedAt: "2026-08-24" }
    ]
  }
];

export function getDemoProjectById(id: string): ProjectDetails {
  const match = MOCK_DEMO_PROJECTS.find((p) => p.id === id);
  if (match) return match;

  // Generic fallback if unknown ID
  return {
    id: id,
    projectCode: `CUE-${id.slice(0, 4).toUpperCase()}`,
    name: "Harbourfront Pinnacle Tower",
    location: "Colombo Port City, Colombo 01",
    status: "IN_PROGRESS",
    progress: 68,
    currentPhase: "12th Floor Concrete Casting",
    projectManagerName: "Eng. Damith Perera",
    projectManagerContact: "+94 77 123 4567",
    recentUpdate: "Concrete pouring for 12th slab completed ahead of schedule.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Ceylon Urban Estates (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@ceylonurban.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m1", name: "Roof Slab Casting — Level 12", description: "Structural concrete pouring", plannedDate: "2026-09-15", actualCompletionDate: null, status: "IN_PROGRESS", progress: 75 },
      { id: "m2", name: "Curtain Wall Glazing & Façade", description: "Aluminium glass curtain installation", plannedDate: "2026-10-30", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [],
    photos: [{ id: "p1", photoUrl: "/images/project-residential.png", caption: "Progress Photo", uploadedAt: new Date().toISOString() }]
  };
}
