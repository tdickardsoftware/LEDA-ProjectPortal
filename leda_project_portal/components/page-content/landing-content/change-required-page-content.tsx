"use client";

/**
 * ChangeRequiredPageContent
 *
 * Shown when an administrator has flagged the user's account with
 * `mustResetPassword`. Presents two options:
 *   1. Send a password-reset link to the user's current email address.
 *   2. Sign out immediately.
 *
 * The user's email is retrieved from the active Better-Auth session on mount.
 */

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function ChangeRequiredPageContent() {
  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    authClient.getSession().then((s) => {
      const e = s?.data?.user?.email || "";
      setEmail(e);
    }).catch(() => setEmail(""));
  }, []);

  const sendReset = async () => {
    if (!email) return;
    setSending(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/login/reset-password?email=${encodeURIComponent(email)}`;
      await authClient.requestPasswordReset({ email, redirectTo });
    } catch {
      setError("Failed to send reset link.");
    } finally {
      setSending(false);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
    } finally {
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      router.push("/login");
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <div className="w-full max-w-md p-8 bg-background rounded-lg shadow-lg border border-border text-center space-y-4">
        <h2 className="text-2xl font-bold">Password Update Required</h2>
        <p className="text-foreground">An administrator has requested that you update your password before continuing.</p>
        <div className="space-y-2">
          <Button onClick={sendReset} disabled={sending || !email} className="w-full">
            {sending ? "Sending..." : "Send Password Reset Link"}
          </Button>
          <Button variant="outline" onClick={signOut} className="w-full">
            Sign out
          </Button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
