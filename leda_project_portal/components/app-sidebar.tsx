//
// Use Client
//
"use client";
//
// Imports
//
import * as React from "react";
import {
	Book,
	FileText,
	Frame,
	LifeBuoy,
	Map,
	PieChart,
	Send,
	Wrench,
	ListCheck,
	Target,
} from "lucide-react";
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
//
// Define data for sidenav bar
//
const data = {
	user: {
		name: "Tyler Dickard",
		email: "tdickardsoftware@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Management",
			url: "/portal/Management",
			icon: Book,
			items: [
				{
					title: "Places",
					url: "/portal/Management/Places",
				},
				{
					title: "Players",
					url: "/portal/Management/Players",
				},
				{
					title: "Teams",
					url: "/portal/Management/Teams",
				},
			],
		},
		{
			title: "Maintenance",
			url: "/portal/Maintenance",
			icon: Wrench,
			items: [
				{
					title: "Divisions",
					url: "/portal/Maintenance/Divisions",
				},
				{
					title: "Mentions",
					url: "/portal/Maintenance/Mentions",
				},
				{
					title: "Payment Types",
					url: "/portal/Maintenance/Payment-Types",
				},
				{
					title: "Payout Tiers",
					url: "/portal/Maintenance/Payout-Tiers",
				},
				{
					title: "Penalties",
					url: "/portal/Maintenance/Penalties",
				},
				{
					title: "People Types",
					url: "/portal/Maintenance/People-Types",
				},
				{
					title: "Place Types",
					url: "/portal/Maintenance/Place-Types",
				},
				{
					title: "Seasons",
					url: "/portal/Maintenance/Seasons",
				},
			],
		},
		{
			title: "Reports",
			url: "/portal/Reports",
			icon: FileText,
			items: [
				{
					title: "Captains Meeting",
					url: "/portal/Reports/Captains-Meeting",
					items: [
						{
							title: "Folder Labels",
							url: "/portal/Reports/Captains-Meeting/Folder-Labels",
						},
						{
							title: "Schedules",
							url: "/portal/Reports/Captains-Meeting/Schedules",
						},
						{
							title: "Team Report",
							url: "/portal/Reports/Captains-Meeting/Team-Report",
						},
					],
				},
				{
					title: "League Play",
					url: "/portal/Reports/League-Play",
					items: [
						{
							title: "Bar Affiliation Fee Not Paid",
							url: "/portal/Reports/League-Play/Bar-Affiliation-Fee-Not-Paid",
						},
						{
							title: "Mentions - Best of Division",
							url: "/portal/Reports/League-Play/Mentions-Best-Of-Division",
						},
						{
							title: "Mentions - For Plaques",
							url: "/portal/Reports/League-Play/Mentions-For-Plaques",
						},
						{
							title: "Mentions - Weekly League",
							url: "/portal/Reports/League-Play/Mentions-Weekly-League",
						},
						{
							title: "Players No Form",
							url: "/portal/Reports/League-Play/Players-No-Form",
						},
						{
							title: "Players Not Paid",
							url: "/portal/Reports/League-Play/Players-Not-Paid",
						},
						{
							title: "Team Roster Fee Not Paid",
							url: "/portal/Reports/League-Play/Team-Roster-Fee-Not-Paid",
						},
						{
							title: "Ton 80's Weekly League",
							url: "/portal/Reports/League-Play/Ton-80-Weekly-League",
						},
						{
							title: "Top Darter",
							url: "/portal/Reports/League-Play/Top-Darter",
						},
						{
							title: "Weekly Scoresheets",
							url: "/portal/Reports/League-Play/Weekly-Scoresheets",
						},
					],
				},
				{
					title: "Lists",
					url: "/portal/Reports/Lists",
					items: [
						{
							title: "Captains",
							url: "/portal/Reports/Lists/Captains",
						},
						{
							title: "Election List",
							url: "/portal/Reports/Lists/Election-List",
						},
						{
							title: "Mailing Labels",
							url: "/portal/Reports/Lists/Mailing-Labels",
						},
						{
							title: "Members",
							url: "/portal/Reports/Lists/Members",
						},
						{
							title: "Places",
							url: "/portal/Reports/Lists/Places",
						},
						{
							title: "Season Members",
							url: "/portal/Reports/Lists/Season-Members",
						},
						{
							title: "Teams",
							url: "/portal/Reports/Lists/Teams",
						},
					],
				},
				{
					title: "Trails",
					url: "/portal/Reports/Trails",
					items: [
						{
							title: "Eligible for Trip",
							url: "/portal/Reports/Trails/Eligible-For-Trip",
						},
						{
							title: "History of Wins",
							url: "/portal/Reports/Trails/History-Of-Wins",
						},
						{
							title: "Membership List",
							url: "/portal/Reports/Trails/Membership-List",
						},
						{
							title: "Points List",
							url: "/portal/Reports/Trails/Points-List",
						},
						{
							title: "Save Points Letter",
							url: "/portal/Reports/Trails/Save-Points-Letter",
						},
					],
				},
			],
		},
		{
			title: "Activites",
			url: "/portal/Activities",
			icon: ListCheck,
			items: [
				{
					title: "Payouts",
					url: "/portal/Activities/Payouts",
				},
				{
					title: "Rosters",
					url: "/portal/Activities/Rosters",
				},
				{
					title: "Scheduling",
					url: "/portal/Activities/Scheduling",
				},
				{
					title: "Trails",
					url: "/portal/Activities/Trails",
				},
				{
					title: "Weekly Score",
					url: "/portal/Activities/Weekly-Score",
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
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Target className="size-8" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										Lake Erie Dart Association
									</span>
									<span className="truncate text-xs">
										portal
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
