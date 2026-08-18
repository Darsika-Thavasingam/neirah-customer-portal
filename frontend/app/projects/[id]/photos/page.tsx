"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ProjectPhoto = {
  id: string;
  photoUrl: string;
  caption?: string | null;
  category?: string | null;
  uploadedAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

const USER_ID =
  process.env.NEXT_PUBLIC_USER_ID ||
  process.env.NEXT_PUBLIC_DEMO_USER_ID ||
  "";

export default function ProjectPhotosPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/customer-portal/projects/${projectId}/photos`,
          {
            headers: {
              "x-user-id": USER_ID,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project photos.");
        }

        const data = await response.json();
        setPhotos(data);
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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="mb-6 text-sm font-medium text-blue-700"
        >
          ← Back to Project
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
          Project Photos
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Customer-visible progress photos.
        </p>

        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            Loading photos...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold text-slate-900">
              No photos available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no customer-visible photos.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <a
                href={photo.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || "Project photo"}
                  className="h-56 w-full object-cover transition hover:scale-[1.02]"
                />
              </a>

              <div className="p-5">
                {photo.category && (
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {photo.category}
                  </span>
                )}

                <h2 className="mt-3 font-semibold text-slate-900">
                  {photo.caption || "Project progress photo"}
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                  Uploaded{" "}
                  {new Date(photo.uploadedAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}