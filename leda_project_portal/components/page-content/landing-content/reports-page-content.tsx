"use client";

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

export default function ReportsPageContent() {
	return (
		<div className="flex flex-wrap gap-4">
			<div>
				<Card className="p-4 shadow-lg bg-background rounded-lg border border-border w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							Captains Meeting
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							Generate reports for a Captains Meeting
						</p>
					</CardContent>
					<Link
						href="/Portal/Reports/Captains-Meeting"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View Avaliable Reports
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
							League Play
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							Generate Reports for Legaue Play
						</p>
					</CardContent>
					<Link
						href="/Portal/Reports/League-Play"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View Avaliable Reports
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
							Lists
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							Generate Reports for Lists
						</p>
					</CardContent>
					<Link
						href="/Portal/Reports/Lists"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View Avaliable Reports
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
							Trails
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground">
							Generate Reports for Trails
						</p>
					</CardContent>
					<Link
						href="/Portal/Reports/Trails"
						className="text-foreground hover:text-muted-foreground"
						prefetch
					>
						<CardFooter className="flex justify-between items-center w-full mt-4">
							<span className="font-medium">
								View Avaliable Reports
							</span>
							<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
		</div>
	);
}
