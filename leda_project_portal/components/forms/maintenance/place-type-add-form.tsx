"use client";

// Import necessary libraries and components
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
import { toast } from "sonner";
import React from "react";
import { InputDefault } from "@/components/ui/form-input-default";
import { Textarea } from "../../ui/textarea";
import { placeTypeRoute } from "@/lib/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Define the schema for form validation using zod
const placeTypeFormSchema = z.object({
	placeTypeCode: z
		.string()
		.min(1, { message: "Place Type Code is required." }),
	desc: z.string().optional(),
});

// Define styles for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

// Define the PlaceTypeAddForm component
export default function PlaceTypeAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	// Initialize the form using react-hook-form and zodResolver
	const form = useForm<z.infer<typeof placeTypeFormSchema>>({
		resolver: zodResolver(placeTypeFormSchema),
		defaultValues: {
			placeTypeCode: "",
		},
	});

	const [placeTypeExists, setPlaceTypeExists] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof placeTypeFormSchema>) => {
			const response = await fetchWithSession(placeTypeRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				if (response.status === 422) {
					setPlaceTypeExists(true);
				}
				const errorData = await response.json();
				throw new Error(
					errorData?.message ||
						`HTTP error! status: ${response.status}`
				);
			}
			return await response.json();
		},
		onSuccess: (results) => {
			toast.success("Successfully submitted the form!");
			form.reset();
			console.log("Form submitted successfully!", results);
			onClose();
			onRefresh();
		},
		onError: (error: unknown) => {
			console.error("Form submission error", error);
			toast.error(
				`Failed to submit the form: ${
					(error as Error).message || "Please try again."
				}`
			);
		},
	});

	// Reset form and error state when component mounts to ensure clean state
	React.useEffect(() => {
		setPlaceTypeExists(false);
		form.reset({
			placeTypeCode: "",
		});
	}, [form]);

	async function onSubmit(values: z.infer<typeof placeTypeFormSchema>) {
		setPlaceTypeExists(false);
		mutation.mutate(values);
	}

	// Render the form
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 mx-auto"
			>
				<div className="flex space-x-4">
					<div className={formContainerStyle}>
						<InputDefault
							control={form.control}
							name="placeTypeCode"
							label="Place Type Code *"
						/>
						{placeTypeExists && (
							<p className="text-red-500 text-sm mt-1">
								Place Type Code already exists
							</p>
						)}
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
				<div className="flex justify-center">
					<Button variant="outline" type="submit" className="hover:bg-muted border-border text-foreground">Add</Button>
				</div>
			</form>
		</Form>
	);
}
