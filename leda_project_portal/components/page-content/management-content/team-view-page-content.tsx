"use client";

import { Team } from "@/lib/definitions";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components//ui/card";
import TeamEditForm from "@/components/forms/management/team-edit-form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamPageContent({
	teamData,
	memberDetails,
}: {
	teamData: Team;
	memberDetails: {
		fullName: string | undefined;
		ledaId: string;
		isCaptain: boolean;
	}[];
}) {
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
						Team Name: {teamData.teamName}
					</h1>
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold mb-6">
							LEDA ID #{teamData.ledaId}
						</h2>
						<Button
							onClick={handleEdit}
							className="hover:bg-gray-100 border-gray-300 text-gray-700"
						>
							Edit Team
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="shadow-lg">
							<CardHeader>
								<CardTitle>Team Information</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-lg">
									Established Date:{" "}
									{new Date(
										teamData.establishedDate
									).toLocaleDateString("en-US")}
								</p>
								<p className="text-lg">
									Last Team Fee Payment:{" "}
									{teamData.lastTeamFeePayment}
								</p>
								{teamData.memo && (
									<p className="text-lg">
										Memo: {teamData.memo}
									</p>
								)}
							</CardContent>
						</Card>
						<Card className="shadow-lg">
							<CardHeader>
								<CardTitle>Team Member Information</CardTitle>
							</CardHeader>
							<CardContent>
								{memberDetails.map((member) => (
									<p
										key={member.ledaId}
										className="text-lg flex items-center"
									>
										{member.fullName} (LEDA ID:{" "}
										{member.ledaId}){" "}
										{member.isCaptain && (
											<Star
												className={cn(
													"h-4 w-4 text-yellow-500"
												)}
											/>
										)}
									</p>
								))}
							</CardContent>
						</Card>
					</div>
					<Link
						href="/Portal/Management/Teams"
						className="mt-6 inline-block rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
						prefetch={true}
					>
						Go Back
					</Link>
				</div>
			)}
			{editValues && (
				<TeamEditForm
					rowData={teamData}
					onRefresh={handleRefresh}
					onClose={handleEdit}
					handleRefresh={handleRefresh}
				/>
			)}
		</div>
	);
}
