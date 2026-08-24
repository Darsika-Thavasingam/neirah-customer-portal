"use client";

import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import EmptyState, { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type DashboardResponse = {
  notifications: Notification[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationIcon({ type, isRead }: { type: string; isRead: boolean }) {
  const t = type.toUpperCase();
  const color = isRead ? "#667085" : "#2563EB";

  if (t.includes("INVOICE") || t.includes("PAYMENT")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    );
  }

  if (t.includes("PROJECT") || t.includes("MILESTONE") || t.includes("UPDATE")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/dashboard`,
          {
            headers: { "x-user-id": getActiveUserId() },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch notifications.");

        const data: DashboardResponse = await response.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  if (loading) {
    return (
      <div className="page-shell max-w-4xl">
        <PageHeader kicker="Alerts & Updates" title="Notifications" />
        <PageLoading message="Loading notifications…" />
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ maxWidth: "56rem" }}>
      <PageHeader
        kicker="Alerts & Updates"
        title="Notifications"
        subtitle="Stay updated with your project and account activity."
        actions={
          unreadCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-[#EAF2FF] px-4 py-1.5 text-xs font-bold text-[#2563EB]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[0.65rem] font-black text-white">
                {unreadCount}
              </span>
              unread
            </span>
          ) : null
        }
      />

      {error && <ErrorState title="Unable to load notifications" message={error} />}

      {!error && notifications.length === 0 && (
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            }
            title="No notifications"
            body="You don't have any notifications at the moment. Updates will appear here as your project progresses."
          />
        </div>
      )}

      {!error && notifications.length > 0 && (
        <div className="space-y-6">
          {/* Unread */}
          {unread.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                Unread · {unread.length}
              </h2>
              <div className="space-y-3">
                {unread.map((n) => (
                  <NotificationCard key={n.id} notification={n} />
                ))}
              </div>
            </section>
          )}

          {/* Read */}
          {read.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">
                Earlier · {read.length}
              </h2>
              <div className="space-y-3">
                {read.map((n) => (
                  <NotificationCard key={n.id} notification={n} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  return (
    <article
      className={`notification-item ${!notification.isRead ? "unread" : ""}`}
    >
      {/* Icon */}
      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
        style={{
          background: notification.isRead ? "var(--surface-soft)" : "var(--primary-soft)",
          borderColor: notification.isRead ? "var(--border)" : "rgba(37,99,235,0.2)",
        }}
      >
        <NotificationIcon type={notification.type} isRead={notification.isRead} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-[#0B1220]">{notification.title}</h2>
            <StatusBadge status={notification.type} />
          </div>
          {!notification.isRead && (
            <span className="shrink-0 rounded-full bg-[#2563EB] px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-white">
              New
            </span>
          )}
        </div>

        <p className="mt-2 text-sm leading-relaxed text-[#475467]">
          {notification.message}
        </p>

        <p className="mt-2 text-xs font-medium text-[#667085]">
          {formatDateTime(notification.createdAt)}
        </p>
      </div>
    </article>
  );
}