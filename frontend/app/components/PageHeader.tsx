"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveUserId, getApiBaseUrl } from "../lib/auth";

export interface PageHeaderProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  unreadNotifications?: number;
  showDefaultActions?: boolean;
  bgImage?: string;
  className?: string;
}

const SKYLINE_USER_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";

export default function PageHeader({
  kicker = "NEIRAH CUSTOMER PORTAL",
  title,
  subtitle,
  actions,
  unreadNotifications,
  showDefaultActions = true,
  bgImage = "/images/project-highrise.png",
  className = "mb-6 sm:mb-8",
}: PageHeaderProps) {
  const pathname = usePathname();
  const [customerInfo, setCustomerInfo] = useState<{
    contactName: string;
    companyName: string;
  }>({
    contactName: "Darsika Thavasingam",
    companyName: "Apex Construction Services",
  });
  const [unreadCount, setUnreadCount] = useState<number>(unreadNotifications ?? 1);

  // Sync active customer info & unread count dynamically
  useEffect(() => {
    function syncInfo() {
      const activeUid = getActiveUserId();
      if (activeUid === SKYLINE_USER_ID) {
        setCustomerInfo({
          contactName: "Skyline Lead",
          companyName: "Skyline Developers PLC",
        });
      } else {
        setCustomerInfo({
          contactName: "Darsika Thavasingam",
          companyName: "Apex Construction Services",
        });
      }

      if (unreadNotifications === undefined) {
        const apiBase = getApiBaseUrl();
        fetch(`${apiBase}/api/v1/customer-portal/dashboard`, {
          headers: { "x-user-id": activeUid },
          cache: "no-store",
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.summary?.unreadNotifications !== undefined) {
              setUnreadCount(data.summary.unreadNotifications);
            }
          })
          .catch(() => { });
      }
    }

    syncInfo();
    window.addEventListener("neirah:userswitch", syncInfo);
    window.addEventListener("storage", syncInfo);
    return () => {
      window.removeEventListener("neirah:userswitch", syncInfo);
      window.removeEventListener("storage", syncInfo);
    };
  }, [unreadNotifications]);

  if (pathname === "/login") return null;

  const displayTitle = title || `Welcome, ${customerInfo.contactName}`;
  const displaySubtitle =
    subtitle || `${customerInfo.companyName} · Last login: Portal session active`;

  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-7 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] group ${className}`}>
      {/* Background Architectural Overlay Image with Hardware-Accelerated Animation */}
      <img
        src={bgImage}
        alt="Header Background"
        className="absolute inset-0 h-full w-full object-cover opacity-35 filter brightness-110 contrast-125 saturate-90 animate-header-ambient pointer-events-none"
      />
      {/* Lightened Translucent Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/75 via-[#0B1220]/50 to-transparent pointer-events-none" />
      {/* Subtle Blueprint Mesh Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] animate-laser-flow pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[0.68rem] font-black uppercase tracking-widest text-[#00E5FF]">
              {kicker}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
            {displayTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-300 font-medium max-w-2xl drop-shadow-sm">
            {displaySubtitle}
          </p>
        </div>

        {/* Action Elements */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 relative z-10">
          {actions}
          {showDefaultActions && (
            <>
              {unreadCount > 0 && (
                <Link
                  href="/notifications"
                  className="flex items-center gap-1.5 bg-[#3B1722]/90 text-[#FCA5A5] border border-red-500/20 text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-red-950/80 transition shadow-sm backdrop-blur-md"
                >
                  🔔 {unreadCount} Unread
                </Link>
              )}
              {pathname !== "/projects" && (
                <Link
                  href="/projects"
                  className="btn btn-primary btn-sm text-xs font-bold py-2 px-4 rounded-xl shadow-md bg-[#2563EB] hover:bg-blue-600 text-white border-none"
                >
                  View All Projects →
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
