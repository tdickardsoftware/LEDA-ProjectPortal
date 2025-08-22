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
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { InputDefault } from "@/components/ui/form-input-default";
import { teamRoute } from "@/lib/apiRoutes";
import PlayerSelector from "@/components/ui/player-selector";
import { useMutation } from "@tanstack/react-query";

export const teamFormSchema = z.object({
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	teamName: z.string().min(1, { message: "Team Name is required." }),
	establishedDate: z.string(),
	memo: z.string().optional(),
	lastTeamFeePayment: z.string(),
	memberIdList: z.string().optional(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const inputWidth = "w-24";
const checkboxWidth = "h-5 w-5";

export default function PlaceAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	const [generateIDStatus, setGenerateIDStatus] = useState(true);
	const [ledaIdExists, setLedaIdExists] = useState(false);
	const [memberIdList, setMemberIdList] = useState<string>("");
	const [currentStep, setCurrentStep] = useState(0);

	// Define the steps
	const steps = [
		{ name: "Basic Info", fields: ["ledaId", "teamName"] },
		{
			name: "Team Details",
			fields: ["establishedDate", "memo"],
		},
		{ name: "Team Members", fields: ["memberIdList"] },
	];

	const form = useForm<z.infer<typeof teamFormSchema>>({
		resolver: zodResolver(teamFormSchema),
		mode: "onChange",
		defaultValues: {
			ledaId: undefined,
			teamName: "",
			establishedDate: "",
			memo: "",
			lastTeamFeePayment: "UNPAID - NEW TEAM ADDED",
			memberIdList: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof teamFormSchema>) => {
			const submissionValues = generateIDStatus
				? { ...values, ledaId: 0 }
				: values;
			const submissionValues2 = {
				...submissionValues,
				memberIdList: memberIdList,
			};

			const response = await fetch(teamRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submissionValues2),
			});

			if (!response.ok) {
				if (response.status === 422) {
					setLedaIdExists(true);
				}
				const errorData = await response.json();
				throw new Error(
					errorData?.message ||
						`HTTP error! status: ${response.status}`
				);
			}

			return await response.json();
		},
		onSuccess: (results) => {
			toast.success("Successfully submitted the form!");
			form.reset();
			setGenerateIDStatus(true);
			setCurrentStep(0);
			console.log("Form submitted successfully!", results);
			onClose();
			onRefresh();
		},
		onError: (error: unknown) => {
			console.error("Form submission error", error);
			toast.error(
				`Failed to submit the form: ${
					(error as Error).message || "Please try again."
				}`
			);
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
			currentStepFields as (keyof z.infer<typeof teamFormSchema>)[]
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
			onClose();
		}
	};

	function onSubmit(values: z.infer<typeof teamFormSchema>) {
		setLedaIdExists(false);
		mutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
			>
				<div className="mb-6">
					<div className="flex border-b border-gray-200">
						{/* Render step headers as non-clickable */}
						<div className="flex space-x-1 rounded-xl p-1 w-full">
							{steps.map((step, index) => (
								<div
									key={index}
									className={`w-full py-2.5 text-sm font-medium leading-5 
						${
							index === currentStep
								? "border-b-2 border-blue-500 text-blue-600"
								: "text-gray-500"
						} ${index < currentStep ? "text-green-500" : ""}`}
								>
									<span className="flex items-center justify-center">
										<span className="flex h-6 w-6 items-center justify-center rounded-full mr-2 border border-current">
											{index < currentStep ? "✓" : index + 1}
										</span>
										{step.name}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Step 1: Basic Info */}
				{currentStep === 0 && (
					<div className={formContainerStyle}>
						<h1>Team Basic Information</h1>
						<hr className="bg-gray-300 mb-4"></hr>
						<div className="flex items-start space-x-2">
							<Label
								className="whitespace-nowrap"
								htmlFor="generateID"
							>
								Generate LEDA ID
							</Label>
							<Checkbox
								checked={generateIDStatus}
								onCheckedChange={(checked: boolean) =>
									setGenerateIDStatus(checked)
								}
								className={checkboxWidth}
								id="generateID"
							/>
						</div>
						<FormField
							control={form.control}
							name="ledaId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="LEDA ID #"
											{...field}
											disabled={generateIDStatus}
											className={inputWidth}
											type="number"
											onChange={(e) => {
												field.onChange(
													e.target.value ===
														""
														? undefined
														: parseFloat(
																e.target
																	.value
														  )
												);
											}}
										/>
									</FormControl>
									<FormMessage />
									{ledaIdExists && (
										<p className="text-red-500 text-sm mt-1">
											This LEDA ID is already in
											use
										</p>
									)}
								</FormItem>
							)}
						/>
						<InputDefault
							control={form.control}
							name="teamName"
							label="Team Name *"
						/>
					</div>
				)}

				{/* Step 2: Team Details */}
				{currentStep === 1 && (
					<div className={formContainerStyle}>
						<h1>Team Details</h1>
						<hr className="bg-gray-300 mb-4"></hr>
						<InputDefault
							control={form.control}
							name="establishedDate"
							label="Established Date *"
							type="date"
						/>
						<FormField
							control={form.control}
							name="memo"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Memo</FormLabel>
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
				)}

				{/* Step 3: Team Members */}
				{currentStep === 2 && (
					<div className={formContainerStyle}>
						<h1>Team Members</h1>
						<hr className="bg-gray-300 mb-4"></hr>
						<PlayerSelector
							setMemberIdList={handleSetMemberIdList}
						/>
					</div>
				)}

				<div className="flex justify-between">
					<Button type="button" onClick={prevStep}>
						{currentStep === 0 ? "Cancel" : "Back"}
					</Button>
					<Button type="button" onClick={nextStep}>
						{currentStep === steps.length - 1 ? "Submit" : "Next"}
					</Button>
				</div>
			</form>
		</Form>
	);
}