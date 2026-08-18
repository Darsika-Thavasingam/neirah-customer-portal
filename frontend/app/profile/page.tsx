'use client';

import { useEffect, useState } from 'react';

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

const USER_ID =
  process.env.NEXT_PUBLIC_USER_ID ||
  '09e6e881-dcbb-42b9-ae4f-e62a0f2e598c';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/access/me`,
          {
            headers: {
              'x-user-id': USER_ID,
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
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error || 'Profile not found.'}
          </div>
        </div>
      </main>
    );
  }

  const { customer, user, portalAccess } = profile;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="mt-1 text-gray-600">
            View your customer and portal account information.
          </p>
        </div>

        {/* Company Information */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
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
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileField label="User Name" value={user.name} />

            <ProfileField label="Account Email" value={user.email} />

            <ProfileField label="Role" value={user.role} />

            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                Account Status
              </p>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </section>

        {/* Portal Access */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Portal Access
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                Portal Status
              </p>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  portalAccess.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {portalAccess.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <ProfileField
              label="Last Login"
              value={
                portalAccess.lastLogin
                  ? new Date(
                      portalAccess.lastLogin,
                    ).toLocaleString()
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
      <p className="mb-1 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="text-base text-gray-900">
        {value || 'Not provided'}
      </p>
    </div>
  );
}