"use client";

/**
 * CalendarPageContent
 *
 * Displays a react-big-calendar view of blocked dates (non-game dates such as
 * holidays). Users can:
 *   - Navigate by month/week/day to any year — the query key changes with
 *     `currentYear` so only the viewed year's data is fetched.
 *   - Add a new blocked date (date + description) via an add-date dialog.
 *   - Delete a blocked date via a per-event delete button with a
 *     confirmation dialog.
 *
 * Data mutations invalidate the `["calendar", currentYear]` query cache.
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCalendarData } from "@/hooks/useCalendarData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerCustom } from "@/components/ui/date-picker";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import ShadcnBigCalendar from "@/components/ui/shadcn-big-calendar/shadcn-big-calendar";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import type { CalendarProps } from "react-big-calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarRoute } from "@/lib/apiRoutes";
import { fetchWithSession } from "@/lib/getData";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const localizer = momentLocalizer(moment);

// Type for blocked date from database
interface BlockedDate {
	date: Date;
	desc: string;
}

// Calendar event type
type CalendarEvent = {
	title: string;
	start: Date;
	end: Date;
	desc: string;
};

export default function CalendarPageContent() {
	const [view, setView] = useState(Views.MONTH);
	const [date, setDate] = useState(new Date());
	const [showBlockedDatesDialog, setShowBlockedDatesDialog] = useState(false);
	const [showAddDateDialog, setShowAddDateDialog] = useState(false);
	const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
	const [dateToDelete, setDateToDelete] = useState<BlockedDate | null>(null);
	const [newDate, setNewDate] = useState<Date | undefined>(new Date());
	const [newDesc, setNewDesc] = useState("");

	const queryClient = useQueryClient();

	// Fetch calendar data for the current year being viewed
	const currentYear = date.getFullYear();
	const { data: calendarData, isLoading } = useCalendarData(currentYear);

	// Mutation for adding a new blocked date
	const addDateMutation = useMutation({
		mutationFn: async (data: { date: string; desc: string }) => {
			const response = await fetchWithSession(calendarRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData?.message || `HTTP error! status: ${response.status}`
				);
			}
			return await response.json();
		},
		onSuccess: () => {
			toast.success("Blocked date added successfully!");
			queryClient.invalidateQueries({ queryKey: ["calendar", currentYear] });
			setShowAddDateDialog(false);
			setNewDate(new Date());
			setNewDesc("");
		},
		onError: (error: Error) => {
			toast.error(`Failed to add date: ${error.message}`);
		},
	});

	// Mutation for deleting a blocked date
	const deleteDateMutation = useMutation({
		mutationFn: async (dateToDelete: Date) => {
			const response = await fetchWithSession(calendarRoute, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ date: dateToDelete.toISOString() }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData?.message || `HTTP error! status: ${response.status}`
				);
			}
			return await response.json();
		},
		onSuccess: () => {
			toast.success("Blocked date deleted successfully!");
			queryClient.invalidateQueries({ queryKey: ["calendar", currentYear] });
			setShowDeleteConfirmDialog(false);
			setDateToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete date: ${error.message}`);
		},
	});

	// Transform API data to BlockedDate format
	const blockedDates = useMemo<BlockedDate[]>(() => {
		if (!calendarData) return [];
		return calendarData.map(item => ({
			date: new Date(item.date),
			desc: item.desc
		}));
	}, [calendarData]);

	// Extract dates for disabling in date picker
	const disabledDates = useMemo(() => {
		return blockedDates.map(bd => bd.date);
	}, [blockedDates]);

	// Convert blocked dates to calendar events
	const events: CalendarEvent[] = blockedDates.map(({ date, desc }) => {
		const eventDate = new Date(date);
		return {
			title: desc,
			start: eventDate,
			end: eventDate,
			desc: desc,
		};
	});

	/** Navigate the calendar to a new date and update the year used as the query key. */
	const handleNavigate = (newDate: Date) => {
		setDate(newDate);
	};

	const handleViewChange = (newView: any) => {
		setView(newView);
	};

	const eventStyleGetter: CalendarProps<CalendarEvent>["eventPropGetter"] = () => {
		return {
			className: "event-variant-primary",
		};
	};

	/** Add a new blocked date after validating that both date and description are provided. */
	const handleAddDate = () => {
		if (!newDate || !newDesc.trim()) {
			toast.error("Please select a date and enter a description.");
			return;
		}
		addDateMutation.mutate({
			date: newDate.toISOString(),
			desc: newDesc,
		});
	};

	/** Open the delete-confirmation dialog for a specific blocked date. */
	const handleDeleteClick = (blockedDate: BlockedDate) => {
		setDateToDelete(blockedDate);
		setShowDeleteConfirmDialog(true);
	};

	const handleDeleteConfirm = () => {
		if (dateToDelete) {
			deleteDateMutation.mutate(dateToDelete.date);
		}
	};

	// Custom event component with delete button
	const CustomEvent = ({ event }: { event: CalendarEvent }) => {
		return (
			<div className="group flex items-center justify-between w-full h-full px-1">
				<span className="truncate flex-1">{event.title}</span>
				<button
					onClick={(e) => {
						e.stopPropagation();
						const blockedDate = blockedDates.find(
							bd => bd.date.toDateString() === event.start.toDateString()
						);
						if (blockedDate) {
							handleDeleteClick(blockedDate);
						}
					}}
					className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-destructive/20 rounded p-0.5"
				>
					<Trash2 className="h-3 w-3 text-destructive" />
				</button>
			</div>
		);
	};

	return (
		<div className="space-y-6 mt-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button size="default" onClick={() => setShowAddDateDialog(true)}>
						Add Date
					</Button>
				<Badge 
					variant="outline" 
					className="text-sm cursor-pointer hover:bg-accent"
					onClick={() => setShowBlockedDatesDialog(true)}
				>
						{blockedDates.length} {blockedDates.length === 1 ? "date" : "dates"} blocked
					</Badge>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Blocked Dates Calendar</CardTitle>
					<CardDescription>
						View dates that are blocked for matchups. Switch between month, week, and day views.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="w-full">
						<ShadcnBigCalendar
							localizer={localizer}
							events={events}
							style={{ height: 600, width: "100%" }}
							className="border-border border-rounded-md border-solid border-2 rounded-lg"
							date={date}
							onNavigate={handleNavigate}
							view={view}
							onView={handleViewChange}
							eventPropGetter={eventStyleGetter}
							views={["month", "week", "day", "agenda"]}
							components={{
								event: CustomEvent,
							}}
						/>
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={showAddDateDialog} onOpenChange={setShowAddDateDialog}>
				<AlertDialogContent className="max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle>Add Blocked Date</AlertDialogTitle>
						<AlertDialogDescription>
							Add a new date to block for matchups
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="blocked-date">Date *</Label>
							<DatePickerCustom
								onDateChange={(selectedDate) => setNewDate(selectedDate)}
								initialMonth={newDate || new Date()}
								dateSelected={newDate}
								showInput={true}							disabledDates={disabledDates}							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description *</Label>
							<Input
								id="description"
								placeholder="e.g., Tournament Day"
								value={newDesc}
								onChange={(e) => setNewDesc(e.target.value)}
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleAddDate();
							}}
							disabled={addDateMutation.isPending}
						>
							{addDateMutation.isPending ? "Adding..." : "Add Date"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={showBlockedDatesDialog} onOpenChange={setShowBlockedDatesDialog}>
				<AlertDialogContent className="max-w-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle>Blocked Dates</AlertDialogTitle>
						<AlertDialogDescription>
							All dates currently blocked for matchups
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="max-h-96 overflow-y-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="w-12"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{blockedDates.length === 0 ? (
									<TableRow>
										<TableCell colSpan={3} className="text-center text-muted-foreground">
											No blocked dates
										</TableCell>
									</TableRow>
								) : (
									blockedDates
										.sort((a, b) => a.date.getTime() - b.date.getTime())
										.map((blockedDate, index) => (
											<TableRow key={index} className="group">
												<TableCell className="font-medium">
													{moment(blockedDate.date).format("MMMM D, YYYY")}
												</TableCell>
												<TableCell>{blockedDate.desc}</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="icon"
														className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
														onClick={() => handleDeleteClick(blockedDate)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))
								)}
							</TableBody>
						</Table>
					</div>
					<AlertDialogFooter>
						<AlertDialogAction>Close</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Blocked Date?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the blocked date for{" "}
							<span className="font-semibold">
								{dateToDelete && moment(dateToDelete.date).format("MMMM D, YYYY")}
							</span>
							? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDeleteConfirm();
							}}
							disabled={deleteDateMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteDateMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}