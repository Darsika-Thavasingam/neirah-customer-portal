"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "../lib/auth";

const SLIDES = [
  {
    src: "/images/project-highrise.png",
    title: "Your projects,\nalways in view.",
    sub: "Real-time progress. Clear milestones. Transparent billing.",
    tag: "High-Rise Development",
  },
  {
    src: "/images/project-commercial.png",
    title: "Commercial\nexcellence delivered.",
    sub: "Track every phase from foundation to handover in one place.",
    tag: "Commercial Construction",
  },
  {
    src: "/images/project-facade.png",
    title: "Precision & quality\nat scale.",
    sub: "Direct access to engineering updates and site photo logs.",
    tag: "Facade & Structural Work",
  },
  {
    src: "/images/project-villa.png",
    title: "Luxury residential\nproject tracking.",
    sub: "Quotations, contracts, and payment history under one portal.",
    tag: "Luxury Residential",
  },
  {
    src: "/images/project-interior.png",
    title: "Interior fit-out\n& completion.",
    sub: "Stay informed on final inspections and document handovers.",
    tag: "Interior Fit-Out",
  },
  {
    src: "/images/project-industrial.png",
    title: "Industrial & infrastructure\nsolutions.",
    sub: "Full supply-chain visibility and milestone accountability.",
    tag: "Industrial Projects",
  },
];

