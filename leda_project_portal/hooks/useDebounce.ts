/**
 * Shared debounce helpers.
 * - useDebouncedEffect: runs `effect` after `delayMs` of no dep changes (search inputs).
 * - useDebouncedCallback: `schedule()` runs the latest callback after `delayMs`;
 *   `cancel()` drops a pending run (autosave with a manual "save now" path).
 */
"use client";

import { useCallback, useEffect, useRef, type DependencyList } from "react";

export function useDebouncedEffect(effect: () => void, deps: DependencyList, delayMs: number) {
	useEffect(() => {
		const timer = setTimeout(effect, delayMs);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
}

export function useDebouncedCallback(callback: () => void, delayMs: number) {
	const callbackRef = useRef(callback);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		callbackRef.current = callback;
	});

	const cancel = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
	}, []);

	const schedule = useCallback(() => {
		cancel();
		timerRef.current = setTimeout(() => callbackRef.current(), delayMs);
	}, [cancel, delayMs]);

	useEffect(() => cancel, [cancel]);

	return { schedule, cancel };
}
