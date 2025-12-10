//
// Imports
//

import {
	Player,
	PlayerMemberInfo,
	Team,
	// ...existing code...
	Place,
	Division,
	Mention,
	PaymentType,
	PayoutTier,
	Penalty,
	PeopleType,
	PlaceType,
	Season,
	TrailsDate,
	TrailsDateData,
	PlayerDataTable,
	PlaceDataTable,
	TeamDataTable,
} from "@/lib/definitions";
import {
	// relative API routes
	divisionRoute,
	mentionRoute,
	paymentTypeRoute,
	payoutTierRoute,
	penaltyRoute,
	peopleTypeRoute,
	placeDataTableRoute,
	placeRoute,
	placeTypeRoute,
	playerRoute,
	playersDataTableRoute,
	seasonRoute,
	teamRoute,
	teamsDataTableRoute,
	trailsDateRoute,
	trailsRoute,
} from "@/lib/apiRoutes";
import { useQuery } from "@tanstack/react-query";

// Helper: allow Next.js redirect errors to bubble to the framework
function rethrowNextRedirect(error: unknown) {
	// Next attaches a special digest to redirect errors
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const digest = (error as any)?.digest as unknown;
	if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
		throw error;
	}
}
//
// async function to get all player data from the database
//
// Shared helper to call our Next.js API with session cookies
export async function fetchWithSession(input: string, init: RequestInit = {}) {
	const baseInit: RequestInit = {
		method: init.method ?? "GET",
		headers: {
			"Content-Type": "application/json",
			...(init.headers as Record<string, string> | undefined),
		},
		cache: "no-store",
		...init,
	};

	let url = input;

	if (typeof window === "undefined") {
		// Server-side: build absolute URL and forward cookies from the incoming request
		const { headers } = await import("next/headers");
		const hdrs = await headers();
		const host = hdrs.get("host") ?? process.env.VERCEL_URL ?? "localhost:3000";
		const proto = hdrs.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
		const origin = `${proto}://${host}`;
		if (!/^https?:\/\//i.test(input)) {
			url = origin + input;
		}
		const cookieHeader = hdrs.get("cookie") ?? "";
		(baseInit.headers as Record<string, string>).cookie = cookieHeader;
		// Extract csrfToken from cookies and send as header for unsafe methods
		if (/^(POST|PUT|DELETE|PATCH)$/i.test(String(baseInit.method))) {
			const match = cookieHeader.match(/(?:^|;\s*)csrfToken=([^;]+)/);
			if (match?.[1]) {
				(baseInit.headers as Record<string, string>)["X-CSRF-Token"] = decodeURIComponent(match[1]);
			}
		}
	} else {
		// Client-side: include credentials for same-origin requests
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(baseInit as any).credentials = "include";
		// Read CSRF token from document.cookie
		if (/^(POST|PUT|DELETE|PATCH)$/i.test(String(baseInit.method))) {
			try {
				const m = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
				if (m?.[1]) {
					(baseInit.headers as Record<string, string>)["X-CSRF-Token"] = decodeURIComponent(m[1]);
				}
			} catch { /* no-op */ }
		}
	}

	const resp = await fetch(url, baseInit);
	if (resp.status === 403) {
		if (typeof window === "undefined") {
			const { redirect } = await import("next/navigation");
			redirect("/Portal");
		} else {
			try {
				window.location.assign("/Portal");
			} catch { /* no-op */ }
			throw new Error("Forbidden");
		}
	}
	return resp;
}

