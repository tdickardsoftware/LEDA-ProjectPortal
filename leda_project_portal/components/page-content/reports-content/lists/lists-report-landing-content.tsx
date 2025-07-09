"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { Label } from "@/components/ui/label";

export default function ListsReportLandingContent() {
	const [selectedReport, setSelectedReport] = useState<string>("");

	const handleReportSelect = (value: string) => {
		setSelectedReport(value);
	};

	const renderReportContent = () => {
		if (!selectedReport) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-gray-500 text-center">
						Select a report to continue...
					</p>
				</div>
			);
		}
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-4">
						Work In Progress
					</h2>
					<p className="text-gray-600">
						The selected report is not yet implemented.
					</p>
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between">
				<FolderTabMed title="Report Selection" className="w-fit">
					<div className="flex gap-6">
						<div className="flex flex-col gap-1">
							<Label htmlFor="report-selector">Report</Label>
							<ReportSelector
								handleSelect={handleReportSelect}
								selectedReport={selectedReport}
								type="lists"
							/>
						</div>
					</div>
				</FolderTabMed>
			</div>
			<div className="mt-4">
				<Separator
					orientation="horizontal"
					className="bg-gray-400 w-100"
				/>
			</div>
			<div className="flex flex-1 overflow-hidden">
				<div className="flex-1 p-4 overflow-auto">
					{renderReportContent()}
				</div>
			</div>
		</div>
	);
}
