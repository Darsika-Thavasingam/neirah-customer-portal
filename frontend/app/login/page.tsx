"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_USERS = [
  {
    id: "d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c",
    name: "Apex Construction Services",
    email: "portal@apexconstruction.lk",
    contact: "Darsika Thavasingam",
    role: "Verified Customer Access",
  },
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Skyline Developers PLC",
    email: "portal@skylinedev.lk",
    contact: "Kamal Perera",
    role: "Verified Customer Access",
  },
];

export default function CustomerLoginPage() {
  const router = useRouter();
  const [accessId, setAccessId] = useState(
    process.env.NEXT_PUBLIC_USER_ID || DEMO_USERS[0].id
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
          "Invalid or inactive customer portal access. Please verify your access credentials."
        );
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("neirah_customer_user_id", accessId);
        // Notify same-tab listeners (e.g. dashboard) to re-fetch with new identity
        window.dispatchEvent(new Event("neirah:userswitch"));
      }

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
    <main className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200/80 bg-[#0B1220] shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition hover:scale-105">
            <img
              src="/neirah-logo.png?v=3"
              alt="Neirah Construction OS Logo"
              className="h-full w-full object-contain p-1"
            />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-[#2563EB]">
            Neirah Tech Solution
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#0B1220] sm:text-3xl">
            Customer Access Portal
          </h1>
          <p className="mt-1.5 text-xs text-[#667085]">
            Secure self-service gateway for construction project clients
          </p>
        </div>

        {/* Login Form Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-8 shadow-[0_10px_30px_rgba(37,99,235,0.08)] sm:px-10">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="accessId"
                  className="block text-xs font-bold uppercase tracking-[0.08em] text-[#0B1220]"
                >
                  Customer Access Key / User ID
                </label>
                <div className="mt-1.5">
                  <input
                    id="accessId"
                    name="accessId"
                    type="text"
                    required
                    value={accessId}
                    onChange={(e) => setAccessId(e.target.value)}
                    placeholder="Enter User UUID or Select Demo Account"
                    className="block w-full rounded-xl border border-[rgba(15,23,42,0.14)] bg-[#F7F9FC] px-4 py-3 text-sm text-[#0B1220] font-mono transition focus:border-[#2563EB] focus:bg-white focus:outline-2 focus:outline-offset-2 focus:outline-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-[0.08em] text-[#0B1220]"
                >
                  Password / Security Token
                </label>
                <div className="mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-[rgba(15,23,42,0.14)] bg-[#F7F9FC] px-4 py-3 text-sm text-[#0B1220] transition focus:border-[#2563EB] focus:bg-white focus:outline-2 focus:outline-offset-2 focus:outline-[#2563EB]"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-3.5 text-xs font-semibold text-[#B42318]">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:opacity-50"
                >
                  {loading ? "Verifying Access..." : "Sign In to Portal"}
                </button>
              </div>
            </form>

            {/* Demo Account Quick Switcher */}
            <div className="mt-8 border-t border-[rgba(15,23,42,0.08)] pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#667085]">
                Quick Demo Customer Switcher
              </p>
              <div className="mt-3 space-y-2">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setAccessId(user.id)}
                    className={`w-full text-left rounded-xl border p-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                      accessId === user.id
                        ? "border-[#2563EB] bg-[#EAF2FF]"
                        : "border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B1220]">
                        {user.name}
                      </span>
                      {accessId === user.id && (
                        <span className="rounded-md bg-[#2563EB] px-1.5 py-0.5 text-[0.65rem] font-bold text-white uppercase">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[0.7rem] text-[#667085]">
                      {user.contact} · {user.email}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#667085]">
              Neirah Construction OS · Multi-Tenant Enterprise Security
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
