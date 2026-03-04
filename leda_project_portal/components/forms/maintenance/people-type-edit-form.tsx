/**
 * PeopleTypeEditForm Component
 *
 * Edit form for an existing people type code. Fetches the full record by
 * `peopleTypeCode` from the API on mount and pre-populates the fields. The
 * code field is disabled to prevent changing the primary key after creation.
 * Submits a PUT request to update the description.
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
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import React from "react";
import { InputDefault } from "@/components/ui/form-input-default";
import { Textarea } from "@/components/ui/textarea";
import { peopleTypeRoute } from "@/lib/apiRoutes";
import { PeopleType } from "@/lib/definitions";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Validation schema for people type fields
const peopleTypeFormSchema = z.object({
	peopleTypeCode: z
		.string()
		.min(1, { message: "People Type Code is required." }),
	desc: z.string().optional(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

/**
 * PeopleTypeEditForm fetches a people type record and provides an edit interface.
 *
 * @param onClose - Callback to close the edit panel
 * @param onRefresh - Callback to reload the parent data table
 * @param rowData - Row data containing the peopleTypeCode used to fetch details
 */
export default function PeopleTypeEditForm({
	onClose,
	onRefresh,
	rowData,
}: {
	onClose: () => void;
	onRefresh: () => void;
	rowData: PeopleType;
}) {
	// Local state to store the full people type record fetched from the API
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
			const response = await fetchWithSession(
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
			});
		};
		fetchData();
	}, [rowData, form]);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof peopleTypeFormSchema>) => {
			const response = await fetchWithSession(peopleTypeRoute, {
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

	async function onSubmit(values: z.infer<typeof peopleTypeFormSchema>) {
		mutation.mutate(values);
	}

	if (!rowData) {
		return <div>No people type data available.</div>;
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
					<Button variant="outline" type="button" onClick={onClose} className="hover:bg-muted border-border text-foreground">
						Back
					</Button>
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Update</Button>
				</div>
			</form>
		</Form>
	);
}
