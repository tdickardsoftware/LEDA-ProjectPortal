"use client";

import React from "react";
import { KeyRound, Users, Shield } from "lucide-react";
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
      <MenuItemDialog title="Force Password Reset" Icon={KeyRound} />
      <MenuItemDialog title="Batch Account Creation" Icon={Users} />
      <MenuItemDialog title="Role Management" Icon={Shield} />
    </>
  );
}
