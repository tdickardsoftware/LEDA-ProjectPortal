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
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Textarea } from "@/components/ui/textarea";
import { InputDefault } from "@/components/ui/form-input-default";
import { teamRoute } from "@/lib/apiRoutes";
import { Team } from "@/lib/definitions";


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
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: Team;
}) {
	const [formData, setFormData] = useState<Team>({} as Team);


	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof teamInfoSchema>>({
		resolver: zodResolver(teamInfoSchema),
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

	useEffect(() => {

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
			form.reset({
				...data,
				ledaId: data.ledaId ? Number(data.ledaId) : undefined,
				establishedDate: data.establishedDate
					? new Date(data.establishedDate)
						.toISOString()
						.split("T")[0]
						: undefined,
			}); // Set form values to the retrieved data
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData) {
		return <div>No team data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof teamInfoSchema>) {
		try {
			const response = await fetch(teamRoute, {
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
				// Prevent form from reloading the page
				onSubmitCapture={(e) => e.preventDefault()}
			>
				<div className="flex space-x-4">
					{/* Team Information Section */}
					<div className={formContainerStyle}>
						<h1>Team Information for LEDA ID #{rowData.ledaId}</h1>
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
						<InputDefault
							control={form.control}
							name="teamName"
							label="Team Name *"
						/>
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
				</div>

				<div className="flex justify-between">
					<Button type="button" onClick={onClose}>Back</Button>
					<Button type="submit">Update</Button>
				</div>
			</form>
		</Form>
	);
}
