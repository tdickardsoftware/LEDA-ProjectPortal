"use client";

/**
 * LoginPageContent
 *
 * Authentication form that accepts either an email address or a username.
 * Branching logic calls `authClient.signIn.email` or `authClient.signIn.username`
 * depending on the format of the identifier supplied.
 *
 * After a successful sign-in the component:
 *   - Invalidates any cached session in React Query.
 *   - Sets or clears the `mustResetPassword` cookie based on the user record.
 *   - Redirects to `/login/change-required` when a password reset is required,
 *     otherwise to `/Portal`.
 *
 * Generic error messages (defaulting to a password error) are used to avoid
 * revealing whether a given account exists.
 */

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/skeleton";

// Accepts either a valid email or a username (alphanumeric, 3-32 chars)
const loginSchema = z.object({
  emailOrUsername: z.string()
    .min(3, { message: "Enter a valid email or username" })
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^[a-zA-Z0-9_]{3,32}$/.test(val),
      { message: "Enter a valid email or username" }
    ),
  password: z.string()
});

export default function LoginPageContent() {

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });
  // Respect DISABLE_SIGN_UP (prefer public var); treat only 'true' as enabled flag
  const disableSignUp =
    process.env.NEXT_PUBLIC_DISABLE_SIGN_UP === 'true' ||
    process.env.DISABLE_SIGN_UP === 'true';

  // --- Helpers ---

  /** Normalises error objects from authClient responses into a message + optional HTTP status. */
  function getErrorInfo(err: unknown): { message: string; status?: number } {
    if (err instanceof Error) {
      const e1 = err as unknown as Record<string, unknown>;
      const status = typeof e1["status"] === "number" ? (e1["status"] as number) : undefined;
      return { message: err.message || "", status };
    }
    if (typeof err === "string") {
      return { message: err };
    }
    if (err && typeof err === "object") {
      const rec = err as Record<string, unknown>;
      const message = typeof rec.message === "string" ? rec.message : JSON.stringify(rec);
      const status = typeof rec.status === "number" ? rec.status : undefined;
      return { message, status };
    }
    return { message: "" };
  }

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const { emailOrUsername, password } = values;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);
    setIsLoading(true);

    const setInvalidPassword = () =>
      form.setError("password", { message: "Invalid password" });
    const setInvalidIdentifier = () =>
      form.setError("emailOrUsername", { message: `Incorrect ${isEmail ? "email" : "username"}` });

    try {
      if (isEmail) {
        await authClient.signIn.email(
          { email: emailOrUsername, password, callbackURL: `/Portal` },
          {
            onSuccess: async () => {
              // Ensure any previously cached session is replaced.
              queryClient.removeQueries({ queryKey: ["auth", "session"] });
              const session = await authClient.getSession();
              const u = (session?.data && typeof session.data === 'object' ? (session.data as Record<string, unknown>).user : undefined) as Record<string, unknown> | undefined;
              const mustReset = Boolean(u && typeof u === 'object' && 'mustResetPassword' in u ? u.mustResetPassword : false);
              try {
                const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
                if (mustReset) {
                  document.cookie = `mustResetPassword=1; Path=/; SameSite=Lax${secure}`;
                } else {
                  document.cookie = `mustResetPassword=; Path=/; SameSite=Lax${secure}; Max-Age=0`;
                }
              } catch { /* no-op */ }
              window.location.href = mustReset ? "/login/change-required" : "/Portal";
            },
            onError: (error: unknown) => {
              setIsLoading(false);
              const { message, status } = getErrorInfo(error);
              const msg = message.toLowerCase();
              if (msg.includes("too many") || status === 429) {
                form.setError("emailOrUsername", { message: "Too many attempts. Try again later." });
                return;
              }
              if (msg.includes("password")) {
                setInvalidPassword();
              } else if (msg.includes("user") || msg.includes("email")) {
                setInvalidIdentifier();
              } else {
                // Default to password error to avoid leaking which field is wrong
                setInvalidPassword();
              }
            },
          }
        );
      } else {
        await authClient.signIn.username(
          { username: emailOrUsername, password, callbackURL: `/Portal` },
          {
            onSuccess: async () => {
              // Ensure any previously cached session is replaced.
              queryClient.removeQueries({ queryKey: ["auth", "session"] });
              const session = await authClient.getSession();
              const u = (session?.data && typeof session.data === 'object' ? (session.data as Record<string, unknown>).user : undefined) as Record<string, unknown> | undefined;
              const mustReset = Boolean(u && typeof u === 'object' && 'mustResetPassword' in u ? u.mustResetPassword : false);
              try {
                const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
                if (mustReset) {
                  document.cookie = `mustResetPassword=1; Path=/; SameSite=Lax${secure}`;
                } else {
                  document.cookie = `mustResetPassword=; Path=/; SameSite=Lax${secure}; Max-Age=0`;
                }
              } catch { /* no-op */ }
              window.location.href = mustReset ? "/login/change-required" : "/Portal";
            },
            onError: (error: unknown) => {
              setIsLoading(false);
              const { message, status } = getErrorInfo(error);
              const msg = message.toLowerCase();
              if (msg.includes("too many") || status === 429) {
                form.setError("emailOrUsername", { message: "Too many attempts. Try again later." });
                return;
              }
              if (msg.includes("password")) {
                setInvalidPassword();
              } else if (msg.includes("user") || msg.includes("username")) {
                setInvalidIdentifier();
              } else {
                setInvalidPassword();
              }
            },
          }
        );
      }
    } catch (error) {
      setIsLoading(false);
      const { message, status } = getErrorInfo(error);
      const msg = message.toLowerCase();
      if (msg.includes("too many") || status === 429) {
        form.setError("emailOrUsername", { message: "Too many attempts. Try again later." });
      } else if (msg.includes("password")) {
        setInvalidPassword();
      } else if (msg.includes("user") || msg.includes("email") || msg.includes("username")) {
        setInvalidIdentifier();
      } else {
        setInvalidPassword();
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <div className="w-full max-w-md p-8 bg-background rounded-lg shadow-lg border border-border">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailOrUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email or username" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Enter your password" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between mb-2">
              {!disableSignUp && (
                <Link href="/sign-up" className="text-sm text-blue-600 hover:underline">
                  Create Account
                </Link>
              )}
              <Link href="/login/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}