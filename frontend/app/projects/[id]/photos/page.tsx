"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import { PageLoading } from "../../../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../../../components/EmptyState";
import { getActiveUserId } from "../../../lib/auth";

type ProjectPhoto = {
  id: string;
  photoUrl: string;
  caption?: string | null;
  category?: string | null;
  uploadedAt: string;
};

const API_BASE = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return url.endsWith("/api/v1") ? url : `${url.replace(/\/$/, "")}/api/v1`;
})();

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

  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        if (!getActiveUserId()) throw new Error("Customer portal user is not configured.");

        const response = await fetch(
          `${API_BASE}/customer-portal/projects/${projectId}/photos`,
          {
            headers: { "x-user-id": getActiveUserId() },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch project photos.");

        const data = await response.json();
        setPhotos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch project photos.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchPhotos();
  }, [projectId]);

  if (loading) {
    return (
      <div className="page-shell">
        <PageLoading message="Loading gallery…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Link href={`/projects/${projectId}`} className="back-link mb-5 inline-flex">
        ← Back to Project
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">Gallery</p>
          <h1 className="page-title">Project Photos</h1>
          <p className="page-subtitle">
            Customer-visible progress photos and job site documentation.
          </p>
        </div>
        {!error && photos.length > 0 && (
          <span className="shrink-0 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 py-1.5 text-xs font-bold text-[#667085]">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <ErrorState
          title="Unable to load photos"
          message={error}
          backHref={`/projects/${projectId}`}
          backLabel="Back to Project"
        />
      )}

      {!error && photos.length === 0 && (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            }
            title="No photos available"
            body="There are currently no customer-visible photos for this project. Photos will appear here as construction progresses."
          />
        </div>
      )}

      {!error && photos.length > 0 && (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <article key={photo.id} className="gallery-item">
              <a
                href={photo.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                aria-label={photo.caption ?? "View project photo"}
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || "Project progress photo"}
                  className="gallery-img"
                  loading="lazy"
                />
              </a>

              <div className="p-4">
                {photo.category && (
                  <div className="mb-2">
                    <StatusBadge status={photo.category} />
                  </div>
                )}

                <h2 className="text-sm font-bold text-[#0B1220]">
                  {photo.caption || "Project progress photo"}
                </h2>

                <p className="mt-1.5 text-xs font-medium text-[#667085]">
                  {formatDate(photo.uploadedAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}