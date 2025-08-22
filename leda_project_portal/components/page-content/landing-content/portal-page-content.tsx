"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Can } from "@casl/react";
import { useUserAbilities } from "@/lib/use-user-abilities";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";

export default function PortalPageContent() {
	const { ability, loading } = useUserAbilities();

	if (loading) {
		return <div>Loading...</div>; // Or your loading component
	}

	return (
		<div className="flex flex-wrap gap-4">
			<Can I="manage" a="Management" ability={ability}>
				<div>
					<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
						<CardHeader>
							<CardTitle>Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700">
								Manage Player, Place, or Team data
							</p>
						</CardContent>
						<Link
							href="/Portal/Management"
							className="text-gray-700 hover:text-gray-500"
							prefetch
						>
							<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">
									Go To Management Page
								</span>
								<ArrowRight className="w-5 h-5" />
							</CardFooter>
						</Link>
					</Card>
				</div>
			</Can>

			<Can I="manage" a="Maintenance" ability={ability}>
				<div>
					<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
						<CardHeader>
							<CardTitle>Maintenance</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700">
								Handle any typically static data used for Activies
							</p>
						</CardContent>
						<Link
							href="/Portal/Maintenance"
							className="text-gray-700 hover:text-gray-500"
							prefetch
						>
							<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">
									Go To Maintenance Page
								</span>
								<ArrowRight className="w-5 h-5" />
							</CardFooter>
						</Link>
					</Card>
				</div>
			</Can>

			<Can I="manage" a="Reports" ability={ability}>
				<div>
					<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
						<CardHeader>
							<CardTitle>Reports</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700">
								Generate Reports using data from activities
							</p>
						</CardContent>
						<Link
							href="/Portal/Reports"
							className="text-gray-700 hover:text-gray-500"
							prefetch
						>
							<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">
									Go To Reports Page
								</span>
								<ArrowRight className="w-5 h-5" />
							</CardFooter>
						</Link>
					</Card>
				</div>
			</Can>

			<Can I="manage" a="Activities" ability={ability}>
				<div>
					<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
						<CardHeader>
							<CardTitle>Activities</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700">
								Input data for processing/use for reports
							</p>
						</CardContent>
						<Link
							href="/Portal/Activities"
							className="text-gray-700 hover:text-gray-500"
							prefetch
						>
							<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">
									Go To Activities Page
								</span>
								<ArrowRight className="w-5 h-5" />
							</CardFooter>
						</Link>
					</Card>
				</div>
			</Can>
			{ability.can("see", "Denial")  && (
				<div className="mt-4 text-red-600">
					You do not have permission to manage all resources.
				</div>
			)}
		</div>
	);
}