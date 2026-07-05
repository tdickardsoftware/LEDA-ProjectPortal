/**
 * PlayerEditInformationForm Component
 *
 * Multi-step form for editing an existing LEDA member record. Fetches full
 * player data by LEDA ID on mount and pre-populates all fields. The
 * `hasChanges` flag reflects whether any field has been dirtied. Reloads
 * the page on successful save to reflect the updated player data.
 */
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
import validator from "validator";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import StatePicker from "@/components/ui/state-selector";
import GenderSelector from "@/components/ui/gender-selector";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/ui/phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import React from "react";
import PlayerTypeSelector from "@/components/ui/player-type-selector";
import { InputDefault } from "@/components/ui/form-input-default";
import { DatePickerFormField } from "@/components/ui/date-picker-form-field";
import { playerRoute } from "@/lib/apiRoutes";
import CheckboxDefault from "@/components/ui/checkbox-default";
import { PlayerMemberInfo } from "@/lib/definitions";
import { Tab } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Validation schema for all player fields — mirrors PlayerAddInformationForm
const playerInfoSchema = z.object({
	firstName: z.string().min(1, { message: "First Name is Required" }),
	nickname: z.string().nullable().optional(),
	middleInitial: z.string().nullable().optional(),
	lastName: z.string().min(1, { message: "Last Name is Required" }),
	addressOne: z.string().min(1, { message: "Address is Required" }),
	addressTwo: z.string().nullable().optional(),
	city: z.string().min(1, { message: "City is Required" }),
	state: z.string().min(1, { message: "State is Required" }),
	zip: z.string().min(1, { message: "Zip Code is Required" }),
	phoneNumber: z
		.string()
		.min(1, { message: "Phone Number is Required" })
		.refine((value) => isValidPhoneNumber(value, "US"), {
			message: "Phone Number is Invalid",
		}),
	otherNumber: z
		.string()
		.nullable()
		.optional()
		.refine(
			(value) => !value || value === "" || isValidPhoneNumber(value, "US"),
			{ message: "Other Number is Invalid" }
		),
	email: z
		.string()
		.min(1, { message: "Email is Required" })
		.refine(
			(value) => value.toUpperCase() === "UNKNOWN" || validator.isEmail(value),
			{ message: "Email is Invalid" }
		)
		.transform((value) => value.toUpperCase() === "UNKNOWN" ? "UNKNOWN" : value),
	gender: z.string().min(1, { message: "Gender is Required" }),
	dateOfBirth: z.string().nullable().optional(),
	// Membership Information
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	establishedDate: z.string(),
	badStanding: z.boolean(),
	badStandingReason: z.string().nullable().optional(),
	takeOffMailing: z.boolean(),
	mailStandings: z.boolean(),
	formOnFile: z.boolean(),
	needsMemberCard: z.boolean(),
	inactiveDate: z.string().nullable().optional(),
	lastTrailsDate: z.string().nullable().optional(),
	memberType: z.string().min(1, { message: "Member Type is Required" }),
	cannotBeCaptain: z.boolean(),
	lifetimeMember: z.boolean(),
	lifetimeMemberReason: z.string().nullable().optional(),
});

// Shared style constants for the form layout
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";
const inputWidth = "w-24";
const checkboxWidth = "h-5 w-5";

/**
 * PlayerEditInformationForm fetches a player record and provides a multi-step edit interface.
 *
 * @param onClose - Callback to close the edit panel
 * @param onRefresh - Callback to reload the parent data table
 * @param rowData - The player record used to look up full data by ledaId
 * @param handleEdit - Optional alternative close handler
 */
