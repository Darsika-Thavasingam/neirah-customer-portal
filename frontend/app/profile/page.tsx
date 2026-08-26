"use client";

import { useEffect, useState, useRef } from "react";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { PageLoading } from "../components/SkeletonLoader";
import { ErrorState } from "../components/EmptyState";
import { getActiveUserId } from "../lib/auth";

type ProfileResponse = {
  customer: { id: string; companyName: string; contactName: string; email: string; phone: string | null; address: string | null; billingInfo: string | null };
  user: { id: string; email: string; name: string; role: string; isActive: boolean };
  portalAccess: { id: string; isActive: boolean; lastLogin: string | null };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const PRESET_AVATARS = [
  { url: "/images/project-commercial.png", title: "Commercial Lead" },
  { url: "/images/project-residential.png", title: "Project Director" },
  { url: "/images/project-industrial.png", title: "Site Supervisor" },
];

function InfoRow({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="py-3 px-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
      <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-[#0B1220] ${mono ? "font-mono text-xs text-[#2563EB] break-all" : ""}`}>
        {value || <span className="font-normal text-[#CBD5E1]">Not provided</span>}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("neirah_profile_avatar");
    if (saved) setAvatarUrl(saved);

    async function fetch_() {
      try {
        const uid = getActiveUserId();
        if (!uid) throw new Error("No user configured.");
        const res = await fetch(`${API_BASE_URL}/api/v1/customer-portal/access/me`, { headers: { "x-user-id": uid }, cache: "no-store" });
        if (!res.ok) throw new Error("Failed.");
        setProfile(await res.json());
      } catch (e: any) { setError(e.message || "Unable to load profile."); }
      finally { setLoading(false); }
    }
    fetch_();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const r = ev.target?.result as string;
        if (r) { setAvatarUrl(r); localStorage.setItem("neirah_profile_avatar", r); setShowAvatarModal(false); }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="page-shell max-w-4xl"><PageLoading message="Loading profile…" /></div>;
  if (error || !profile) return (
    <div className="page-shell max-w-4xl">
      <ErrorState title="Unable to load profile" message={error || "Profile data not found."} />
    </div>
  );

  const { customer, user, portalAccess } = profile;
  const initial = customer.contactName?.charAt(0)?.toUpperCase() ?? "C";

  return (
    <div className="page-shell max-w-4xl animate-fade-in-up">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

      {/* Hero Banner */}
      <PageHeader
        kicker="ENTERPRISE CLIENT"
        title={customer.contactName || "Account Profile"}
        subtitle={`🏢 ${customer.companyName} · Last login: Portal session active`}
        bgImage="/images/project-commercial.png"
        actions={
          <div className="flex items-center gap-4">
            <button onClick={() => setShowAvatarModal(true)} className="relative group/av shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover border-2 border-cyan-300 shadow-xl transition group-hover/av:brightness-75" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-cyan-500 text-2xl font-black text-white border-2 border-cyan-300 shadow-xl transition group-hover/av:brightness-75">
                  {initial}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/av:opacity-100 transition flex items-center justify-center">
                <span className="text-[0.55rem] font-black text-white bg-blue-600/80 px-1.5 py-0.5 rounded">📷 Edit</span>
              </div>
            </button>
            <button onClick={() => setShowAvatarModal(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/20 transition">
              📷 Change Photo
            </button>
          </div>
        }
      />

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#0B1220]">📷 Update Profile Photo</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 font-bold">✕</button>
            </div>
            <div onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-5 text-center hover:border-[#2563EB] hover:bg-blue-50 mb-4 transition">
              <div className="mx-auto mb-2 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">📤</div>
              <p className="text-xs font-black text-[#0B1220]">Click to Upload</p>
              <p className="text-[0.7rem] text-[#667085]">PNG, JPG, WEBP up to 5MB</p>
            </div>
            <p className="text-[0.7rem] font-bold text-[#667085] mb-2">Or select a preset:</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {PRESET_AVATARS.map((p) => (
                <button key={p.url} onClick={() => { setAvatarUrl(p.url); localStorage.setItem("neirah_profile_avatar", p.url); setShowAvatarModal(false); }}
                  className="relative h-20 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-[#2563EB] hover:shadow-md transition">
                  <img src={p.url} alt={p.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[0.55rem] font-bold text-white">{p.title}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              {avatarUrl && (
                <button onClick={() => { setAvatarUrl(null); localStorage.removeItem("neirah_profile_avatar"); setShowAvatarModal(false); }}
                  className="flex-1 text-xs font-bold py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition">
                  Remove Photo
                </button>
              )}
              <button onClick={() => setShowAvatarModal(false)} className="flex-1 text-xs font-bold py-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 transition">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 pt-6">
        {/* Company Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-sm">🏢</div>
            <h2 className="text-sm font-extrabold text-[#0B1220]">Company Information</h2>
          </div>
          <InfoRow label="Company Name" value={customer.companyName} />
          <InfoRow label="Contact Person" value={customer.contactName} />
          <InfoRow label="Business Email" value={customer.email} />
          <InfoRow label="Phone" value={customer.phone} />
          <InfoRow label="Address" value={customer.address} />
        </div>

        {/* Account Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-sm">👤</div>
              <h2 className="text-sm font-extrabold text-[#0B1220]">User Credentials</h2>
            </div>
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Account Email" value={user.email} />
            <div className="py-2.5 px-3">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] mb-1.5">Security Role</p>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#344054]">{user.role}</span>
            </div>
            <div className="py-2.5 px-3">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] mb-1.5">Account Status</p>
              <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-sm">🔐</div>
              <h2 className="text-sm font-extrabold text-[#0B1220]">Portal Authorization</h2>
            </div>
            <div className="py-2.5 px-3">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-[#98A2B3] mb-1.5">Access Status</p>
              <StatusBadge status={portalAccess.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
            <InfoRow label="Last Active" value={portalAccess.lastLogin ? new Date(portalAccess.lastLogin).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Active Session"} />
            <InfoRow label="Tenant Key" value={portalAccess.id} mono />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#EFF6FF] p-5 text-xs text-[#2563EB]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p><strong>Enterprise Security Active:</strong> Your session uses isolated <code className="font-mono bg-white px-1.5 py-0.5 rounded-md">x-user-id</code> headers for multi-tenant data confidentiality.</p>
      </div>
    </div>
  );
}