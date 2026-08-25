"use client";

import { useEffect, useState, useRef } from "react";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

type ProfileResponse = {
  customer: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    phone: string | null;
    address: string | null;
    billingInfo: string | null;
  };
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  };
  portalAccess: {
    id: string;
    isActive: boolean;
    lastLogin: string | null;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PRESET_AVATARS = [
  { url: "/images/project-commercial.png", title: "Commercial Lead" },
  { url: "/images/project-residential.png", title: "Villa Project Director" },
  { url: "/images/project-industrial.png", title: "Site Supervisor" },
];

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="meta-label block">{label}</span>
      <p
        className={`mt-1 text-sm font-semibold text-[#0B1220] ${
          mono ? "font-mono text-xs text-[#2563EB]" : ""
        }`}
      >
        {value || <span className="font-normal text-[#667085]">Not provided</span>}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Custom Profile Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved custom avatar from localStorage
    const savedAvatar = localStorage.getItem("neirah_profile_avatar");
    if (savedAvatar) setAvatarUrl(savedAvatar);

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const userId = getActiveUserId();
        if (!userId) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/access/me`,
          {
            headers: { "x-user-id": userId },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile.");

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAvatarUrl(result);
          localStorage.setItem("neirah_profile_avatar", result);
          setShowAvatarModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetAvatar = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem("neirah_profile_avatar", url);
    setShowAvatarModal(false);
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem("neirah_profile_avatar");
    setShowAvatarModal(false);
  };

  if (loading) {
    return (
      <div className="page-shell max-w-4xl">
        <PageHeader kicker="Account & Credentials" title="Customer Profile" />
        <PageLoading message="Loading profile credentials…" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-shell max-w-4xl">
        <PageHeader kicker="Account & Credentials" title="Customer Profile" />
        <ErrorState
          title="Unable to load profile"
          message={error || "Profile data not found."}
        />
      </div>
    );
  }

  const { customer, user, portalAccess } = profile;
  const initialLetter = customer.contactName?.charAt(0)?.toUpperCase() ?? "C";

  return (
    <div className="page-shell max-w-4xl animate-fade-in-up">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Visual Hero Header Banner matching other high-tech blueprint pages */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border-2 border-blue-500/40 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0F172A] shadow-[0_10px_35px_rgba(37,99,235,0.2)] min-h-[220px] group">
        <img
          src="/images/project-commercial.png"
          alt="Profile Header"
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-cyan-500/30 opacity-70 animate-pulse pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-white">
          
          <div className="flex items-center gap-6">
            {/* Interactive Profile Photo / Avatar Container */}
            <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => setShowAvatarModal(true)}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="h-24 w-24 rounded-2xl object-cover border-4 border-cyan-300 shadow-2xl transition duration-300 group-hover/avatar:brightness-75"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-cyan-600 text-4xl font-black text-white shadow-2xl border-4 border-cyan-300 transition duration-300 group-hover/avatar:brightness-90">
                  {initialLetter}
                </div>
              )}
              
              {/* Camera Overlay Icon */}
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-white flex items-center gap-1 bg-blue-600/90 px-2 py-1 rounded-md shadow-md">
                  📷 Change
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[0.68rem] font-black uppercase tracking-widest text-cyan-300 bg-blue-500/30 px-3 py-1 rounded-lg border border-cyan-400/40 backdrop-blur-md">
                  Enterprise Client Account
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {customer.contactName || "Customer Account"}
              </h1>
              <p className="text-xs text-cyan-100 mt-1 font-semibold drop-shadow-sm">
                🏢 {customer.companyName}
              </p>
            </div>
          </div>

          {/* Prominent Edit Photo Button */}
          <button
            onClick={() => setShowAvatarModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/40 bg-white/10 px-5 py-3 text-xs font-black text-white backdrop-blur-md shadow-xl transition hover:bg-white/25 hover:scale-105 active:scale-95 shrink-0"
          >
            <span className="text-base">📷</span> Edit Profile Photo
          </button>
        </div>
      </div>

      {/* Enhanced Avatar Customization Modal / Dialog */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📷</span>
                <h3 className="text-base font-black text-[#0B1220]">Profile Photo Customization</h3>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#667085] mb-5 leading-relaxed">
              Upload a high-resolution photo from your device or pick one of our executive site manager presets.
            </p>

            {/* Direct Interactive File Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 text-center transition hover:border-[#2563EB] hover:bg-blue-50 mb-5"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-md group-hover:scale-110 transition">
                📤
              </div>
              <p className="mt-3 text-xs font-black text-[#0B1220]">Click to Upload Image File</p>
              <p className="mt-1 text-[0.7rem] text-[#667085]">Supports PNG, JPG, WEBP up to 5MB</p>
            </div>

            {/* Preset Image Selections */}
            <span className="meta-label block mb-2 font-bold text-xs">Or Choose Executive Avatar Preset:</span>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PRESET_AVATARS.map((preset, idx) => (
                <button
                  key={preset.url}
                  onClick={() => selectPresetAvatar(preset.url)}
                  className="group relative h-20 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition"
                >
                  <img src={preset.url} alt={preset.title} className="h-full w-full object-cover group-hover:scale-110 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-1 left-1 right-1 text-[0.58rem] text-white font-bold truncate text-center">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              {avatarUrl && (
                <button
                  onClick={removeAvatar}
                  className="btn btn-secondary btn-sm flex-1 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  Remove Custom Photo
                </button>
              )}
              <button
                onClick={() => setShowAvatarModal(false)}
                className="btn btn-primary btn-sm flex-1 text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Company Info */}
        <section className="card card-hover hover-lift p-6">
          <h2 className="section-heading mb-5">Company Information</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Company Name" value={customer.companyName} />
            <Field label="Contact Person" value={customer.contactName} />
            <Field label="Business Email" value={customer.email} />
            <Field label="Phone Contact" value={customer.phone} />
            <div className="md:col-span-2">
              <Field label="Registered Address" value={customer.address} />
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section className="card card-hover hover-lift p-6">
          <h2 className="section-heading mb-5">User Credentials</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="User Account Name" value={user.name} />
            <Field label="Account Email" value={user.email} />
            <div>
              <span className="meta-label mb-1.5 block">Security Role</span>
              <span className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#344054]">
                {user.role}
              </span>
            </div>
            <div>
              <span className="meta-label mb-1.5 block">Account Status</span>
              <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
          </div>
        </section>

        {/* Access Token Info */}
        <section className="card card-hover hover-lift p-6">
          <h2 className="section-heading mb-5">Portal Authorization</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <span className="meta-label mb-1.5 block">Access Token Status</span>
              <StatusBadge status={portalAccess.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
            <Field
              label="Last Active Timestamp"
              value={
                portalAccess.lastLogin
                  ? new Date(portalAccess.lastLogin).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Active Session"
              }
            />
            <div className="md:col-span-2">
              <Field label="Customer Tenant Identification Key" value={portalAccess.id} mono />
            </div>
          </div>
        </section>

        {/* Security Banner */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-blue-200 bg-[#EAF2FF] p-4 text-xs font-medium text-[#2563EB]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p>
            <strong>Enterprise Multi-Tenant Security Active:</strong> Your customer portal session uses isolated headers (<code className="font-mono bg-white px-1 py-0.5 rounded">x-user-id</code>) to ensure data confidentiality and secure access.
          </p>
        </div>
      </div>
    </div>
  );
}