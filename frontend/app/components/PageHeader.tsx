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
  kicker = "NEIRAH CONSTRUCTION OS",
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

  const isAttachedToSubNav = className.includes("mb-0");

  return (
    <div
      className={`relative overflow-hidden ${isAttachedToSubNav ? "rounded-t-2xl rounded-b-none border-b-0" : "rounded-2xl"} bg-[#0B1220] text-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(37,99,235,0.08)] border border-white/10 ${className}`}
    >
      {/* Header Background Image (Increased Opacity) */}
      <img
        src={bgImage}
        alt="Header Background"
        className="absolute inset-0 h-full w-full object-cover opacity-65 filter brightness-110 contrast-115 saturate-100 pointer-events-none"
      />
      {/* Lighter Gradient Overlay for Vivid Visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/75 via-[#0B1220]/50 to-[#0B1220]/25 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2.5 flex-wrap">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#3B82F6]">
              {kicker}
            </span>
            {showDefaultActions && unreadCount > 0 && (
              <Link
                href="/notifications"
                className="inline-flex items-center gap-1 bg-[#2563EB]/20 text-[#3B82F6] border border-[#2563EB]/30 text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full hover:bg-[#2563EB]/30 transition"
              >
                🔔 {unreadCount} Unread
              </Link>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            {displayTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-300 font-normal max-w-2xl drop-shadow-sm">
            {displaySubtitle}
          </p>
        </div>

        {/* Custom Actions */}
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3 relative z-10">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}


