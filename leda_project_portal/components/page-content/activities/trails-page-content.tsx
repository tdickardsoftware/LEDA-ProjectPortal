// Use Client
"use client";
// Imports
import { DataTable } from "@/components/datatable";
import { columns } from "@/schemas/activities/trails_dates";
import { fetchTrailsDateData, fetchTrailsDates } from "@/lib/getData";
import { trailsDateRoute, trailsRoute } from "@/lib/apiRoutes";
import { format } from "date-fns";
import {  useEffect, useState } from "react";
import { TrailsDateData } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { Pencil, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrailsDateEditForm from "@/components/forms/activities/trails-date-edit-form";
import { Spinner } from "@/components/ui/skeleton";
import TrailsDateAddForm from "@/components/forms/activities/trails-date-add-form";
import { Separator } from "@/components/ui/separator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import {
	useQuery,
	useMutation,
	useQueryClient
} from "@tanstack/react-query";

//
// Component export
//
export default function TrailsPageContent() {
	// QueryClient setup
	const queryClient = useQueryClient();
	
	// States
	const [trailsDate, setTrailsDate] = useState<string | null>("");
	const [editStates, setEditStates] = useState<{ [key: string]: boolean }>(
		{}
	);
	const [addPlayer, setAddPlayer] = useState<boolean>(false);
	
	// Helper function to get Eastern Time
	const getEasternTime = (date = new Date()) => {
		return new Date(
			date.toLocaleString("en-US", {
				timeZone: "America/New_York",
			})
		);
	};

	const [addTrailsDate, setAddTrailsDate] = useState<string | null>(
		format(getEasternTime(), "MM-dd-yyyy")
	);

	// Queries
	const { 
		data = [], 
		isLoading: isLoadingTrailsDates 
	} = useQuery({
		queryKey: ['trailsDates'],
		queryFn: async () => {
			const result = await fetchTrailsDates();
			return result.map((item) => ({
				...item,
				trailsDate: format(new Date(item.trailsDate), "MM-dd-yyyy"),
			}));
		}
	});

	// Auto-select current date if it exists

	useEffect(() => {
		if (data && data.length > 0) {
			const currentDate = format(getEasternTime(), "MM-dd-yyyy");
			const currentTrailsDate = data.find(
				(item) => item.trailsDate === currentDate
			);
			if (currentTrailsDate && !trailsDate) {
				setTrailsDate(currentDate);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	const {
		data: trailsDateData = [],
		isLoading: loadingTrailsDateData,
		refetch: refetchTrailsDateData
	} = useQuery({
		queryKey: ['trailsDateData', trailsDate],
		queryFn: () => trailsDate ? fetchTrailsDateData(trailsDate) : Promise.resolve([]),
		enabled: !!trailsDate,
	});

	// Mutations
	const addPlayerMutation = useMutation({
		mutationFn: async (values: TrailsDateData) => {
			if (trailsDate !== null) {
				values.trailsDate = trailsDate;
			}
			return fetch(trailsRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trailsDateData', trailsDate] });
			setAddPlayer(false);
		}
	});

	const deletePlayerMutation = useMutation({
		mutationFn: async (value: TrailsDateData) => {
			return fetch(trailsRoute, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(value),
			});
		},
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ['trailsDateData', variables.trailsDate] });
			const result = await getData(variables.trailsDate);
			if (result.length === 0) {
				window.location.reload();
			}
		}
	});

	const addTrailsDateMutation = useMutation({
		mutationFn: async (values: TrailsDateData[]) => {
			for (const value of values) {
				value.trailsDate = addTrailsDate as string;
				await fetch(trailsRoute, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(value),
				});
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trailsDates'] });
			window.location.reload();
		}
	});

	//
	// Function Name: handleAddPlayer
	// Description: this function handles adding a player to a trails date (DOES NOT ADD TO DB)
	//
	const handleAddPlayer = (values: TrailsDateData) => {
		setAddPlayer(false);
		queryClient.setQueryData(['trailsDateData', trailsDate], 
			(oldData: TrailsDateData[] | undefined) => [...(oldData || []), values]);
	};
	//
	// Function Name: handleAddPlayerDB
	// Description: this function handles adding a player to a trails date and saving it to the database
	//
	const handleAddPlayerDB = (values: TrailsDateData) => {
		addPlayerMutation.mutate(values);
	};
	//
	// Function Name: handleEditAddPlayer
	// Description: enable the editing of a player during the add process of a trails date
	//
	const handleEditAddPlayer = (values: TrailsDateData, index?: number) => {
		queryClient.setQueryData(['trailsDateData', trailsDate], 
			(oldData: TrailsDateData[] | undefined) => {
				const updatedData = [...(oldData || [])];
				if (index !== undefined) {
					handleEditToggle(index.toString());
					updatedData[index] = values;
				} else {
					updatedData.push(values);
				}
				return updatedData;
			});
	};
	//
	// Function Name: goBack
	// Description: this function handles displaying the add/edit form for a player
	//
	const goBack = (value: boolean) => {
		setAddPlayer(value);
	};
	//
	// Function Name: handleDateSelect
	// Description: this function handles selecting a date for the trails date
	//
	const handleDateSelect = (date: Date | null) => {
		if (date === null) return;
		const selectedDate = getEasternTime(date);
		const formattedDate = format(selectedDate, "MM-dd-yyyy");
		setAddTrailsDate(formattedDate);
	};
	//
	// Function Name: handleSetTrailsDate
	// Description: this function handles setting the trails date and loading the data for that date
	//
	const handleSetTrailsDate = (value: string) => {
		const parsedValue = JSON.parse(value)[0];
		if (!parsedValue) {
			setTrailsDate(null);
			return;
		}
		if (parsedValue.trailsDate !== trailsDate) {
			setTrailsDate(parsedValue.trailsDate);
		}
	};
	//
	// Function Name: handleRefresh
	// Description: this function handles refreshing the data for a selected trails date
	//
	const handleRefresh = async (index?: string) => {
		await refetchTrailsDateData();
		if (index !== undefined) {
			handleEditToggle(index);
		}
	};
	//
	// Function Name: handleEditToggle
	// Description: this function handles toggling the edit state for a selected row
	//
	const handleEditToggle = (index: string) => {
		setEditStates((prevState) => ({
			...prevState,
			[index]: !prevState[index],
		}));
	};
	//
	//Function name: handleAddDelete
	// Description: this function handles deleting a player from the trails date data locally, before it is saved to the database
	//
	const handleAddDelete = (index: number) => {
		queryClient.setQueryData(['trailsDateData', trailsDate], 
			(oldData: TrailsDateData[] | undefined) => {
				const updatedData = [...(oldData || [])];
				updatedData.splice(index, 1);
				return updatedData;
			});
	};
	//
	// Function Name: getData
	// Description: this function fetches the data for a selected trails date
	//
	const getData = async (trailsDate: string) => {
		const result = await fetchTrailsDateData(trailsDate);
		return result;
	};
	//
	// Function Name: handleDelete
	// Description: this function handles deleting a player from the trails date data and saving it to the db
	//
	const handleDelete = (value: TrailsDateData) => {
		deletePlayerMutation.mutate(value);
	};
	//
	// Function Name: handleSubmit
	// Description: this function handles submitting the data for the trails date
	//
	const handleSubmit = (values: TrailsDateData[]) => {
		addTrailsDateMutation.mutate(values);
	};

	const CustomDatePickerInput = ({
		value,
		onClick,
	}: {
		value: string;
		onClick: () => void;
	}) => (
		<Button
			variant="outline"
			onClick={onClick}
			className="flex items-center justify-between text-left px-4 py-2 border border-gray-300 rounded-lg" // removed w-full
		>
			<span>{value || "Select a date"}</span>
			<Calendar className="text-gray-500" />
		</Button>
	);

	return (
		<div className="flex gap-20 w-fit">
			{isLoadingTrailsDates ? (
				<Spinner />
			) : (
				<DataTable
					columns={columns}
					data={data}
					pageName="Prior Trails Dates"
					apiEndpoint={trailsDateRoute}
					singleRowSelection={true}
					passValueToParent={handleSetTrailsDate}
					defaultSelectedRow={data.findIndex(
						(item) => item.trailsDate === trailsDate
					)}
				/>
			)}

			<Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[40vw] max-h-[80vh] overflow-y-auto">
				{trailsDate && (
					<>
						<CardHeader>
							<CardTitle className="text-lg font-semibold">
								Data for a Selected Trails Date
							</CardTitle>
							<h1 className="font-semibold">{trailsDate}</h1>
						</CardHeader>
						<CardContent>
							{loadingTrailsDateData && <Spinner />}
							{trailsDateData.length != 0 &&
								!loadingTrailsDateData && (
									<div className="flex flex-col gap-2">
										{!addPlayer && (
											<div className="flex justify-end pt-4">
												<Button
													variant={"outline"}
													className="hover:bg-gray-100 border-gray-300 text-gray-700"
													onClick={() =>
														setAddPlayer(!addPlayer)
													}
												>
													Add Player
												</Button>
											</div>
										)}
										{addPlayer && (
											<>
												<TrailsDateAddForm
													handleFormSubmit={
														handleAddPlayerDB
													}
													trailsDate={addTrailsDate}
													goBack={goBack}
													trailsDateData={
														trailsDateData
													}
												/>
											</>
										)}
										<Separator
											orientation="horizontal"
											className="my-2 bg-gray-300"
										/>
										{trailsDateData.map((item, index) => (
											<Accordion
												type="single"
												collapsible
												key={index}
											>
												<AccordionItem
													value={index.toString()}
												>
													<div className="flex justify-between items-center w-full">
														<span className="text-left">
															{item.ledaId} -{" "}
															{item.fullName}
														</span>
														<div className="flex items-center">
															<AccordionTrigger />
															<Button
																variant={
																	"ghost"
																}
																size="icon"
																onClick={() =>
																	handleDelete(
																		item
																	)
																}
															>
																<X className="text-red-500" />
															</Button>
														</div>
													</div>
													<AccordionContent>
														<div className="flex justify-between">
															{!editStates[
																index.toString()
															] && (
																<div className="flex flex-col gap-2">
																	{item.notes && (
																		<p>
																			Notes:{" "}
																			{
																				item.notes
																			}
																		</p>
																	)}
																	<p>
																		Trails
																		Points:{" "}
																		{
																			item.trailsPoints
																		}
																	</p>
																	<p>
																		Singles
																		Place:{" "}
																		{
																			item.singlesPlace
																		}
																	</p>
																	<p>
																		Doubles
																		Place:{" "}
																		{
																			item.doublesPlace
																		}
																	</p>
																</div>
															)}
															{editStates[
																index.toString()
															] && (
																<TrailsDateEditForm
																	rowData={
																		item
																	}
																	handleRefresh={() =>
																		handleRefresh(
																			index.toString()
																		)
																	}
																	index={index.toString()}
																/>
															)}
															<div>
																<Button
																	variant={
																		"ghost"
																	}
																	size="icon"
																	onClick={() =>
																		handleEditToggle(
																			index.toString()
																		)
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
								)}
						</CardContent>
					</>
				)}
				{!trailsDate && (
					<>
						<CardHeader>
							<CardTitle className="text-lg font-semibold text-center">
								Add a Trails Date
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-row justify-center items-center gap-8">
								<DatePicker
									selected={
										addTrailsDate
											? new Date(addTrailsDate)
											: null
									}
									onChange={handleDateSelect}
									excludeDates={data.map(
										(item) => new Date(item.trailsDate)
									)}
									dateFormat="yyyy-MM-dd"
									customInput={
										<CustomDatePickerInput
											value={addTrailsDate || ""}
											onClick={() => {}}
										/>
									}
								/>
								{!addPlayer && (
									<Button
										variant={"outline"}
										className="hover:bg-gray-100 border-gray-300 text-gray-700 flex items-center gap-1"
										onClick={() => setAddPlayer(!addPlayer)}
									>
										<Plus className="w-4 h-4" />
										Add Player
									</Button>
								)}
							</div>
							{addPlayer && (
								<div className="flex justify-center pt-4">
									<TrailsDateAddForm
										handleFormSubmit={handleAddPlayer}
										trailsDate={addTrailsDate}
										goBack={goBack}
										trailsDateData={trailsDateData}
									/>
								</div>
							)}
							<Separator
								orientation="horizontal"
								className="my-2 bg-gray-300"
							/>
							{trailsDateData.length != 0 && (
								<div className="flex flex-col gap-2">
									{trailsDateData.map((item, index) => (
										<Accordion
											type="single"
											collapsible
											key={index}
										>
											<AccordionItem
												value={index.toString()}
											>
												<div className="flex justify-between items-center w-full">
													<span className="text-left">
														{item.ledaId} -{" "}
														{item.fullName}
													</span>
													<div className="flex items-center">
														<AccordionTrigger />
														<Button
															variant={"ghost"}
															size="icon"
															onClick={() =>
																handleAddDelete(
																	index
																)
															}
														>
															<X className="text-red-500" />
														</Button>
													</div>
												</div>
												<AccordionContent>
													<div className="flex justify-between">
														{!editStates[
															index.toString()
														] && (
															<div>
																<div className="flex flex-col gap-2">
																	{item.notes && (
																		<p>
																			Notes:{" "}
																			{
																				item.notes
																			}
																		</p>
																	)}
																	<p>
																		Trails
																		Points:{" "}
																		{
																			item.trailsPoints
																		}
																	</p>
																	<p>
																		Singles
																		Place:{" "}
																		{
																			item.singlesPlace
																		}
																	</p>
																	<p>
																		Doubles
																		Place:{" "}
																		{
																			item.doublesPlace
																		}
																	</p>
																</div>
															</div>
														)}
														{editStates[
															index.toString()
														] && (
															<TrailsDateAddForm
																handleFormSubmit={
																	handleEditAddPlayer
																}
																trailsDate={
																	addTrailsDate
																}
																goBack={goBack}
																trailsDateData={
																	trailsDateData
																}
																editData={item}
																index={index}
															/>
														)}
														<div>
															<Button
																variant={
																	"ghost"
																}
																size="icon"
																onClick={() =>
																	handleEditToggle(
																		index.toString()
																	)
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
							)}
							<div className="flex items-center justify-center py-2">
								<Button
									variant={"outline"}
									className="hover:bg-gray-100 border-gray-300 text-gray-700"
									onClick={() => handleSubmit(trailsDateData)}
									disabled={trailsDateData.length === 0}
								>
									Add Trails Date
								</Button>
							</div>
						</CardContent>
					</>
				)}
			</Card>
		</div>
	);
}
