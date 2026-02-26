/**
 * Hook for fetching LEDA calendar dates and descriptions for a given year.
 * Data is queried from the calendar API and cached via React Query.
 */
import { useQuery } from "@tanstack/react-query";
import { calendarRoute } from "@/lib/apiRoutes";

// Shape of a single calendar entry returned by the API
interface CalendarDate {
	date: string;
	desc: string;
}

/**
 * Fetches calendar dates for the given `year`.
 * Query key includes the year so each year's data is cached independently.
 */
export function useCalendarData(year: number) {
	return useQuery<CalendarDate[]>({
		queryKey: ["calendar", year],
		queryFn: async () => {
			const response = await fetch(`${calendarRoute}?year=${year}`);
			if (!response.ok) {
				throw new Error("Failed to fetch calendar data");
			}
			return response.json();
		},
	});
}
