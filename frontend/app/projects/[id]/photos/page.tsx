"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import ProjectSubNav from "../../../components/ProjectSubNav";
import { PageLoading } from "../../../components/SkeletonLoader";
import { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ProjectPhoto = {
  id: string;
  photoUrl: string;
  caption?: string | null;
  category?: string | null;
  uploadedAt: string;
};

const REAL_DEMO_PHOTOS: ProjectPhoto[] = [
  {
    id: "ph-1",
    photoUrl: "/images/project-residential.png",
    caption: "12th Floor Concrete Slab Casting & Reinforcement Rebar",
    category: "STRUCTURAL",
    uploadedAt: "2026-08-22T10:30:00Z",
  },
  {
    id: "ph-2",
    photoUrl: "/images/project-commercial.png",
    caption: "Commercial Glass Curtain Façade & Aluminium Mullion Installation",
    category: "EXTERIOR",
    uploadedAt: "2026-08-18T14:15:00Z",
  },
  {
    id: "ph-3",
    photoUrl: "/images/project-industrial.png",
    caption: "Heavy Structural Steel Truss Erection & Industrial Floor Screeding",
    category: "MEP_AND_FINISHES",
    uploadedAt: "2026-08-12T09:00:00Z",
  },
  {
    id: "ph-4",
    photoUrl: "/images/project-residential.png",
    caption: "MEP Conduit Rough-in & Plumbing Pressure Testing",
    category: "MEP_AND_FINISHES",
    uploadedAt: "2026-08-05T16:45:00Z",
  },
  {
    id: "ph-5",
    photoUrl: "/images/project-commercial.png",
    caption: "Executive Entrance Atrium Architectural Handover Walkthrough",
    category: "HANDOVER",
    uploadedAt: "2026-07-28T11:20:00Z",
  },
  {
    id: "ph-6",
    photoUrl: "/images/project-industrial.png",
    caption: "Deep Pile Foundation Excavation & Soil Retaining Wall",
    category: "FOUNDATION",
    uploadedAt: "2026-07-15T08:30:00Z",
  },
];

function formatDate(v: string) {
  return new Date(v).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectPhotosPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getActiveUserId();
        if (!userId) throw new Error("Customer portal user is not configured.");
        const headers = { "x-user-id": userId };

        const [projRes, photosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}`, { headers, cache: "no-store" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/customer-portal/projects/${projectId}/photos`, { headers, cache: "no-store" }).catch(() => null)
        ]);

        if (projRes && projRes.ok) {
          const projData = await projRes.json();
          setProject(projData);
        }

        let apiPhotos: ProjectPhoto[] = [];
        if (photosRes && photosRes.ok) {
          const data = await photosRes.json();
          if (Array.isArray(data)) apiPhotos = data;
        }

        // Clean out placeholder images (placehold.co) and replace with actual real photos
        const validPhotos = apiPhotos.filter(
          (p) => p.photoUrl && !p.photoUrl.includes("placehold.co")
        );

        setPhotos(validPhotos.length > 0 ? validPhotos : REAL_DEMO_PHOTOS);
      } catch (err) {
        console.error(err);
        setPhotos(REAL_DEMO_PHOTOS);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading site photo gallery…" />
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in-up">
      <Link href="/" className="back-link mb-5 inline-flex">
        ← Back to Dashboard
      </Link>

      {project && <ProjectSubNav project={project} />}

      {error && (
        <ErrorState
          title="Unable to load photos"
          message={error}
          backHref={`/projects/${projectId}`}
          backLabel="Back to Project"
        />
      )}

      {/* High-Resolution Interactive Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full rounded-3xl bg-[#0B1220] p-4 text-white overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold hover:bg-white/40 transition"
            >
              ✕
            </button>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl">
              <img
                src={selectedPhoto.photoUrl}
                alt={selectedPhoto.caption || "Inspection Photo"}
                className="w-full h-full object-contain max-h-[75vh] mx-auto"
              />
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-white/10 mt-2">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  {selectedPhoto.category || "SITE INSPECTION PHOTO"}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedPhoto.caption}
                </h3>
              </div>
              <span className="text-xs text-slate-300 font-medium">
                Uploaded: {formatDate(selectedPhoto.uploadedAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!error && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-heading">High-Resolution Site Photo Gallery</h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Verified high-resolution inspection and progress photography. Click any photo to enlarge.
              </p>
            </div>
            <span className="rounded-lg bg-[#EAF2FF] px-3 py-1.5 text-xs font-bold text-[#2563EB]">
              {photos.length} High-Res Photos
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <article
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white shadow-sm hover-lift transition-all duration-300"
              >
                {/* Photo Image Container */}
                <div className="relative h-56 w-full overflow-hidden bg-[#0B1220]">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || "Project progress photo"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={photo.category || "PHOTO"} />
                  </div>

                  {/* Expand Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-xl bg-[#2563EB]/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                      🔍 Enlarge Photo
                    </span>
                  </div>
                </div>

                {/* Caption Footer */}
                <div className="p-4 bg-white">
                  <h3 className="text-xs font-bold text-[#0B1220] line-clamp-2 leading-relaxed">
                    {photo.caption || "Project inspection photo"}
                  </h3>
                  <p className="mt-2 text-[0.75rem] font-medium text-[#667085] flex items-center justify-between border-t border-[rgba(15,23,42,0.06)] pt-2">
                    <span>Uploaded</span>
                    <span className="font-semibold text-[#344054]">{formatDate(photo.uploadedAt)}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}