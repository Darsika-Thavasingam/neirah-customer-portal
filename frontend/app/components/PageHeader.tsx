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
  sideImage?: string;
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
  sideImage,
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
          contactName: "Sahan Rathnayake",
          companyName: "Skyline Engineering Ltd",
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
            const d = data?.data ?? data;
            if (d?.summary?.unreadNotifications !== undefined) {
              setUnreadCount(d.summary.unreadNotifications);
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
  const displaySubtitle = subtitle || `${customerInfo.companyName} · Last login: Portal session active`;
  const isAttachedToSubNav = className.includes("mb-0");

  return (
    <div
      className={`relative overflow-hidden ${isAttachedToSubNav ? "rounded-t-2xl rounded-b-none border-b-0" : "rounded-2xl"} bg-[#0B1220] text-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(37,99,235,0.08)] border border-white/10 ${className}`}
    >
      {/* High-Visibility Full-Bleed Architectural Background Image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-75 sm:opacity-85 filter brightness-110 contrast-115 saturate-110 transition-transform duration-700 hover:scale-105"
        />
        {/* Gradient Protection Overlay for Crisp Typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/95 via-[#0B1220]/70 to-[#0B1220]/35" />
        {/* Subtle Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#2563EB] via-white/40 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2.5 flex-wrap">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#3B82F6] bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
              {kicker}
            </span>
            {showDefaultActions && unreadCount > 0 && (
              <Link
                href="/notifications"
                className="inline-flex items-center gap-1 bg-[#2563EB]/40 text-blue-200 border border-[#2563EB]/50 text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full hover:bg-[#2563EB]/60 transition"
              >
                🔔 {unreadCount} Unread
              </Link>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
            {displayTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-200 font-medium leading-relaxed drop-shadow-sm">
            {displaySubtitle}
          </p>
        </div>

        {/* Right Side Image Thumbnail or Custom Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 relative z-10">
          {sideImage && (
            <div className="hidden sm:flex items-center gap-3 p-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 shadow-md">
              <img src={sideImage} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <div className="pr-2">
                <span className="block text-[0.62rem] font-bold text-blue-300 uppercase tracking-wider">Site View</span>
                <span className="text-xs font-bold text-white">Active Site</span>
              </div>
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
