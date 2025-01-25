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

export default function ManagementPageContent() {
    return (
        <div className="flex flex-wrap gap-4">
            <div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Places</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">View, Add, Edit, or Delete Places</p>
					</CardContent>
					<Link href="/Portal/Management/Places" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Places</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
            <div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Players</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">View, Add, Edit, or Delete Players</p>
					</CardContent>
					<Link href="/Portal/Management/Players" className="text-gray-700 hover:text-gray-500" prefetch>
						<CardFooter className="flex justify-between items-center w-full mt-4">
								<span className="font-medium">View Players</span>
								<ArrowRight className="w-5 h-5" />
						</CardFooter>
					</Link>
				</Card>
			</div>
            <div>
				<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] transition-transform transform hover:scale-105 hover:shadow-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold">Teams</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">View, Add, Edit, or Delete Teams</p>
					</CardContent>
					<Link href="/Portal/Management/Teams" className="text-gray-700 hover:text-gray-500" prefetch>
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