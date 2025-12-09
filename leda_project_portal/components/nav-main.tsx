//
// Use Client
//
"use client";

//
// Imports
//
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
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname
import { useUserAbilities } from "@/lib/use-user-abilities";
import React from "react";
import { Can } from "@casl/react";
import NavUserManagement from "@/components/nav-user-management";
import { Spinner } from "./ui/skeleton";

//
// Define types for the nested structure
//
type NavItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: NavItem[]; // Recursive type definition for nested items
};

//
// Return all of the items for the main nav object
//
export function NavMain({ items }: { items: NavItem[] }) {
	const { ability, loading } = useUserAbilities();
	
	const pathname = usePathname(); // Get the current pathname
	
	if (loading) {
		return <Spinner />; // Or your loading component
	}
	// If no items are available (e.g., user cannot manage any section), render nothing
	if (!items || items.length === 0) {
		return null;
	}

	// Use NavItem[] as the type for menuItems parameter
	const renderMenuItems = (menuItems: NavItem[]) => {
		return menuItems.map((item: NavItem) => {
			const currentPage = pathname === item.url; // Check if item is active

			return (
				<Collapsible
					key={item.title}
					asChild
					defaultOpen={item.isActive}
				>
					<SidebarMenuItem>
						<SidebarMenuButton asChild tooltip={item.title}>
							<Link
								href={item.url}
								className={
									currentPage ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
								}
							>
								{item.icon && <item.icon />}
								<div>{item.title}</div>
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
									<SidebarMenuSub className="text-nowrap w-fit">
										{renderMenuItems(item.items)}
									</SidebarMenuSub>
								</CollapsibleContent>
							</>
						) : null}
					</SidebarMenuItem>
				</Collapsible>
			);
		});
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Admin Tools</SidebarGroupLabel>
			<SidebarMenu>{renderMenuItems(items)}</SidebarMenu>
			<Can I="manage" a="Users" ability={ability}>
				<SidebarGroupLabel>User Management</SidebarGroupLabel>
				<SidebarMenu>
					<NavUserManagement />
				</SidebarMenu>
			</Can>
		</SidebarGroup>
	);
}
