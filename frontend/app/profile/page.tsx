"use client";

import { useEffect, useState } from "react";
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
      <p className="meta-label">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold text-[#0B1220] ${
          mono ? "font-mono text-xs" : ""
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

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        if (!getActiveUserId()) {
          throw new Error("Customer portal user is not configured.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/access/me`,
          {
            headers: { "x-user-id": getActiveUserId() },
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

  if (loading) {
    return (
      <div className="page-shell" style={{ maxWidth: "56rem" }}>
        <PageHeader kicker="Account & Security" title="My Profile" />
        <PageLoading message="Loading profile…" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-shell" style={{ maxWidth: "56rem" }}>
        <PageHeader kicker="Account & Security" title="My Profile" />
        <ErrorState
          title="Unable to load profile"
          message={error || "Profile data not found."}
        />
      </div>
    );
  }

  const { customer, user, portalAccess } = profile;

  return (
    <div className="page-shell" style={{ maxWidth: "56rem" }}>
      {/* Avatar + heading */}
      <div className="mb-8 flex items-center gap-5">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)",
          }}
          aria-hidden="true"
        >
          {customer.contactName?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="page-kicker">Account & Security</p>
          <h1 className="page-title">{customer.contactName || "My Profile"}</h1>
          <p className="page-subtitle">{customer.companyName}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Company Information */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Company Information</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Company Name" value={customer.companyName} />
            <Field label="Contact Name" value={customer.contactName} />
            <Field label="Email" value={customer.email} />
            <Field label="Phone" value={customer.phone} />
            <div className="md:col-span-2">
              <Field label="Address" value={customer.address} />
            </div>
            {customer.billingInfo && (
              <div className="md:col-span-2">
                <Field label="Billing Information" value={customer.billingInfo} />
              </div>
            )}
          </div>
        </section>

        {/* Account Information */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Account Information</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="User Name" value={user.name} />
            <Field label="Account Email" value={user.email} />
            <div>
              <p className="meta-label mb-1.5">Role</p>
              <span className="rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#344054]">
                {user.role}
              </span>
            </div>
            <div>
              <p className="meta-label mb-1.5">Account Status</p>
              <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>
          </div>
        </section>

        {/* Portal Access */}
        <section className="card p-6">
          <h2 className="section-heading mb-5">Portal Access</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="meta-label mb-1.5">Portal Status</p>
              <StatusBadge
                status={portalAccess.isActive ? "ACTIVE" : "INACTIVE"}
              />
            </div>
            <Field
              label="Last Login"
              value={
                portalAccess.lastLogin
                  ? new Date(portalAccess.lastLogin).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not available"
              }
            />
            <div className="md:col-span-2">
              <Field label="Access ID" value={portalAccess.id} mono />
            </div>
          </div>
        </section>

        {/* Security note */}
        <div
          className="flex items-start gap-3 rounded-xl border px-4 py-3"
          style={{
            background: "var(--primary-soft)",
            borderColor: "rgba(37,99,235,0.15)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-xs font-medium text-[#2563EB]">
            This portal is secured with enterprise-grade multi-tenant isolation.
            Your data is only accessible with your unique customer access key.
          </p>
        </div>
      </div>
    </div>
  );
}