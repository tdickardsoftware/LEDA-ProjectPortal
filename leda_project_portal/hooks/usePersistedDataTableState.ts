"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PersistedDataTableState = {
	page: number;
	search: string;
	sorting: { id: string; desc: boolean }[];
};

type PersistedDataTableStateOptions = {
	defaultPage?: number;
	defaultSearch?: string;
};

function safeParseState(raw: string | null): Partial<PersistedDataTableState> | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object") return null;

		const maybe = parsed as Partial<PersistedDataTableState>;
		const result: Partial<PersistedDataTableState> = {};

		if (typeof maybe.page === "number" && Number.isFinite(maybe.page) && maybe.page >= 1) {
			result.page = Math.floor(maybe.page);
		}

		if (typeof maybe.search === "string") {
			result.search = maybe.search;
		}

		if (Array.isArray((maybe as any).sorting)) {
			const sortingRaw = (maybe as any).sorting as unknown[];
			const sorting = sortingRaw
				.map((item) => {
					if (!item || typeof item !== "object") return null;
					const obj = item as { id?: unknown; desc?: unknown };
					if (typeof obj.id !== "string" || !obj.id) return null;
					return { id: obj.id, desc: Boolean(obj.desc) };
				})
				.filter(Boolean) as { id: string; desc: boolean }[];

			result.sorting = sorting;
		}

		return result;
	} catch {
		return null;
	}
}

/**
 * Persists datatable UI state (page + search) in sessionStorage.
 * Designed to prevent an initial render on page 1 when navigating back from a view page.
 */
export function usePersistedDataTableState(storageKey: string, options?: PersistedDataTableStateOptions) {
	const defaults = useMemo(
		() => ({
			page: options?.defaultPage ?? 1,
			search: options?.defaultSearch ?? "",
			sorting: [] as { id: string; desc: boolean }[]
		}),
		[options?.defaultPage, options?.defaultSearch]
	);

	const [state, setState] = useState<PersistedDataTableState>(() => {
		if (typeof window === "undefined") return defaults;

		const parsed = safeParseState(sessionStorage.getItem(storageKey));
		return {
			page: parsed?.page ?? defaults.page,
			search: parsed?.search ?? defaults.search,
			sorting: parsed?.sorting ?? defaults.sorting
		};
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			sessionStorage.setItem(storageKey, JSON.stringify(state));
		} catch {
			// Ignore storage quota / privacy mode errors.
		}
	}, [storageKey, state]);

	const setPage = useCallback((page: number) => {
		setState((prev) => ({ ...prev, page }));
	}, []);

	const setSearch = useCallback((search: string) => {
		setState((prev) => ({ ...prev, search }));
	}, []);

	const setSorting = useCallback((sorting: { id: string; desc: boolean }[]) => {
		setState((prev) => ({ ...prev, sorting }));
	}, []);

	return {
		page: state.page,
		search: state.search,
		sorting: state.sorting,
		setPage,
		setSearch,
		setSorting
	};
}
