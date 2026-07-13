"use client";

/**
 * CaptainsMeetingScheduleContent
 *
 * Renders the interactive schedule view used within the Captains Meeting
 * report workflow. Four TanStack Query hooks load: roster, current season,
 * full schedule data, and season-place-captain info.
 *
 * Once all four datasets are available the component fires `onDataReady`,
 * passing combined data up to the parent landing page so a PDF download
 * can be offered.
 *
 * A memoized `DivisionAccordion` renders the schedule grid in view-only mode
 * (no editing controls shown).
 */

import { useCallback, memo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { rosterRoute, scheduleRoute, seasonRoute, placeRoute } from '@/lib/apiRoutes';
import { CaptainsMtgSchedulePlaceCaptainSeasonInfo } from "@/lib/definitions";

interface CaptainsMeetingScheduleContentProps {
	seasonCode: string;
	onDataReady?: (data: {
		divisionsData: DivisionsData;
		matchData: ScheduleData;
		gameDates: Record<string, string>;
		placesData: Record<string, string>;
		seasonInfo: CaptainsMtgSchedulePlaceCaptainSeasonInfo[];
		backupPlaceId?: string | null;
	}) => void;
}

interface DivisionAccordionProps {
	division: string;
	index: number;
	divisionsData: DivisionsData;
	gameDates: Record<string, string>;
	matchData: ScheduleData;
	backupPlaceId?: string | null;
}

const DivisionAccordion = memo<DivisionAccordionProps>(
	({
		division,
		index,
		divisionsData,
		gameDates,
		matchData,
		backupPlaceId,
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
												viewMode={true}											backupPlaceId={backupPlaceId}											/>
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

// Custom hooks for API calls
const useRosterData = (seasonCode: string) => {
	return useQuery({
		queryKey: ['roster', seasonCode],
		queryFn: async () => {
			const response = await fetch(`${rosterRoute}?seasonCode=${seasonCode}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!response.ok) {
				throw new Error('Failed to fetch roster data');
			}
			const data: RosterApiResponse = await response.json();
			return data;
		},
		enabled: !!seasonCode,
		staleTime: 60 * 1000, // 1 minute
	});
};

const useSeasonData = (seasonCode: string) => {
	return useQuery({
		queryKey: ['season', seasonCode],
		queryFn: async () => {
			const response = await fetch(`${seasonRoute}?seasonCode=${seasonCode}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!response.ok) {
				throw new Error('Failed to fetch season data');
			}
			const data: SeasonApiResponse = await response.json();
			return data;
		},
		enabled: !!seasonCode,
		staleTime: 60 * 1000, // 1 minute
	});
};

const useScheduleData = (seasonCode: string) => {
	return useQuery({
		queryKey: ['schedule', seasonCode],
		queryFn: async () => {
			const response = await fetch(`${scheduleRoute}?seasonCode=${seasonCode}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!response.ok) {
				throw new Error('Failed to fetch schedule data');
			}
			const data: ScheduleApiResponse = await response.json();
			return data;
		},
		enabled: !!seasonCode,
		staleTime: 60 * 1000, // 1 minute
	});
};

const useSeasonInfo = (seasonCode: string) => {
	return useQuery({
		queryKey: ['seasonInfo', seasonCode],
		queryFn: async () => {
			const response = await fetch(`${scheduleRoute}/placeCaptainSeasonInfo?seasonCode=${seasonCode}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!response.ok) {	
				throw new Error('Failed to fetch season info');
			}
			const data: CaptainsMtgSchedulePlaceCaptainSeasonInfo[] = await response.json();
			return data;
		},
		enabled: !!seasonCode,
		staleTime: 60 * 1000, // 1 minute
	});
};

export default function CaptainsMeetingScheduleContent({
	seasonCode,
	onDataReady,
}: CaptainsMeetingScheduleContentProps) {
	const [divisionsData, setDivisionsData] = useState<DivisionsData>({});
	const [gameDates, setGameDates] = useState<Record<string, string>>({});
	const [matchData, setMatchData] = useState<ScheduleData>({});

	// TanStack Query hooks
	const { 
		data: rosterData, 
		error: rosterError,
		isLoading: isRosterLoading 
	} = useRosterData(seasonCode);

	const { 
		data: seasonData, 
		error: seasonError,
		isLoading: isSeasonLoading 
	} = useSeasonData(seasonCode);

	const { 
		data: scheduleData, 
		error: scheduleError,
		isLoading: isScheduleLoading 
	} = useScheduleData(seasonCode);

	const { 
		data: seasonInfo = [], 
		error: seasonInfoError,
		isLoading: isSeasonInfoLoading 
	} = useSeasonInfo(seasonCode);

	// The backup location (if the season has one) may not be any team's home
	// place, so seasonInfo alone won't have its name — resolve it separately.
	const backupPlaceId = seasonData?.backupPlaceId ?? null;
	const { data: backupPlace } = useQuery({
		queryKey: ['place-resolve', backupPlaceId],
		queryFn: async () => {
			const response = await fetch(`${placeRoute}?ledaId=${backupPlaceId}`);
			if (!response.ok) throw new Error('Failed to fetch backup place');
			return response.json() as Promise<{ ledaId: number; name: string }>;
		},
		enabled: !!backupPlaceId,
		staleTime: 5 * 60 * 1000,
	});

	const isLoading = isRosterLoading || isSeasonLoading || isScheduleLoading || isSeasonInfoLoading;
	const hasError = rosterError || seasonError || scheduleError || seasonInfoError;

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

	// Process data when queries complete
	useEffect(() => {
		if (!seasonCode || isLoading || hasError) return;

		try {
			if (rosterData?.teamInformation) {
				const fetchedData = structuredClone(rosterData.teamInformation);
				setDivisionsData(fetchedData);

				// Process game dates
				const gameDatesData = seasonData?.dates || {};
				setGameDates(gameDatesData);

				// Process match data
				let processedMatchData: ScheduleData;
				if (scheduleData?.scheduleData) {
					processedMatchData = ensureSubdivisionIsolation(
						structuredClone(scheduleData.scheduleData)
					);
				} else {
					// Initialize empty match data structure
					processedMatchData = initializeEmptyMatchData(fetchedData);
				}
				setMatchData(processedMatchData);

				// Extract places data from seasonInfo
				const places: Record<string, string> = {};
				seasonInfo.forEach((info) => {
					if (info.placeId && info.placeName) {
						places[info.placeId.toString()] = info.placeName;
					}
				});
				// Merge in the backup location's name, since it may not belong to any team
				if (backupPlaceId && backupPlace?.name) {
					places[backupPlaceId] = backupPlace.name;
				}

				// Notify parent component when data is ready
				if (onDataReady) {
					onDataReady({
						divisionsData: fetchedData,
						matchData: processedMatchData,
						gameDates: gameDatesData,
						placesData: places,
						seasonInfo,
						backupPlaceId,
					});
				}
			}
		} catch (error) {
			console.error('Error processing schedule data:', error);
			setDivisionsData({});
		}
	}, [
		seasonCode, 
		rosterData, 
		seasonData, 
		scheduleData, 
		seasonInfo, 
		isLoading, 
		hasError,
		backupPlaceId,
		backupPlace,
		ensureSubdivisionIsolation, 
		initializeEmptyMatchData, 
		onDataReady
	]);

	if (isLoading) {
		return <Spinner />;
	}

	if (hasError) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<p className="text-red-500">Error loading schedule data</p>
				<p className="text-sm text-muted-foreground">Please try again later</p>
			</div>
		);
	}

	if (!seasonCode) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<p className="text-muted-foreground">No season code available</p>
			</div>
		);
	}

	if (Object.keys(divisionsData).length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64">
				<p className="text-muted-foreground">No division data available</p>
				<p className="text-sm text-muted-foreground">Season Code: {seasonCode}</p>
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
							backupPlaceId={seasonData?.backupPlaceId}
						/>
					))}
				</div>
			)}
		</div>
	);
}

