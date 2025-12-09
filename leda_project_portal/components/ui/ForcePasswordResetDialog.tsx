"use client";

import React, { useCallback, useMemo, useState } from "react";
import { KeyRound, X } from "lucide-react";
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
import UserSelector from "@/components/ui/user-selector";
import { Button } from "@/components/ui/button";
import { fetchWithSession } from "@/lib/getData";
import { userRoute } from "@/lib/apiRoutes";

export type MinimalUser = { username: string; email: string };

export default function ForcePasswordResetDialog() {
  const [selectedUsers, setSelectedUsers] = useState<MinimalUser[]>([]);
  const selectedEmails = useMemo(() => selectedUsers.map((u) => u.email), [selectedUsers]);
  const handleUsersChange = useCallback((next: MinimalUser[]) => {
    setSelectedUsers((prev) => {
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
        <AlertDialogContent className="bg-background">
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

            <div className="max-h-60 overflow-auto rounded-lg border border-border bg-muted/60 shadow-sm">
              {selectedUsers.length === 0 ? (
                <div className="py-6 px-4 text-sm text-muted-foreground text-center">No users selected.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {selectedUsers.map((user) => (
                    <li key={user.email} className="group flex items-center justify-between gap-2 px-3 py-2 hover:bg-background transition-colors">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{user.username}</div>
                        {user.username?.trim().toLowerCase() !== user.email?.trim().toLowerCase() && (
                          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
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
              <AlertDialogCancel className="hover:bg-muted border-border text-foreground">Close</AlertDialogCancel>
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
