// Import necessary modules and components
"use client";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

// DatePicker component definition
export function DatePickerCustom({
	onDateChange,
	initialMonth,
	dateSelected,
	showInput = false,
	disabledDates = [],
}: {
	onDateChange: (date: Date | undefined) => void;
	initialMonth?: Date;
	dateSelected?: Date;
	showInput?: boolean;
	disabledDates?: Date[];
}) {
	// State to manage the selected date
	const [date, setDate] = React.useState<Date | undefined>(
		dateSelected 
			? new Date(
				dateSelected.getTime() + dateSelected.getTimezoneOffset() * 60000
			)
			: undefined
	);
	// State to manage the visibility of the popover
	const [isOpen, setIsOpen] = React.useState(false);

	// Handle date change
	const handleDateChange = (selectedDate: Date | undefined) => {
		if (!selectedDate) {
			setDate(undefined);
			onDateChange(undefined);
			setIsOpen(false);
			return;
		}
		// Convert selected date to local time
		const localDate = new Date(
			selectedDate.getTime() +
				selectedDate.getTimezoneOffset() * 60000
		);
		setDate(localDate);
		onDateChange(localDate);
		setIsOpen(false);
	};

	// Format date to MM/DD/YYYY
	const formatDate = (date: Date | undefined) => {
		if (!date) return "Pick a date";
		return date.toLocaleDateString("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
		});
	};

	return (
		// Popover component to display the date picker
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				{showInput ? (
					<Button
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? formatDate(date) : <span>Pick a date</span>}
					</Button>
				) : (
					<Button
						variant={"ghost"}
						size="icon"
						className={cn("h-8 w-8", !date && "text-muted-foreground")}
					>
						<CalendarIcon className="h-4 w-4" />
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0 bg-background">
				<DayPicker
					mode="single"
					selected={date}
					onSelect={handleDateChange}
					initialFocus
					defaultMonth={initialMonth}
					disabled={disabledDates.map(d => {
						const normalized = new Date(d);
						normalized.setHours(0, 0, 0, 0);
						return (date: Date) => {
							const checkDate = new Date(date);
							checkDate.setHours(0, 0, 0, 0);
							return checkDate.getTime() === normalized.getTime();
						};
					})}
				/>
			</PopoverContent>
		</Popover>
	);
}
