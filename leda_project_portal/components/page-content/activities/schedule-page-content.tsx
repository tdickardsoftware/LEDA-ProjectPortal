"use client";

/**
 * SchedulePageContent
 *
 * Displays and saves the weekly match schedule for the selected season.
 * Uses SidenavPageLayout with DivisionTreeSidenav for navigation.
 * Selecting a subdivision in the sidenav renders its SubdivisionScheduler
 * in the main content area. All data-fetching and mutation logic is
 * delegated to the `useScheduleData` custom hook.
 */

import { useCallback, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Spinner } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubdivisionScheduler } from "@/components/subdivision-scheduler";
import { Button } from "@/components/ui/button";
import { FolderTabMed } from "@/components/ui/folder-tab";
import { useScheduleData } from "@/hooks/useScheduleData";
import { ScheduleData } from "@/lib/schedule";
import SidenavPageLayout from "@/components/sidenav-page-layout";
import DivisionTreeSidenav, { DivisionTreeDivision } from "@/components/division-tree-sidenav";

export default function ScheduleContent() {
	const {
		seasonCode,
		divisionsData,
		loading,
		currentSeason,
		setCurrentSeason,
		gameDates,
		matchData,
		updatedMatchData,
		setUpdatedMatchData,
		enableSaveButton,
		setEnableSaveButton,
		handleSeasonCodeSelect,
		handleSaveData,
		rosterNotFound,
	} = useScheduleData();

	const [selectedSubdivision, setSelectedSubdivision] = useState<{
		divisionName: string;
		subdivisionName: string;
	} | null>(null);

	// Clear selection when the season changes
	useEffect(() => {
		setSelectedSubdivision(null);
	}, [seasonCode]);

	const handleSetEnableSaveButton = useCallback(
		(value: boolean) => {
			setEnableSaveButton(value);
		},
		[setEnableSaveButton]
	);

	const handleFetchUpdatedData = useCallback(
		(data: ScheduleData) => {
			setUpdatedMatchData(data);
		},
		[setUpdatedMatchData]
	);

	const handleSaveClick = useCallback(() => {
		handleSaveData(updatedMatchData);
	}, [handleSaveData, updatedMatchData]);

	const handleCurrentSeasonChange = useCallback(
		(checked: boolean | "indeterminate") => {
			setCurrentSeason(checked === true);
		},
		[setCurrentSeason]
	);

	// Build sidenav tree from hook data
	const divisionTreeItems = useMemo<DivisionTreeDivision[]>(
		() =>
			Object.keys(divisionsData).map((divisionName) => ({
				name: divisionName,
				subdivisions: Object.keys(
					divisionsData[divisionName].subdivisions
				).map((subdivisionName) => ({ name: subdivisionName })),
			})),
		[divisionsData]
	);

	if (loading) {
		return <Spinner />;
	}

	const selectedTeams =
		selectedSubdivision &&
		divisionsData[selectedSubdivision.divisionName]?.subdivisions[
			selectedSubdivision.subdivisionName
		];

	return (
		<SidenavPageLayout
			header={
				<div className="flex justify-between">
					<FolderTabMed title="Season Code">
						<div className="flex gap-4">
							<SeasonCodeSelector
								disabled={currentSeason}
								handleSelect={handleSeasonCodeSelect}
								setDisabled={() => {}}
								useCurrentSeason={currentSeason}
								seasonCode={seasonCode || ""}
							/>
							<div className="flex items-center gap-4">
								<Label>Current Season?</Label>
								<Checkbox
									checked={currentSeason}
									onCheckedChange={handleCurrentSeasonChange}
								/>
							</div>
						</div>
					</FolderTabMed>
					<FolderTabMed title="Manage Schedule">
						<div className="p-4 flex justify-center">
							<Button
								onClick={handleSaveClick}
								variant="outline"
								className="hover:bg-muted border-border text-foreground"
								disabled={!enableSaveButton}
							>
								Save Changes
							</Button>
						</div>
					</FolderTabMed>
				</div>
			}
			sidenav={
				rosterNotFound ? null : (
					<DivisionTreeSidenav
						key={seasonCode ?? "no-season"}
						divisions={divisionTreeItems}
						onSubdivisionSelect={(divisionName, subdivisionName) =>
							setSelectedSubdivision({ divisionName, subdivisionName })
						}
						selectedSubdivision={selectedSubdivision}
						emptyMessage="Select a season to view the schedule..."
					/>
				)
			}
			showContent={!rosterNotFound && !!selectedSubdivision && !!selectedTeams}
			emptyContent={
				rosterNotFound ? (
					<div className="flex items-center justify-center py-16">
						<div className="rounded-md border border-yellow-500 bg-yellow-500/10 p-6 text-sm max-w-md text-center">
							<p className="font-semibold text-yellow-600 dark:text-yellow-400">
								No roster found for this season
							</p>
							<p className="mt-1 text-muted-foreground">
								A roster must be created before scheduling can begin.{" "}
								<Link
									href="/Portal/Activities/Rosters"
									className="underline text-primary hover:text-primary/80"
								>
									Create a roster here
								</Link>
							</p>
						</div>
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<p className="text-muted-foreground text-center">
							Select a subdivision to view its schedule...
						</p>
					</div>
				)
			}
		>
			{selectedSubdivision && selectedTeams &&
				Object.keys(selectedTeams).length > 0 && (
					<SubdivisionScheduler
						division={selectedSubdivision.divisionName}
						subdivision={selectedSubdivision.subdivisionName}
						teams={selectedTeams}
						gameDates={gameDates}
						matchData={matchData}
						setEnabledSaveButton={handleSetEnableSaveButton}
						handleSaveData={handleFetchUpdatedData}
						seasonCode={seasonCode}
					/>
				)}
		</SidenavPageLayout>
	);
}
