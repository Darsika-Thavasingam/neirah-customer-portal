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
    documents: [
      { id: "d1", fileName: "Architectural_Blueprints_Rev4.pdf", category: "Drawings", fileUrl: "#", uploadedAt: "2026-05-10" },
      { id: "d2", fileName: "BOQ_Commercial_Quotation_Approved.pdf", category: "BOQ", fileUrl: "#", uploadedAt: "2026-04-12" }
    ],
    photos: [
      { id: "p1", photoUrl: "/images/project-residential.png", caption: "12th Floor Formwork Reinforcement", uploadedAt: "2026-08-20" },
      { id: "p2", photoUrl: "/images/project-commercial.png", caption: "Glass Façade Installation Progress", uploadedAt: "2026-08-18" }
    ]
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
    documents: [
      { id: "d3", fileName: "Villa_Structural_Details.pdf", category: "Drawings", fileUrl: "#", uploadedAt: "2026-06-01" }
    ],
    photos: [
      { id: "p3", photoUrl: "/images/project-residential.png", caption: "Villa Block B Framing", uploadedAt: "2026-08-22" }
    ]
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
    photos: [
      { id: "p4", photoUrl: "/images/project-commercial.png", caption: "Site Preparation Excavation", uploadedAt: "2026-08-15" }
    ]
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
    documents: [
      { id: "d4", fileName: "Depot_Fire_Safety_Plan.pdf", category: "Compliance", fileUrl: "#", uploadedAt: "2026-07-10" }
    ],
    photos: [
      { id: "p5", photoUrl: "/images/project-industrial.png", caption: "Depot Interior Steel Trusses", uploadedAt: "2026-08-24" }
    ]
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
    documents: [
      { id: "d5", fileName: "Completion_Certificate.pdf", category: "Legal", fileUrl: "#", uploadedAt: "2026-07-28" }
    ],
    photos: [
      { id: "p6", photoUrl: "/images/project-commercial.png", caption: "Completed Corporate HQ", uploadedAt: "2026-07-28" }
    ]
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
    photos: [
      { id: "p7", photoUrl: "/images/project-industrial.png", caption: "Tech Park Master Plan Site", uploadedAt: "2026-08-10" }
    ]
  },
  {
    id: "vanguard-residence-01",
    projectCode: "PRJ-VAN-01",
    name: "Vanguard Coastal Ocean Residence",
    location: "Galle Face, Colombo 01",
    status: "IN_PROGRESS",
    progress: 74,
    currentPhase: "Finishing & Interior Fit-outs",
    projectManagerName: "Eng. Priyantha Silva",
    projectManagerContact: "+94 77 999 1122",
    recentUpdate: "Marble flooring and smart home automation wiring completed for oceanfront suites.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Vanguard Properties Ltd (Single Project Client)", contactName: "Dinesh De Silva", email: "dinesh@vanguard.lk", phone: "+94 11 555 7777" },
    milestones: [
      { id: "m11", name: "Penthouse Glass Enclosure", description: "Panoramic curtain wall glass installation", plannedDate: "2026-09-05", actualCompletionDate: null, status: "IN_PROGRESS", progress: 80 },
      { id: "m12", name: "Swimming Pool & Terrace Deck", description: "Rooftop infinity pool waterproofing", plannedDate: "2026-10-12", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [
      { id: "d6", fileName: "Vanguard_Luxury_Suite_Specs.pdf", category: "Drawings", fileUrl: "#", uploadedAt: "2026-06-20" }
    ],
    photos: [
      { id: "p8", photoUrl: "/images/project-residential.png", caption: "Oceanfront Facade Inspection", uploadedAt: "2026-08-24" }
    ]
  }
];

export function getDemoProjectById(id: string): ProjectDetails {
  const match = MOCK_DEMO_PROJECTS.find((p) => p.id === id);
  if (match) return match;

  // Generic fallback if unknown ID
  return {
    id: id,
    projectCode: `PRJ-${id.slice(0, 4).toUpperCase()}`,
    name: "Skyline Residency Tower A",
    location: "Colombo 03, Western Province",
    status: "IN_PROGRESS",
    progress: 68,
    currentPhase: "12th Floor Concrete Casting",
    projectManagerName: "Eng. Damith Perera",
    projectManagerContact: "+94 77 123 4567",
    recentUpdate: "Concrete pouring for 12th slab completed ahead of schedule.",
    updatedAt: new Date().toISOString(),
    customer: { companyName: "Skyline Developers (Pvt) Ltd", contactName: "Kavinda Fernando", email: "kavinda@skyline.lk", phone: "+94 11 234 5678" },
    milestones: [
      { id: "m1", name: "Roof Slab Casting", description: "Structural concrete pouring", plannedDate: "2026-09-15", actualCompletionDate: null, status: "IN_PROGRESS", progress: 75 },
      { id: "m2", name: "Exterior Glazing & Façade", description: "Aluminium glass curtain installation", plannedDate: "2026-10-30", actualCompletionDate: null, status: "UPCOMING", progress: 0 }
    ],
    documents: [],
    photos: [{ id: "p1", photoUrl: "/images/project-residential.png", caption: "Progress Photo", uploadedAt: new Date().toISOString() }]
  };
}
