/**
 * Auth helpers for the Neirah Customer Portal demo switcher.
 *
 * All pages should use these functions instead of reading env vars directly
 * at module level, so that the demo customer switcher (stored in localStorage)
 * takes effect across every API call.
 *
 * Customer mapping:
 *   Apex Construction Services
 *     userId:    d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c
 *     projectId: 2e79e9a8-1c38-4e71-b506-3232ab8d6ed4
 *
 *   Skyline Developers PLC
 *     userId:    a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
 *     projectId: 8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b
 */

const SKYLINE_USER_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
const SKYLINE_PROJECT_ID = "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b";

const DEFAULT_USER_ID =
  process.env.NEXT_PUBLIC_USER_ID ?? "d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c";
const DEFAULT_PROJECT_ID =
  process.env.NEXT_PUBLIC_PROJECT_ID ?? "2e79e9a8-1c38-4e71-b506-3232ab8d6ed4";

/**
 * Returns the active user ID.
 * Reads from localStorage (demo switcher) when available, falls back to env var.
 * Safe to call on the server (returns the env-var default).
 */
export function getActiveUserId(): string {
  if (typeof window === "undefined") return DEFAULT_USER_ID;
  const stored = localStorage.getItem("neirah_customer_user_id");
  if (!stored) return DEFAULT_USER_ID;
  // Auto-correct stale legacy demo key ID
  if (stored === "a1b2c3d4-1234-5678-abcd-ef1234567890") {
    localStorage.setItem("neirah_customer_user_id", SKYLINE_USER_ID);
    return SKYLINE_USER_ID;
  }
  return stored;
}

/**
 * Returns the active project ID that corresponds to the active user.
 * Reads from localStorage (demo switcher) when available.
 * Safe to call on the server (returns the env-var default).
 */
export function getActiveProjectId(): string {
  if (typeof window === "undefined") return DEFAULT_PROJECT_ID;
  const userId = localStorage.getItem("neirah_customer_user_id");
  if (userId === SKYLINE_USER_ID) return SKYLINE_PROJECT_ID;
  return DEFAULT_PROJECT_ID;
}

/**
 * Returns the standard auth headers for API requests.
 */
export function getAuthHeaders(): { "x-user-id": string } {
  return { "x-user-id": getActiveUserId() };
}

/**
 * Returns the base API URL dynamically matching the current hostname.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3001";
}
