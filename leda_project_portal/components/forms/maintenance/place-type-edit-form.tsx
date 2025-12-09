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
import { placeTypeRoute } from "@/lib/apiRoutes";
import { PlaceType } from "@/lib/definitions";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

const placeTypeFormSchema = z.object({
	placeTypeCode: z
		.string()
		.min(1, { message: "Place Type Code is required." }),
	desc: z.string().optional(),
});

const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

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
			if (!rowData || !rowData.placeTypeCode) {
				return;
			}
			const response = await fetchWithSession(
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
			});
		};
		fetchData();
	}, [rowData, form]);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof placeTypeFormSchema>) => {
			const response = await fetchWithSession(placeTypeRoute, {
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

	async function onSubmit(values: z.infer<typeof placeTypeFormSchema>) {
		mutation.mutate(values);
	}

	if (!rowData) {
		return <div>No place type data available.</div>;
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
