import { useState, useCallback } from 'react';
import { 
	ScheduleData, 
	DivisionsData, 
	RosterApiResponse, 
	SeasonApiResponse, 
	ScheduleApiResponse 
} from '@/lib/schedule';
import { rosterRoute, scheduleRoute, seasonRoute } from '@/lib/apiRoutes';

export function useScheduleData() {
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [divisionsData, setDivisionsData] = useState<DivisionsData>({});
	const [loading, setLoading] = useState(false);
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [gameDates, setGameDates] = useState<Record<string, string>>({});
	const [matchData, setMatchData] = useState<ScheduleData>({});
	const [updatedMatchData, setUpdatedMatchData] = useState<ScheduleData>({});
	const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);

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

	const handleSeasonCodeSelect = useCallback(async (value: string) => {
		if (value === seasonCode) return;
		
		setSeasonCode(value);
		setLoading(true);

		try {
			// Parallel API calls for better performance
			const [rosterResult, gameDatesResult, matchDataResult] = await Promise.allSettled([
				fetch(`${rosterRoute}?seasonCode=${value}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				}),
				fetch(`${seasonRoute}?seasonCode=${value}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				}),
				fetch(`${scheduleRoute}?seasonCode=${value}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				})
			]);

			// Handle roster data
			if (rosterResult.status === 'fulfilled' && rosterResult.value.status === 200) {
				const rosterData: RosterApiResponse = await rosterResult.value.json();
				const fetchedData = structuredClone(rosterData.teamInformation);
				setDivisionsData(fetchedData);

				// Handle game dates
				if (gameDatesResult.status === 'fulfilled' && gameDatesResult.value.status === 200) {
					const gameDatesData: SeasonApiResponse = await gameDatesResult.value.json();
					setGameDates(gameDatesData.dates || {});
				}

				// Handle match data
				if (matchDataResult.status === 'fulfilled' && matchDataResult.value.status === 200) {
					const existingMatchData: ScheduleApiResponse = await matchDataResult.value.json();
					const processedMatchData = ensureSubdivisionIsolation(
						structuredClone(existingMatchData.scheduleData)
					);
					setMatchData(processedMatchData);
				} else {
					// Initialize empty match data structure
					const newMatchData = initializeEmptyMatchData(fetchedData);
					setMatchData(newMatchData);
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
	}, [seasonCode, ensureSubdivisionIsolation, initializeEmptyMatchData]);

	const handleSaveData = useCallback(async (updatedMatchData: ScheduleData) => {
		if (!seasonCode) return;

		try {
			const processedMatchData = ensureSubdivisionIsolation(updatedMatchData);
			setMatchData(processedMatchData);

			await fetch(scheduleRoute, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					seasonCode,
					scheduleData: processedMatchData,
				}),
			});
			
			setEnableSaveButton(false);
		} catch (error) {
			console.error('Error saving schedule data:', error);
		}
	}, [seasonCode, ensureSubdivisionIsolation]);

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
	};
}
