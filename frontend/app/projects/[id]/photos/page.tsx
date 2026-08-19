"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import { getActiveUserId } from '../../../lib/auth';

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


export default function ProjectPhotosPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        if (!getActiveUserId()) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE}/customer-portal/projects/${projectId}/photos`,
          {
            headers: {
              "x-user-id": getActiveUserId(),
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project photos.");
        }

        const data = await response.json();
        setPhotos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch project photos."
        );
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchPhotos();
  }, [projectId]);

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/projects/${projectId}`}
          className="mb-4 inline-flex items-center text-sm font-semibold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          ← Back to Project
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Gallery
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
            Project Photos
          </h1>
          <p className="mt-1 text-sm text-[#667085]">
            Customer-visible progress photos and job site documentation.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading photos...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            {error}
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-12 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-2xl text-[#2563EB]">
              🖼️
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0B1220]">
              No photos available
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              There are currently no customer-visible photos for this project.
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition hover:shadow-md"
            >
              <a
                href={photo.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || "Project photo"}
                  className="h-56 w-full object-cover transition duration-300 hover:scale-105"
                />
              </a>

              <div className="p-6">
                {photo.category && (
                  <div className="mb-3">
                    <StatusBadge status={photo.category} />
                  </div>
                )}

                <h2 className="text-base font-bold text-[#0B1220]">
                  {photo.caption || "Project progress photo"}
                </h2>

                <p className="mt-2 text-xs font-medium text-[#667085]">
                  Uploaded{" "}
                  {new Date(photo.uploadedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}