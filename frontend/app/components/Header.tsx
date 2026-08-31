"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../lib/auth";

// Global fetch interceptor – injects x-user-id header and handles 401 unauthenticated responses
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
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
      }
    }
    const res = await originalFetch(input, init);

    // Auto-logout on 401 Unauthorized response from backend
    if (res.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
      logout();
    }

    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      const clone = res.clone();
      try {
        const text = await clone.text();
        const json = JSON.parse(text);
        if (
          json &&
          typeof json === "object" &&
          json.success === true &&
          "data" in json
        ) {
          return new Response(JSON.stringify(json.data), {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
          });
        }
      } catch (e) {
        // Fallback to original response
      }
    }
    return res;
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
    { href: "/notifications", label: "Updates", prefix: "/notifications" },
    { href: "/profile", label: "Profile", prefix: "/profile" },
  ];

  const isActive = (item: { href: string; exact?: boolean; prefix?: string }) => {
    if (item.exact) return pathname === item.href;
    if (item.prefix) return pathname.startsWith(item.prefix);
    return pathname === item.href;
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 bg-[#0B1220] text-white flex-col justify-between p-6 shrink-0 z-40 relative overflow-hidden group">
        {/* Architectural Background Image & Gradient Scrim */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/project-highrise.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-80 filter brightness-115 contrast-120 saturate-110 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/95 via-[#0B1220]/88 to-[#0B1220]/95" />
        </div>

        {/* Top Logo & Brand Identity */}
        <div className="relative z-10 space-y-6">
          <Link href="/" className="flex items-center gap-3 group/brand">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 p-1.5 backdrop-blur-md border border-white/20 shadow-lg transition-transform duration-300 group-hover/brand:scale-105">
              <img
                src="/neirah-logo.png?v=3"
                alt="Neirah OS Logo"
                className="h-full w-full object-contain filter brightness-110"
              />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-wider text-white uppercase block leading-none">
                NEIRAH OS
              </span>
              <span className="text-[0.65rem] font-semibold text-[#2563EB] tracking-widest uppercase block mt-1">
                Customer Portal
              </span>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    active
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 translate-x-1"
                      : "text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-0.5"
                  }`}
                >
                  <span className="text-sm">
                    {item.label === "Dashboard" ? "📊" : item.label === "Updates" ? "🔔" : "👤"}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Direct Modules Navigation Group */}
          <div className="pt-3 border-t border-white/10">
            <p className="px-3 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Project Hub
            </p>
            <div className="space-y-0.5">
              <Link href="/projects" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 hover:translate-x-0.5">
                <span>🏗️</span> All Projects
              </Link>
              <Link href="/quotations" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 hover:translate-x-0.5">
                <span>📄</span> Quotations
              </Link>
              <Link href="/contracts" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 hover:translate-x-0.5">
                <span>⚖️</span> Contracts
              </Link>
              <Link href="/payments" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 hover:translate-x-0.5">
                <span>💳</span> Payments & Invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Profile Summary & Sign Out */}
        <div className="relative z-10 space-y-3">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <Link href="/profile" className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white font-bold text-xs">
                  C
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-semibold text-white truncate">
                    My Account
                  </p>
                  <p className="text-[0.65rem] text-emerald-400 truncate font-medium">
                    ● Authenticated
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[0.65rem] font-semibold text-slate-400 px-2">
            <span>System: <strong className="text-[#067647]">Online</strong></span>
            <span className="text-slate-400 font-mono">v3.4</span>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR & DRAWER ── */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0B1220] text-white px-4 py-3 flex items-center justify-between border-b border-white/10 relative overflow-hidden">
        {/* Mobile Header Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img src="/images/project-highrise.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220] via-[#0B1220]/80 to-[#0B1220]/60" />
        </div>

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 p-1 border border-white/10">
            <img
              src="/neirah-logo.png?v=3"
              alt="Neirah"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xs font-bold tracking-wider text-white uppercase">Neirah OS</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 hover:text-white p-1 relative z-10"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav className="lg:hidden bg-[#0B1220] text-white px-4 py-3 space-y-1.5 z-40 border-b border-white/10">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  active ? "bg-[#2563EB] text-white" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <Link href="/projects" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-semibold text-slate-300">
              🏗 Projects Hub
            </Link>
            <Link href="/quotations" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-semibold text-slate-300">
              📄 Quotations
            </Link>
            <Link href="/contracts" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-semibold text-slate-300">
              ⚖️ Contracts
            </Link>
            <Link href="/payments" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-semibold text-slate-300">
              💳 Payments
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-white/5 rounded-xl flex items-center gap-2"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
