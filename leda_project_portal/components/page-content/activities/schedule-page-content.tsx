"use client";

import { useCallback, memo } from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubdivisionScheduler } from "@/components/subdivision-scheduler";
import { Button } from "@/components/ui/button";
import { FolderTabMed } from "@/components/ui/folder-tab";
import { useScheduleData } from "@/hooks/useScheduleData";
import { DivisionsData, ScheduleData } from "@/lib/schedule";

interface DivisionAccordionProps {
	division: string;
	index: number;
	divisionsData: DivisionsData;
	gameDates: Record<string, string>;
	matchData: ScheduleData;
	handleSetEnableSaveButton: (value: boolean) => void;
	handleFetchUpdatedData: (data: ScheduleData) => void;
}

const DivisionAccordion = memo<DivisionAccordionProps>(
	({
		division,
		index,
		divisionsData,
		gameDates,
		matchData,
		handleSetEnableSaveButton,
		handleFetchUpdatedData,
	}) => (
		<Accordion
			key={index}
			type="single"
			collapsible
			className="w-full mb-4"
			defaultValue={`division-${index}`}
		>
			<AccordionItem value={`division-${index}`}>
				<AccordionTrigger className="underline">{division}</AccordionTrigger>
				<AccordionContent>
					{Object.entries(divisionsData[division].subdivisions).map(
						([subdivision, teams], subIndex) => (
							<Accordion
								key={subIndex}
								type="single"
								collapsible
								className="w-full mt-2"
								defaultValue={`subdivision-${subIndex}`}
							>
								<AccordionItem
									value={`subdivision-${subIndex}`}
									className="border-b-0"
								>
									<AccordionTrigger className="underline">
										{subdivision}
									</AccordionTrigger>
									<AccordionContent>
										{Object.keys(teams).length > 0 && (
											<SubdivisionScheduler
												division={division}
												subdivision={subdivision}
												teams={teams}
												gameDates={gameDates}
												matchData={matchData}
												setEnabledSaveButton={
													handleSetEnableSaveButton
												}
												handleSaveData={handleFetchUpdatedData}
											/>
										)}
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						)
					)}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
);

DivisionAccordion.displayName = "DivisionAccordion";

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
	} = useScheduleData();

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

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="flex flex-col max-w-[80vw]">
			<div className="flex justify-between">
				<FolderTabMed title="Season Code">
					<div className="flex gap-4">
						<SeasonCodeSelector
							disabled={currentSeason}
							handleSelect={handleSeasonCodeSelect}
							setDisabled={() => {}} // This prop seems unused based on the original code
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
			{Object.keys(divisionsData).length > 0 && (
				<div className="w-full mt-4">
					{Object.keys(divisionsData).map((division, index) => (
						<DivisionAccordion
							key={division}
							division={division}
							index={index}
							divisionsData={divisionsData}
							gameDates={gameDates}
							matchData={matchData}
							handleSetEnableSaveButton={handleSetEnableSaveButton}
							handleFetchUpdatedData={handleFetchUpdatedData}
						/>
					))}
				</div>
			)}
		</div>
	);
}
