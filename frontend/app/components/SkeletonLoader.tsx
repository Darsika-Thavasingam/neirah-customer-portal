import React from "react";

/* ─── Skeleton primitives ─── */

export function SkeletonText({ className = "" }: { className?: string }) {
  return <div className={`skeleton skeleton-text ${className}`} />;
}

export function SkeletonTitle({ className = "" }: { className?: string }) {
  return <div className={`skeleton skeleton-title ${className}`} />;
}

export function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

/* ─── Card skeleton ─── */
export function CardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-1/4" />
          <SkeletonTitle className="w-1/2" />
          <SkeletonText className="w-1/3" />
        </div>
        <SkeletonBlock className="h-6 w-20" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <SkeletonText className="w-3/4" />
            <SkeletonText className="w-1/2" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-3 border-t border-[rgba(15,23,42,0.06)] pt-5">
        <SkeletonBlock className="h-9 w-28" />
        <SkeletonBlock className="h-9 w-24" />
      </div>
    </div>
  );
}

/* ─── Metric skeleton ─── */
export function MetricSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className={`grid gap-4 ${count === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <SkeletonText className="w-1/2" />
          <SkeletonTitle className="mt-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/* ─── Page loading state ─── */
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#2563EB]" />
      <p className="mt-4 text-sm font-medium text-[#667085]">{message}</p>
    </div>
  );
}

export default function SkeletonLoader({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
