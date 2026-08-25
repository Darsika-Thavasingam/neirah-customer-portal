"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Global fetch interceptor – supports multi-tenant demo switcher
if (typeof window !== "undefined" && !(window as any).__fetch_intercepted__) {
  (window as any).__fetch_intercepted__ = true;
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : "";
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    if (url.startsWith(apiBase)) {
      const storedUserId = localStorage.getItem("neirah_customer_user_id");

      const setHeader = (
        headers: HeadersInit,
        name: string,
        value: string
      ) => {
        if (headers instanceof Headers) {
          headers.set(name, value);
        } else if (Array.isArray(headers)) {
          const idx = headers.findIndex(
            ([k]) => k.toLowerCase() === name.toLowerCase()
          );
          if (idx !== -1) headers[idx][1] = value;
          else headers.push([name, value]);
        } else {
          const key =
            Object.keys(headers).find(
              (k) => k.toLowerCase() === name.toLowerCase()
            ) || name;
          (headers as any)[key] = value;
        }
      };

      if (storedUserId) {
        init = init || {};
        init.headers = init.headers || {};
        setHeader(init.headers, "x-user-id", storedUserId);

        // Map Skyline project ID if required
        let targetUrl = url;
        if (
          storedUserId === "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" &&
          url.includes("2e79e9a8-1c38-4e71-b506-3232ab8d6ed4")
        ) {
          targetUrl = url.replace(
            "2e79e9a8-1c38-4e71-b506-3232ab8d6ed4",
            "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b"
          );
        }
        if (targetUrl !== url) {
          if (typeof input === "string") input = targetUrl;
          else if (input instanceof URL) input = new URL(targetUrl);
          else if (input instanceof Request)
            input = new Request(targetUrl, input);
        }
      } else {
        init = init || {};
        init.headers = init.headers || {};
        const getHeader = (headers: HeadersInit, name: string) => {
          if (headers instanceof Headers) return headers.get(name);
          if (Array.isArray(headers)) {
            const e = headers.find(
              ([k]) => k.toLowerCase() === name.toLowerCase()
            );
            return e ? e[1] : null;
          }
          const k = Object.keys(headers).find(
            (k) => k.toLowerCase() === name.toLowerCase()
          );
          return k ? (headers as any)[k] : null;
        };
        const cur = getHeader(init.headers, "x-user-id");
        if (
          cur === "09e6e881-dcbb-42b9-ae4f-e62a0f2e598c" ||
          !cur
        ) {
          setHeader(
            init.headers,
            "x-user-id",
            "d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c"
          );
        }
      }
    }
    return originalFetch(input, init);
  };
}

const SKYLINE_USER_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
const SKYLINE_PROJECT_ID = "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const defaultProjectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";

  const [projectUrl, setProjectUrl] = useState(
    defaultProjectId ? `/projects/${defaultProjectId}` : "/"
  );

  useEffect(() => {
    function updateProjectUrl() {
      const stored = localStorage.getItem("neirah_customer_user_id");
      if (stored === SKYLINE_USER_ID) {
        setProjectUrl(`/projects/${SKYLINE_PROJECT_ID}`);
      } else {
        setProjectUrl(
          defaultProjectId ? `/projects/${defaultProjectId}` : "/"
        );
      }
    }
    updateProjectUrl();
    window.addEventListener("neirah:userswitch", updateProjectUrl);
    window.addEventListener("storage", updateProjectUrl);
    return () => {
      window.removeEventListener("neirah:userswitch", updateProjectUrl);
      window.removeEventListener("storage", updateProjectUrl);
    };
  }, [defaultProjectId]);

  if (pathname === "/login") return null;

  const navItems = [
    { href: "/", label: "Dashboard", exact: true },
    { href: "/notifications", label: "Notifications", prefix: "/notifications" },
    { href: "/profile", label: "Profile", prefix: "/profile" },
  ];

  const isActive = (item: { href: string; exact?: boolean; prefix?: string }) => {
    if (item.exact) return pathname === item.href;
    if (item.prefix) return pathname.startsWith(item.prefix);
    return pathname === item.href;
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="mx-auto flex max-w-[80rem] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-200/60 bg-[#0B1220] shadow-sm transition-transform group-hover:scale-105">
            <img
              src="/neirah-logo.png?v=3"
              alt="Neirah Construction OS"
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#2563EB]">
              Neirah
            </div>
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#667085]">
              Customer Portal
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden items-center gap-1.5 lg:flex bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#2563EB] to-blue-600 text-white shadow-md shadow-blue-500/20 scale-102"
                    : "text-[#475467] hover:text-[#0B1220] hover:bg-white/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: notifications + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 border border-slate-200/80 text-[#667085] transition hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-[#475467] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] lg:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          className="border-t border-[rgba(15,23,42,0.06)] bg-white px-4 pb-4 pt-2 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#EAF2FF] text-[#2563EB]"
                      : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#0B1220]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