export default function PlayerEditInformationForm({
	onClose,
	onRefresh,
	rowData,
	handleEdit,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: PlayerMemberInfo;
	handleEdit?: () => void;
}) {
	// Conditional flag to show/hide the bad standing reason textarea
	const [badStandingStatus, setBadStandingStatus] = useState(false);
	// Conditional flag to show/hide the lifetime member reason textarea
	const [lifetimeMemberStatus, setLifetimeMemberStatus] = useState(false);
	// Local state to store the full player record fetched from the API
	const [formData, setFormData] = useState<PlayerMemberInfo>(
		{} as PlayerMemberInfo
	);
	// Track which wizard step is currently active
	const [currentStep, setCurrentStep] = useState(0);

	// Define the steps
	const steps = [
		{
			name: "Personal Info",
			fields: [
				"firstName",
				"nickname",
				"middleInitial",
				"lastName",
				"gender",
				"dateOfBirth",
			],
		},
		{
			name: "Contact Info",
			fields: [
				"addressOne",
				"addressTwo",
				"city",
				"state",
				"zip",
				"email",
				"phoneNumber",
				"otherNumber",
			],
		},
		{
			name: "Membership Info",
			fields: [
				"ledaId",
				"memberType",
				"establishedDate",
				"badStanding",
				"badStandingReason",
			],
		},
		{
			name: "Additional Info",
			fields: [
				"lifetimeMember",
				"lifetimeMemberReason",
				"takeOffMailing",
				"mailStandings",
				"formOnFile",
				"needsMemberCard",
				"inactiveDate",
				"lastTrailsDate",
				"cannotBeCaptain",
			],
		},
	];

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof playerInfoSchema>>({
		resolver: zodResolver(playerInfoSchema),
		mode: "onChange",
		defaultValues: {
			firstName: formData.firstName || "",
			nickname: formData.nickname || "",
			middleInitial: formData.middleInitial || "",
			lastName: formData.lastName || "",
			addressOne: formData.addressOne || "",
			addressTwo: formData.addressTwo || "",
			city: formData.city || "",
			state: formData.state || "",
			zip: formData.zip || "",
			phoneNumber: formData.phoneNumber || "",
			otherNumber: formData.otherNumber || "",
			email: formData.email || "",
			gender: formData.gender || "",
			dateOfBirth: formData.dateOfBirth
				? new Date(formData.dateOfBirth).toISOString().split("T")[0]
				: "",
			ledaId: formData.ledaId ?? undefined,
			establishedDate: formData.establishedDate
				? new Date(formData.establishedDate).toISOString().split("T")[0]
				: "",
			badStanding: formData.badStanding || false,
			badStandingReason: formData.badStandingReason || "",
			takeOffMailing: formData.takeOffMailing || false,
			mailStandings: formData.mailStandings || false,
			formOnFile: formData.formOnFile || false,
			needsMemberCard: formData.needsMemberCard || false,
			inactiveDate: formData.inactiveDate
				? new Date(formData.inactiveDate).toISOString().split("T")[0]
				: "",
			lastTrailsDate: formData.lastTrailsDate
				? new Date(formData.lastTrailsDate).toISOString().split("T")[0]
				: "",
			memberType: formData.memberType || "",
			cannotBeCaptain: formData.cannotBeCaptain || false,
			lifetimeMember: formData.lifetimeMember || false,
			lifetimeMemberReason: formData.lifetimeMemberReason || "",
		},
	});

	// True when any form field has been modified from its original value
	const hasChanges = form.formState.isDirty;

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof playerInfoSchema>) => {
			const response = await fetchWithSession(playerRoute, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData?.message ||
						`HTTP error! status: ${response.status}`
				);
			}
			return await response.json();
		},
		onSuccess: () => {
			toast.success("Successfully updated the form!");
			form.reset();
			setBadStandingStatus(false);
			setLifetimeMemberStatus(false);
			window.location.reload();
			onClose();
			onRefresh();
		},
		onError: (error: unknown) => {
			console.error("Form update error", error);
			toast.error(
				`Failed to update the form: ${
					(error as Error).message || "Please try again."
				}`
			);
		},
	});

	// Handle step navigation
	const nextStep = async () => {
		const currentStepFields = steps[currentStep].fields;

		// Validate only the fields in the current step
		const result = await form.trigger(
			currentStepFields as (keyof z.infer<typeof playerInfoSchema>)[]
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

	useEffect(() => {
		if (!rowData) {
			return;
		}

		const fetchData = async () => {
			const response = await fetchWithSession(
				playerRoute + `?ledaId=${rowData.ledaId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch player data: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			setFormData(data);
			form.reset({
				...data,
				ledaId: data.ledaId ? Number(data.ledaId) : undefined,
				dateOfBirth: data.dateOfBirth
					? new Date(data.dateOfBirth).toISOString().split("T")[0]
					: undefined,
				establishedDate: data.establishedDate
					? new Date(data.establishedDate).toISOString().split("T")[0]
					: undefined,
				inactiveDate: data.inactiveDate
					? new Date(data.inactiveDate).toISOString().split("T")[0]
					: undefined,
				lastTrailsDate: data.lastTrailsDate
					? new Date(data.lastTrailsDate).toISOString().split("T")[0]
					: undefined,
			}); // Set form values to the retrieved data

			setBadStandingStatus(data.badStanding || false);
			setLifetimeMemberStatus(data.lifetimeMember || false);
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData || !formData.state) {
		return <div>Loading player data...</div>;
	}

	function onSubmit(values: z.infer<typeof playerInfoSchema>) {
		mutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
				ref={formRef}
				// Prevent form from reloading the page
				onSubmitCapture={(e) => e.preventDefault()}
			>
				<Tab.Group
					selectedIndex={currentStep}
					onChange={setCurrentStep}
				>
					<div className="mb-6">
						<div className="flex border-b border-border">
							<Tab.List className="flex space-x-1 rounded-xl p-1 w-full">
								{steps.map((step, index) => (
									<Tab
										key={index}
										className={({ selected }) =>
											`w-full py-2.5 text-sm font-medium leading-5 
											${
												selected
													? "border-b-2 border-blue-500 text-blue-600"
													: "text-muted-foreground hover:text-foreground hover:border-border"
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
						{/* Step 1: Personal Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>
									Personal Information for LEDA ID #
									{rowData.ledaId}
								</h1>
								<div className="flex space-x-4">
									<InputDefault
										control={form.control}
										name="firstName"
										label="First Name *"
									/>
									<InputDefault
										control={form.control}
										name="nickname"
										label="Nickname"
									/>
									<InputDefault
										control={form.control}
										name="middleInitial"
										label="Middle Initial"
										customClass="w-10"
									/>
									<InputDefault
										control={form.control}
										name="lastName"
										label="Last Name *"
									/>
								</div>
								<GenderSelector
									control={form.control}
									name="gender"
								/>
								<DatePickerFormField
									control={form.control}
									name="dateOfBirth"
									label="Date of Birth"
									enableMonthYearPicker
								/>
							</div>
						</Tab.Panel>

						{/* Step 2: Contact Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Contact Information</h1>
								<InputDefault
									control={form.control}
									name="addressOne"
									label="Address One *"
								/>
								<InputDefault
									control={form.control}
									name="addressTwo"
									label="Address Two"
								/>
								<div className="flex space-x-4">
									<InputDefault
										control={form.control}
										name="city"
										label="City *"
									/>
									<StatePicker
										name="state"
										control={form.control}
									/>
									<InputDefault
										control={form.control}
										name="zip"
										label="Zip Code *"
									/>
								</div>
								<InputDefault
									control={form.control}
									name="email"
									label="Email *"
									type="email"
								/>
								<PhoneNumberInput
									control={form.control}
									name="phoneNumber"
									label="Phone Number *"
								/>
								<PhoneNumberInput
									control={form.control}
									name="otherNumber"
									label="Other Number"
								/>
							</div>
						</Tab.Panel>

						{/* Step 3: Membership Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Membership Information</h1>
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
													value={field.value ?? ""}
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
										</FormItem>
									)}
								/>
								<PlayerTypeSelector
									control={form.control}
									name="memberType"
									label="Member Type"
								/>
								<DatePickerFormField
									control={form.control}
									name="establishedDate"
									label="Established Date *"
									enableMonthYearPicker
								/>
								{/* Bad Standing Checkbox */}
								<FormField
									control={form.control}
									name="badStanding"
									render={({ field }) => (
										<FormItem>
											<Label
												className="whitespace-nowrap pr-2"
												htmlFor="badStandingCheckbox"
											>
												Bad Standing
											</Label>
											<FormControl>
												<Checkbox
													id="badStandingCheckbox"
													checked={field.value}
													onCheckedChange={(
														checked: boolean
													) => {
														field.onChange(checked);
														setBadStandingStatus(
															checked
														);
													}}
													className={checkboxWidth}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="badStandingReason"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Reasoning..."
													{...field}
													value={field.value ?? ""}
													disabled={
														!badStandingStatus
													}
													className="w-fit"
													type="text"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</Tab.Panel>

						{/* Step 4: Additional Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Additional Information</h1>
								{/* Lifetime Member Checkbox */}
								<FormField
									control={form.control}
									name="lifetimeMember"
									render={({ field }) => (
										<FormItem>
											<Label
												className="whitespace-nowrap pr-2"
												htmlFor="lifetimeMemberCheckbox"
											>
												Lifetime Member
											</Label>
											<FormControl>
												<Checkbox
													id="lifetimeMemberCheckbox"
													checked={field.value}
													onCheckedChange={(
														checked: boolean
													) => {
														field.onChange(checked);
														setLifetimeMemberStatus(
															checked
														);
													}}
													className={checkboxWidth}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lifetimeMemberReason"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Reasoning..."
													{...field}
													value={field.value ?? ""}
													disabled={
														!lifetimeMemberStatus
													}
													className="w-fit"
													type="text"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Take Off Mailing Checkbox */}
								<CheckboxDefault
									control={form.control}
									name="takeOffMailing"
									label="Take Off Mailing"
									className={checkboxWidth}
								/>

								{/* Mail Standings Checkbox */}
								<CheckboxDefault
									control={form.control}
									name="mailStandings"
									label="Mail Standings"
									className={checkboxWidth}
								/>

								{/* Form on File Checkbox */}
								<CheckboxDefault
									control={form.control}
									name="formOnFile"
									label="Form on File"
									className={checkboxWidth}
								/>

								{/* Needs Member Card Checkbox */}
								<CheckboxDefault
									control={form.control}
									name="needsMemberCard"
									label="Needs Member Card"
									className={checkboxWidth}
								/>

								{/* Cannot be Captain Checkbox */}
								<CheckboxDefault
									control={form.control}
									name="cannotBeCaptain"
									label="Cannot be Captain"
									className={checkboxWidth}
								/>
								<DatePickerFormField
									control={form.control}
									name="inactiveDate"
									label="Inactive Date"
									enableMonthYearPicker
								/>
								<DatePickerFormField
									control={form.control}
									name="lastTrailsDate"
									label="Last Trails Date"
									enableMonthYearPicker
								/>
							</div>
						</Tab.Panel>
					</Tab.Panels>
				</Tab.Group>

				<div className="flex justify-between">
					<Button variant="outline" type="button" onClick={prevStep} className="hover:bg-muted border-border text-foreground">
						{currentStep === 0
							? handleEdit
								? "Edit"
								: "Back"
							: "Back"}
					</Button>
					<div className="flex gap-2">
						{hasChanges && currentStep < steps.length - 1 && (
							<Button
								variant="outline"
								type="button"
								onClick={() => setCurrentStep(steps.length - 1)}
								className="hover:bg-muted border-border text-foreground"
							>
								Skip to Update
							</Button>
						)}
						<Button variant="outline" type="button" onClick={nextStep} className="hover:bg-muted border-border text-foreground">
							{currentStep === steps.length - 1 ? "Update" : "Next"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
