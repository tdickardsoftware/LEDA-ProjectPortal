// Use Client
"use client";

/**
 * TrailsPageContent
 *
 * Redesigned trails page using SidenavPageLayout + DivisionTreeSidenav.
 *
 * Sidenav structure:
 *   Year selector  →  Months (divisions)  →  Dates (subdivisions, selectable)
 *
 * - Selecting a date loads and displays the player roster for that event.
 * - When no date is selected the empty content area shows the "Add a Trails
 *   Date" flow (date picker + player staging + submit).
 */

import { useEffect, useMemo, useState } from "react";
import { format, getMonth, getYear, parse } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTrailsDateData, fetchTrailsDates, fetchWithSession } from "@/lib/getData";
import { trailsRoute } from "@/lib/apiRoutes";
import { TrailsDateData } from "@/lib/definitions";
import SidenavPageLayout from "@/components/sidenav-page-layout";
import DivisionTreeSidenav, { DivisionTreeDivision } from "@/components/division-tree-sidenav";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Plus, X } from "lucide-react";
import { SaveStatusIndicator, SaveStatus } from "@/components/ui/save-status-indicator";
import TrailsDateEditForm from "@/components/forms/activities/trails-date-edit-form";
import TrailsDateAddForm from "@/components/forms/activities/trails-date-add-form";
import { DatePickerCustom } from "@/components/ui/date-picker";
import { Spinner } from "@/components/ui/skeleton";

const MONTH_NAMES = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];

const getEasternTime = (date = new Date()) =>
	new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));

