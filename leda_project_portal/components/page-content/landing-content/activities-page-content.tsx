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


export default function ActivitiesPageContent() {
    return (
		<div className="flex flex-wrap gap-4">
			<div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Payouts *WIP*</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">Calculate Payouts</p>
					</CardContent>
					<Link href="/Portal/Activities/Payouts" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Payouts</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Rosters</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">View, Add, Edit, or Delete Rosters</p>
					</CardContent>
					<Link href="/Portal/Activities/Rosters" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Rosters</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Scheduling</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">View, Add, Edit, or Delete Schedules</p>
					</CardContent>
					<Link href="/Portal/Activities/Scheduling" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Schedules</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Trails</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">View, Add, Edit, or Delete Trails Dates</p>
					</CardContent>
					<Link href="/Portal/Activities/Trails" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Trails</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
			<div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Weekly Scoresheets *WIP*</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">View, Add, Edit, or Delete Weekly Scoresheets</p>
					</CardContent>
					<Link href="/Portal/Activities/Weekly-Score" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Scoresheets</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
		</div>
    );
}