"use client";

import React, { useState, useCallback, useMemo } from "react";
import { KeyRound, Users, Shield, X } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import UserSelector from "@/components/ui/user-selector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { userRoute } from "@/lib/apiRoutes";
import { fetchWithSession } from "@/lib/getData";
// Email validation regex used by batch account creation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MenuItemDialog({
  title,
  Icon,
}: {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <SidebarMenuItem>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <SidebarMenuButton asChild>
            <button type="button">
              <Icon />
              <span>{title}</span>
            </button>
          </SidebarMenuButton>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </AlertDialogHeader>
          {/* Intentionally no content for now */}
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-100 border-gray-300 text-gray-700">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}

export default function NavUserManagement() {
  return (
    <>
      <ForcePasswordResetMenuItem />
  <BatchAccountCreationMenuItem />
      <MenuItemDialog title="Role Management" Icon={Shield} />
    </>
  );
}

type MinimalUser = { username: string; email: string };

function ForcePasswordResetMenuItem() {
  const [selectedUsers, setSelectedUsers] = useState<MinimalUser[]>([]);
  const selectedEmails = useMemo(() => selectedUsers.map((u) => u.email), [selectedUsers]);
  const handleUsersChange = useCallback((next: MinimalUser[]) => {
    setSelectedUsers((prev) => {
      // If emails and usernames are identical, skip; otherwise accept update
      if (prev.length === next.length) {
        const prevMap = new Map(prev.map((u) => [u.email, u.username] as const));
        const same = next.every((u) => prevMap.get(u.email) === u.username);
        if (same) return prev;
      }
      return next;
    });
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedUsers.length === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const emails = selectedUsers.map((u) => u.email);
      const res = await fetchWithSession(userRoute, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, mustResetPassword: true }),
      });
      if (!res.ok) {
        let message = "Failed to update users";
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {}
        throw new Error(message);
      }
      // Clear on success
      setSelectedUsers([]);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const removeUser = (email: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.email !== email));
  };
  const handleSelectedEmailsChange = useCallback((emails: string[]) => {
    // Rebuild selectedUsers from currently known ones where possible; keep username when matching
    setSelectedUsers((prev) => {
      const prevByEmail = new Map(prev.map((u) => [u.email, u] as const));
      const next = emails.map((email) => prevByEmail.get(email) || { email, username: email });
      return next;
    });
  }, []);

  return (
    <SidebarMenuItem>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <SidebarMenuButton asChild>
            <button type="button">
              <KeyRound />
              <span>Force Password Reset</span>
            </button>
          </SidebarMenuButton>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Force Password Reset</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3 py-1">
            <div>
              <UserSelector
                onUsersChange={handleUsersChange}
                placeholder="Select users to force reset..."
                selectedEmails={selectedEmails}
                onSelectedEmailsChange={handleSelectedEmailsChange}
              />
            </div>

      <div className="max-h-60 overflow-auto rounded-lg border border-gray-200 bg-gray-50/60 shadow-sm">
              {selectedUsers.length === 0 ? (
        <div className="py-6 px-4 text-sm text-gray-500 text-center">No users selected.</div>
              ) : (
        <ul className="divide-y divide-gray-200">
                  {selectedUsers.map((user) => (
          <li key={user.email} className="group flex items-center justify-between gap-2 px-3 py-2 hover:bg-white transition-colors">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{user.username}</div>
                        {user.username?.trim().toLowerCase() !== user.email?.trim().toLowerCase() && (
                          <div className="truncate text-xs text-gray-500">{user.email}</div>
                        )}
                      </div>
                      <Button
                        type="button"
                        aria-label={`Remove ${user.email}`}
                        className="invisible group-hover:visible text-red-600 hover:text-red-700"
                        onClick={() => removeUser(user.email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {submitError && (
              <div className="text-sm text-red-600 px-1">{submitError}</div>
            )}
            
          </div>

          <AlertDialogFooter>
            <div className="flex justify-between w-full">
                <AlertDialogCancel className="hover:bg-gray-100 border-gray-300 text-gray-700">Close</AlertDialogCancel>
                {selectedUsers.length > 0 && (
                <div className="flex justify-end">
                    <Button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                    {submitting ? "Submitting..." : "Submit"}
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

function BatchAccountCreationMenuItem() {
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
      // POST to ot-email endpoint to generate JWT tokens for each email
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
          // Send invite email with sign-up link using token and email
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

      if (failures) {
        setSubmitError(`${failures} failed. Check console for details.`);
        // eslint-disable-next-line no-console
        console.error("Batch account creation errors:", results.filter((r) => r.status === "rejected"));
      }
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
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Batch Account Creation</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50/60 shadow-sm placeholder-gray-200"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  onBlur={onInputBlur}
                  placeholder="Enter email and press Enter. Paste multiple with commas or spaces."
                />
                <Button type="button" variant="outline"  className="hover:bg-gray-100 border-gray-300 text-gray-700" onClick={() => setEmails([])} disabled={!emails.length}>
                  Clear All
                </Button>
              </div>
              <div className="text-xs text-gray-500 px-1">Press Enter or comma to add. Invalid or duplicate emails are ignored.</div>
            </div>

      <div className="max-h-60 overflow-auto rounded-lg border border-gray-200 bg-gray-50/60 shadow-sm">
              {emails.length === 0 ? (
        <div className="py-6 px-4 text-sm text-gray-500 text-center">No emails added.</div>
              ) : (
        <ul className="divide-y divide-gray-200">
                  {emails.map((email) => (
          <li key={email} className="group flex items-center justify-between gap-2 px-3 py-2 hover:bg-white transition-colors">
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
              <AlertDialogCancel className="hover:bg-gray-100 border-gray-300 text-gray-700">Close</AlertDialogCancel>
              {emails.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="hover:bg-gray-100 border-gray-300 text-gray-700"
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
