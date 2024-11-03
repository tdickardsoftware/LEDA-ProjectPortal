"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Define types for the nested structure
type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[]; // Recursive type definition for nested items
};

export function NavMain({ items }: { items: NavItem[] }) {
  // Use NavItem[] as the type for menuItems parameter
  const renderMenuItems = (menuItems: NavItem[]) => {
    return menuItems.map((item: NavItem) => (
      <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={item.title}>
            <Link href={item.url}>
              {item.icon && <item.icon />}
              <div>
                {item.title}
              </div>
            </Link>
          </SidebarMenuButton>
          {item.items?.length ? (
            <>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {renderMenuItems(item.items)}
                </SidebarMenuSub>
              </CollapsibleContent>
            </>
          ) : null}
        </SidebarMenuItem>
      </Collapsible>
    ));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin Tools</SidebarGroupLabel>
      <SidebarMenu>{renderMenuItems(items)}</SidebarMenu>
    </SidebarGroup>
  );
}
