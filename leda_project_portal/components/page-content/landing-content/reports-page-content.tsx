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
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Captains Meeting *WORK IN PROGRESS*</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">Generate reports for a Captains Meeting</p>
					</CardContent>
					<Link href="/Portal/Reports/Captains-Meeting" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Avaliable Reports</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
            <div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">League Play *WORK IN PROGRESS*</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">Generate Reports for Legaue Play</p>
					</CardContent>
					<Link href="/Portal/Reports/League-Play" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Avaliable Reports</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
            <div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Lists *WORK IN PROGRESS*</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">Generate Reports for Lists</p>
					</CardContent>
					<Link href="/Portal/Reports/Lists" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Avaliable Reports</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
            <div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Trails *WORK IN PROGRESS*</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">Generate Reports for Trails</p>
					</CardContent>
					<Link href="/Portal/Reports/Trails" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Avaliable Reports</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
        </div>
    );
}