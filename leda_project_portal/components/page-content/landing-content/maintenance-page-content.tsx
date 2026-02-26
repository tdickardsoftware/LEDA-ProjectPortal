"use client";

/**
 * MaintenancePageContent
 *
 * Landing page for the Maintenance section of the portal.
 * Renders a grid of navigation cards linking to each maintenance sub-section:
 * Divisions, Mentions, Payment Types, Payments, Payout Tiers, Penalties,
 * Seasons, and other static-data management screens.
 */

import Link from "next/link";
import React from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function MaintenancePageContent() {
	return (
		<div className="flex flex-wrap gap-4">
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Divisions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, or Delete Divisions
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Divisions"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Divisions</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Mentions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Mentions
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Mentions"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Mentions</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Payment Types
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Payment Types
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Payment-Types"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View Payment Types
							</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Payments
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Payments
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Payments"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Payments</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Payout Tiers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Payout Tiers
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Payout-Tiers"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View Payout Tiers
							</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Penalties
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Penalties
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Penalties"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Penalties</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							People Types
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete People Types
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/People-Types"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View People Types
							</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Place Types
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Place Types
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Place-Types"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View Place Types
							</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Seasons
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Seasons
						</p>
					</CardContent>
					<Link
						href="/Portal/Maintenance/Seasons"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Seasons</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
		</div>
	);
}
