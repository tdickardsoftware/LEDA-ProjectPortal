"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { userRoute } from "@/lib/apiRoutes";
import { useQuery } from "@tanstack/react-query";

type MinimalUser = {
  username: string;
  email: string;
};

interface UserSelectorProps {
  onUsersChange: (selectedUsers: MinimalUser[]) => void;
  disabled?: boolean;
  placeholder?: string;
  // Optional controlled selection (list of selected emails)
  selectedEmails?: string[];
  onSelectedEmailsChange?: (emails: string[]) => void;
}

export default function UserSelector({
  onUsersChange,
  disabled = false,
  placeholder = "Select users...",
  selectedEmails,
  onSelectedEmailsChange,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]); // store selected by email

  const { data: users = [], isLoading: loading } = useQuery<MinimalUser[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(userRoute, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      return (data as MinimalUser[]) || [];
    },
  });

  const lastEmittedRef = useRef<string>("");
  useEffect(() => {
    // Build the selected users in current data order to keep deterministic string
    const selectedUsers = users.filter((u) => selected.includes(u.email));
    const key = selectedUsers.map((u) => u.email).join(",");
    if (key !== lastEmittedRef.current) {
      lastEmittedRef.current = key;
      onUsersChange(selectedUsers);
    }
    // Depend on both selected and users, but only emit when the derived emails actually change
  }, [selected, users, onUsersChange]);

  // Sync internal state with controlled prop when provided
  useEffect(() => {
    if (!selectedEmails) return;
    setSelected((prev) => {
      const sameLength = prev.length === selectedEmails.length;
      const same = sameLength && prev.every((e) => selectedEmails.includes(e));
      return same ? prev : [...selectedEmails];
    });
  }, [selectedEmails]);

  const toggleUser = (email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSelectedEmailsChange) {
      const next = selected.includes(email)
        ? selected.filter((x) => x !== email)
        : [...selected, email];
      onSelectedEmailsChange(next);
    } else {
      setSelected((prev) => (prev.includes(email) ? prev.filter((x) => x !== email) : [...prev, email]));
    }
  };

  const selectedText = selected.length > 0
    ? users
        .filter((u) => selected.includes(u.email))
        .map((u) => `${u.username} <${u.email}>`)
        .join(", ")
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between bg-white border-gray-200"
          disabled={disabled}
        >
          <span className="truncate">{selectedText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-white">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>{loading ? "Loading users..." : "No users found."}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {users.map((user) => (
                <CommandItem
                  key={user.email}
                  value={`${user.username} ${user.email}`}
                  className="flex items-center gap-2"
                  onSelect={() => toggleUser(user.email)}
                >
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                    <Checkbox
                      checked={selected.includes(user.email)}
                      className="mr-2"
                      onCheckedChange={() => toggleUser(user.email)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <span className="truncate">{user.username}</span>
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
