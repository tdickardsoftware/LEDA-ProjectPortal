import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
	ScheduleData, 
	DivisionsData, 
	RosterApiResponse, 
	SeasonApiResponse, 
	ScheduleApiResponse 
} from '@/lib/schedule';
import { rosterRoute, scheduleRoute, seasonRoute } from '@/lib/apiRoutes';
import { fetchWithSession } from '@/lib/getData';

// Helper fetchers
const fetchRoster = async (seasonCode: string) => {
	const res = await fetch(`${rosterRoute}?seasonCode=${seasonCode}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) throw new Error('Failed to fetch roster');
	return res.json() as Promise<RosterApiResponse>;
};

const fetchGameDates = async (seasonCode: string) => {
	const res = await fetch(`${seasonRoute}?seasonCode=${seasonCode}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) throw new Error('Failed to fetch game dates');
	return res.json() as Promise<SeasonApiResponse>;
};

const fetchSchedule = async (seasonCode: string) => {
	const res = await fetch(`${scheduleRoute}?seasonCode=${seasonCode}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) throw new Error('Failed to fetch schedule');
	return res.json() as Promise<ScheduleApiResponse>;
};

export function useScheduleData() {
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [updatedMatchData, setUpdatedMatchData] = useState<ScheduleData>({});
	const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);

	const queryClient = useQueryClient();

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

	// Queries
	const {
		data: rosterData,
		isLoading: rosterLoading,
	} = useQuery({
		queryKey: ['roster', seasonCode],
		queryFn: () => seasonCode ? fetchRoster(seasonCode) : Promise.reject(),
		enabled: !!seasonCode,
	});

	const {
		data: gameDatesData,
		isLoading: gameDatesLoading,
	} = useQuery({
		queryKey: ['gameDates', seasonCode],
		queryFn: () => seasonCode ? fetchGameDates(seasonCode) : Promise.reject(),
		enabled: !!seasonCode,
	});

	const {
		data: scheduleData,
		isLoading: scheduleLoading,
	} = useQuery({
		queryKey: ['schedule', seasonCode],
		queryFn: () => seasonCode ? fetchSchedule(seasonCode) : Promise.reject(),
		enabled: !!seasonCode,
	});

	// Derived data
	const divisionsData: DivisionsData = rosterData?.teamInformation || {};
	const gameDates: Record<string, string> = gameDatesData?.dates || {};
	let matchData: ScheduleData = {};

	if (scheduleData?.scheduleData) {
		matchData = ensureSubdivisionIsolation(structuredClone(scheduleData.scheduleData));
	} else if (divisionsData && Object.keys(divisionsData).length > 0) {
		matchData = initializeEmptyMatchData(divisionsData);
	}

	const loading = rosterLoading || gameDatesLoading || scheduleLoading;

	// Save mutation
	const saveMutation = useMutation({
		mutationFn: async (data: { seasonCode: string, scheduleData: ScheduleData }) => {
			const processedMatchData = ensureSubdivisionIsolation(data.scheduleData);
			await fetchWithSession(scheduleRoute, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					seasonCode: data.seasonCode,
					scheduleData: processedMatchData,
				}),
			});
			return processedMatchData;
		},
		onSuccess: () => {
			setEnableSaveButton(false);
			queryClient.invalidateQueries({ queryKey: ['schedule', seasonCode] });
		},
		onError: (error) => {
			console.error('Error saving schedule data:', error);
		}
	});

	const handleSeasonCodeSelect = useCallback((value: string) => {
		if (value === seasonCode) return;
		setSeasonCode(value);
	}, [seasonCode]);

	const handleSaveData = useCallback(async (updatedMatchData: ScheduleData) => {
		if (!seasonCode) return;
		saveMutation.mutate({ seasonCode, scheduleData: updatedMatchData });
	}, [seasonCode, saveMutation]);

	return {
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
		// Optionally expose errors if needed:
		// errors: { rosterError, gameDatesError, scheduleError }
	};
}
