/**
 * TempPlayerAddForm
 *
 * Used from the weekly scoresheets to add a temporary player to a team's
 * game participation list. The user can either:
 *   - Enter a new first / middle / last name to create a fresh temp record, or
 *   - Select an existing temporary player from the dropdown.
 *
 * On submit the parent receives a fully-formed TempPlayer object via onAdded.
 */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";
import { tempPlayerRoute } from "@/lib/apiRoutes";
import { TempPlayer } from "@/lib/definitions";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const newPlayerSchema = z.object({
	firstName: z.string().min(1, { message: "First Name is required" }),
	middleInitial: z.string().nullable().optional(),
	lastName: z.string().min(1, { message: "Last Name is required" }),
});

interface TempPlayerAddFormProps {
	onAdded: (player: TempPlayer) => void;
	onClose: () => void;
}

export default function TempPlayerAddForm({ onAdded, onClose }: TempPlayerAddFormProps) {
	const [mode, setMode] = useState<"new" | "existing">("new");
	const [selectedExistingId, setSelectedExistingId] = useState<string>("");
	const queryClient = useQueryClient();

	const { data: existingTempPlayers = [] } = useQuery<TempPlayer[]>({
		queryKey: ["tempPlayers"],
		queryFn: async () => {
			const res = await fetchWithSession(tempPlayerRoute, { method: "GET" });
			if (!res.ok) return [];
			return res.json();
		},
		staleTime: 1000 * 30,
	});

	const form = useForm<z.infer<typeof newPlayerSchema>>({
		resolver: zodResolver(newPlayerSchema),
		defaultValues: { firstName: "", middleInitial: "", lastName: "" },
	});

	const createMutation = useMutation({
		mutationFn: async (values: z.infer<typeof newPlayerSchema>) => {
			const res = await fetchWithSession(tempPlayerRoute, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err?.message || `HTTP ${res.status}`);
			}
			return res.json() as Promise<TempPlayer>;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["tempPlayers"] });
			toast.success(`Temp player ${data.firstName} ${data.lastName} added.`);
			onAdded(data);
			onClose();
		},
		onError: (err: unknown) => {
			toast.error(`Failed to add temp player: ${(err as Error).message}`);
		},
	});

	const handleSubmitNew = (values: z.infer<typeof newPlayerSchema>) => {
		createMutation.mutate(values);
	};

	const handleSelectExisting = () => {
		const found = existingTempPlayers.find(
			(p) => String(p.tempId) === selectedExistingId
		);
		if (!found) {
			toast.error("Please select a temp player.");
			return;
		}
		onAdded(found);
		onClose();
	};

	return (
		<div className="space-y-4 w-full">
			{/* Mode toggle */}
			<div className="flex gap-4">
				<button
					type="button"
					onClick={() => setMode("new")}
					className={`pb-1 text-sm font-medium border-b-2 ${
						mode === "new" ? "border-blue-500 text-blue-600" : "border-transparent text-muted-foreground"
					}`}
				>
					New Temp Player
				</button>
				<button
					type="button"
					onClick={() => setMode("existing")}
					className={`pb-1 text-sm font-medium border-b-2 ${
						mode === "existing" ? "border-blue-500 text-blue-600" : "border-transparent text-muted-foreground"
					}`}
				>
					Select Existing
				</button>
			</div>

			{mode === "new" && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmitNew)} className="space-y-3">
						<div className="flex gap-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormLabel>First Name *</FormLabel>
										<FormControl>
											<Input placeholder="First" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="middleInitial"
								render={({ field }) => (
									<FormItem className="w-16">
										<FormLabel>M.I.</FormLabel>
										<FormControl>
											<Input
												placeholder="M"
												{...field}
												value={field.value ?? ""}
												maxLength={1}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormLabel>Last Name *</FormLabel>
										<FormControl>
											<Input placeholder="Last" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button variant="outline" type="button" onClick={onClose} className="border-border hover:bg-muted text-foreground">
								Cancel
							</Button>
							<Button variant="outline" type="submit" disabled={createMutation.isPending} className="border-border hover:bg-muted text-foreground">
								{createMutation.isPending ? "Adding..." : "Add Temp Player"}
							</Button>
						</div>
					</form>
				</Form>
			)}

			{mode === "existing" && (
				<div className="space-y-3">
					{existingTempPlayers.length === 0 ? (
						<p className="text-sm text-muted-foreground">No existing temporary players.</p>
					) : (
						<>
							<div className="space-y-1">
								<Label>Select Temp Player</Label>
								<Select
									value={selectedExistingId}
									onValueChange={setSelectedExistingId}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Choose a temp player..." />
									</SelectTrigger>
									<SelectContent>
										{existingTempPlayers.map((p) => (
											<SelectItem key={p.tempId} value={String(p.tempId)}>
												{p.firstName}{p.middleInitial ? ` ${p.middleInitial}.` : ""} {p.lastName}{" "}
												<span className="text-muted-foreground text-xs">(Temp ID: {p.tempId})</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex justify-end gap-2 pt-2">
								<Button variant="outline" type="button" onClick={onClose} className="border-border hover:bg-muted text-foreground">
									Cancel
								</Button>
								<Button
									variant="outline"
									type="button"
									onClick={handleSelectExisting}
									disabled={!selectedExistingId}
									className="border-border hover:bg-muted text-foreground"
								>
									Add to Team
								</Button>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
