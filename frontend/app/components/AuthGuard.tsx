"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "../lib/auth";
import { PageLoading } from "./SkeletonLoader";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isUserAuthed = isAuthenticated();
      setAuthed(isUserAuthed);
      setChecking(false);

      // On protected routes (everything except /login), enforce authentication
      if (pathname !== "/login" && !isUserAuthed) {
        router.replace("/login");
      }
    };

    checkAuth();

    const handleUserSwitch = () => checkAuth();
    window.addEventListener("neirah:userswitch", handleUserSwitch);
    window.addEventListener("storage", handleUserSwitch);

    return () => {
      window.removeEventListener("neirah:userswitch", handleUserSwitch);
      window.removeEventListener("storage", handleUserSwitch);
    };
  }, [pathname, router]);

  // Public route: /login (Always allow visiting the login page)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Loading spinner while verifying initial authentication state
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4">
        <PageLoading message="Verifying portal session…" />
      </div>
    );
  }

  // If unauthenticated on a protected route, render redirect spinner
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4">
        <PageLoading message="Redirecting to sign-in page…" />
      </div>
    );
  }

  return <>{children}</>;
}
