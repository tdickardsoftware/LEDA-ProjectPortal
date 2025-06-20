"use client";

import { useCallback, memo, useEffect, useState } from "react";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/skeleton";
import { SubdivisionScheduler } from "@/components/subdivision-scheduler";
import { DivisionsData, ScheduleData } from "@/lib/schedule";
import { 
	RosterApiResponse, 
	SeasonApiResponse, 
	ScheduleApiResponse 
} from '@/lib/schedule';
import { rosterRoute, scheduleRoute, seasonRoute } from '@/lib/apiRoutes';
import { CaptainsMtgSchedulePlaceCaptainSeasonInfo } from "@/lib/definitions";

interface CaptainsMeetingScheduleContentProps {
	seasonCode: string;
	onDataReady?: (data: {
		divisionsData: DivisionsData;
		matchData: ScheduleData;
		gameDates: Record<string, string>;
		placesData: Record<string, string>;
		seasonInfo: CaptainsMtgSchedulePlaceCaptainSeasonInfo[];
	}) => void;
}

interface DivisionAccordionProps {
	division: string;
	index: number;
	divisionsData: DivisionsData;
	gameDates: Record<string, string>;
	matchData: ScheduleData;
}

const DivisionAccordion = memo<DivisionAccordionProps>(
	({
		division,
		index,
		divisionsData,
		gameDates,
		matchData,
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
												setEnabledSaveButton={() => {}} // No-op for view mode
												handleSaveData={() => {}} // No-op for view mode
												viewMode={true}
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

export default function CaptainsMeetingScheduleContent({
	seasonCode,
	onDataReady,
}: CaptainsMeetingScheduleContentProps) {
	const [divisionsData, setDivisionsData] = useState<DivisionsData>({});
	const [loading, setLoading] = useState(false);
	const [gameDates, setGameDates] = useState<Record<string, string>>({});
	const [matchData, setMatchData] = useState<ScheduleData>({});

	const ensureSubdivisionIsolation = useCallback((matchData: ScheduleData): ScheduleData => {
		const clonedData = structuredClone(matchData);
		
		Object.entries(clonedData).forEach(([division, subdivisions]) => {
			Object.entries(subdivisions).forEach(([subdivision, teams]) => {
				const subdivisionId = `${division}-${subdivision}`;
				Object.entries(teams).forEach(([, team]) => {
					Object.values(team.matchesData).forEach((match) => {
						match.subdivisionId = subdivisionId;
					});
				});
			});
		});
		
		return clonedData;
	}, []);

	const initializeEmptyMatchData = useCallback((divisionsData: DivisionsData): ScheduleData => {
		const newMatchData: ScheduleData = {};
		
		Object.entries(divisionsData).forEach(([division, divisionData]) => {
			newMatchData[division] = {};
			Object.entries(divisionData.subdivisions).forEach(([subdivision, teams]) => {
				newMatchData[division][subdivision] = {};
				Object.entries(teams).forEach(([teamLetter, teamInfo]) => {
					newMatchData[division][subdivision][teamLetter] = {
						teamName: teamInfo.teamName,
						teamId: teamInfo.teamId,
						matchesData: {},
					};
				});
			});
		});
		
		return newMatchData;
	}, []);

	useEffect(() => {
		if (!seasonCode) return;

		const fetchScheduleData = async () => {
			setLoading(true);

			try {
				// Parallel API calls for better performance
				const [rosterResult, gameDatesResult, matchDataResult, seasonInfoResult] = await Promise.allSettled([
					fetch(`${rosterRoute}?seasonCode=${seasonCode}`, {
						method: 'GET',
						headers: { 'Content-Type': 'application/json' },
					}),
					fetch(`${seasonRoute}?seasonCode=${seasonCode}`, {
						method: 'GET',
						headers: { 'Content-Type': 'application/json' },
					}),
					fetch(`${scheduleRoute}?seasonCode=${seasonCode}`, {
						method: 'GET',
						headers: { 'Content-Type': 'application/json' },
					}),
					fetch(`${scheduleRoute}/placeCaptainSeasonInfo?seasonCode=${seasonCode}`, {
						method: 'GET',
						headers: { 'Content-Type': 'application/json' },
					})
				]);

				// Handle roster data
				if (rosterResult.status === 'fulfilled' && rosterResult.value.status === 200) {
					const rosterData: RosterApiResponse = await rosterResult.value.json();
					const fetchedData = structuredClone(rosterData.teamInformation);
					setDivisionsData(fetchedData);

					let processedMatchData: ScheduleData;
					let seasonInfo: CaptainsMtgSchedulePlaceCaptainSeasonInfo[] = [];

					// Handle season info
					if (seasonInfoResult.status === 'fulfilled' && seasonInfoResult.value.status === 200) {
						seasonInfo = await seasonInfoResult.value.json();
					}

					// Extract places data from seasonInfo, not roster data
					const places: Record<string, string> = {};
					seasonInfo.forEach((info) => {
						if (info.placeId && info.placeName) {
							places[info.placeId.toString()] = info.placeName;
						}
					});

					// Handle game dates
					let gameDatesData: SeasonApiResponse | null = null;
					if (gameDatesResult.status === 'fulfilled' && gameDatesResult.value.status === 200) {
						gameDatesData = await gameDatesResult.value.json();
						setGameDates(gameDatesData?.dates || {});
					}

					// Handle match data
					if (matchDataResult.status === 'fulfilled' && matchDataResult.value.status === 200) {
						const existingMatchData: ScheduleApiResponse = await matchDataResult.value.json();
						processedMatchData = ensureSubdivisionIsolation(
							structuredClone(existingMatchData.scheduleData)
						);
						setMatchData(processedMatchData);
					} else {
						// Initialize empty match data structure
						const newMatchData = initializeEmptyMatchData(fetchedData);
						processedMatchData = newMatchData;
						setMatchData(newMatchData);
					}

					// Notify parent component when data is ready
					if (onDataReady) {
						onDataReady({
							divisionsData: fetchedData,
							matchData: processedMatchData,
							gameDates: gameDatesData?.dates || {},
							placesData: places,
							seasonInfo,
						});
					}
				} else {
					setDivisionsData({});
				}
			} catch (error) {
				console.error('Error fetching season data:', error);
				setDivisionsData({});
			} finally {
				setLoading(false);
			}
		};

		fetchScheduleData();
	}, [seasonCode, ensureSubdivisionIsolation, initializeEmptyMatchData, onDataReady]);

	if (loading) {
		return <Spinner />;
	}

	if (!seasonCode) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<p className="text-gray-500">No season code available</p>
			</div>
		);
	}

	if (Object.keys(divisionsData).length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<p className="text-gray-500">No division data available</p>
				<p className="text-sm text-gray-400">Season Code: {seasonCode}</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col max-w-[80vw]">
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
						/>
					))}
				</div>
			)}
		</div>
	);
}

