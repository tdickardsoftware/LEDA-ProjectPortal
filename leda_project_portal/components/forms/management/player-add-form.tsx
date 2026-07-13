/**
 * PlayerAddInformationForm Component
 *
 * Multi-step form for registering a new LEDA member (player).
 * Steps: Personal Info → Contact Info → Membership Info → Additional Info.
 * Validates each step before advancing. Optionally auto-generates a LEDA ID.
 * Accepts "UNKNOWN" as a valid email value for players without known email.
 * Returns a 422 conflict when the provided LEDA ID is already in use.
 * Reloads the page on successful submission to reflect the new player.
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
import { useState } from "react";
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
import { playerRoute, tempPlayerRoute } from "@/lib/apiRoutes";
import CheckboxDefault from "@/components/ui/checkbox-default";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Validation schema for all player fields across all form steps
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
		.nullable()
		.optional(),
	emailUnknown: z.boolean(),
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
	lastMembershipFeePayment: z
		.string()
		.min(1, { message: "Last Membership fee is required" }),
	lastTrailsDate: z.string().nullable().optional(),
	memberType: z.string().min(1, { message: "Member Type is Required" }),
	cannotBeCaptain: z.boolean(),
	lifetimeMember: z.boolean(),
	lifetimeMemberReason: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
	// Email is only required when the player's email isn't marked unknown
	if (data.emailUnknown) return;
	if (!data.email) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email is Required", path: ["email"] });
	} else if (!validator.isEmail(data.email)) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email is Invalid", path: ["email"] });
	}
});

// Shared style constants for the form layout
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";
const inputWidth = "w-24";
const checkboxWidth = "h-5 w-5";

/**
 * PlayerAddInformationForm renders a stepped player registration form.
 *
 * @param onClose - Callback to close the containing dialog
 * @param onRefresh - Callback to reload the parent data table
 * @param tempConversionData - When provided, pre-fills name fields and converts a temp player
 */
