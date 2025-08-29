"use client";

import React from "react";
import ForcePasswordResetDialog from "@/components/ui/ForcePasswordResetDialog";
import BatchAccountCreationDialog from "@/components/ui/BatchAccountCreationDialog";
import RoleManagementDialog from "@/components/ui/RoleManagementDialog";

// removed unused MenuItemDialog

export default function NavUserManagement() {
  return (
    <>
      <ForcePasswordResetDialog />
      <BatchAccountCreationDialog />
      <RoleManagementDialog />
    </>
  );
}
