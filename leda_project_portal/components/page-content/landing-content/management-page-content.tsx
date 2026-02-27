"use client";

/**
 * ManagementPageContent
 *
 * Landing page for the Management section of the portal.
 * Renders navigation cards linking to Places, Players, and Teams sub-sections.
 */

import Link from "next/link";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function ManagementPageContent() {
	return (
		<div className="flex flex-wrap gap-4">
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Places
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Places
						</p>
					</CardContent>
					<Link
						href="/Portal/Management/Places"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Places</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Players
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Players
						</p>
					</CardContent>
					<Link
						href="/Portal/Management/Players"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Players</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Teams
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							View, Add, Edit, or Delete Teams
						</p>
					</CardContent>
					<Link
						href="/Portal/Management/Teams"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">View Teams</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
		</div>
	);
}
