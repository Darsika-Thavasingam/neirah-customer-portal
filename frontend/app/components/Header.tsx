"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Global fetch interceptor to support multi-tenant demo switcher
if (typeof window !== "undefined" && !(window as any).__fetch_intercepted__) {
  (window as any).__fetch_intercepted__ = true;
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === "string" ? input : (input instanceof Request ? input.url : "");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    if (url.startsWith(apiBase)) {
      const storedUserId = localStorage.getItem("neirah_customer_user_id");
      if (storedUserId) {
        init = init || {};
        init.headers = init.headers || {};

        const setHeader = (headers: HeadersInit, name: string, value: string) => {
          if (headers instanceof Headers) {
            headers.set(name, value);
          } else if (Array.isArray(headers)) {
            const index = headers.findIndex(([k]) => k.toLowerCase() === name.toLowerCase());
            if (index !== -1) {
              headers[index][1] = value;
            } else {
              headers.push([name, value]);
            }
          } else {
            const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase()) || name;
            (headers as any)[key] = value;
          }
        };

        // Override user ID header
        setHeader(init.headers, "x-user-id", storedUserId);

        // If logged in as Skyline, map the default/Apex project ID to Skyline project ID in URL
        let targetUrl = url;
        if (storedUserId === "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" && url.includes("2e79e9a8-1c38-4e71-b506-3232ab8d6ed4")) {
          targetUrl = url.replace("2e79e9a8-1c38-4e71-b506-3232ab8d6ed4", "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b");
        }

        if (targetUrl !== url) {
          if (typeof input === "string") {
            input = targetUrl;
          } else if (input instanceof URL) {
            input = new URL(targetUrl);
          } else if (input instanceof Request) {
            input = new Request(targetUrl, input);
          }
        }
      } else {
        // Fallback for env default user ID translation: map 09e6e881-dcbb-42b9-ae4f-e62a0f2e598c to d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c
        init = init || {};
        init.headers = init.headers || {};
        const getHeader = (headers: HeadersInit, name: string) => {
          if (headers instanceof Headers) {
            return headers.get(name);
          } else if (Array.isArray(headers)) {
            const entry = headers.find(([k]) => k.toLowerCase() === name.toLowerCase());
            return entry ? entry[1] : null;
          } else {
            const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase());
            return key ? (headers as any)[key] : null;
          }
        };

        const currentHeaderVal = getHeader(init.headers, "x-user-id");
        if (currentHeaderVal === "09e6e881-dcbb-42b9-ae4f-e62a0f2e598c" || !currentHeaderVal) {
          const setHeader = (headers: HeadersInit, name: string, value: string) => {
            if (headers instanceof Headers) {
              headers.set(name, value);
            } else if (Array.isArray(headers)) {
              const index = headers.findIndex(([k]) => k.toLowerCase() === name.toLowerCase());
              if (index !== -1) {
                headers[index][1] = value;
              } else {
                headers.push([name, value]);
              }
            } else {
              const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase()) || name;
              (headers as any)[key] = value;
            }
          };
          setHeader(init.headers, "x-user-id", "d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c");
        }
      }
    }

    return originalFetch(input, init);
  };
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Start with the default Apex project ID (matches server render).
  // After mount, update from localStorage to support the demo switcher.
  const defaultProjectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";
  const [projectUrl, setProjectUrl] = useState(
    defaultProjectId ? `/projects/${defaultProjectId}` : "/"
  );

  useEffect(() => {
    const storedUserId = localStorage.getItem("neirah_customer_user_id");
    if (storedUserId === "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d") {
      setProjectUrl("/projects/8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b");
    } else {
      setProjectUrl(defaultProjectId ? `/projects/${defaultProjectId}` : "/");
    }
  }, [defaultProjectId]);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: projectUrl, label: "Projects", isPrefixMatch: true },
    { href: "/quotations", label: "Quotations", isPrefixMatch: true },
    { href: "/contracts", label: "Contracts", isPrefixMatch: true },
    { href: "/invoices", label: "Invoices", isPrefixMatch: true },
    { href: "/payments", label: "Payments", isPrefixMatch: true },
    { href: "/notifications", label: "Notifications", isPrefixMatch: true },
    { href: "/profile", label: "Profile", isPrefixMatch: true },
  ];

  if (pathname === "/login") {
    return null;
  }

  const isActive = (item: { href: string; isPrefixMatch?: boolean }) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    if (item.isPrefixMatch && item.href !== "/") {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(15,23,42,0.08)] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <div className="relative flex h-10 w-10 overflow-hidden items-center justify-center rounded-xl border border-blue-200/80 bg-[#0B1220] shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition group-hover:scale-105">
            <img
              src="/neirah-logo.png?v=3"
              alt="Neirah Construction OS Logo"
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <div className="leading-none">
            <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
              Neirah
            </div>
            <div className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#667085]">
              Customer Portal
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                  active
                    ? "bg-[#EAF2FF] text-[#2563EB] font-bold shadow-xs"
                    : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#0B1220]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle Navigation Menu"
          className="inline-flex items-center justify-center rounded-lg border border-[rgba(15,23,42,0.12)] p-2 text-[#0B1220] hover:bg-[#F7F9FC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] lg:hidden"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <nav
          className="border-t border-[rgba(15,23,42,0.08)] bg-white px-4 pt-2 pb-4 shadow-lg lg:hidden"
          aria-label="Mobile Navigation"
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3.5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                    active
                      ? "bg-[#EAF2FF] text-[#2563EB] font-bold"
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