export default function CustomerLoginPage() {
  const router = useRouter();
  const [accessId, setAccessId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Auto-advance slideshow
  const advance = useCallback((dir: 1 | -1 = 1) => {
    if (transitioning) return;
    setTransitioning(true);
    setPrev(current);
    setCurrent((c) => (c + dir + SLIDES.length) % SLIDES.length);
    setTimeout(() => {
      setPrev(null);
      setTransitioning(false);
    }, 800);
  }, [current, transitioning]);

  useEffect(() => {
    const id = setInterval(() => advance(1), 5500);
    return () => clearInterval(id);
  }, [advance]);

  const executeLogin = async (keyToUse: string) => {
    const key = keyToUse.trim();
    if (!key) { setError("Please enter your portal access key."); return; }
    setLoading(true);
    setError("");
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/v1/customer-portal/access/me`, {
        headers: { "x-user-id": key },
        cache: "no-store",
      }).catch(() => {
        throw new Error(`Unable to connect to Neirah API server (${apiBase}). Please verify backend service is running.`);
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Invalid or inactive portal access key. Please contact your project manager.");
      }

      localStorage.setItem("neirah_customer_user_id", key);
      window.dispatchEvent(new Event("neirah:userswitch"));
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(accessId);
  };

  const slide = SLIDES[current];
  const prevSlide = prev !== null ? SLIDES[prev] : null;

  return (
    <div className="login-root">
      <style>{`
        .login-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Inter', sans-serif;
          background: #0B1220;
        }

        /* ──────────── LEFT PANEL ──────────── */
        .login-panel {
          width: 440px;
          flex-shrink: 0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 2.75rem;
          position: relative;
          z-index: 10;
          box-shadow: 8px 0 40px rgba(15,23,42,0.14);
        }

        /* ──────────── RIGHT SLIDESHOW ──────────── */
        .login-stage {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #0B1220;
        }

        /* Individual slide image */
        .slide-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .slide-img.entering {
          opacity: 0.6;
          animation: kenBurns 6s ease-out forwards;
        }
        .slide-img.exiting {
          opacity: 0;
          transform: scale(1.06);
        }

        @keyframes kenBurns {
          from { transform: scale(1.06) translateX(-1%); opacity: 0; }
          to   { transform: scale(1.0)  translateX(0);   opacity: 0.62; }
        }

        /* Overlay gradients */
        .slide-gradient-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.35) 55%, rgba(11,18,32,0.10) 100%);
          pointer-events: none;
          z-index: 2;
        }
        .slide-gradient-left {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(11,18,32,0.45) 0%, transparent 50%);
          pointer-events: none;
          z-index: 2;
        }
        .slide-gradient-blue {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(37,99,235,0.18) 0%, transparent 55%);
          pointer-events: none;
          z-index: 2;
        }

        /* Caption */
        .slide-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2.5rem 3rem;
          color: white;
          z-index: 3;
        }
        .slide-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.55);
          margin-bottom: 0.75rem;
        }
        .slide-tag::before {
          content: '';
          display: block;
          width: 20px;
          height: 1.5px;
          background: rgba(37,99,235,0.7);
          border-radius: 2px;
        }
        .slide-title {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.035em;
          white-space: pre-line;
          margin: 0 0 0.6rem;
          animation: fadeUp 0.7s ease forwards;
        }
        .slide-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.52);
          line-height: 1.6;
          margin: 0 0 1.5rem;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Dot indicators */
        .slide-dots {
          display: flex;
          gap: 0.4rem;
          align-items: center;
        }
        .slide-dot {
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.35s ease;
        }
        .slide-dot.active {
          width: 28px;
          background: #2563EB;
        }
        .slide-dot:not(.active) {
          width: 10px;
        }
        .slide-dot:not(.active):hover {
          background: rgba(255,255,255,0.6);
        }

        /* Nav arrows */
        .slide-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 4;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
        }
        .slide-nav:hover { background: rgba(37,99,235,0.45); }
        .slide-nav.left { left: 1.25rem; }
        .slide-nav.right { right: 1.25rem; }

        /* Slide counter pill top-right */
        .slide-counter {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 4;
          background: rgba(11,18,32,0.55);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: 100px;
          backdrop-filter: blur(6px);
          letter-spacing: 0.05em;
        }

        /* ── Form elements ── */
        .login-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #344054;
          margin-bottom: 0.35rem;
        }
        .login-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.875rem;
          color: #0B1220;
          background: #F8FAFC;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: #2563EB;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .login-btn {
          width: 100%;
          padding: 0.9rem 1.5rem;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.32);
        }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Demo switcher pills */
        .demo-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
        .demo-pill {
          font-size: 0.65rem; font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          border: 1.5px solid #E2E8F0;
          background: #F8FAFC;
          color: #344054;
          cursor: pointer;
          transition: all 0.15s;
        }
        .demo-pill:hover, .demo-pill.active {
          border-color: #2563EB;
          background: #EFF6FF;
          color: #2563EB;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-panel { width: 100%; box-shadow: none; }
          .login-stage { display: none; }
        }
      `}</style>

      {/* ── LEFT: Form ── */}
      <div className="login-panel">
        <div style={{ width: "100%", maxWidth: "340px" }}>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
            <img src="/neirah-logo.png?v=3" alt="Neirah"
              style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 10, background: "#0B1220", padding: 6 }} />
            <div>
              <span style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "#2563EB" }}>
                Customer Portal
              </span>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0B1220", margin: 0, letterSpacing: "-0.02em" }}>
                Neirah Construction OS
              </p>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0B1220", letterSpacing: "-0.03em", lineHeight: 1.2, margin: "0 0 0.5rem" }}>
              Access your portal
            </h1>
            <p style={{ fontSize: "0.82rem", color: "#667085", lineHeight: 1.65, margin: 0 }}>
              Enter your portal access key to view project progress, invoices, documents and updates.
            </p>
          </div>

          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#ECFDF5", borderRadius: "10px", padding: "0.6rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#067647", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#067647" }}>Portal system online — secure connection active</span>
          </div>

          <form id="portal-login-form" onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="accessId" className="login-label">Portal Access Key</label>
              <input
                id="accessId"
                type="text"
                required
                value={accessId}
                onChange={(e) => setAccessId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="login-input"
                style={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                autoComplete="off"
                spellCheck={false}
                suppressHydrationWarning
              />
              <span style={{ fontSize: "0.68rem", color: "#98A2B3", marginTop: "0.3rem", display: "block" }}>
                Provided by your Neirah project coordinator
              </span>
            </div>
          </form>

          <div style={{ marginTop: "0.75rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#667085", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick Demo:</span>
            <div className="demo-pills">
              {[
                { label: "Customer A (Apex)", id: "d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c" },
                { label: "Customer B (Skyline)", id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" },
              ].map(d => (
                <button
                  key={d.id}
                  type="button"
                  className={`demo-pill ${accessId === d.id ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAccessId(d.id);
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "0.5rem",
              background: "#FEF3F2", color: "#B42318",
              borderRadius: "10px", padding: "0.75rem 1rem",
              fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.5,
              marginTop: "1.25rem",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            form="portal-login-form"
            disabled={loading}
            className="login-btn"
            style={{ marginTop: "1.25rem" }}
          >
            {loading ? (
              <><div className="spinner" />Verifying access…</>
            ) : (
              <>Sign In to My Portal <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
            )}
          </button>

          {/* What you can access */}
          <div style={{ marginTop: "2rem", padding: "1rem", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#667085", marginBottom: "0.5rem" }}>Portal Access Includes</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
              {["Project Progress", "Milestone Tracking", "Invoices & Payments", "Project Documents", "Site Photo Gallery", "Project Updates"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.7rem", color: "#475467", fontWeight: 500 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#067647" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop: "1.5rem", fontSize: "0.72rem", color: "#98A2B3", textAlign: "center" }}>
            Need help?{" "}
            <span style={{ color: "#2563EB", fontWeight: 600, cursor: "pointer" }}>
              Contact your Neirah project manager
            </span>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Animated Slideshow ── */}
      <div className="login-stage" aria-hidden="true">

        {/* Slide counter */}
        <div className="slide-counter">{current + 1} / {SLIDES.length}</div>

        {/* Exiting slide */}
        {prevSlide && (
          <img key={`prev-${prev}`} src={prevSlide.src} alt="" className="slide-img exiting" />
        )}

        {/* Entering slide — Ken Burns pan */}
        <img key={`curr-${current}`} src={slide.src} alt="" className="slide-img entering" />

        {/* Gradient overlays */}
        <div className="slide-gradient-bottom" />
        <div className="slide-gradient-left" />
        <div className="slide-gradient-blue" />

        {/* Nav arrows */}
        <button className="slide-nav left" onClick={() => advance(-1)} aria-label="Previous">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="slide-nav right" onClick={() => advance(1)} aria-label="Next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Caption — animates per slide */}
        <div className="slide-caption">
          <p className="slide-tag">{slide.tag}</p>
          <h2 className="slide-title">{slide.title}</h2>
          <p className="slide-sub">{slide.sub}</p>

          {/* Dot indicators */}
          <div className="slide-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`slide-dot ${i === current ? "active" : ""}`}
                onClick={() => { setPrev(current); setCurrent(i); }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
