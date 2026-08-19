'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { getActiveUserId } from '../lib/auth';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type DashboardResponse = {
  notifications: Notification[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError('');

        if (!getActiveUserId()) {
          throw new Error('Customer portal user is not configured.');
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/dashboard`,
          {
            headers: {
              'x-user-id': getActiveUserId(),
            },
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data: DashboardResponse = await response.json();

        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load notifications.');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-8 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <p className="text-sm text-[#667085]">Loading notifications...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-sm font-semibold text-[#B42318]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
              Alerts & Updates
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B1220] sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-[#667085]">
              Stay updated with your project and account activity.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-[#EAF2FF] px-4 py-2 text-xs font-bold text-[#2563EB]">
            <span>{unreadCount}</span> unread
          </div>
        </div>

        {/* Empty state */}
        {notifications.length === 0 ? (
          <section className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-12 text-center shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-2xl text-[#2563EB]">
              🔔
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#0B1220]">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              You don't have any notifications at the moment.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-[0_10px_30px_rgba(37,99,235,0.08)] transition ${
        notification.isRead
          ? 'border-[rgba(15,23,42,0.08)] bg-white'
          : 'border-blue-200 bg-[#EAF2FF]/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            notification.isRead
              ? 'border-[rgba(15,23,42,0.08)] bg-[#F7F9FC] text-[#667085]'
              : 'border-blue-200 bg-[#EAF2FF] text-[#2563EB]'
          }`}
        >
          🔔
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#0B1220]">
                {notification.title}
              </h2>

              <StatusBadge status={notification.type} />
            </div>

            {!notification.isRead && (
              <span className="inline-flex w-fit items-center rounded-full bg-[#2563EB] px-2.5 py-0.5 text-[0.7rem] font-bold text-white uppercase tracking-wider">
                New
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#475467]">
            {notification.message}
          </p>

          <p className="mt-3 text-xs font-medium text-[#667085]">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}