export default function PlayerAddInformationForm({
	onClose,
	onRefresh,
	tempConversionData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	tempConversionData?: { tempId: number; firstName: string; middleInitial?: string; lastName: string };
}) {
	// When true, ledaId is set to 0 so the server auto-assigns an ID
	const [generateIDStatus, setGenerateIDStatus] = useState(true);
	const [badStandingStatus, setBadStandingStatus] = useState(false);
	const [lifetimeMemberStatus, setLifetimeMemberStatus] = useState(false);
	const [ledaIdExists, setLedaIdExists] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	const formRef = React.useRef<HTMLFormElement>(null);

	const form = useForm<z.infer<typeof playerInfoSchema>>({
		resolver: zodResolver(playerInfoSchema),
		mode: "onChange",
		defaultValues: {
			lifetimeMember: false,
			cannotBeCaptain: false,
			needsMemberCard: true,
			formOnFile: false,
			mailStandings: false,
			takeOffMailing: false,
			badStanding: false,
			lifetimeMemberReason: "",
			otherNumber: "",
			nickname: "",
			addressTwo: "",
			badStandingReason: "",
			addressOne: "",
			firstName: tempConversionData?.firstName ?? "",
			middleInitial: tempConversionData?.middleInitial ?? "",
			lastName: tempConversionData?.lastName ?? "",
			city: "",
			state: "OH",
			zip: "",
			email: "",
			emailUnknown: false,
			phoneNumber: "",
			gender: "",
			ledaId: undefined,
			lastMembershipFeePayment: "UNPAID - New Player",
			memberType: "",
		},
	});

	const isEmailUnknown = form.watch("emailUnknown");

	// Reset form and all state when component mounts to ensure clean state
	React.useEffect(() => {
		setGenerateIDStatus(true);
		setBadStandingStatus(false);
		setLifetimeMemberStatus(false);
		setLedaIdExists(false);
		setCurrentStep(0);
		form.reset({
			lifetimeMember: false,
			cannotBeCaptain: false,
			needsMemberCard: true,
			formOnFile: false,
			mailStandings: false,
			takeOffMailing: false,
			badStanding: false,
			lifetimeMemberReason: "",
			otherNumber: "",
			middleInitial: tempConversionData?.middleInitial ?? "",
			nickname: "",
			addressTwo: "",
			badStandingReason: "",
			addressOne: "",
			firstName: tempConversionData?.firstName ?? "",
			lastName: tempConversionData?.lastName ?? "",
			city: "",
			state: "OH",
			zip: "",
			email: "",
			emailUnknown: false,
			phoneNumber: "",
			gender: "",
			ledaId: undefined,
			lastMembershipFeePayment: "UNPAID - New Player",
			memberType: "",
		});
	}, [form, tempConversionData]);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof playerInfoSchema>) => {
			let response: Response;
			if (tempConversionData) {
				// Convert temp player: always auto-assign the ledaId server-side
				response = await fetchWithSession(tempPlayerRoute, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "convert", tempId: tempConversionData.tempId, ...values }),
				});
			} else {
				const submissionValues = generateIDStatus
					? { ...values, ledaId: 0 }
					: values;
				response = await fetchWithSession(playerRoute, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(submissionValues),
				});
			}

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
		onSuccess: () => {
			toast.success(tempConversionData ? "Player converted successfully!" : "Successfully submitted the form!");
			form.reset();
			setGenerateIDStatus(true);
			setBadStandingStatus(false);
			setLifetimeMemberStatus(false);
			window.location.reload();
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

	// Handle step navigation
	const nextStep = async () => {
		const currentStepFields = steps[currentStep].fields;
		const result = await form.trigger(
			currentStepFields as (keyof z.infer<typeof playerInfoSchema>)[]
		);

		if (result) {
			if (currentStep < steps.length - 1) {
				setCurrentStep(currentStep + 1);
			} else {
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

	function onSubmit(values: z.infer<typeof playerInfoSchema>) {
		setLedaIdExists(false);
		mutation.mutate({
			...values,
			email: values.emailUnknown ? "UNKNOWN" : values.email,
		});
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
				ref={formRef}
			>
				<div className="mb-6">
					<div className="flex border-b border-border">
						{/* Render step headers as non-clickable */}
						<div className="flex space-x-1 rounded-xl p-1 w-full">
							{steps.map((step, index) => (
								<div
									key={index}
									className={`w-full py-2.5 text-sm font-medium leading-5 
						${
							index === currentStep
								? "border-b-2 border-blue-500 text-blue-600"
								: "text-muted-foreground"
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

				{/* Step 1: Personal Info */}
				{currentStep === 0 && (
					<div className={formContainerStyle}>
						<h1>Personal Information</h1>
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
				)}

				{/* Step 2: Contact Info */}
				{currentStep === 1 && (
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
							label={isEmailUnknown ? "Email" : "Email *"}
							type="email"
							disabled={isEmailUnknown}
						/>
						<CheckboxDefault
							control={form.control}
							name="emailUnknown"
							label="Email Unknown"
							className={checkboxWidth}
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
				)}

				{/* Step 3: Membership Info */}
				{currentStep === 2 && (
					<div className={formContainerStyle}>
						<h1>Membership Information</h1>
						{/* Generate ID Checkbox — hidden when converting a temp player */}
						{!tempConversionData && (
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
						)}

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
				)}

				{/* Step 4: Additional Info */}
				{currentStep === 3 && (
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
				)}

				<div className="flex justify-between">
					<Button variant="outline" type="button" onClick={prevStep} className="hover:bg-muted border-border text-foreground">
						{currentStep === 0 ? "Cancel" : "Back"}
					</Button>
					<Button variant="outline" type="button" onClick={nextStep} className="hover:bg-muted border-border text-foreground">
						{currentStep === steps.length - 1 ? "Submit" : "Next"}
					</Button>
				</div>
			</form>
		</Form>
	);
}