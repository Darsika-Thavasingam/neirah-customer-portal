'use client';

import { useEffect, useState } from 'react';

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

const USER_ID =
  process.env.NEXT_PUBLIC_USER_ID ||
  '09e6e881-dcbb-42b9-ae4f-e62a0f2e598c';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE_URL}/api/v1/customer-portal/dashboard`,
          {
            headers: {
              'x-user-id': USER_ID,
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
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">
            Loading notifications...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Notifications
            </h1>

            <p className="mt-1 text-gray-600">
              Stay updated with your project and account activity.
            </p>
          </div>

          <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            {unreadCount} unread
          </div>
        </div>

        {/* Empty state */}
        {notifications.length === 0 ? (
          <section className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">🔔</div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No notifications
            </h2>

            <p className="mt-2 text-gray-500">
              You don't have any notifications at the moment.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
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
      className={`rounded-xl border p-5 shadow-sm ${
        notification.isRead
          ? 'border-gray-200 bg-white'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            notification.isRead
              ? 'bg-gray-100'
              : 'bg-blue-100'
          }`}
        >
          🔔
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                {notification.title}
              </h2>

              <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {notification.type}
              </span>
            </div>

            {!notification.isRead && (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
                New
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {notification.message}
          </p>

          <p className="mt-3 text-xs text-gray-400">
            {new Date(
              notification.createdAt,
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}