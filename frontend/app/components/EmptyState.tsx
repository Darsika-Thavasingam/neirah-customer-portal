import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: {
    label: string;
    href: string;
  };
}

const DEFAULT_ICON = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h6M9 13h4" />
  </svg>
);

export default function EmptyState({
  icon,
  title,
  body,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon text-[#2563EB]">
        {icon ?? DEFAULT_ICON}
      </div>
      <h2 className="empty-state-title">{title}</h2>
      {body && <p className="empty-state-body">{body}</p>}
      {action && (
        <div className="mt-5">
          <Link href={action.href} className="btn btn-primary">
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  backHref,
  backLabel = "Go back",
}: {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: "var(--danger-bg)",
        borderColor: "var(--danger-border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEE4E2] text-[#B42318]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#B42318]">{title}</h2>
          {message && (
            <p className="mt-1 text-sm font-normal text-[#B42318]">
              {message}
            </p>
          )}
          {backHref && (
            <Link href={backHref} className="mt-3 inline-block back-link">
              ← {backLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
