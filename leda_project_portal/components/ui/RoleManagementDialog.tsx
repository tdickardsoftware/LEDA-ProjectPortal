/**
 * RoleManagementDialog component
 *
 * Admin dialog accessible from the sidebar for managing user roles
 * (Developer / Office Admin / User).  Displays users grouped by role in an
 * accordion; supports drag-and-drop between role columns, multi-select
 * checkboxes, inline search filtering, and individual role updates via PATCH
 * to the user API.  Data is loaded on dialog open and refreshed after each
 * role change.
 */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchWithSession } from "@/lib/getData";
import { userRoute } from "@/lib/apiRoutes";

export type RoleKey = "Developer" | "Office Admin" | "User";
export type RoleRecord = { username: string; role: RoleKey };

export default function RoleManagementDialog() {
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
      await load();
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

  const handleDragStart = useCallback(
    (fromRole: RoleKey, username: string) => (e: React.DragEvent<HTMLElement>) => {
      try {
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

  const renderTable = (role: RoleKey) => {
    const filtered = roles[role].filter((u) => u.toLowerCase().includes(search[role].toLowerCase()));
    if (loading) return <div className="py-3 px-4 text-sm text-muted-foreground">Loading…</div>;
    return (
      <>
        <div className="px-3 pb-2">
          <Input
            value={search[role]}
            onChange={(e) => setSearch((s) => ({ ...s, [role]: e.target.value }))}
            placeholder="Search users…"
            className="max-w-sm"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="py-3 px-4 text-sm text-muted-foreground">No users.</div>
        ) : (
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
                  key={`${role}-${u}`}
                  draggable={updating !== u}
                  onDragStart={handleDragStart(role, u)}
                  className="cursor-move"
                >
                  <TableCell>
                    <Checkbox
                      checked={selected[role].has(u)}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => ({
                          ...prev,
                          [role]: new Set(
                            (() => {
                              const s = new Set(prev[role]);
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
                      <DropdownMenuContent align="end" className="bg-background">
                        {role !== "Developer" ? (
                          <DropdownMenuItem onClick={() => updateRoleForUser(u, "Developer")}>
                            Set to Developer
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>Current: Developer</DropdownMenuItem>
                        )}
                        {role !== "Office Admin" ? (
                          <DropdownMenuItem onClick={() => updateRoleForUser(u, "Office Admin")}>
                            Set to Office Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>Current: Office Admin</DropdownMenuItem>
                        )}
                        {role !== "User" ? (
                          <DropdownMenuItem onClick={() => updateRoleForUser(u, "User")}>
                            Set to User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>Current: User</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </>
    );
  };

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
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Role Management</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-3 py-1">
            {error && <div className="text-sm text-red-600 px-1">{error}</div>}
            <div className="rounded-lg border border-border bg-muted/60 shadow-sm">
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
                    {renderTable("Developer")}
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
                    {renderTable("Office Admin")}
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
                    {renderTable("User")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-muted border-border text-foreground">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}
