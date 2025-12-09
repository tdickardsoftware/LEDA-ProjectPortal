"use client";

import { Season } from "@/lib/definitions";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components//ui/card";
import SeasonEditForm from "@/components/forms/maintenance/season-edit-form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SeasonPageContent({ seasonData }: { seasonData: Season }) {
	const [editValues, setEditValues] = useState(false);

	const handleEdit = () => {
		setEditValues(!editValues);
	};

	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<div className="container mx-auto p-6">
			{!editValues && (
				<div>
					<h1 className="text-4xl font-bold mb-4">
						Season: {seasonData.desc}
					</h1>
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold mb-6">
							Season Code: {seasonData.seasonCode}
						</h2>
						<Button variant="outline"
							onClick={handleEdit}
							className="hover:bg-muted border-border text-foreground"
						>
							Edit Season
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="shadow-lg">
							<CardHeader>
								<CardTitle>Season Information</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-lg">
									Fiscal Year:{" "}
									<span className="font-medium">
										{seasonData.fiscalYear}
									</span>
								</p>
								<p className="text-lg">
									Current Season? :{" "}
									<span className="font-medium">
										{seasonData.isCurrentSeason
											? "Yes"
											: "No"}
									</span>
								</p>
							</CardContent>
						</Card>
						<Card className="shadow-lg">
							<CardHeader>
								<CardTitle>Season Date Information</CardTitle>
							</CardHeader>
							<CardContent>
								{Object.entries(seasonData.dates).map(
									([key, value]) => (
										<p key={key} className="text-lg">
											{key.replace(/(\D+)(\d+)/, "$1 $2")}
											:{" "}
											<span className="font-medium">
												{value}
											</span>
										</p>
									)
								)}
							</CardContent>
						</Card>
					</div>
					<Link
						href="/Portal/Maintenance/Seasons"
						className="mt-6 inline-block rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
						prefetch={true}
					>
						Go Back
					</Link>
				</div>
			)}
			{editValues && (
				<SeasonEditForm
					onClose={handleEdit}
					onRefresh={handleRefresh}
					rowData={seasonData}
					handleRefresh={handleRefresh}
				/>
			)}
		</div>
	);
}