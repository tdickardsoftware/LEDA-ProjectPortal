"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { DatePickerCustom } from "@/components/ui/date-picker";

function parseIsoDateString(value: string | null | undefined): Date | undefined {
	if (!value) return undefined;
	// Expecting YYYY-MM-DD (native date input format)
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		const date = new Date(`${value}T00:00:00`);
		return isNaN(date.getTime()) ? undefined : date;
	}
	const fallback = new Date(value);
	return isNaN(fallback.getTime()) ? undefined : fallback;
}

function formatIsoDateString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function DatePickerFormField({
	control,
	name,
	label,
	initialMonth,
	disabledDates,
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
	initialMonth?: Date;
	disabledDates?: Date[];
}) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const selected = parseIsoDateString(field.value);
				return (
					<FormItem className="flex flex-col">
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<DatePickerCustom
								showInput={true}
								dateSelected={selected}
								initialMonth={selected ?? initialMonth}
								disabledDates={disabledDates ?? []}
								onDateChange={(date) => {
									field.onChange(date ? formatIsoDateString(date) : "");
								}}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}
