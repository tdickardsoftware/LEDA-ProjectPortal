"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import React from "react";
import { InputDefault } from "@/components/ui/form-input-default";
import { divisionRoute } from "@/lib/apiRoutes";
import { Division } from "@/lib/definitions";

const divisionFormSchema = z.object({
	ledaId: z
		.number()
		.min(0, { message: "LEDA ID Must be a Postive Number." })
		.optional(),
	divisionName: z.string().min(1, { message: "Division Name is required." }),
	establishedDate: z.string(),
	memo: z.string().optional(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-white rounded-lg border border-gray-300";

export default function DivisionEditForm({
	onClose,
	onRefresh,
	rowData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: Division;
}) {
	const [formData, setFormData] = useState<Division>({} as Division);

	const formRef = React.useRef<HTMLFormElement>(null);
	const form = useForm<z.infer<typeof divisionFormSchema>>({
		resolver: zodResolver(divisionFormSchema),
		defaultValues: {
			divisionName: formData.divisionName || "",
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(
				divisionRoute + `?divisionName=${rowData.divisionName}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch division data: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			setFormData(data);
			form.reset({
				...data,
				ledaId: data.ledaId ? Number(data.ledaId) : undefined,
				establishedDate: data.establishedDate
					? new Date(data.establishedDate).toISOString().split("T")[0]
					: undefined,
			}); // Set form values to the retrieved data
		};
		fetchData();
	}, [rowData, form]);

	if (!rowData) {
		return <div>No division data available.</div>;
	}

	async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
		try {
			const response = await fetch(divisionRoute, {
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
			onRefresh(); // Refresh the datatable with the division API route
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
					{/* Division Information Section */}
					<div className={formContainerStyle}>
						<h1>
							Division Information for Division #
							{rowData.divisionName}
						</h1>
						<InputDefault
							control={form.control}
							name="divisionName"
							label="Division Name *"
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
