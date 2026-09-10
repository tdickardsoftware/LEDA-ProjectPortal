/**
 * Players management page — tabbed view for Members and Temporary Players.
 *
 * Members tab: server-paginated data table with add/edit/delete/view.
 * Temporary Players tab: flat table of all temp records with convert and
 *   delete actions. "Convert to Member" opens the full PlayerAddInformationForm
 *   pre-populated with the temp player's name fields.
 */
"use client";

import { useState } from "react";
import { columns } from "@/schemas/managment/players";
import { usePlayersData } from "@/hooks/usePlayersData";
import { Spinner } from "@/components/ui/skeleton";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";
import { ServerSideDataTable } from "@/components/server-side-datatable";
import { playerRoute, tempPlayerRoute } from "@/lib/apiRoutes";
import { TempPlayer } from "@/lib/definitions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";
import { toast } from "sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PlayerAddInformationForm from "@/components/forms/management/player-add-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Page() {
	const [activeTab, setActiveTab] = useState<"members" | "temp">("members");
	const [convertDialogOpen, setConvertDialogOpen] = useState(false);
	const [selectedTempPlayer, setSelectedTempPlayer] = useState<TempPlayer | null>(null);
	const [hideInactivePlayers, setHideInactivePlayers] = useState(false);

	// ── Members tab state ─────────────────────────────────────────────────────
	const { page, setPage, pageSize, setPageSize, search, setSearch, sorting, setSorting } =
		usePersistedDataTableState("datatable:/Portal/Management/Players");
	const { data, isLoading } = usePlayersData(page, pageSize, search, sorting, hideInactivePlayers);

	// ── Temp players tab state ────────────────────────────────────────────────
	const queryClient = useQueryClient();

	const { data: tempPlayers = [], isLoading: isTempLoading } = useQuery<TempPlayer[]>({
		queryKey: ["tempPlayers"],
		queryFn: async () => {
			const res = await fetchWithSession(tempPlayerRoute, { method: "GET" });
			if (!res.ok) return [];
			return res.json();
		},
		staleTime: 1000 * 30,
		enabled: activeTab === "temp",
	});

	const deleteTempMutation = useMutation({
		mutationFn: async (tempId: number) => {
			const res = await fetchWithSession(`${tempPlayerRoute}?tempId=${tempId}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err?.message || `HTTP ${res.status}`);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tempPlayers"] });
			toast.success("Temp player deleted.");
		},
		onError: (err: unknown) => {
			toast.error(`Failed to delete: ${(err as Error).message}`);
		},
	});

	const handleOpenConvert = (player: TempPlayer) => {
		setSelectedTempPlayer(player);
		setConvertDialogOpen(true);
	};

	const tabClass = (tab: "members" | "temp") =>
		`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
			activeTab === tab
				? "border-blue-500 text-blue-600"
				: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
		}`;

	if (isLoading && !data && activeTab === "members") {
		return (
			<div className="container mx-auto py-10">
				<div className="flex items-center justify-center min-h-[400px]">
					<Spinner />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			{/* Tab bar */}
			<div className="flex border-b border-border mb-6">
				<button className={tabClass("members")} onClick={() => setActiveTab("members")}>
					Members
				</button>
				<button className={tabClass("temp")} onClick={() => setActiveTab("temp")}>
					Temporary Players
				</button>
			</div>

			{/* Members tab */}
			{activeTab === "members" && (
				<>
					<ServerSideDataTable
						columns={columns}
						data={data?.data || []}
						pageName="Players Page"
						stateKey="datatable:/Portal/Management/Players"
						queryKey={["players-datatable"]}
						pageSize={pageSize}
						onPageSizeChange={setPageSize}
						extraControls={
							<div className="flex items-center gap-2">
								<Checkbox
									id="hideInactivePlayers"
									checked={hideInactivePlayers}
									onCheckedChange={(checked) => {
										setHideInactivePlayers(checked === true);
										setPage(1);
									}}
								/>
								<Label htmlFor="hideInactivePlayers" className="cursor-pointer">
									Hide inactive players
								</Label>
							</div>
						}
						addDialogConfig={{
							form: "PlayerAddInformationForm",
							title: "Add Player",
							buttonName: "Add Player +",
						}}
						deleteDialogConfig={{
							buttonName: "Delete Player",
							title: "Delete Player",
							apiEndpoint: playerRoute,
						}}
						editDialogConfig={{
							form: "PlayerEditInformationForm",
							title: "Edit Player",
							buttonName: "Edit Player",
						}}
						viewLinkConfig={{
							linkName: "View Player",
							parentPage: "Players",
						}}
						defaultSort="ledaId"
						sorting={sorting}
						onSortingChange={setSorting}
						isLoading={isLoading}
						totalPages={data?.pagination.totalPages || 1}
						currentPage={page}
						onPageChange={setPage}
						onSearchChange={setSearch}
						searchValue={search}
					/>
				</>
			)}

			{/* Temporary Players tab */}
			{activeTab === "temp" && (
				<div>
					{isTempLoading ? (
						<div className="flex items-center justify-center min-h-[200px]">
							<Spinner />
						</div>
					) : tempPlayers.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No temporary players on record.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Temp ID</TableHead>
									<TableHead>First Name</TableHead>
									<TableHead>M.I.</TableHead>
									<TableHead>Last Name</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tempPlayers.map((player) => (
									<TableRow key={player.tempId}>
										<TableCell>{player.tempId}</TableCell>
										<TableCell>{player.firstName}</TableCell>
										<TableCell>{player.middleInitial ?? "—"}</TableCell>
										<TableCell>{player.lastName}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="outline"
													size="sm"
													className="border-border hover:bg-muted text-foreground"
													onClick={() => handleOpenConvert(player)}
												>
													Convert to Member
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															className="border-border hover:bg-muted text-destructive"
														>
															Delete
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Delete Temp Player</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete{" "}
																<strong>
																	{player.firstName} {player.lastName}
																</strong>{" "}
																(Temp ID: {player.tempId})? This cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => deleteTempMutation.mutate(player.tempId)}
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			)}

			{/* Convert temp player dialog */}
			<Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
				<DialogContent className="max-w-2xl bg-background max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Convert Temp Player to Member —{" "}
							{selectedTempPlayer?.firstName} {selectedTempPlayer?.lastName}
						</DialogTitle>
					</DialogHeader>
					{selectedTempPlayer && (
						<PlayerAddInformationForm
							onClose={() => {
								setConvertDialogOpen(false);
								setSelectedTempPlayer(null);
							}}
							onRefresh={() => {
								queryClient.invalidateQueries({ queryKey: ["tempPlayers"] });
							}}
							tempConversionData={selectedTempPlayer}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
