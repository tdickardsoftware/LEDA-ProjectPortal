/**
 * LinkTempPlayerForm
 *
 * Used from the Players management page's Temporary Players tab to link a
 * temp player record to an existing member, for cases where the temp player
 * turns out to already be a registered player. Re-keys all of the temp
 * player's recorded data (scoresheets, points, mentions, trails) onto the
 * selected member and removes the temp record.
 */
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import PlayerSelect from "@/components/ui/single-player-select";
import { fetchWithSession } from "@/lib/getData";
import { tempPlayerRoute } from "@/lib/apiRoutes";
import { TempPlayer } from "@/lib/definitions";
import { toast } from "sonner";

const linkFormSchema = z.object({
	ledaId: z.number().positive({ message: "Select a player to link to." }),
	fullName: z.string().optional(),
});

interface LinkTempPlayerFormProps {
	tempPlayer: TempPlayer;
	onClose: () => void;
}

export default function LinkTempPlayerForm({ tempPlayer, onClose }: LinkTempPlayerFormProps) {
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof linkFormSchema>>({
		resolver: zodResolver(linkFormSchema),
		defaultValues: { ledaId: undefined, fullName: "" },
	});

	const linkMutation = useMutation({
		mutationFn: async (values: z.infer<typeof linkFormSchema>) => {
			const res = await fetchWithSession(tempPlayerRoute, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "link",
					tempId: tempPlayer.tempId,
					ledaId: values.ledaId,
				}),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err?.message || `HTTP ${res.status}`);
			}
			return res.json();
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["tempPlayers"] });
			toast.success(data?.message || "Temp player linked successfully.");
			onClose();
		},
		onError: (err: unknown) => {
			toast.error(`Failed to link player: ${(err as Error).message}`);
		},
	});

	const onSubmit = (values: z.infer<typeof linkFormSchema>) => linkMutation.mutate(values);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
				onSubmitCapture={(e) => e.preventDefault()}
			>
				<p className="text-sm text-muted-foreground">
					Linking <strong>{tempPlayer.firstName} {tempPlayer.lastName}</strong> (Temp ID: {tempPlayer.tempId})
					will move all of their recorded data onto the selected player and remove the temp record. This cannot be undone.
				</p>
				<PlayerSelect
					control={form.control}
					name="ledaId"
					label="Existing Player *"
					trailsDateData={[]}
				/>
				<div className="flex justify-end gap-2 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="border-border hover:bg-muted text-foreground"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="outline"
						disabled={linkMutation.isPending}
						className="border-border hover:bg-muted text-foreground"
					>
						{linkMutation.isPending ? "Linking..." : "Link Player"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
