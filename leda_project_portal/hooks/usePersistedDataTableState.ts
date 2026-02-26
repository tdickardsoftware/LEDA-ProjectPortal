/**
 * Hook that persists data-table UI state (page, pageSize, search, sorting)
 * in sessionStorage so navigating away and back restores the previous view.
 * State is reset to page 1 on unmount unless the next route marks itself as
 * a "preserve" navigation (e.g. opening a detail/view page).
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PersistedDataTableState = {
	page: number;
	pageSize: number;
	search: string;
	sorting: { id: string; desc: boolean }[];
};

type PersistedDataTableStateOptions = {
	defaultPage?: number;
	defaultPageSize?: number;
	defaultSearch?: string;
};

/**
 * Safely parses a JSON string from sessionStorage into a partial
 * `PersistedDataTableState`, validating each field before accepting it.
 * Returns `null` if the raw value is absent or malformed.
 */
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

		if (typeof (maybe as any).pageSize === "number" && Number.isFinite((maybe as any).pageSize) && (maybe as any).pageSize >= 1) {
			result.pageSize = Math.floor((maybe as any).pageSize);
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
			pageSize: options?.defaultPageSize ?? 10,
			search: options?.defaultSearch ?? "",
			sorting: [] as { id: string; desc: boolean }[]
		}),
		[options?.defaultPage, options?.defaultPageSize, options?.defaultSearch]
	);

	const [state, setState] = useState<PersistedDataTableState>(() => {
		if (typeof window === "undefined") return defaults;

		const parsed = safeParseState(sessionStorage.getItem(storageKey));
		return {
			page: parsed?.page ?? defaults.page,
			pageSize: parsed?.pageSize ?? defaults.pageSize,
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

	// Reset persisted page when leaving the page, unless the next navigation
	// was explicitly marked as "preserve" (used for view/detail pages).
	useEffect(() => {
		if (typeof window === "undefined") return;
		return () => {
			try {
				const preserveKey = `datatable:preserve:${storageKey}`;
				const shouldPreserve = sessionStorage.getItem(preserveKey) === "1";
				if (shouldPreserve) {
					sessionStorage.removeItem(preserveKey);
					return;
				}

				const raw = sessionStorage.getItem(storageKey);
				const parsed = safeParseState(raw);
				sessionStorage.setItem(
					storageKey,
					JSON.stringify({
						page: defaults.page,
						pageSize: parsed?.pageSize ?? defaults.pageSize,
						search: parsed?.search ?? defaults.search,
						sorting: parsed?.sorting ?? defaults.sorting,
					})
				);
			} catch {
				// Ignore storage errors.
			}
		};
	}, [storageKey, defaults.page, defaults.pageSize, defaults.search, defaults.sorting]);

	const setPage = useCallback((page: number) => {
		setState((prev) => ({ ...prev, page }));
	}, []);

	const setPageSize = useCallback((pageSize: number) => {
		setState((prev) => ({ ...prev, pageSize }));
	}, []);

	const setSearch = useCallback((search: string) => {
		setState((prev) => ({ ...prev, search }));
	}, []);

	const setSorting = useCallback((sorting: { id: string; desc: boolean }[]) => {
		setState((prev) => ({ ...prev, sorting }));
	}, []);

	return {
		page: state.page,
		pageSize: state.pageSize,
		search: state.search,
		sorting: state.sorting,
		setPage,
		setPageSize,
		setSearch,
		setSorting
	};
}