export default function TrailsPageContent() {
	const queryClient = useQueryClient();

	// ── State ────────────────────────────────────────────────────────────────
	const [selectedYear, setSelectedYear] = useState<number>(getYear(getEasternTime()));
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [editStates, setEditStates] = useState<Record<string, boolean>>({});
	const [addPlayer, setAddPlayer] = useState(false);

	// Staging state for building a brand-new trails date before submitting
	const [newDateStr, setNewDateStr] = useState<string>(
		format(getEasternTime(), "MM-dd-yyyy")
	);
	const [stagingPlayers, setStagingPlayers] = useState<TrailsDateData[]>([]);

	// ── Queries ──────────────────────────────────────────────────────────────

	const { data: allDates = [], isLoading: isLoadingDates } = useQuery({
		queryKey: ["trailsDates"],
		queryFn: async () => {
			const result = await fetchTrailsDates();
			return result.map((item) => ({
				...item,
				trailsDate: format(new Date(item.trailsDate), "MM-dd-yyyy"),
			}));
		},
	});

	const {
		data: trailsDateData = [],
		isLoading: loadingTrailsDateData,
		refetch: refetchTrailsDateData,
	} = useQuery({
		queryKey: ["trailsDateData", selectedDate],
		queryFn: () =>
			selectedDate ? fetchTrailsDateData(selectedDate) : Promise.resolve([]),
		enabled: !!selectedDate,
	});

	// ── Derived data ─────────────────────────────────────────────────────────

	const availableYears = useMemo(() => {
		const years = new Set(
			allDates.map((d) => getYear(parse(d.trailsDate, "MM-dd-yyyy", new Date())))
		);
		return [...years].sort((a, b) => b - a); // newest first
	}, [allDates]);

	// If the current selectedYear has no data, fall back to the most recent year
	useEffect(() => {
		if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
			setSelectedYear(availableYears[0]);
		}
	}, [availableYears, selectedYear]);

	// Auto-select today's date if a trails event exists for it
	useEffect(() => {
		if (allDates.length > 0 && !selectedDate) {
			const today = format(getEasternTime(), "MM-dd-yyyy");
			if (allDates.some((d) => d.trailsDate === today)) {
				setSelectedDate(today);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allDates]);

	const datesForYear = useMemo(
		() =>
			allDates.filter(
				(d) =>
					getYear(parse(d.trailsDate, "MM-dd-yyyy", new Date())) === selectedYear
			),
		[allDates, selectedYear]
	);

	// Build DivisionTreeSidenav data: month → dates
	const divisionTreeItems = useMemo<DivisionTreeDivision[]>(() => {
		const byMonth: Record<number, string[]> = {};
		datesForYear.forEach((d) => {
			const month = getMonth(parse(d.trailsDate, "MM-dd-yyyy", new Date()));
			(byMonth[month] ??= []).push(d.trailsDate);
		});
		return Object.keys(byMonth)
			.map(Number)
			.sort((a, b) => a - b)
			.map((month) => ({
				name: MONTH_NAMES[month],
				subdivisions: byMonth[month]
					.sort()
					.map((date) => ({ name: date })),
			}));
	}, [datesForYear]);

	const selectedSubdivision = useMemo(() => {
		if (!selectedDate) return null;
		return {
			divisionName:
				MONTH_NAMES[getMonth(parse(selectedDate, "MM-dd-yyyy", new Date()))],
			subdivisionName: selectedDate,
		};
	}, [selectedDate]);

	const disabledTrailsDates = useMemo(
		() =>
			allDates
				.map((item) => parse(item.trailsDate, "MM-dd-yyyy", new Date()))
				.filter((d) => !isNaN(d.getTime())),
		[allDates]
	);

	// ── Mutations ─────────────────────────────────────────────────────────────

	const addPlayerMutation = useMutation({
		mutationFn: async (values: TrailsDateData) => {
			if (selectedDate) values.trailsDate = selectedDate;
			return fetchWithSession(trailsRoute, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["trailsDateData", selectedDate] });
			setAddPlayer(false);
		},
	});

	const deletePlayerMutation = useMutation({
		mutationFn: async (value: TrailsDateData) =>
			fetchWithSession(trailsRoute, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(value),
			}),
		onMutate: async (value) => {
			await queryClient.cancelQueries({ queryKey: ["trailsDateData", selectedDate] });
			const previous = queryClient.getQueryData<TrailsDateData[]>([
				"trailsDateData",
				selectedDate,
			]);
			queryClient.setQueryData<TrailsDateData[]>(
				["trailsDateData", selectedDate],
				(old) => (old ?? []).filter(
					(item) => String(item.ledaId) !== String(value.ledaId)
				)
			);
			return { previous };
		},
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ["trailsDateData", selectedDate] });
			// If no players remain for this date, remove it from the sidenav and deselect
			const remaining = queryClient.getQueryData<TrailsDateData[]>(["trailsDateData", selectedDate]);
			if (remaining && remaining.length === 0) {
				queryClient.setQueryData<{ trailsDate: string }[]>(
					["trailsDates"],
					(old) => (old ?? []).filter((d) => d.trailsDate !== selectedDate)
				);
				setSelectedDate(null);
			}
		},
		onError: (_err, _val, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					["trailsDateData", selectedDate],
					context.previous
				);
			}
		},
	});

	const addTrailsDateMutation = useMutation({
		mutationFn: async (players: TrailsDateData[]) => {
			for (const player of players) {
				await fetchWithSession(trailsRoute, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ...player, trailsDate: newDateStr }),
				});
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["trailsDates"] });
			setStagingPlayers([]);
			window.location.reload();
		},
	});

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleEditToggle = (key: string) =>
		setEditStates((prev) => ({ ...prev, [key]: !prev[key] }));

	const handleRefresh = async (key: string) => {
		await refetchTrailsDateData();
		handleEditToggle(key);
	};

	const handleDelete = (value: TrailsDateData) => {
		if (
			!window.confirm(
				`Are you sure you want to remove ${value.fullName} from this trails date?`
			)
		)
			return;
		deletePlayerMutation.mutate(value);
	};

	const saveStatus: SaveStatus =
		addPlayerMutation.isPending || deletePlayerMutation.isPending
			? "saving"
			: addPlayerMutation.isError || deletePlayerMutation.isError
			? "error"
			: addPlayerMutation.isSuccess || deletePlayerMutation.isSuccess
			? "saved"
			: "idle";

	// ── Sidenav ───────────────────────────────────────────────────────────────

	const sidenav = (
		<div className="flex flex-col h-full border-r">
			{/* Year selector + new date button */}
			<div className="p-3 border-b shrink-0 flex flex-col gap-2">
				<Select
					value={String(selectedYear)}
					onValueChange={(v) => {
						setSelectedYear(Number(v));
						setSelectedDate(null);
						setAddPlayer(false);
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select year" />
					</SelectTrigger>
					<SelectContent>
						{availableYears.map((y) => (
							<SelectItem key={y} value={String(y)}>
								{y}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="sm"
					className="w-full flex items-center gap-1"
					onClick={() => {
						setSelectedDate(null);
						setAddPlayer(false);
						setStagingPlayers([]);
					}}
				>
					<Plus className="w-3 h-3" />
					New Date
				</Button>
			</div>

			{/* Month → Date tree */}
			<div className="flex-1 overflow-hidden">
				<DivisionTreeSidenav
					divisions={divisionTreeItems}
					onSubdivisionSelect={(_month, date) => {
						setSelectedDate(date);
						setAddPlayer(false);
						setEditStates({});
					}}
					selectedSubdivision={selectedSubdivision}
					emptyMessage="No trails dates for this year."
					widthClass="w-52"
				/>
			</div>
		</div>
	);



	// ── Main content (date selected) ──────────────────────────────────────────

	const content = (
		<div className="max-w-xl">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">{selectedDate}</h2>
				<SaveStatusIndicator status={saveStatus} />
			</div>

			{loadingTrailsDateData && <Spinner />}

			{!loadingTrailsDateData && (
				<>
					{!addPlayer && (
						<div className="flex justify-end mb-2">
							<Button
								variant="outline"
								className="hover:bg-muted border-border text-foreground flex items-center gap-1"
								onClick={() => setAddPlayer(true)}
							>
								<Plus className="w-4 h-4" />
								Add Player
							</Button>
						</div>
					)}

					{addPlayer && (
						<TrailsDateAddForm
							handleFormSubmit={(values) =>
								addPlayerMutation.mutate(values)
							}
							trailsDate={selectedDate}
							goBack={(v) => setAddPlayer(v)}
							trailsDateData={trailsDateData}
						/>
					)}

					<Separator className="my-2 bg-muted" />

					<div className="flex flex-col gap-2">
						{trailsDateData.map((item, index) => (
							<Accordion type="single" collapsible key={index}>
								<AccordionItem value={index.toString()}>
									<div className="flex justify-between items-center w-full">
										<span className="text-left">
											{item.ledaId} – {item.fullName}
										</span>
										<div className="flex items-center">
											<AccordionTrigger />
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDelete(item)}
											>
												<X className="text-red-500" />
											</Button>
										</div>
									</div>
									<AccordionContent>
										<div className="flex justify-between">
											{!editStates[index.toString()] ? (
												<div className="flex flex-col gap-2">
													{item.notes && (
														<p>Notes: {item.notes}</p>
													)}
													<p>Trails Points: {item.trailsPoints}</p>
													<p>Singles Place: {item.singlesPlace}</p>
													<p>Doubles Place: {item.doublesPlace}</p>
												</div>
											) : (
												<TrailsDateEditForm
													rowData={item}
													handleRefresh={() =>
														handleRefresh(index.toString())
													}
													index={index.toString()}
												/>
											)}
											<div>
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleEditToggle(index.toString())
													}
												>
													<Pencil className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						))}
					</div>
				</>
			)}
		</div>
	);

	// ── Empty content (no date selected — Add a Trails Date) ──────────────────

	const emptyContent = (
		<div className="max-w-sm">
			<h2 className="text-lg font-semibold mb-4">Add a Trails Date</h2>

			<div className="flex flex-row items-center gap-4 mb-4">
				<DatePickerCustom
					showInput
					dateSelected={
						newDateStr
							? parse(newDateStr, "MM-dd-yyyy", new Date())
							: undefined
					}
					initialMonth={
						newDateStr
							? parse(newDateStr, "MM-dd-yyyy", new Date())
							: getEasternTime()
					}
					disabledDates={disabledTrailsDates}
					onDateChange={(date) => {
						if (!date) return;
						setNewDateStr(format(getEasternTime(date), "MM-dd-yyyy"));
					}}
				/>

				{!addPlayer && (
					<Button
						variant="outline"
						className="hover:bg-muted border-border text-foreground flex items-center gap-1"
						onClick={() => setAddPlayer(true)}
					>
						<Plus className="w-4 h-4" />
						Add Player
					</Button>
				)}
			</div>

			{addPlayer && (
				<TrailsDateAddForm
					handleFormSubmit={(values) => {
						setStagingPlayers((prev) => [...prev, values]);
						setAddPlayer(false);
					}}
					trailsDate={newDateStr}
					goBack={(v) => setAddPlayer(v)}
					trailsDateData={stagingPlayers}
				/>
			)}

			<Separator className="my-2 bg-muted" />

			{stagingPlayers.length > 0 && (
				<div className="flex flex-col gap-2">
					{stagingPlayers.map((item, index) => (
						<Accordion type="single" collapsible key={index}>
							<AccordionItem value={index.toString()}>
								<div className="flex justify-between items-center w-full">
									<span>
										{item.ledaId} – {item.fullName}
									</span>
									<div className="flex items-center">
										<AccordionTrigger />
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												setStagingPlayers((prev) =>
													prev.filter((_, i) => i !== index)
												)
											}
										>
											<X className="text-red-500" />
										</Button>
									</div>
								</div>
								<AccordionContent>
									<div className="flex flex-col gap-2">
										{item.notes && <p>Notes: {item.notes}</p>}
										<p>Trails Points: {item.trailsPoints}</p>
										<p>Singles Place: {item.singlesPlace}</p>
										<p>Doubles Place: {item.doublesPlace}</p>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					))}

					<Button
						className="mt-2"
						disabled={addTrailsDateMutation.isPending}
						onClick={() => addTrailsDateMutation.mutate(stagingPlayers)}
					>
						{addTrailsDateMutation.isPending ? "Saving…" : "Submit"}
					</Button>
				</div>
			)}
		</div>
	);

	// ── Render ─────────────────────────────────────────────────────────────────

	if (isLoadingDates) return <Spinner />;

	return (
		<SidenavPageLayout
			sidenav={sidenav}
			showContent={!!selectedDate}
			emptyContent={emptyContent}
		>
			{content}
		</SidenavPageLayout>
	);
}

