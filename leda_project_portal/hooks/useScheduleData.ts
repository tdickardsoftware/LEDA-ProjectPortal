/**
 * Core scheduling hook for the LEDA schedule management page.
 * Orchestrates fetching roster and game-date data, building the empty match
 * data structure, and saving updated schedule data back to the API.
 * Each subdivision fetches its own match data independently (lazy loading)
 * rather than loading the entire schedule upfront.
 */
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
	ScheduleData, 
	DivisionsData, 
	RosterApiResponse, 
	SeasonApiResponse
} from '@/lib/schedule';
import { rosterRoute, scheduleRoute, seasonRoute } from '@/lib/apiRoutes';
import { fetchWithSession } from '@/lib/getData';
import { SaveStatus } from '@/components/ui/save-status-indicator';
export type { SaveStatus };

// Helper fetchers
const fetchRoster = async (seasonCode: string): Promise<RosterApiResponse | null> => {
	const res = await fetch(`${rosterRoute}?seasonCode=${seasonCode}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});
	if (res.status === 404) return null;
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
/**
 * Manages all state and server interactions for the schedule builder.
 * Returns roster divisions, game dates, match data, a save handler,
 * and loading/save-button state.
 */
export function useScheduleData() {
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [updatedMatchData, setUpdatedMatchData] = useState<ScheduleData>({});
	const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
	const [requiresManualSave, setRequiresManualSave] = useState<boolean>(false);

	const queryClient = useQueryClient();

	// Stamps every match with its parent subdivisionId so cross-subdivision
	// mutations cannot accidentally overwrite unrelated records.
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

	// Builds a ScheduleData skeleton from the roster so each team has an
	// empty matchesData object ready for per-subdivision data to be merged in.
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

	// NOTE: We no longer fetch all schedule data upfront
	// Each subdivision will fetch its own matchup data when opened
	// This improves performance with normalized data structure

	// Derived data
	const divisionsData: DivisionsData = rosterData?.teamInformation || {};
	const gameDates: Record<string, string> = gameDatesData?.dates || {};
	
	// Initialize empty match data structure
	const matchData: ScheduleData = divisionsData && Object.keys(divisionsData).length > 0 
		? initializeEmptyMatchData(divisionsData) 
		: {};

	const loading = rosterLoading || gameDatesLoading;

	// Save mutation
	const saveMutation = useMutation({
		mutationFn: async (data: { seasonCode: string, scheduleData: ScheduleData }) => {
			setSaveStatus('saving');
			const processedMatchData = ensureSubdivisionIsolation(data.scheduleData);
			const response = await fetchWithSession(scheduleRoute, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					seasonCode: data.seasonCode,
					scheduleData: processedMatchData,
				}),
			});
			if (!response.ok) {
				const errorBody = await response.json().catch(() => ({}));
				throw new Error(errorBody?.message ?? `Save failed with status ${response.status}`);
			}
			return processedMatchData;
		},
		onSuccess: () => {
			setUpdatedMatchData({});
			setEnableSaveButton(false);
			setRequiresManualSave(false);
			setSaveStatus('saved');
			queryClient.invalidateQueries({ queryKey: ['schedule', seasonCode] });
		},
		onError: (error) => {
			console.error('Error saving schedule data:', error);
			setSaveStatus('error');
		}
	});

	const handleSeasonCodeSelect = useCallback((value: string) => {
		if (value === seasonCode) return;
		setSeasonCode(value);
		setUpdatedMatchData({});
		setEnableSaveButton(false);
		setRequiresManualSave(false);
		setSaveStatus('idle');
	}, [seasonCode]);

	const stageScheduleData = useCallback((
		nextMatchData: ScheduleData,
		options?: { requiresManualSave?: boolean }
	) => {
		const hasChanges = Object.keys(nextMatchData).length > 0;
		const nextRequiresManualSave = hasChanges && options?.requiresManualSave === true;

		setUpdatedMatchData(nextMatchData);
		setEnableSaveButton(hasChanges);
		setRequiresManualSave(nextRequiresManualSave);
		setSaveStatus(hasChanges && !nextRequiresManualSave ? 'pending' : 'idle');
	}, []);

	const handleSaveData = useCallback(async (updatedMatchData: ScheduleData) => {
		if (!seasonCode || Object.keys(updatedMatchData).length === 0) return;
		await saveMutation.mutateAsync({ seasonCode, scheduleData: updatedMatchData });
	}, [seasonCode, saveMutation]);

	useEffect(() => {
		if (requiresManualSave) {
			return;
		}

		if (!seasonCode || Object.keys(updatedMatchData).length === 0) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			void handleSaveData(updatedMatchData);
		}, 1500);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [handleSaveData, requiresManualSave, seasonCode, updatedMatchData]);

	const rosterNotFound = !!seasonCode && !rosterLoading && rosterData === null;

	return {
		seasonCode,
		divisionsData,
		loading,
		currentSeason,
		setCurrentSeason,
		gameDates,
		matchData,
		updatedMatchData,
		stageScheduleData,
		enableSaveButton,
		setEnableSaveButton,
		requiresManualSave,
		saveStatus,
		handleSeasonCodeSelect,
		handleSaveData,
		rosterNotFound,
	};
}
