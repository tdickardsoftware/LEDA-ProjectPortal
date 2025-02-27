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
					items: [
						{
							title: "Folder Labels",
							url: "/Portal/Reports/Captains-Meeting/Folder-Labels",
						},
						{
							title: "Schedules",
							url: "/Portal/Reports/Captains-Meeting/Schedules",
						},
						{
							title: "Team Report",
							url: "/Portal/Reports/Captains-Meeting/Team-Report",
						},
					],
				},
				{
					title: "League Play",
					url: "/Portal/Reports/League-Play",
					items: [
						{
							title: "Bar Affiliation Fee Not Paid",
							url: "/Portal/Reports/League-Play/Bar-Affiliation-Fee-Not-Paid",
						},
						{
							title: "Mentions - Best of Division",
							url: "/Portal/Reports/League-Play/Mentions-Best-Of-Division",
						},
						{
							title: "Mentions - For Plaques",
							url: "/Portal/Reports/League-Play/Mentions-For-Plaques",
						},
						{
							title: "Mentions - Weekly League",
							url: "/Portal/Reports/League-Play/Mentions-Weekly-League",
						},
						{
							title: "Players No Form",
							url: "/Portal/Reports/League-Play/Players-No-Form",
						},
						{
							title: "Players Not Paid",
							url: "/Portal/Reports/League-Play/Players-Not-Paid",
						},
						{
							title: "Team Roster Fee Not Paid",
							url: "/Portal/Reports/League-Play/Team-Roster-Fee-Not-Paid",
						},
						{
							title: "Ton 80's Weekly League",
							url: "/Portal/Reports/League-Play/Ton-80-Weekly-League",
						},
						{
							title: "Top Darter",
							url: "/Portal/Reports/League-Play/Top-Darter",
						},
						{
							title: "Weekly Scoresheets",
							url: "/Portal/Reports/League-Play/Weekly-Scoresheets",
						},
					],
				},
				{
					title: "Lists",
					url: "/Portal/Reports/Lists",
					items: [
						{
							title: "Captains",
							url: "/Portal/Reports/Lists/Captains",
						},
						{
							title: "Election List",
							url: "/Portal/Reports/Lists/Election-List",
						},
						{
							title: "Mailing Labels",
							url: "/Portal/Reports/Lists/Mailing-Labels",
						},
						{
							title: "Members",
							url: "/Portal/Reports/Lists/Members",
						},
						{
							title: "Places",
							url: "/Portal/Reports/Lists/Places",
						},
						{
							title: "Season Members",
							url: "/Portal/Reports/Lists/Season-Members",
						},
						{
							title: "Teams",
							url: "/Portal/Reports/Lists/Teams",
						},
					],
				},
				{
					title: "Trails",
					url: "/Portal/Reports/Trails",
					items: [
						{
							title: "Eligible for Trip",
							url: "/Portal/Reports/Trails/Eligible-For-Trip",
						},
						{
							title: "History of Wins",
							url: "/Portal/Reports/Trails/History-Of-Wins",
						},
						{
							title: "Membership List",
							url: "/Portal/Reports/Trails/Membership-List",
						},
						{
							title: "Points List",
							url: "/Portal/Reports/Trails/Points-List",
						},
						{
							title: "Save Points Letter",
							url: "/Portal/Reports/Trails/Save-Points-Letter",
						},
					],
				},
			],
		},
		{
			title: "Activites",
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
	return (
		<Sidebar 
			collapsible="icon" 
			{...props} 
			className="w-auto max-w-[300px]"
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Target className="size-8" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
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
			<SidebarContent className="w-full overflow-hidden">
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
