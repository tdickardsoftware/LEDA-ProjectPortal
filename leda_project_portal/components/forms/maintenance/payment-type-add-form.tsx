// Import necessary modules and components
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
import { toast } from "sonner";
import React from "react";
import { InputDefault } from "@/components/ui/form-input-default";
import { Textarea } from "@/components/ui/textarea";
import { paymentTypeRoute } from "@/lib/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

// Define the schema for the form validation
const paymentTypeFormSchema = z.object({
	paymentType: z.string().min(1, { message: "Payment Type is required." }),
	desc: z.string().optional(),
});

// Define the style for the form container
const formContainerStyle =
	"p-4 shadow-lg bg-background rounded-lg border border-border";

// PaymentTypeAddForm component definition
export default function PaymentTypeAddForm({
	onClose,
	onRefresh,
}: {
	onClose: () => void;
	onRefresh: () => void;
}) {
	// Initialize the form with default values and validation schema
	const form = useForm<z.infer<typeof paymentTypeFormSchema>>({
		resolver: zodResolver(paymentTypeFormSchema),
		defaultValues: {
			paymentType: "",
			desc: "",
		},
	});

	const [paymentTypeExists, setPaymentTypeExists] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (values: z.infer<typeof paymentTypeFormSchema>) => {
			const response = await fetchWithSession(paymentTypeRoute, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				if (response.status === 422) {
					setPaymentTypeExists(true);
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
		setPaymentTypeExists(false);
		form.reset({
			paymentType: "",
			desc: "",
		});
	}, [form]);

	async function onSubmit(values: z.infer<typeof paymentTypeFormSchema>) {
		setPaymentTypeExists(false);
		mutation.mutate(values);
	}

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
							name="paymentType"
							label="Payment Type *"
						/>
						{paymentTypeExists && (
							<p className="text-red-500 text-sm">
								{" "}
								Payment type already exists{" "}
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
