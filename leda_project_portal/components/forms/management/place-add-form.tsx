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
import validator from "validator";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PhoneNumberInput from "@/components/ui/phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import React from "react";
import PlaceTypeSelector from "@/components/ui/place-type-selector";
import { Textarea } from "@/components/ui/textarea";
import PlaceOwnerSelector from "@/components/ui/place-owner-select";
import { InputDefault } from "../../ui/form-input-default";
import { placeRoute } from "@/lib/apiRoutes";
import StatePicker from "../../ui/state-selector";
import CheckboxDefault from "@/components/ui/checkbox-default";
import { Tab } from "@headlessui/react";

const placeFormSchema = z.object({
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	name: z.string().min(1, { message: "Name is required." }),
	addressOne: z.string().min(1, { message: "Address is required." }),
	addressTwo: z.string().optional(),
	city: z.string().min(1, { message: "City is required." }),
	state: z.string().min(1, { message: "State is required." }),
	zip: z.string().min(1, { message: "Zip is required." }),
	phoneNumber: z
		.string()
		.min(1, { message: "Phone Number is Required" })
		.refine((value) => isValidPhoneNumber(value, "US"), {
			message: "Phone Number is Invalid",
		}),
	otherNumber: z
		.string()
		.optional()
		.refine(
			(value) => value === "" || isValidPhoneNumber(value ?? "", "US"),
			{ message: "Other Number is Invalid" }
		),
	email: z
		.string()
		.min(1, { message: "Email is Required" })
		.refine(validator.isEmail, { message: "Email is Invalid" }),
	website: z
		.string()
		.optional()
		.refine((value) => value === undefined || validator.isURL(value), {
			message: "Website is Invalid",
		}),
	establishDate: z.string(),
	memo: z.string().optional(),
	numberOfBoards: z
		.number()
		.min(0, { message: "Number of Boards Must be a Postive Number." }),
	sendMailings: z.boolean(),
	regularSponsor: z.boolean(),
	currentSponsor: z.boolean(),
	issues: z.boolean(),
	lastBarFeePayment: z.string(),
	lastSanctioningDate: z.string().optional(),
	placeType: z.string().min(1, { message: "Place Type is Required" }),
	contactId: z.string().min(1, { message: "Place Owner is Required" }),
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
	const [currentStep, setCurrentStep] = useState(0);

	// Define the steps
	const steps = [
		{ name: "Basic Info", fields: ["name", "website", "numberOfBoards"] },
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
			fields: ["ledaId", "contactId", "placeType", "establishDate"],
		},
		{
			name: "Additional Info",
			fields: [
				"lastSanctioningDate",
				"sendMailings",
				"regularSponsor",
				"currentSponsor",
				"issues",
				"memo",
			],
		},
	];

	const form = useForm<z.infer<typeof placeFormSchema>>({
		resolver: zodResolver(placeFormSchema),
		mode: "onChange",
		defaultValues: {
			ledaId: undefined,
			name: "",
			addressOne: "",
			addressTwo: "",
			city: "",
			state: "",
			zip: "",
			phoneNumber: "",
			otherNumber: "",
			email: "",
			website: "",
			establishDate: "",
			memo: "",
			numberOfBoards: 0,
			sendMailings: false,
			regularSponsor: false,
			currentSponsor: false,
			issues: false,
			lastBarFeePayment: "UNPAID - NEW PLACE ADDED",
			lastSanctioningDate: "",
			placeType: "",
			contactId: "",
		},
	});

	// Handle step navigation
	const nextStep = async () => {
		const currentStepFields = steps[currentStep].fields;

		// Validate only the fields in the current step
		const result = await form.trigger(
			currentStepFields as (keyof z.infer<typeof placeFormSchema>)[]
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

	async function onSubmit(values: z.infer<typeof placeFormSchema>) {
		try {
			const submissionValues = generateIDStatus
				? { ...values, ledaId: 0 }
				: values;

			const response = await fetch(placeRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submissionValues),
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

			toast.success("Successfully submitted the form!");

			// Reset form and state
			form.reset();
			setGenerateIDStatus(true);
			onClose(); // Close the form
			onRefresh(); // Refresh the datatable with the place API route
		} catch (error) {
			console.error("Form submission error", error);
			toast.error(
				`Failed to submit the form: ${
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
								<h1>Basic Place Information</h1>
								<hr className="bg-gray-300 mb-4"></hr>
								<InputDefault
									control={form.control}
									name="name"
									label="Name of Place *"
								/>
								<InputDefault
									control={form.control}
									name="website"
									label="Website"
								/>
								<FormField
									control={form.control}
									name="numberOfBoards"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Number of Boards *
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Number of Boards..."
													{...field}
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
							</div>
						</Tab.Panel>

						{/* Step 2: Contact Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Contact Information</h1>
								<hr className="bg-gray-300 mb-4"></hr>
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
										control={form.control}
										name="state"
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
								<hr className="bg-gray-300 mb-4"></hr>
								{/* Generate ID Checkbox */}
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
											{ledaIdExists && (
												<p className="text-red-500 text-sm mt-1">
													This LEDA ID is already in
													use
												</p>
											)}
										</FormItem>
									)}
								/>
								<PlaceOwnerSelector
									control={form.control}
									name="contactId"
									label="Select Place Owner *"
								/>
								<PlaceTypeSelector
									control={form.control}
									name="placeType"
									label="Place Type *"
								/>
								<InputDefault
									control={form.control}
									name="establishDate"
									label="Established Date *"
									type="date"
								/>
							</div>
						</Tab.Panel>

						{/* Step 4: Additional Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Additional Information</h1>
								<hr className="bg-gray-300 mb-4"></hr>
								<InputDefault
									control={form.control}
									name="lastSanctioningDate"
									label="Last Sanctioning Date *"
									type="date"
								/>
								<CheckboxDefault
									control={form.control}
									name="sendMailings"
									label="Send Mailings"
									className={checkboxWidth}
								/>
								<CheckboxDefault
									control={form.control}
									name="regularSponsor"
									label="Regular Sponsor"
									className={checkboxWidth}
								/>
								<CheckboxDefault
									control={form.control}
									name="currentSponsor"
									label="Current Sponsor"
									className={checkboxWidth}
								/>
								<CheckboxDefault
									control={form.control}
									name="issues"
									label="Issues"
									className={checkboxWidth}
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
						</Tab.Panel>
					</Tab.Panels>
				</Tab.Group>

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