export async function fetchPlayers() {
	try {
		const response = await fetchWithSession(playerRoute);
		if (!response.ok) {
			throw new Error(
				"Network response was not ok: " + (await response.text())
			);
		}
		const data = (await response.json()) as Player[];
		return data;
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}

export async function fetchPlayersDataTable() {
	// attempt to get data
	try {
		const response = await fetchWithSession(playersDataTableRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as PlayerDataTable[];
		return data;
		// if it cannot get data error out
	} catch (error) {
		rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// get data for a specific player with both player and membership information
//
export async function fetchPlayerMember(ledaId: string) {
	// attempt to get data
	try {
	const response = await fetchWithSession(`${playerRoute}?ledaId=${ledaId}`);
		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			console.log(response);
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as PlayerMemberInfo;
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Member Information");
	}
}
//
// async function to get all team data from the database
//
export async function fetchTeams() {
	// attempt to get data
	try {
	const response = await fetchWithSession(teamRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Team[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all team data from the database for datatable
//
export async function fetchTeamsDataTable() {
	// attempt to get data
	try {
	const response = await fetchWithSession(teamsDataTableRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}			
		const data = (await response.json()) as TeamDataTable[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Team DataTable Information");
	}
}
//
// Get data for a specific team
//
export async function fetchTeam(ledaId: string) {
	// attempt to get data
	try {
	const response = await fetchWithSession(`${teamRoute}?ledaId=${ledaId}`);
		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			console.log(response);
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Team;
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Team Information");
	}
}

//
// Fetch members for a specific team (memberInfo endpoint)
//
export interface TeamMemberInfoRecord {
	fullName: string;
	ledaId: string;
	isCaptain: boolean;
	cannotBeCaptain: boolean;
	badStanding: boolean;
}

export async function fetchTeamMembers(ledaId: string): Promise<TeamMemberInfoRecord[]> {
	try {
		const response = await fetchWithSession(`${teamRoute}/memberInfo?ledaId=${ledaId}`);
		if (!response.ok) {
			if (response.status === 404) return [];
			throw new Error("Network response was not ok");
		}
		const data = await response.json();
		return (data as TeamMemberInfoRecord[]).map(m => ({
			fullName: m.fullName,
			ledaId: m.ledaId,
			isCaptain: m.isCaptain,
			cannotBeCaptain: m.cannotBeCaptain,
			badStanding: m.badStanding,
		}));
	} catch (error) {
		rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Team Member Information");
	}
}
//
// async function to get all place data from the database
//
export async function fetchPlaces() {
	// attempt to get data
	try {
	const response = await fetchWithSession(placeRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Place[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all place data from the database for datatable
//
export async function fetchPlacesDataTable() {
	// attempt to get data
	try {
	const response = await fetchWithSession(placeDataTableRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as PlaceDataTable[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Place DataTable Information");
	}
}
//
// Get data for a specific place
//
export async function fetchPlace(ledaId: string) {
	// attempt to get data
	try {
	const response = await fetchWithSession(`${placeRoute}?ledaId=${ledaId}`);
		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			console.log(response);
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Place;
		return data;
		// if it cannot get data error out
	} catch (error) {
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Place Information");
	}
}
//
// async function to get all division data from the database
//
export async function fetchDivisions() {
	// attempt to get data
	try {
	const response = await fetchWithSession(divisionRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Division[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all Mention data from the database
//
export async function fetchMentions() {
	// attempt to get data
	try {
	const response = await fetchWithSession(mentionRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Mention[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all Payment Type data from the database
//
export async function fetchPaymentTypes() {
	// attempt to get data
	try {
	const response = await fetchWithSession(paymentTypeRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as PaymentType[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all Payout Tiers data from the database
//
export async function fetchPayoutTiers() {
	// attempt to get data
	try {
	const response = await fetchWithSession(payoutTierRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as PayoutTier[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all Penalties data from the database
//
export async function fetchPenalties() {
	// attempt to get data
	try {
	const response = await fetchWithSession(penaltyRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Penalty[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all People Types data from the database
//
export async function fetchPeopleTypes() {
	// attempt to get data
	try {
	const response = await fetchWithSession(peopleTypeRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as PeopleType[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all Place Types data from the database
//
export async function fetchPlaceTypes() {
	// attempt to get data
	try {
	const response = await fetchWithSession(placeTypeRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as PlaceType[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// async function to get all Seasons data from the database
//
export async function fetchSeasons() {
	// attempt to get data
	try {
	const response = await fetchWithSession(seasonRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Season[];
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// fetch a specific season
//
export async function fetchSeason(seasonCode: string) {
	// attempt to get data
	try {
		const response = await fetchWithSession(
			`${seasonRoute}?seasonCode=${seasonCode}`
		);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as Season;
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// Fetch trails dates
//
export async function fetchTrailsDates() {
	// attempt to get data
	try {
	const response = await fetchWithSession(trailsDateRoute);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()) as TrailsDate[];
		return data;
		// if it cannot get data error out
	} catch (error) {
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Player Information");
	}
}
//
// Fetch trails date data for a specific trails date
//
export async function fetchTrailsDateData(
	trailsDate: string
): Promise<TrailsDateData[]> {
	// attempt to get data
	try {
		const response = await fetchWithSession(
			`${trailsRoute}?trailsDate=${trailsDate}`
		);
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = (await response.json()).rows as TrailsDateData[];
		console.log(data);
		return data;
		// if it cannot get data error out
	} catch (error) {
	rethrowNextRedirect(error);
		console.error("API Error: ", error);
		throw new Error("Failed to fetch Trails Date Data");
	}
}

// --- TanStack Query Hooks ---

export function usePlayersQuery() {
	return useQuery({
		queryKey: ["players"],
		queryFn: fetchPlayers,
	});
}

export function usePlayerMemberQuery(ledaId: string) {
	return useQuery({
		queryKey: ["playerMember", ledaId],
		queryFn: () => fetchPlayerMember(ledaId),
		enabled: !!ledaId,
	});
}

export function useTeamsQuery() {
	return useQuery({
		queryKey: ["teams"],
		queryFn: fetchTeams,
	});
}

export function useTeamQuery(ledaId: string) {
	return useQuery({
		queryKey: ["team", ledaId],
		queryFn: () => fetchTeam(ledaId),
		enabled: !!ledaId,
	});
}

export function usePlacesQuery() {
	return useQuery({
		queryKey: ["places"],
		queryFn: fetchPlaces,
	});
}

export function usePlaceQuery(ledaId: string) {
	return useQuery({
		queryKey: ["place", ledaId],
		queryFn: () => fetchPlace(ledaId),
		enabled: !!ledaId,
	});
}

export function useDivisionsQuery() {
	return useQuery({
		queryKey: ["divisions"],
		queryFn: fetchDivisions,
	});
}

export function useMentionsQuery() {
	return useQuery({
		queryKey: ["mentions"],
		queryFn: fetchMentions,
	});
}

export function usePaymentTypesQuery() {
	return useQuery({
		queryKey: ["paymentTypes"],
		queryFn: fetchPaymentTypes,
	});
}

export function usePayoutTiersQuery() {
	return useQuery({
		queryKey: ["payoutTiers"],
		queryFn: fetchPayoutTiers,
	});
}

export function usePenaltiesQuery() {
	return useQuery({
		queryKey: ["penalties"],
		queryFn: fetchPenalties,
	});
}

export function usePeopleTypesQuery() {
	return useQuery({
		queryKey: ["peopleTypes"],
		queryFn: fetchPeopleTypes,
	});
}

export function usePlaceTypesQuery() {
	return useQuery({
		queryKey: ["placeTypes"],
		queryFn: fetchPlaceTypes,
	});
}

export function useSeasonsQuery() {
	return useQuery({
		queryKey: ["seasons"],
		queryFn: fetchSeasons,
	});
}

export function useSeasonQuery(seasonCode: string) {
	return useQuery({
		queryKey: ["season", seasonCode],
		queryFn: () => fetchSeason(seasonCode),
		enabled: !!seasonCode,
	});
}

export function useTrailsDatesQuery() {
	return useQuery({
		queryKey: ["trailsDates"],
		queryFn: fetchTrailsDates,
	});
}

export function useTrailsDateDataQuery(trailsDate: string) {
	return useQuery({
		queryKey: ["trailsDateData", trailsDate],
		queryFn: () => fetchTrailsDateData(trailsDate),
		enabled: !!trailsDate,
	});
}
