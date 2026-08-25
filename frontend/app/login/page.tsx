"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [accessId, setAccessId] = useState(
    process.env.NEXT_PUBLIC_USER_ID || "d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c"
  );
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${apiBase}/api/v1/customer-portal/access/me`, {
        headers: {
          "x-user-id": accessId,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          "Invalid or inactive customer portal access key. Please verify your account identity."
        );
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("neirah_customer_user_id", accessId);
        window.dispatchEvent(new Event("neirah:userswitch"));
      }

      // Direct redirection straight to Portfolio Command Center Dashboard
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Unable to verify customer access."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white shadow-xl grid md:grid-cols-12 animate-fade-in-up">
        {/* Left Side: Brand Visual Hero Panel */}
        <div className="md:col-span-5 bg-[#0B1220] p-8 text-white flex flex-col justify-between relative overflow-hidden min-h-[440px]">
          {/* Construction Imagery Background */}
          <img
            src="/images/project-commercial.png"
            alt="Neirah Construction OS"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          {/* Dark Navy Glass Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/80 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0B1220]/90 border border-blue-500/30 p-1.5 shadow-md flex items-center justify-center backdrop-blur-md">
                <img
                  src="/neirah-logo.png?v=3"
                  alt="Neirah OS"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#2563EB]">
                  Neirah Construction OS
                </span>
                <h2 className="text-sm font-bold text-white leading-none mt-0.5">
                  Customer Portal
                </h2>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <h3 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Construction Command Center
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct single sign-on access to your active construction projects, real-time site milestones, commercial invoices, and project documentation.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 pt-6 border-t border-white/10 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant Enterprise Security Active</span>
            </div>
            <p className="text-[0.7rem] text-slate-500">
              © 2026 Neirah Construction OS. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Enterprise Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B1220]">
              Sign In to Customer Portal
            </h2>
            <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
              Enter your enterprise portal credentials to access your multi-project command center.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="accessId"
                className="block text-xs font-bold uppercase tracking-wider text-[#0B1220]"
              >
                Customer Access Key (UUID)
              </label>
              <input
                id="accessId"
                type="text"
                required
                value={accessId}
                onChange={(e) => setAccessId(e.target.value)}
                placeholder="e.g. d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c"
                className="form-input mt-2 font-mono text-xs p-3"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#0B1220]"
              >
                Security Passcode
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input mt-2 text-xs p-3"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-3.5 text-xs font-semibold text-[#B42318]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider mt-4 hover-lift"
            >
              {loading ? "Authenticating Account..." : "Log In to Construction Portal →"}
            </button>
          </form>

          <div className="mt-8 border-t border-[rgba(15,23,42,0.08)] pt-4 text-center">
            <p className="text-[0.7rem] text-[#667085]">
              Need technical support or access credentials? Contact Neirah OS Systems Administrator.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
