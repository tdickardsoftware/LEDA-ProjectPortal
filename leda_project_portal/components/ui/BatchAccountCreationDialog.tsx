/**
 * BatchAccountCreationDialog component
 *
 * Admin dialog accessible from the sidebar for creating multiple portal
 * accounts at once by email.  Emails can be typed, pasted (space / comma /
 * semicolon delimited), or entered one-by-one.  Each unique, valid email is
 * collected into a chip list, then submitted in parallel via POST to the
 * one-time-email API endpoint.  Invalid emails are silently filtered out as
 * they are added.
 */
"use client";

import React, { useCallback, useState } from "react";
import { Users, X } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchWithSession } from "@/lib/getData";
import { userRoute } from "@/lib/apiRoutes";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BatchAccountCreationDialog() {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);
  const [, setSubmitInfo] = useState<string | null>(null);

  const normalizeEmail = (e: string) => e.trim().toLowerCase();

  const addEmails = useCallback((raw: string) => {
    const parts = raw
      .split(/[\s,;]+/)
      .map(normalizeEmail)
      .filter(Boolean);
    if (parts.length === 0) return;
    setEmails((prev) => {
      const set = new Set(prev);
      for (const p of parts) {
        if (emailRegex.test(p)) set.add(p);
      }
      return Array.from(set);
    });
  }, []);

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = (e.currentTarget.value || "").trim();
      if (value) addEmails(value);
      setInputValue("");
    }
  };

  const onInputBlur = () => {
    if (inputValue.trim()) {
      addEmails(inputValue);
      setInputValue("");
    }
  };

  const handleSubmit = async () => {
    if (!emails.length || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitInfo(null);
    try {
      const results = await Promise.allSettled(
        emails.map(async (email) => {
          const res = await fetchWithSession(`${userRoute}/ot-email?email=${encodeURIComponent(email)}`, {
            method: "POST",
          });
          if (!res.ok) {
            let message = `Failed for ${email}`;
            try { const data = await res.json(); message = data?.error || data?.message || message; } catch {}
            throw new Error(message);
          }
          const data = await res.json();
          await fetchWithSession(`/api/user/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token: data?.token })
          });
          return data;
        })
      );

      const successes = results.filter((r) => r.status === "fulfilled").length;
      const failures = results.filter((r) => r.status === "rejected").length;

      if (failures) setSubmitError(`${failures} failed. Check console for details.`);
      if (successes) setSubmitInfo(`${successes} token(s) created.`);
      if (successes && failures === 0) setEmails([]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Batch request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarMenuItem>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <SidebarMenuButton asChild>
            <button type="button">
              <Users />
              <span>Batch Account Creation</span>
            </button>
          </SidebarMenuButton>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Batch Account Creation</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1 rounded-lg border border-border bg-muted/60 shadow-sm placeholder-gray-200"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  onBlur={onInputBlur}
                  placeholder="Enter email and press Enter. Paste multiple with commas or spaces."
                />
                <Button type="button" variant="outline"  className="hover:bg-muted border-border text-foreground" onClick={() => setEmails([])} disabled={!emails.length}>
                  Clear All
                </Button>
              </div>
              <div className="text-xs text-muted-foreground px-1">Press Enter or comma to add. Invalid or duplicate emails are ignored.</div>
            </div>

            <div className="max-h-60 overflow-auto rounded-lg border border-border bg-muted/60 shadow-sm">
              {emails.length === 0 ? (
                <div className="py-6 px-4 text-sm text-muted-foreground text-center">No emails added.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {emails.map((email) => (
                    <li key={email} className="group flex items-center justify-between gap-2 px-3 py-2 hover:bg-background transition-colors">
                      <div className="truncate text-sm font-medium">{email}</div>
                      <Button
                        type="button"
                        aria-label={`Remove ${email}`}
                        className="invisible group-hover:visible text-red-600 hover:text-red-700"
                        onClick={() => removeEmail(email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <div className="flex justify-between w-full">
              <AlertDialogCancel className="hover:bg-muted border-border text-foreground">Close</AlertDialogCancel>
              {emails.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="hover:bg-muted border-border text-foreground"
                  >
                    {submitting ? "Submitting..." : "Create Accounts"}
                  </Button>
                </div>
              )}
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}
