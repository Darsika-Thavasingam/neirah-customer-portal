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
      {/* ── DESKTOP SIDEBAR (BORDERLESS DYNAMIC ANIMATED CONSTRUCTION OS) ── */}
      <aside className="hidden lg:flex w-68 h-screen sticky top-0 bg-[#0B1220] text-white shadow-[8px_0_32px_rgba(0,0,0,0.18)] flex-col justify-between p-6 shrink-0 z-40 overflow-hidden relative group">
        {/* Animated Background Architectural Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/images/project-highrise.png"
            alt=""
            className="absolute -right-20 -bottom-10 w-96 h-auto object-cover opacity-15 mix-blend-overlay filter blur-[1px] transition-all duration-1000 group-hover:scale-110 group-hover:opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220] via-[#0B1220]/90 to-[#0B1220]" />
          {/* Subtle Ambient Moving Glow Orb */}
          <div className="absolute top-1/4 -left-12 w-40 h-40 bg-[#2563EB]/20 rounded-full filter blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10">
          {/* Brand Logo & Live OS Badge */}
          <Link href="/" className="flex items-center gap-3.5 mb-8 group/brand">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 backdrop-blur-md p-1.5 shadow-inner border border-white/10 transition-transform group-hover/brand:scale-105">
              <img
                src="/neirah-logo.png?v=3"
                alt="Neirah"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="block text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-[#38BDF8]">
                  Customer OS
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-base font-black text-white tracking-tight leading-none">Neirah Portal</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-2" aria-label="Sidebar navigation">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.label === "Dashboard" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={active ? "text-cyan-300" : "text-slate-400"}>
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    )}
                    {item.label === "Updates" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={active ? "text-cyan-300" : "text-slate-400"}>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    )}
                    {item.label === "Profile" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={active ? "text-cyan-300" : "text-slate-400"}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                    <span>{item.label}</span>
                  </div>

                  {item.label === "Updates" && (
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Shortcuts */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-slate-400 block mb-3 px-2">Quick Modules</span>
            <div className="space-y-1">
              <Link href="/projects" className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition">
                <span>🏗</span> All Projects
              </Link>
              <Link href="/quotations" className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition">
                <span>📄</span> Quotations
              </Link>
              <Link href="/contracts" className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition">
                <span>⚖️</span> Contracts
              </Link>
              <Link href="/payments" className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition">
                <span>💳</span> Payments & Invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Profile Summary & Live System Status */}
        <div className="relative z-10 space-y-3">
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 transition-all hover:bg-white/10">
            <Link href="/profile" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-[#2563EB] text-white font-black text-sm shadow-md">
                C
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-extrabold text-white group-hover:text-cyan-300 truncate transition-colors">
                  My Customer Account
                </p>
                <p className="text-[0.65rem] text-slate-400 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Active Client Session
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-between text-[0.62rem] font-bold text-slate-400 px-2">
            <span>System: <strong className="text-emerald-400">Online</strong></span>
            <span className="text-slate-300 font-mono">v3.4 Production</span>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR & DRAWER ── */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0B1220] text-white shadow-md px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 p-1">
            <img
              src="/neirah-logo.png?v=3"
              alt="Neirah"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xs font-black tracking-wider text-white uppercase">Neirah OS</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 hover:text-white p-1"
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
        <nav className="lg:hidden bg-[#0B1220] text-white shadow-xl px-4 py-3 space-y-1.5 z-40 border-b border-white/10">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  active ? "bg-[#2563EB] text-white" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <Link href="/projects" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-300">
              🏗 Projects Hub
            </Link>
            <Link href="/quotations" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-300">
              📄 Quotations
            </Link>
            <Link href="/contracts" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-300">
              ⚖️ Contracts
            </Link>
            <Link href="/payments" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-300">
              💳 Payments
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
