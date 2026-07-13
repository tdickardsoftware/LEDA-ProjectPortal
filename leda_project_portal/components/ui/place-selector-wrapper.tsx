"use client";

/**
 * PlaceSelectorWrapper
 *
 * A thin React Hook Form provider wrapper around PlaceSelector, allowing it
 * to be used standalone outside of an existing multi-field form (e.g. a
 * single control on a page). Emits the chosen placeId via `onPlaceChange`.
 */

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import PlaceSelector from "@/components/ui/place-selector";

interface PlaceSelectorWrapperProps {
	label: string;
	value?: string | null;
	onPlaceChange: (placeId: string) => void;
	placeTeamCounts?: Record<string, number>;
}

export default function PlaceSelectorWrapper({
	label,
	value,
	onPlaceChange,
	placeTeamCounts,
}: PlaceSelectorWrapperProps) {
	const form = useForm<{ placeId: string }>({
		defaultValues: { placeId: value || "" },
	});

	// Keep the field in sync when the external value changes (e.g. switching seasons)
	useEffect(() => {
		form.setValue("placeId", value || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	const placeId = form.watch("placeId");
	useEffect(() => {
		if (placeId && placeId !== (value || "")) {
			onPlaceChange(placeId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [placeId]);

	return (
		<FormProvider {...form}>
			<PlaceSelector
				name="placeId"
				label={label}
				control={form.control}
				placeTeamCounts={placeTeamCounts}
			/>
		</FormProvider>
	);
}
