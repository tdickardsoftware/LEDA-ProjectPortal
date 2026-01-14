import { useQuery } from "@tanstack/react-query";
import { calendarRoute } from "@/lib/apiRoutes";

interface CalendarDate {
	date: string;
	desc: string;
}

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
