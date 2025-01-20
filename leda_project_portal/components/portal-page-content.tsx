"use client";

import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@/components/ui/collapsible";
import { Separator } from "@radix-ui/react-separator";
import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";

export default function PortalPageContent() {
	const [isManagementOpen, setIsManagementOpen] = React.useState(false);
	const [isMaintenanceOpen, setIsMaintenanceOpen] = React.useState(false);
	const [isReportsOpen, setIsReportsOpen] = React.useState(false);
	const [isActivitiesOpen, setIsActivitiesOpen] = React.useState(false);

	return (
		<div className="flex flex-row space-x-4">
			<div className="flex flex-col space-y-4">
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
					<Link href="/portal/Management">
						<CardHeader>
							<CardTitle>Management</CardTitle>
							<Separator className="my-4 bg-gray-500" />
							<CardDescription>
								Manage Player, Place, or Team data
							</CardDescription>
						</CardHeader>
					</Link>
					<CardContent>
						<Collapsible
							open={isManagementOpen}
							onOpenChange={setIsManagementOpen}
						>
							<CollapsibleTrigger className="flex items-center space-x-2">
								<span>Links</span>{" "}
								<ChevronsUpDown className="h-4 w-4" />
							</CollapsibleTrigger>
							<CollapsibleContent>
								<Separator className="my-4 bg-gray-500" />
								<div className="flex flex-col space-y-2">
									<Link
										href="/portal/Management/Players"
										className="border-b"
									>
										Players
									</Link>
									<Link
										href="/portal/Management/Places"
										className="border-b"
									>
										Places
									</Link>
									<Link
										href="/portal/Management/Teams"
										className="border-b"
									>
										Teams
									</Link>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</CardContent>
				</Card>
			</div>
			<div className="flex flex-col space-y-4">
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
					<Link href="/portal/Maintenance">
						<CardHeader>
							<CardTitle>Maintenance</CardTitle>
							<Separator className="my-4 bg-gray-500" />
							<CardDescription>
								Manage typically static data and seasons data
							</CardDescription>
						</CardHeader>
					</Link>
					<CardContent>
						<Collapsible
							open={isMaintenanceOpen}
							onOpenChange={setIsMaintenanceOpen}
						>
							<CollapsibleTrigger className="flex items-center space-x-2">
								<span>Links</span>{" "}
								<ChevronsUpDown className="h-4 w-4" />
							</CollapsibleTrigger>
							<CollapsibleContent>
								<Separator className="my-4 bg-gray-500" />
								<div className="flex flex-col space-y-2">
									<Link
										href="/portal/Maintenance/Divisions"
										className="border-b"
									>
										Divisions
									</Link>
									<Link
										href="/portal/Maintenance/Mentions"
										className="border-b"
									>
										Mentions
									</Link>
									<Link
										href="/portal/Maintenance/Payment-Types"
										className="border-b"
									>
										Payment Types
									</Link>
									<Link
										href="/portal/Maintenance/Payout-Tiers"
										className="border-b"
									>
										Payout Tiers
									</Link>
									<Link
										href="/portal/Maintenance/Penalties"
										className="border-b"
									>
										Penalties
									</Link>
									<Link
										href="/portal/Maintenance/People-Types"
										className="border-b"
									>
										People Types
									</Link>
									<Link
										href="/portal/Maintenance/Place-Types"
										className="border-b"
									>
										Place Types
									</Link>
									<Link
										href="/portal/Maintenance/Seasons"
										className="border-b"
									>
										Seasons
									</Link>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</CardContent>
				</Card>
			</div>
			<div className="flex flex-col space-y-4">
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
					<Link href="/portal/Reports">
						<CardHeader>
							<CardTitle>Reports *WORK IN PROGRESS*</CardTitle>
							<Separator className="my-4 bg-gray-500" />
							<CardDescription>
								Reports for different activities
							</CardDescription>
						</CardHeader>
					</Link>
					<CardContent>
						<Collapsible
							open={isReportsOpen}
							onOpenChange={setIsReportsOpen}
						>
							<CollapsibleTrigger className="flex items-center space-x-2">
								<span>Links</span>{" "}
								<ChevronsUpDown className="h-4 w-4" />
							</CollapsibleTrigger>
							<CollapsibleContent>
								<Separator className="my-4 bg-gray-500" />
								<div className="flex flex-col space-y-2">
									<Link
										href="/portal/Reports/Captains-Meeting"
										className="border-b"
									>
										Captains Meeting
									</Link>
									<Link
										href="/portal/Reports/League-Play"
										className="border-b"
									>
										League Play
									</Link>
									<Link
										href="/portal/Reports/Lists"
										className="border-b"
									>
										Lists
									</Link>
									<Link
										href="/portal/Reports/Trails"
										className="border-b"
									>
										Trails
									</Link>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</CardContent>
				</Card>
			</div>
			<div className="flex flex-col space-y-4">
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
					<Link href="/portal/Activities">
						<CardHeader>
							<CardTitle>Activities *WORK IN PROGRESS*</CardTitle>
							<Separator className="my-4 bg-gray-500" />
							<CardDescription>
								Manage Payouts, Rosters, Schedules, Trails
								Events, and Weekly Scoresheets
							</CardDescription>
						</CardHeader>
					</Link>
					<CardContent>
						<Collapsible
							open={isActivitiesOpen}
							onOpenChange={setIsActivitiesOpen}
						>
							<CollapsibleTrigger className="flex items-center space-x-2">
								<span>Links</span>{" "}
								<ChevronsUpDown className="h-4 w-4" />
							</CollapsibleTrigger>
							<CollapsibleContent>
								<Separator className="my-4 bg-gray-500" />
								<div className="flex flex-col space-y-2">
									<Link
										href="/portal/Activities/Payouts"
										className="border-b"
									>
										Payouts
									</Link>
									<Link
										href="/portal/Activities/Rosters"
										className="border-b"
									>
										Rosters
									</Link>
									<Link
										href="/portal/Activities/Scheduling"
										className="border-b"
									>
										Scheduling
									</Link>
									<Link
										href="/portal/Activities/Trails"
										className="border-b"
									>
										Trails
									</Link>
									<Link
										href="/portal/Activities/Weekly-Score"
										className="border-b"
									>
										Weekly Score
									</Link>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
