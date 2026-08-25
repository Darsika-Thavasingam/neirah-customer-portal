"use client";

import { useEffect, useState, useMemo } from "react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError("");

        const userId = getActiveUserId();
        if (!userId) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/dashboard`,
          {
            headers: { "x-user-id": userId },
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

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filterTab === "UNREAD") return notifications.filter((n) => !n.isRead);
    if (filterTab === "READ") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, filterTab]);

  if (loading) {
    return (
      <div className="page-shell max-w-4xl">
        <PageHeader kicker="Alerts & Audit" title="Customer Notifications" />
        <PageLoading message="Loading notifications inbox…" />
      </div>
    );
  }

  return (
    <div className="page-shell max-w-4xl animate-fade-in-up">
      {/* High-Tech Laser Blueprint Visual Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border-2 border-blue-500/40 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0F172A] p-6 sm:p-7 text-white shadow-[0_10px_35px_rgba(37,99,235,0.2)] group">
        <img
          src="/images/project-commercial.png"
          alt="System Notifications"
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-cyan-500/30 opacity-70 animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <span className="rounded-md bg-blue-500/30 px-2.5 py-0.5 text-[0.68rem] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                Real-Time System Dispatch
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Customer Notifications & Alerts
            </h1>
            <p className="mt-1 text-xs text-cyan-100 font-semibold drop-shadow-sm">
              Live automated alerts for site updates, BOQ approvals, and invoice status.
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/20 shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {unreadCount} Unread Alert{unreadCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {error && <ErrorState title="Unable to load notifications" message={error} />}

      {!error && (
        <>
          {/* Filter Bar */}
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-2 shadow-2xs">
            <button
              onClick={() => setFilterTab("ALL")}
              className={`tab-btn ${filterTab === "ALL" ? "tab-btn-active" : ""}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterTab("UNREAD")}
              className={`tab-btn ${filterTab === "UNREAD" ? "tab-btn-active" : ""}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterTab("READ")}
              className={`tab-btn ${filterTab === "READ" ? "tab-btn-active" : ""}`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                }
                title="No notifications"
                body="You have no notifications matching this tab filter."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`card card-hover hover-lift shimmer-card p-5 transition flex gap-4 items-start ${
                    !n.isRead ? "border-l-4 border-l-[#2563EB] bg-[#F8FAFC]" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2563EB] font-bold shadow-2xs">
                    🔔
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-[#0B1220]">{n.title}</h2>
                        <StatusBadge status={n.type} />
                      </div>
                      <span className="text-xs text-[#667085]">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#475467]">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}