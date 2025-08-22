//
// Use Client
//
"use client";
//
// Imports
//
import * as React from "react";
import { Book, FileText, Frame, LifeBuoy, Map, PieChart, Send, Wrench, ListCheck } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useUserAbilities } from "@/lib/use-user-abilities";
//
// Define data for sidenav bar
//
const data = {
	navMain: [
		{
			title: "Management",
			url: "/Portal/Management",
			icon: Book,
			items: [
				{
					title: "Places",
					url: "/Portal/Management/Places",
				},
				{
					title: "Players",
					url: "/Portal/Management/Players",
				},
				{
					title: "Teams",
					url: "/Portal/Management/Teams",
				},
			],
		},
		{
			title: "Maintenance",
			url: "/Portal/Maintenance",
			icon: Wrench,
			items: [
				{
					title: "Divisions",
					url: "/Portal/Maintenance/Divisions",
				},
				{
					title: "Mentions",
					url: "/Portal/Maintenance/Mentions",
				},
				{
					title: "Payment Types",
					url: "/Portal/Maintenance/Payment-Types",
				},
				{
					title: "Payments",
					url: "/Portal/Maintenance/Payments",
				},
				{
					title: "Payout Tiers",
					url: "/Portal/Maintenance/Payout-Tiers",
				},
				{
					title: "Penalties",
					url: "/Portal/Maintenance/Penalties",
				},
				{
					title: "People Types",
					url: "/Portal/Maintenance/People-Types",
				},
				{
					title: "Place Types",
					url: "/Portal/Maintenance/Place-Types",
				},
				{
					title: "Seasons",
					url: "/Portal/Maintenance/Seasons",
				},
			],
		},
		{
			title: "Reports",
			url: "/Portal/Reports",
			icon: FileText,
			items: [
				{
					title: "Captains Meeting",
					url: "/Portal/Reports/Captains-Meeting",
				},
				{
					title: "League Play",
					url: "/Portal/Reports/League-Play",
				},
				{
					title: "Lists",
					url: "/Portal/Reports/Lists",
				},
				{
					title: "Trails",
					url: "/Portal/Reports/Trails",
				},
			],
		},
		{
			title: "Activities",
			url: "/Portal/Activities",
			icon: ListCheck,
			items: [
				{
					title: "Payouts",
					url: "/Portal/Activities/Payouts",
				},
				{
					title: "Rosters",
					url: "/Portal/Activities/Rosters",
				},
				{
					title: "Scheduling",
					url: "/Portal/Activities/Scheduling",
				},
				{
					title: "Trails",
					url: "/Portal/Activities/Trails",
				},
				{
					title: "Weekly Score",
					url: "/Portal/Activities/Weekly-Score",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Support",
			url: "#",
			icon: LifeBuoy,
		},
		{
			title: "Feedback",
			url: "#",
			icon: Send,
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: Frame,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: PieChart,
		},
		{
			name: "Travel",
			url: "#",
			icon: Map,
		},
	],
};
//
// Return sidenav object
//
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { ability, loading } = useUserAbilities();
	// Access sidebar collapsed/expanded state via data attributes for conditional rendering
	// We'll render both images and toggle via CSS to avoid re-renders.

	// Filter top-level groups based on manage permission
	const filteredNav = React.useMemo(() => {
		// While loading, show nothing to avoid flicker/leak
		if (loading) return [] as typeof data.navMain;
		return data.navMain.filter((group) => {
			// Map group title to Subjects
			const subject = (group.title === "Management"
				? "Management"
				: group.title === "Maintenance"
				? "Maintenance"
				: group.title === "Reports"
				? "Reports"
				: group.title === "Activities"
				? "Activities"
				: "all");
			return ability.can("manage", subject);
		});
	}, [ability, loading]);
	return (
		<Sidebar collapsible="icon" {...props} className="w-auto max-w-[300px]">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-sidebar-primary">
									{/* Expanded state: show full JPG */}
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src="/LEDA_logo.jpg"
										alt="LEDA"
										className="h-full w-full object-cover group-data-[collapsible=icon]:hidden"
									/>
									{/* Collapsed state: show ICO for better look */}
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src="/leda-reports-logo.ico"
										alt="LEDA"
										className="hidden h-full w-full object-cover group-data-[collapsible=icon]:block"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
									<span className="truncate font-semibold">
										Lake Erie Dart Association
									</span>
									<span className="truncate text-xs">
										Portal
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="w-full overflow-hidden">
				<NavMain items={filteredNav} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
