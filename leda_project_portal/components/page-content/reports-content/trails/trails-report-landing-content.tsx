"use client";

/**
 * Trails Report Landing Content Component
 *
 * This component provides a landing page for trails reports, allowing users to:
 * - Select from available trail reports
 * - Navigate to specific report views
 *
 * The component uses similar styling to the weekly scoresheets page but focuses
 * specifically on report selection functionality.
 */

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";

export default function TrailsReportLandingContent() {
	// State declarations
	const [selectedReport, setSelectedReport] = useState<string>("");

	// Event handlers
	const handleReportSelect = (value: string) => {
		setSelectedReport(value);
		// TODO: Add navigation logic or report generation based on selected report
		console.log("Selected report:", value);
	};

	return (
		<div className="flex flex-col h-full">
			<FolderTabMed title="Report Selection" className="w-fit">
				<div className="flex gap-4">
					<ReportSelector
						handleSelect={handleReportSelect}
						selectedReport={selectedReport}
						type="trails"
					/>
				</div>
			</FolderTabMed>
			<div className="mt-4">
				<Separator
					orientation="horizontal"
					className="bg-gray-400 w-100"
				/>
			</div>
			<div className="flex flex-1 overflow-hidden">
				<div className="flex-1 p-4 overflow-auto">
					{!selectedReport ? (
						<div className="flex h-full items-center justify-center">
							<p className="text-gray-500 text-center">
								Select a report to continue...
							</p>
						</div>
					) : (
						<div className="flex h-full items-center justify-center">
							<div className="text-center">
								<h2 className="text-2xl font-semibold mb-4">
									Report Selected
								</h2>
								<p className="text-gray-600">
									You have selected: <span className="font-medium">{selectedReport}</span>
								</p>
								<p className="text-sm text-gray-500 mt-2">
									Report functionality will be implemented here.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
