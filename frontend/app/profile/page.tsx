'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { getActiveUserId } from '../lib/auth';

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
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');

        if (!getActiveUserId()) {
          throw new Error('Customer portal user is not configured.');
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/access/me`,
          {
            headers: {
              'x-user-id': getActiveUserId(),
            },
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load your profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            {error || 'Profile not found.'}
          </div>
        </div>
      </main>
    );
  }

  const { customer, user, portalAccess } = profile;

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
            Account & Security
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-[#667085]">
            View your customer profile and portal account information.
          </p>
        </div>

        {/* Company Information */}
        <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <h2 className="mb-5 text-lg font-bold text-[#0B1220]">
            Company Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileField
              label="Company Name"
              value={customer.companyName}
            />

            <ProfileField
              label="Contact Name"
              value={customer.contactName}
            />

            <ProfileField
              label="Email"
              value={customer.email}
            />

            <ProfileField
              label="Phone"
              value={customer.phone}
            />

            <div className="md:col-span-2">
              <ProfileField
                label="Address"
                value={customer.address}
              />
            </div>

            <div className="md:col-span-2">
              <ProfileField
                label="Billing Information"
                value={customer.billingInfo}
              />
            </div>
          </div>
        </section>

        {/* Account Information */}
        <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <h2 className="mb-5 text-lg font-bold text-[#0B1220]">
            Account Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileField label="User Name" value={user.name} />

            <ProfileField label="Account Email" value={user.email} />

            <ProfileField label="Role" value={user.role} />

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#667085]">
                Account Status
              </p>

              <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
            </div>
          </div>
        </section>

        {/* Portal Access */}
        <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
          <h2 className="mb-5 text-lg font-bold text-[#0B1220]">
            Portal Access
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#667085]">
                Portal Status
              </p>

              <StatusBadge status={portalAccess.isActive ? 'ACTIVE' : 'INACTIVE'} />
            </div>

            <ProfileField
              label="Last Login"
              value={
                portalAccess.lastLogin
                  ? new Date(portalAccess.lastLogin).toLocaleString()
                  : 'Not available'
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#667085]">
        {label}
      </p>

      <p className="text-base font-semibold text-[#0B1220]">
        {value || 'Not provided'}
      </p>
    </div>
  );
}