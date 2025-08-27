"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// removed Input in favor of PasswordInput
import PasswordInput from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import React from "react";
import { Check, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { fetchWithSession } from "@/lib/getData";

const resetSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must include a number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must include a special character" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";
  const router = useRouter();

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Live password requirement checks
  const passwordValue = form.watch("password");
  const confirmValue = form.watch("confirmPassword");
  const reqHasMin = (passwordValue?.length ?? 0) >= 8;
  const reqHasUpper = /[A-Z]/.test(passwordValue || "");
  const reqHasNumber = /[0-9]/.test(passwordValue || "");
  const reqHasSpecial = /[^A-Za-z0-9]/.test(passwordValue || "");
  const reqMatches = !!passwordValue && passwordValue === confirmValue;

  const Requirement = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center text-xs gap-2">
      {ok ? (
        <Check className="h-3.5 w-3.5 text-green-600" aria-hidden />
      ) : (
        <X className="h-3.5 w-3.5 text-gray-400" aria-hidden />
      )}
      <span className={ok ? "text-green-700" : "text-gray-600"}>{label}</span>
    </div>
  );

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    setError(null);
    setIsSubmitting(true);
    try {
      // 1) Try to clear mustResetPassword BEFORE changing password (while session is still valid)
      try {
        // Prefer email from query; otherwise try session user (if available)
        let targetEmail = email;
        if (!targetEmail) {
          try {
            const s = await authClient.getSession();
            targetEmail = (s?.data?.user?.email as string | undefined) || "";
          } catch { /* no-op */ }
        }
        if (targetEmail) {
          await fetchWithSession("/api/user", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: [targetEmail], mustResetPassword: false }),
          });
        }
      } catch {
        // ignore; we'll still attempt the password change
      }

      // 2) Now change the password (this may revoke sessions)
      await authClient.resetPassword({ token, newPassword: values.password });

      // 3) Clear cookie client-side to stop middleware enforcement immediately
      try {
        const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `mustResetPassword=; Path=/; SameSite=Lax${secure}; Max-Age=0`;
      } catch { /* swallow */ }
      // Ensure no active session so /login isn’t redirected to /Portal by middleware
      try { await authClient.signOut(); } catch { /* ignore */ }
      setSubmitted(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500); // short delay for user feedback
    } catch {
      setError("Unable to reset password. The link may be invalid or expired.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-6">Invalid Link</h2>
          <p className="mb-4 text-gray-700">
            The password reset link is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-6">Password Reset Successful</h2>
          <p className="mb-4 text-gray-700">
            Your password has been reset. You may now log in with your new password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {error && (
          <div className="mb-4 text-red-600 text-center text-sm font-medium">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Enter new password" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                  <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-4">
                    <Requirement ok={reqHasMin} label="At least 8 characters" />
                    <Requirement ok={reqHasUpper} label="Uppercase letter" />
                    <Requirement ok={reqHasNumber} label="Number" />
                    <Requirement ok={reqHasSpecial} label="Special character" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Re-enter new password" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                  <div className="mt-2">
                    <Requirement ok={reqMatches} label="Passwords match" />
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
