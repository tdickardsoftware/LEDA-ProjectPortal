"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
// Email validation regex used by batch account creation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// removed unused MenuItemDialog

export default function NavUserManagement() {
  return (
    <>
      <ForcePasswordResetMenuItem />
  <BatchAccountCreationMenuItem />
  <RoleManagementMenuItem />
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

type RoleKey = "Developer" | "Office Admin" | "User";
type RoleRecord = { username: string; role: RoleKey };

function RoleManagementMenuItem() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Record<RoleKey, string[]>>({ Developer: [], "Office Admin": [], User: [] });
  const [updating, setUpdating] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<RoleKey | null>(null);
  const [search, setSearch] = useState<Record<RoleKey, string>>({ Developer: "", "Office Admin": "", User: "" });
  const [selected, setSelected] = useState<Record<RoleKey, Set<string>>>(
    { Developer: new Set(), "Office Admin": new Set(), User: new Set() }
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithSession(`${userRoute}/updateRole`, { method: "GET" });
      if (!res.ok) {
        let message = "Failed to load roles";
        try { const data = await res.json(); message = data?.error || data?.message || message; } catch {}
        throw new Error(message);
      }
      const data: RoleRecord[] = await res.json();
      const grouped: Record<RoleKey, string[]> = { Developer: [], "Office Admin": [], User: [] };
      for (const r of data) {
        if (r.role === "Developer") grouped.Developer.push(r.username);
        else if (r.role === "Office Admin") grouped["Office Admin"].push(r.username);
        else grouped.User.push(r.username);
      }
      // Sort names for consistency
      grouped.Developer.sort((a,b)=>a.localeCompare(b));
      grouped["Office Admin"].sort((a,b)=>a.localeCompare(b));
      grouped.User.sort((a,b)=>a.localeCompare(b));
      setRoles(grouped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const updateRoleForUser = useCallback(async (username: string, role: RoleKey) => {
    setUpdating(username);
    try {
      const res = await fetchWithSession(`${userRoute}/updateRole`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role }),
      });
      if (!res.ok) {
        let message = "Failed to update role";
        try { const data = await res.json(); message = data?.error || data?.message || message; } catch {}
        throw new Error(message);
      }
      // Reload lists
      await load();
      // Clear selection of this username from any role to avoid stale selection markers
      setSelected((prev) => {
        const next: Record<RoleKey, Set<string>> = {
          Developer: new Set(prev.Developer),
          "Office Admin": new Set(prev["Office Admin"]),
          User: new Set(prev.User),
        };
        (Object.keys(next) as RoleKey[]).forEach((rk) => next[rk].delete(username));
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setUpdating(null);
    }
  }, [load]);

  // Drag-and-drop helpers
  const handleDragStart = useCallback(
    (fromRole: RoleKey, username: string) => (e: React.DragEvent<HTMLElement>) => {
      try {
        // If the dragged row is selected along with others in the same group, drag them all
        const sel = selected[fromRole];
        const usernames = sel.size > 0 && sel.has(username) ? Array.from(sel) : [username];
        e.dataTransfer.setData("application/json", JSON.stringify({ fromRole, usernames }));
      } catch {
        e.dataTransfer.setData("text/plain", `${fromRole}|${username}`);
      }
      e.dataTransfer.effectAllowed = "move";
    },
    [selected]
  );

  const parseDragData = (e: React.DragEvent) => {
    const json = e.dataTransfer.getData("application/json");
    if (json) {
      try {
        return JSON.parse(json) as { fromRole: RoleKey; usernames?: string[]; username?: string };
      } catch {}
    }
    const txt = e.dataTransfer.getData("text/plain");
    if (txt && txt.includes("|")) {
      const [fromRole, username] = txt.split("|");
      return { fromRole: fromRole as RoleKey, username };
    }
    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent, overRole: RoleKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(overRole);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(null), []);

  const handleDrop = useCallback(
    (toRole: RoleKey) => async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(null);
      const data = parseDragData(e);
      if (!data) return;
      const { fromRole } = data;
      const list = data.usernames ?? (data.username ? [data.username] : []);
      if (!list.length || fromRole === toRole) return;

      // optimistic update
      const prev = roles;
      const next: Record<RoleKey, string[]> = {
        Developer: [...prev.Developer],
        "Office Admin": [...prev["Office Admin"]],
        User: [...prev.User],
      };
      (Object.keys(next) as RoleKey[]).forEach((rk) => {
        next[rk] = next[rk].filter((u) => !list.includes(u));
      });
      next[toRole].push(...list);
      next[toRole].sort((a, b) => a.localeCompare(b));
      setRoles(next);
      // update selection: remove moved from all roles and clear selection in fromRole
      setSelected((prevSel) => {
        const updated: Record<RoleKey, Set<string>> = {
          Developer: new Set(prevSel.Developer),
          "Office Admin": new Set(prevSel["Office Admin"]),
          User: new Set(prevSel.User),
        };
        (Object.keys(updated) as RoleKey[]).forEach((rk) => {
          list.forEach((u) => updated[rk].delete(u));
        });
        return updated;
      });

      try {
        // persist each
        const results = await Promise.allSettled(
          list.map((u) =>
            fetchWithSession(`${userRoute}/updateRole`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: u, role: toRole }),
            })
          )
        );
        const failures = results.filter((r) => r.status === "fulfilled" && !(r as PromiseFulfilledResult<Response>).value.ok).length +
                         results.filter((r) => r.status === "rejected").length;
        if (failures) {
          setError(`${failures} update(s) failed. Refreshing…`);
          await load();
        }
      } catch {
        setRoles(prev);
      }
    },
  [roles, load]
  );

  return (
    <SidebarMenuItem>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <SidebarMenuButton asChild>
            <button type="button">
              <Shield />
              <span>Role Management</span>
            </button>
          </SidebarMenuButton>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Role Management</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3 py-1">
            {error && <div className="text-sm text-red-600 px-1">{error}</div>}
            <div className="rounded-lg border border-gray-200 bg-gray-50/60 shadow-sm">
              <Accordion type="multiple" className="divide-y divide-gray-200">
                <AccordionItem value="dev">
                  <AccordionTrigger
                    onDragOver={(e) => handleDragOver(e, "Developer")}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop("Developer")}
                    className={dragOver === "Developer" ? "ring-1 ring-blue-400 rounded-md" : undefined}
                  >
                    Developer ({roles.Developer.length})
                  </AccordionTrigger>
                  <AccordionContent
                    onDragOver={(e) => handleDragOver(e, "Developer")}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop("Developer")}
                    className={dragOver === "Developer" ? "ring-1 ring-blue-400 rounded-md" : undefined}
                  >
                    {loading ? (
                      <div className="py-3 px-4 text-sm text-gray-500">Loading…</div>
                    ) : (
                      <div className="px-3 pb-2">
                        <Input
                          value={search.Developer}
                          onChange={(e) => setSearch((s) => ({ ...s, Developer: e.target.value }))}
                          placeholder="Search users…"
                          className="max-w-sm"
                        />
                      </div>
                    )}
                    {!loading && (
                      (() => {
                        const filtered = roles.Developer.filter((u) => u.toLowerCase().includes(search.Developer.toLowerCase()));
                        if (filtered.length === 0) {
                          return <div className="py-3 px-4 text-sm text-gray-500">No users.</div>;
                        }
                        return (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10">Select</TableHead>
                                <TableHead className="w-full">User</TableHead>
                                <TableHead className="w-36">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filtered.map((u) => (
                                <TableRow
                                  key={`dev-${u}`}
                                  draggable={updating !== u}
                                  onDragStart={handleDragStart("Developer", u)}
                                  className="cursor-move"
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selected.Developer.has(u)}
                                      onCheckedChange={(checked) =>
                                        setSelected((prev) => ({
                                          ...prev,
                                          Developer: new Set(
                                            (() => {
                                              const s = new Set(prev.Developer);
                                              const isChecked = checked === true;
                                              if (isChecked) s.add(u);
                                              else s.delete(u);
                                              return s;
                                            })()
                                          ),
                                        }))
                                      }
                                      aria-label={`Select ${u}`}
                                    />
                                  </TableCell>
                                  <TableCell className="truncate">{u}</TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-7 px-2" disabled={updating === u}>
                                          {updating === u ? "Updating…" : "Change role"}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuItem disabled>Current: Developer</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateRoleForUser(u, "Office Admin")}>Set to Office Admin</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateRoleForUser(u, "User")}>Set to User</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        );
                      })()
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin">
                  <AccordionTrigger
                    onDragOver={(e) => handleDragOver(e, "Office Admin")}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop("Office Admin")}
                    className={dragOver === "Office Admin" ? "ring-1 ring-blue-400 rounded-md" : undefined}
                  >
                    Office Admin ({roles["Office Admin"].length})
                  </AccordionTrigger>
                  <AccordionContent
                    onDragOver={(e) => handleDragOver(e, "Office Admin")}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop("Office Admin")}
                    className={dragOver === "Office Admin" ? "ring-1 ring-blue-400 rounded-md" : undefined}
                  >
                    {loading ? (
                      <div className="py-3 px-4 text-sm text-gray-500">Loading…</div>
                    ) : (
                      <div className="px-3 pb-2">
                        <Input
                          value={search["Office Admin"]}
                          onChange={(e) => setSearch((s) => ({ ...s, ["Office Admin"]: e.target.value }))}
                          placeholder="Search users…"
                          className="max-w-sm"
                        />
                      </div>
                    )}
                    {!loading && (
                      (() => {
                        const filtered = roles["Office Admin"].filter((u) => u.toLowerCase().includes(search["Office Admin"].toLowerCase()));
                        if (filtered.length === 0) {
                          return <div className="py-3 px-4 text-sm text-gray-500">No users.</div>;
                        }
                        return (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10">Select</TableHead>
                                <TableHead className="w-full">User</TableHead>
                                <TableHead className="w-36">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filtered.map((u) => (
                                <TableRow
                                  key={`admin-${u}`}
                                  draggable={updating !== u}
                                  onDragStart={handleDragStart("Office Admin", u)}
                                  className="cursor-move"
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selected["Office Admin"].has(u)}
                                      onCheckedChange={(checked) =>
                                        setSelected((prev) => ({
                                          ...prev,
                                          ["Office Admin"]: new Set(
                                            (() => {
                                              const s = new Set(prev["Office Admin"]);
                                              const isChecked = checked === true;
                                              if (isChecked) s.add(u);
                                              else s.delete(u);
                                              return s;
                                            })()
                                          ),
                                        }))
                                      }
                                      aria-label={`Select ${u}`}
                                    />
                                  </TableCell>
                                  <TableCell className="truncate">{u}</TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-7 px-2" disabled={updating === u}>
                                          {updating === u ? "Updating…" : "Change role"}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuItem disabled>Current: Office Admin</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateRoleForUser(u, "Developer")}>Set to Developer</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateRoleForUser(u, "User")}>Set to User</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        );
                      })()
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="user">
                  <AccordionTrigger
                    onDragOver={(e) => handleDragOver(e, "User")}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop("User")}
                    className={dragOver === "User" ? "ring-1 ring-blue-400 rounded-md" : undefined}
                  >
                    User ({roles.User.length})
                  </AccordionTrigger>
                  <AccordionContent
                    onDragOver={(e) => handleDragOver(e, "User")}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop("User")}
                    className={dragOver === "User" ? "ring-1 ring-blue-400 rounded-md" : undefined}
                  >
                    {loading ? (
                      <div className="py-3 px-4 text-sm text-gray-500">Loading…</div>
                    ) : (
                      <div className="px-3 pb-2">
                        <Input
                          value={search.User}
                          onChange={(e) => setSearch((s) => ({ ...s, User: e.target.value }))}
                          placeholder="Search users…"
                          className="max-w-sm"
                        />
                      </div>
                    )}
                    {!loading && (
                      (() => {
                        const filtered = roles.User.filter((u) => u.toLowerCase().includes(search.User.toLowerCase()));
                        if (filtered.length === 0) {
                          return <div className="py-3 px-4 text-sm text-gray-500">No users.</div>;
                        }
                        return (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10">Select</TableHead>
                                <TableHead className="w-full">User</TableHead>
                                <TableHead className="w-36">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filtered.map((u) => (
                                <TableRow
                                  key={`user-${u}`}
                                  draggable={updating !== u}
                                  onDragStart={handleDragStart("User", u)}
                                  className="cursor-move"
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selected.User.has(u)}
                                      onCheckedChange={(checked) =>
                                        setSelected((prev) => ({
                                          ...prev,
                                          User: new Set(
                                            (() => {
                                              const s = new Set(prev.User);
                                              const isChecked = checked === true;
                                              if (isChecked) s.add(u);
                                              else s.delete(u);
                                              return s;
                                            })()
                                          ),
                                        }))
                                      }
                                      aria-label={`Select ${u}`}
                                    />
                                  </TableCell>
                                  <TableCell className="truncate">{u}</TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-7 px-2" disabled={updating === u}>
                                          {updating === u ? "Updating…" : "Change role"}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuItem onClick={() => updateRoleForUser(u, "Developer")}>Set to Developer</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateRoleForUser(u, "Office Admin")}>Set to Office Admin</DropdownMenuItem>
                                        <DropdownMenuItem disabled>Current: User</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        );
                      })()
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-100 border-gray-300 text-gray-700">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}
