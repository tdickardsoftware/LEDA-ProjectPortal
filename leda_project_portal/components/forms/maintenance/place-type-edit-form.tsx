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
import { placeTypeRoute } from "@/lib/apiRoutes";
import { PlaceType } from "@/lib/definitions";

const placeTypeFormSchema = z.object({
	placeTypeCode: z
		.string()
		.min(1, { message: "Place Type Code is required." }),
	desc: z.string().optional(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

export default function PlaceTypeEditForm({
	onClose,
	onRefresh,
	rowData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: PlaceType;
}) {
	const [formData, setFormData] = useState<PlaceType>({} as PlaceType);

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof placeTypeFormSchema>>({
		resolver: zodResolver(placeTypeFormSchema),
		defaultValues: {
			placeTypeCode: formData.placeTypeCode || "",
			desc: formData.desc || "",
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(
				placeTypeRoute + `?placeTypeCode=${rowData.placeTypeCode}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch place type data: ${response.status} ${response.statusText}`
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
		return <div>No place type data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof placeTypeFormSchema>) {
		try {
			const response = await fetch(placeTypeRoute, {
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
			onRefresh(); // Refresh the datatable with the place type API route
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
					{/* Place Type Information Section */}
					<div className={formContainerStyle}>
						<h1>
							Place Type Information for Code #
							{rowData.placeTypeCode}
						</h1>
						<InputDefault
							control={form.control}
							name="placeTypeCode"
							label="Place Type Code *"
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
