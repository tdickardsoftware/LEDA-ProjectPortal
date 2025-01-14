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
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { InputDefault } from "@/components/ui/form-input-default";
import { playerRoute } from "@/lib/apiRoutes";
import CheckboxDefault from "@/components/ui/checkbox-default";
import { Player, PlayerMemberInfo } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

const playerInfoSchema = z.object({
	firstName: z.string().min(1, { message: "First Name is Required" }),
	middleInitial: z.optional(z.string()),
	lastName: z.string().min(1, { message: "Last Name is Required" }),
	addressOne: z.string().min(1, { message: "Address is Required" }),
	addressTwo: z.optional(z.string()),
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
		.optional()
		.refine(
			(value) => value === "" || isValidPhoneNumber(value ?? "", "US"),
			{ message: "Other Number is Invalid" }
		),
	email: z
		.string()
		.min(1, { message: "Email is Required" })
		.refine(validator.isEmail, { message: "Email is Invalid" }),
	gender: z.string().min(1, { message: "Gender is Required" }),
	dateOfBirth: z.string().optional(),
	// Membership Information
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	establishedDate: z.string(),
	badStanding: z.boolean(),
	badStandingReason: z.optional(z.string()),
	takeOffMailing: z.boolean(),
	mailStandings: z.boolean(),
	formOnFile: z.boolean(),
	needsMemberCard: z.boolean(),
	inactiveDate: z.optional(z.string().optional()),
	lastMembershipFeePayment: z
		.string()
		.min(3, { message: "Last Membership fee is required" })
		.max(4),
	lastTrailsDate: z.optional(z.string()),
	memberType: z.string().min(1, { message: "Member Type is Required" }),
	cannotBeCaptain: z.boolean(),
	lifetimeMember: z.boolean(),
	lifetimeMemberReason: z.optional(z.string()),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const inputWidth = "w-24";
const checkboxWidth = "h-5 w-5";

export default function PlayerEditInformationForm({
	onClose,
	onRefresh,
	rowData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData: Player;
}) {
	const [badStandingStatus, setBadStandingStatus] = useState(false);
	const [lifetimeMemberStatus, setLifetimeMemberStatus] = useState(false);
	const [formData, setFormData] = useState<PlayerMemberInfo>(
		{} as PlayerMemberInfo
	);
	const [loading, setLoading] = useState(true);

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof playerInfoSchema>>({
		resolver: zodResolver(playerInfoSchema),
		defaultValues: {
			firstName: formData.firstName || "",
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
			ledaId: formData.ledaId || 0,
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
			lastMembershipFeePayment: formData.lastMembershipFeePayment || "",
			lastTrailsDate: formData.lastTrailsDate
				? new Date(formData.lastTrailsDate).toISOString().split("T")[0]
				: "",
			memberType: formData.memberType || "",
			cannotBeCaptain: formData.cannotBeCaptain || false,
			lifetimeMember: formData.lifetimeMember || false,
			lifetimeMemberReason: formData.lifetimeMemberReason || "",
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(
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
			form.reset(data); // Set form values to the retrieved data
			setLoading(false); // Set loading to false after data is fetched
		};
		fetchData();
	}, [rowData.ledaId, form]);

	async function onSubmit(values: z.infer<typeof playerInfoSchema>) {
		try {
			const response = await fetch(playerRoute, {
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

			const results = await response.json();
			toast.success("Successfully submitted the form!");

			// Reset form and state
			form.reset();
			setBadStandingStatus(false);
			setLifetimeMemberStatus(false);

			console.log("Form submitted successfully!", results);
			onClose(); // Close the form
			onRefresh(); // Refresh the datatable with the player API route
		} catch (error) {
			console.error("Form submission error", error);
			toast.error(
				`Failed to submit the form: ${
					(error as Error).message || "Please try again."
				}`
			);
		}
	}

	if (loading) {
		return (
			<div className="flex flex-col space-y-3">
				<Skeleton className="h-[125px] w-[250px] rounded-xl" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-[250px]" />
					<Skeleton className="h-4 w-[200px]" />
				</div>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
				ref={formRef}
			>
				<div className="flex space-x-4">
					{/* Player Information Section */}
					<div className={formContainerStyle}>
						<h1>Player Information</h1>
						<div className="flex space-x-4">
							<InputDefault
								control={form.control}
								name="firstName"
								label="First Name *"
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
						<GenderSelector control={form.control} name="gender" />
						<InputDefault
							control={form.control}
							name="dateOfBirth"
							label="Date of Birth"
							type="date"
						/>
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
							<StatePicker name="state" control={form.control} />
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

					<div>
						<hr className="w-px h-full my-0 bg-gray-300 border-0 dark:bg-gray-700" />
					</div>

					{/* Membership Info Section */}
					<div className={formContainerStyle}>
						<h1>Membership Info</h1>
						<FormField
							control={form.control}
							name="ledaId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="LEDA ID #"
											{...field}
											className={inputWidth}
											type="number"
											onChange={(e) => {
												field.onChange(
													e.target.value
														? Number(e.target.value)
														: undefined
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
						<InputDefault
							control={form.control}
							name="establishedDate"
							label="Established Date *"
							type="date"
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
												setBadStandingStatus(checked);
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
											disabled={!badStandingStatus}
											className="w-fit"
											type="text"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
											disabled={!lifetimeMemberStatus}
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
						<InputDefault
							control={form.control}
							name="inactiveDate"
							label="Inactive Date"
							type="date"
						/>
						<SeasonCodeSelector
							control={form.control}
							name="lastMembershipFeePayment"
							label="Last Membership Fee Payment *"
						/>
						<InputDefault
							control={form.control}
							name="lastTrailsDate"
							label="Last Trails Date"
							type="date"
						/>
					</div>
				</div>

				<div className="flex justify-between">
					<Button type="button">Back</Button>
					<Button type="submit">Next</Button>
				</div>
			</form>
		</Form>
	);
}
