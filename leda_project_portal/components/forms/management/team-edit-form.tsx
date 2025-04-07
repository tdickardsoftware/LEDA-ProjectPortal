"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import React from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector-form";
import { Textarea } from "@/components/ui/textarea";
import { InputDefault } from "@/components/ui/form-input-default";
import { teamRoute } from "@/lib/apiRoutes";
import { Team } from "@/lib/definitions";
import PlayerSelector from "@/components/ui/player-selector";
import { Tab } from "@headlessui/react";

const teamInfoSchema = z.object({
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	teamName: z.string().min(1, { message: "Team Name is required." }),
	establishedDate: z.string(),
	memo: z.string().optional(),
	lastTeamFeePayment: z.string(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const inputWidth = "w-24";

export default function TeamEditForm({
	onClose,
	onRefresh,
	rowData,
	handleRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: Team;
	handleRefresh?: () => void;
}) {
	const [formData, setFormData] = useState<Team>({} as Team);
	const [memberIdList, setMemberIdList] = useState<string>("");
	const [currentStep, setCurrentStep] = useState(0);

	// Define the steps
	const steps = [
		{ name: "Basic Info", fields: ["ledaId", "teamName"] },
		{
			name: "Team Details",
			fields: ["establishedDate", "lastTeamFeePayment", "memo"],
		},
		{ name: "Team Members", fields: [] },
	];

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof teamInfoSchema>>({
		resolver: zodResolver(teamInfoSchema),
		mode: "onChange",
		defaultValues: {
			ledaId: formData.ledaId ?? undefined,
			teamName: formData.teamName || "",
			establishedDate: formData.establishedDate
				? new Date(formData.establishedDate).toISOString().split("T")[0]
				: undefined,
			memo: formData.memo || "",
			lastTeamFeePayment: formData.lastTeamFeePayment || "",
		},
	});

	function handleSetMemberIdList(memberIdList: string) {
		setMemberIdList(memberIdList);
	}

	// Handle step navigation
	const nextStep = async () => {
		const currentStepFields = steps[currentStep].fields;

		// Special case for team members step which doesn't need validation
		if (currentStep === 2) {
			if (currentStep < steps.length - 1) {
				setCurrentStep(currentStep + 1);
			} else {
				form.handleSubmit(onSubmit)();
			}
			return;
		}

		// Validate only the fields in the current step
		const result = await form.trigger(
			currentStepFields as (keyof z.infer<typeof teamInfoSchema>)[]
		);

		if (result) {
			if (currentStep < steps.length - 1) {
				setCurrentStep(currentStep + 1);
			} else {
				// If we're on the last step, submit the form
				form.handleSubmit(onSubmit)();
			}
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		} else {
			if (handleRefresh) {
				handleRefresh();
			} else {
				onClose();
			}
		}
	};

	useEffect(() => {
		if (!rowData || !rowData.ledaId) {
			return;
		}
		const fetchData = async () => {
			const response = await fetch(
				teamRoute + `?ledaId=${rowData.ledaId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch team data: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			setFormData(data);
			setMemberIdList(JSON.stringify(data.memberIdList));
			form.reset({
				...data,
				ledaId: data.ledaId ? Number(data.ledaId) : undefined,
				establishedDate: data.establishedDate
					? new Date(data.establishedDate).toISOString().split("T")[0]
					: undefined,
			}); // Set form values to the retrieved data
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData) {
		return <div>No team data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof teamInfoSchema>) {
		const submittedValues = { ...values, memberIdList: memberIdList };
		try {
			const response = await fetch(teamRoute, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submittedValues),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData?.message ||
						`HTTP error! status: ${response.status}`
				);
			}

			const results = await response.json();
			toast.success("Successfully updated the form!");

			// Reset form and state
			form.reset();

			console.log("Form updated successfully!", results);
			onClose(); // Close the form
			onRefresh(); // Refresh the datatable with the team API route
		} catch (error) {
			console.error("Form update error", error);
			toast.error(
				`Failed to update the form: ${
					(error as Error).message || "Please try again."
				}`
			);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
				ref={formRef}
				onSubmitCapture={(e) => e.preventDefault()}
			>
				<Tab.Group
					selectedIndex={currentStep}
					onChange={setCurrentStep}
				>
					<div className="mb-6">
						<div className="flex border-b border-gray-200">
							<Tab.List className="flex space-x-1 rounded-xl p-1 w-full">
								{steps.map((step, index) => (
									<Tab
										key={index}
										className={({ selected }) =>
											`w-full py-2.5 text-sm font-medium leading-5 
											${
												selected
													? "border-b-2 border-blue-500 text-blue-600"
													: "text-gray-500 hover:text-gray-700 hover:border-gray-300"
											} ${
												index < currentStep
													? "text-green-500"
													: ""
											}`
										}
									>
										<span className="flex items-center justify-center">
											<span className="flex h-6 w-6 items-center justify-center rounded-full mr-2 border border-current">
												{index < currentStep
													? "✓"
													: index + 1}
											</span>
											{step.name}
										</span>
									</Tab>
								))}
							</Tab.List>
						</div>
					</div>

					<Tab.Panels>
						{/* Step 1: Basic Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>
									Team Basic Information for LEDA ID #
									{rowData.ledaId}
								</h1>
								<hr className="bg-gray-300 mb-4"></hr>
								<FormField
									control={form.control}
									name="ledaId"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="LEDA ID #"
													{...field}
													disabled
													className={inputWidth}
													type="number"
													onChange={(e) => {
														field.onChange(
															e.target.value
																? Number(
																		e.target
																			.value
																  )
																: undefined
														);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<InputDefault
									control={form.control}
									name="teamName"
									label="Team Name *"
								/>
							</div>
						</Tab.Panel>

						{/* Step 2: Team Details */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Team Details</h1>
								<hr className="bg-gray-300 mb-4"></hr>
								<InputDefault
									control={form.control}
									name="establishedDate"
									label="Established Date *"
									type="date"
								/>
								<SeasonCodeSelector
									control={form.control}
									name="lastTeamFeePayment"
									label="Last Team Fee Payment *"
								/>
								<FormField
									control={form.control}
									name="memo"
									render={({ field }) => (
										<FormItem>
											<Label>Memo</Label>
											<FormControl>
												<Textarea
													placeholder="Additional Data Here..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</Tab.Panel>

						{/* Step 3: Team Members */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Team Members</h1>
								<hr className="bg-gray-300 mb-4"></hr>
								<div className="player-selector-container">
									<PlayerSelector
										setMemberIdList={handleSetMemberIdList}
										existingJsonList={memberIdList}
									/>
								</div>
							</div>
						</Tab.Panel>
					</Tab.Panels>
				</Tab.Group>

				<div className="flex justify-between">
					<Button type="button" onClick={prevStep}>
						{currentStep === 0
							? handleRefresh
								? "Back"
								: "Cancel"
							: "Back"}
					</Button>
					<Button type="button" onClick={nextStep}>
						{currentStep === steps.length - 1 ? "Update" : "Next"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
