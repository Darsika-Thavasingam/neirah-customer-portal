/**
 * Auth helpers for the Neirah Customer Portal authentication & session management.
 *
 * All pages use these functions to get active session credentials and API base URL.
 *
 * Customer keys in database:
 *   Apex Construction Services:
 *     userId: d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c
 *     projectId: 2e79e9a8-1c38-4e71-b506-3232ab8d6ed4
 *
 *   Skyline Developers PLC:
 *     userId: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
 *     projectId: 8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b
 */

export const SKYLINE_USER_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
export const SKYLINE_PROJECT_ID = "8f1e2d3c-4b5a-6e7f-8a9b-0c1d2e3f4a5b";

export const APEX_USER_ID = "d4e2a1b9-8c7f-4e3a-9b1c-5d6e7f8a9b0c";
export const APEX_PROJECT_ID = "2e79e9a8-1c38-4e71-b506-3232ab8d6ed4";

/**
 * Returns the active user ID from localStorage.
 * Returns empty string if the user is not authenticated.
 */
export function getActiveUserId(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("neirah_customer_user_id");
  if (!stored) return "";

  // Auto-correct legacy demo key ID if stored
  if (stored === "a1b2c3d4-1234-5678-abcd-ef1234567890") {
    localStorage.setItem("neirah_customer_user_id", SKYLINE_USER_ID);
    return SKYLINE_USER_ID;
  }
  return stored.trim();
}

/**
 * Checks whether a valid user session is active.
 */
export function isAuthenticated(): boolean {
  return typeof window !== "undefined" && getActiveUserId().length > 0;
}

/**
 * Clears user session and redirects to login page.
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("neirah_customer_user_id");
    window.dispatchEvent(new Event("neirah:userswitch"));
    window.location.href = "/login";
  }
}

/**
 * Returns the active project ID for the logged in user.
 */
export function getActiveProjectId(): string {
  if (typeof window === "undefined") return "";
  const userId = getActiveUserId();
  if (userId === SKYLINE_USER_ID) return SKYLINE_PROJECT_ID;
  if (userId === APEX_USER_ID) return APEX_PROJECT_ID;
  return "";
}

/**
 * Returns the standard auth headers for API requests.
 */
export function getAuthHeaders(): Record<string, string> {
  const userId = getActiveUserId();
  return userId ? { "x-user-id": userId } : {};
}

/**
 * Returns the base API URL dynamically matching the current origin.
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}
