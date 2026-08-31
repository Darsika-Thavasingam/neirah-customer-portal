"use client";

import { useEffect, useState, useMemo } from "react";
import StatusBadge from "../components/StatusBadge";
import { PageLoading } from "../components/SkeletonLoader";
import PageHeader from "../components/PageHeader";
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

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "BOQ Approval Pending", message: "Your Bill of Quantities for Apex Logistics Hub requires sign-off before procurement can proceed.", type: "ALERT", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "n2", title: "Invoice INV-2026-007 Issued", message: "A new invoice has been generated for the structural phase completion. Please review and confirm receipt.", type: "INVOICE", isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "n3", title: "Milestone 3 Completed On Time", message: "MEP rough-in installations on floors 5–8 have passed municipal inspection and been marked complete.", type: "UPDATE", isRead: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "n4", title: "Payment PAY-SL-9984 Confirmed", message: "LKR 20,000,000 bank wire transfer has been verified and credited to project escrow.", type: "PAYMENT", isRead: true, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const TYPE_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  ALERT: { icon: "⚠️", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  INVOICE: { icon: "💳", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  UPDATE: { icon: "📢", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  PAYMENT: { icon: "✅", color: "#067647", bg: "#ECFDF5", border: "#A7F3D0" },
  INFO: { icon: "ℹ️", color: "#475467", bg: "#F8FAFC", border: "#E9EDF4" },
};

function getMeta(type: string) {
  return TYPE_META[type?.toUpperCase()] || TYPE_META.INFO;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDateTime(v: string) {
  return new Date(v).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function timeAgo(v: string) {
  const d = Math.floor((Date.now() - new Date(v).getTime()) / 86400000);
  const h = Math.floor((Date.now() - new Date(v).getTime()) / 3600000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    async function fetch_() {
      try {
        const uid = getActiveUserId();
        if (!uid) throw new Error("No user configured.");
        // Use dedicated notifications endpoint (falls back to dashboard if needed)
        const res = await fetch(`${API_BASE_URL}/api/v1/customer-portal/notifications`, {
          headers: { "x-user-id": uid }, cache: "no-store",
        });
        let list: Notification[] = [];
        if (res.ok) {
          const json = await res.json();
          const data = json?.data ?? json;
          list = Array.isArray(data) ? data : [];
        } else {
          // Fallback: parse from dashboard
          const dashRes = await fetch(`${API_BASE_URL}/api/v1/customer-portal/dashboard`, {
            headers: { "x-user-id": uid }, cache: "no-store",
          });
          if (dashRes.ok) {
            const dashJson = await dashRes.json();
            const dash = dashJson?.data ?? dashJson;
            list = dash.notifications || [];
          }
        }
        setNotifications(list.length > 0 ? list : MOCK_NOTIFICATIONS);
      } catch {
        setNotifications(MOCK_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, []);

  const unread = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (showUnreadOnly && n.isRead) return false;
      const q = searchQuery.toLowerCase().trim();
      if (q && !n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [notifications, searchQuery, showUnreadOnly]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return (
    <div className="page-shell max-w-3xl">
      <PageLoading message="Loading notifications…" />
    </div>
  );

  return (
    <div className="page-shell max-w-3xl animate-fade-in-up">
      {/* Hero Banner */}
      <PageHeader
        kicker="REAL-TIME ALERTS"
        title="Notifications & Site Updates"
        subtitle="Site updates, invoice alerts, and payment confirmations across your construction projects."
        bgImage="/images/project-industrial.png"
        unreadNotifications={unread}
      />

      {/* Streamlined Functional Toolbar (Replaced bulky ALL/READ/UNREAD tab options) */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search updates by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input text-xs py-2 pl-3.5 pr-8 rounded-xl bg-slate-100/80 border border-slate-200 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#667085] hover:text-[#0B1220]"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 border ${
              showUnreadOnly
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                : "bg-white text-[#667085] border-slate-200 hover:text-[#0B1220] hover:border-slate-300"
            }`}
          >
            {showUnreadOnly ? `Unread Only (${unread})` : `Show Unread (${unread})`}
          </button>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#2563EB] bg-[#EAF2FF] hover:bg-blue-100 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {error && <ErrorState title="Unable to load notifications" message={error} />}

      {!error && (
        filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#667085]">No notifications in this tab.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((n) => {
              const meta = getMeta(n.type);
              return (
                <div key={n.id} className={`py-4 flex gap-4 items-start transition-all px-2 rounded-xl ${!n.isRead ? "bg-[#F0F7FF]/50" : ""}`}>
                  {/* Type icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: meta.bg }}>
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                        <h3 className="text-sm font-extrabold text-[#0B1220]">{n.title}</h3>
                      </div>
                      <span className="text-[0.68rem] font-bold text-[#98A2B3] shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#667085] leading-relaxed">{n.message}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-[0.65rem] text-[#98A2B3]">
                      <span>{formatDateTime(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}