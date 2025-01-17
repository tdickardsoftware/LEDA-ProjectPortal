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
import { InputDefault } from "@/components/ui/form-input-default";
import MentionBasisSelector from "@/components/ui/mention-basis-selector";
import { Textarea } from "@/components/ui/textarea";
import { mentionRoute } from "@/lib/apiRoutes";
import { Mention } from "@/lib/definitions";

const mentionFormSchema = z.object({
	mentionCode: z.string().min(1, { message: "Mention Code is required." }),
	desc: z.string().optional(),
	points: z.number().min(0, { message: "Points must be a positive number." }),
	mentionBasis: z.string().min(1, { message: "Mention Basis is required." }),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";
const inputWidth = "w-24";

export default function MentionEditForm({
	onClose,
	onRefresh,
	rowData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: Mention;
}) {
	const [formData, setFormData] = useState<Mention>({} as Mention);

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof mentionFormSchema>>({
		resolver: zodResolver(mentionFormSchema),
		defaultValues: {
			mentionCode: formData.mentionCode || "",
			desc: formData.desc || "",
			points: formData.points || undefined,
			mentionBasis: formData.mentionBasis || "",
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!rowData || !rowData.mentionCode) {
				return;
			}
			const response = await fetch(
				mentionRoute + `?mentionCode=${rowData.mentionCode}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch mention data: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			setFormData(data);
			form.reset({
				...data,
				points: data.points ? Number(data.points) : undefined,
			}); // Set form values to the retrieved data
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData) {
		return <div>No mention data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof mentionFormSchema>) {
		try {
			const response = await fetch(mentionRoute, {
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
			onRefresh(); // Refresh the datatable with the mention API route
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
					{/* Mention Information Section */}
					<div className={formContainerStyle}>
						<h1>Mention Information for Mention Code #{rowData.mentionCode}</h1>
						<InputDefault
							control={form.control}
							name="mentionCode"
							label="Mention Code *"
                            disabled
						/>
						<FormField
							control={form.control}
							name="points"
							render={({ field }) => (
								<FormItem>
									<Label>Points *</Label>
									<FormControl>
										<Input
											placeholder="0"
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
						<FormField
							control={form.control}
							name="mentionBasis"
							render={() => (
								<FormItem>
									<Label>Mention Basis *</Label>
									<MentionBasisSelector />
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="desc"
							render={({ field }) => (
								<FormItem>
									<Label>Description</Label>
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
					<Button type="button" onClick={onClose}>
						Back
					</Button>
					<Button type="submit">Update</Button>
				</div>
			</form>
		</Form>
	);
}
