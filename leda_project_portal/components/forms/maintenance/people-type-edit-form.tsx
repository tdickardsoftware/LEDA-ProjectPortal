"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import React from "react";
import { InputDefault } from "@/components/ui/form-input-default";
import { Textarea } from "@/components/ui/textarea";
import { peopleTypeRoute } from "@/lib/apiRoutes";
import { PeopleType } from "@/lib/definitions";

const peopleTypeFormSchema = z.object({
	peopleTypeCode: z
		.string()
		.min(1, { message: "People Type Code is required." }),
	desc: z.string().optional(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

export default function PeopleTypeEditForm({
	onClose,
	onRefresh,
	rowData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: PeopleType;
}) {
	const [formData, setFormData] = useState<PeopleType>({} as PeopleType);

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof peopleTypeFormSchema>>({
		resolver: zodResolver(peopleTypeFormSchema),
		defaultValues: {
			peopleTypeCode: formData.peopleTypeCode || "",
			desc: formData.desc || "",
		},
	});

	useEffect(() => {
		if (!rowData || !rowData.peopleTypeCode) {
			return;
		}
		const fetchData = async () => {
			const response = await fetch(
				peopleTypeRoute + `?peopleTypeCode=${rowData.peopleTypeCode}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch people type data: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			setFormData(data);
			form.reset({
				...data,
			}); // Set form values to the retrieved data
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData) {
		return <div>No people type data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof peopleTypeFormSchema>) {
		try {
			const response = await fetch(peopleTypeRoute, {
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
			onRefresh(); // Refresh the datatable with the people type API route
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
					{/* People Type Information Section */}
					<div className={formContainerStyle}>
						<h1>
							People Type Information for Code #
							{rowData.peopleTypeCode}
						</h1>
						<InputDefault
							control={form.control}
							name="peopleTypeCode"
							label="People Type Code *"
                            disabled
						/>
						<FormField
							control={form.control}
							name="desc"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
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
