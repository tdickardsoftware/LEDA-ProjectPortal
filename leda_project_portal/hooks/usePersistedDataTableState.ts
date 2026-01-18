"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PersistedDataTableState = {
	page: number;
	search: string;
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
			search: options?.defaultSearch ?? ""
		}),
		[options?.defaultPage, options?.defaultSearch]
	);

	const [state, setState] = useState<PersistedDataTableState>(() => {
		if (typeof window === "undefined") return defaults;

		const parsed = safeParseState(sessionStorage.getItem(storageKey));
		return {
			page: parsed?.page ?? defaults.page,
			search: parsed?.search ?? defaults.search
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

	return {
		page: state.page,
		search: state.search,
		setPage,
		setSearch
	};
}
