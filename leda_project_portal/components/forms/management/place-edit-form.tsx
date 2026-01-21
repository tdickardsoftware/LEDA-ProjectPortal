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
import { Place } from "@/lib/definitions";
import { Tab } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";
import { DatePickerFormField } from "@/components/ui/date-picker-form-field";

const placeFormSchema = z.object({
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	name: z.string().min(1, { message: "Name is required." }),
	addressOne: z.string().min(1, { message: "Address is required." }),
	addressTwo: z.string().nullable().optional(),
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
		.nullable()
		.optional()
		.refine(
			(value) => !value || value === "" || isValidPhoneNumber(value, "US"),
			{ message: "Other Number is Invalid" }
		),
	email: z
		.string()
		.nullable()
		.optional()
		.refine((value) => !value || validator.isEmail(value), { message: "Email is Invalid" }),
	website: z
		.string()
		.nullable()
		.optional()
		.refine((value) => !value || validator.isURL(value), {
			message: "Website is Invalid",
		}),
	establishDate: z.string(),
	memo: z.string().nullable().optional(),
	numberOfBoards: z
		.number()
		.min(0, { message: "Number of Boards Must be a Postive Number." }),
	sendMailings: z.boolean(),
	regularSponsor: z.boolean(),
	currentSponsor: z.boolean(),
	issues: z.boolean(),
	lastSanctioningDate: z.string().nullable().optional(),
	placeType: z.string().min(1, { message: "Place Type is Required" }),
	contactId: z.string().min(1, { message: "Place Owner is Required" }),
});

const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";
const inputWidth = "w-24";
const checkboxWidth = "h-5 w-5";

export default function PlaceEditForm({
	onClose,
	onRefresh,
	rowData,
	handleEdit,
}: {
	onClose?: () => void;
	onRefresh?: () => void;
	rowData: Place;
	handleEdit?: () => void;
}) {
	const [formData, setFormData] = useState<Place>({} as Place);
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

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof placeFormSchema>>({
		resolver: zodResolver(placeFormSchema),
		mode: "onChange",
		defaultValues: {
			ledaId: formData.ledaId ?? 0,
			name: formData.name || "",
			addressOne: formData.addressOne || "",
			addressTwo: formData.addressTwo || "",
			city: formData.city || "",
			state: formData.state || "",
			zip: formData.zip || "",
			phoneNumber: formData.phoneNumber || "",
			otherNumber: formData.otherNumber || "",
			email: formData.email || "",
			website: formData.website || "",
			establishDate: formData.establishDate
				? new Date(formData.establishDate).toISOString().split("T")[0]
				: "",
			memo: formData.memo || "",
			numberOfBoards: formData.numberOfBoards || 0,
			sendMailings: formData.sendMailings || false,
			regularSponsor: formData.regularSponsor || false,
			currentSponsor: formData.currentSponsor || false,
			issues: formData.issues || false,
			lastSanctioningDate: formData.lastSanctioningDate
				? new Date(formData.lastSanctioningDate)
						.toISOString()
						.split("T")[0]
				: "",
			placeType: formData.placeType || "",
			contactId: formData.contactId ? String(formData.contactId) : "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof placeFormSchema>) => {
			const response = await fetchWithSession(placeRoute, {
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
		onSuccess: (results) => {
			toast.success("Successfully updated the form!");
			form.reset();
			console.log("Form updated successfully!", results);
			if (onClose) {
				onClose();
			}
			if (onRefresh) {
				onRefresh();
			}
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
		const result = await form.trigger(
			currentStepFields as (keyof z.infer<typeof placeFormSchema>)[]
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
			if (onClose) {
				onClose();
			} else if (handleEdit) {
				handleEdit();
			}
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			if (!rowData || !rowData.ledaId) {
				return;
			}
			const response = await fetchWithSession(
				placeRoute + `?ledaId=${rowData.ledaId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch place data: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			setFormData(data);
			form.reset({
				...data,
				ledaId: data.ledaId ? Number(data.ledaId) : undefined,
				numberOfBoards: data.numberOfBoards
					? Number(data.numberOfBoards)
					: undefined,
				establishDate: data.establishDate
					? new Date(data.establishDate).toISOString().split("T")[0]
					: undefined,
				lastSanctioningDate: data.lastSanctioningDate
					? new Date(data.lastSanctioningDate)
							.toISOString()
							.split("T")[0]
					: undefined,
			}); // Set form values to the retrieved data
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData) {
		return <div>No place data available.</div>;
	}

	function onSubmit(values: z.infer<typeof placeFormSchema>) {
		mutation.mutate(values);
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
						{/* Step 1: Basic Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>
									Basic Place Information for LEDA ID #
									{rowData.ledaId}
								</h1>
								<hr className="bg-muted mb-4"></hr>
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
											<Label>Number of Boards *</Label>
											<FormControl>
												<Input
													placeholder="Number of Boards..."
													{...field}
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
										</FormItem>
									)}
								/>
							</div>
						</Tab.Panel>

						{/* Step 2: Contact Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Contact Information</h1>
								<hr className="bg-muted mb-4"></hr>
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
									label="Email"
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
								<hr className="bg-muted mb-4"></hr>
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
								<DatePickerFormField
									control={form.control}
									name="establishDate"
									label="Established Date *"
								/>
							</div>
						</Tab.Panel>

						{/* Step 4: Additional Info */}
						<Tab.Panel>
							<div className={formContainerStyle}>
								<h1>Additional Information</h1>
								<hr className="bg-muted mb-4"></hr>
								<DatePickerFormField
									control={form.control}
									name="lastSanctioningDate"
									label="Last Sanctioning Date *"
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
											<Label>Memo</Label>
											<FormControl>
												<Textarea
													placeholder="Additional Data Here..."
													{...field}
													value={field.value ?? ""}
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
					<Button variant="outline" type="button" onClick={prevStep} className="hover:bg-muted border-border text-foreground">
						{currentStep === 0
							? handleEdit
								? "Edit"
								: "Back"
							: "Back"}
					</Button>
					<Button variant="outline" type="button" onClick={nextStep} className="hover:bg-muted border-border text-foreground">
						{currentStep === steps.length - 1 ? "Update" : "Next"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
