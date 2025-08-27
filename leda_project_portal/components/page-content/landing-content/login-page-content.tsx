"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import React from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
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
                    <Input placeholder="Enter your email or username" {...field} />
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
                    <PasswordInput placeholder="Enter your password" {...field} />
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
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}