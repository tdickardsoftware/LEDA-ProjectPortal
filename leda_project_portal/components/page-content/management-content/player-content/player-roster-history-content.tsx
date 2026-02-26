"use client";

/**
 * PlayerRosterHistoryContent
 *
 * Shows every roster entry (season, team) a player has belonged to across
 * their LEDA membership career. Results are paginated client-side at
 * 10 rows per page using a Shadcn `Pagination` component.
 *
 * Quick-link icon buttons (tooltip-wrapped) let the user jump directly to
 * the scoresheet or stats views for teams in prior seasons.
 */

import { rosterRoute } from "@/lib/apiRoutes";
import { PlayerMemberInfo, PlayerRosterHistory } from "@/lib/definitions";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/skeleton";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, ClipboardList, BarChart } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PlayerRosterHistoryContent({
	playerData,
}: {
	playerData: PlayerMemberInfo;
}) {
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [totalPages, setTotalPages] = useState(1);

	const {
		data: rosterHistory = [],
		isLoading,
		error,
	} = useQuery<PlayerRosterHistory[]>({
		queryKey: ["playerRosterHistory", playerData.ledaId],
		queryFn: async () => {
			const response = await fetch(
				rosterRoute + `/rosterHistory?ledaId=${playerData.ledaId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!response.ok) {
				throw new Error("Failed to fetch data");
			}
			return await response.json();
		},
	});

	// Calculate total pages whenever roster history or page size changes
	useEffect(() => {
		setTotalPages(Math.max(1, Math.ceil(rosterHistory.length / pageSize)));
		// Reset to page 1 if current page is now invalid
		if (currentPage > Math.ceil(rosterHistory.length / pageSize)) {
			setCurrentPage(1);
		}
	}, [rosterHistory, pageSize, currentPage]);

	// Get current page data
	const getCurrentPageData = () => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return rosterHistory.slice(startIndex, endIndex);
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Generate pagination items
	const renderPaginationItems = () => {
		const items = [];

		// Always show first page
		items.push(
			<PaginationItem key="first">
				<PaginationLink
					onClick={() => handlePageChange(1)}
					isActive={currentPage === 1}
					className={
						currentPage === 1 ? "cursor-default" : "cursor-pointer"
					}
				>
					1
				</PaginationLink>
			</PaginationItem>
		);

		// Add ellipsis if needed
		if (currentPage > 3) {
			items.push(
				<PaginationItem key="ellipsis-1">
					<PaginationEllipsis />
				</PaginationItem>
			);
		}

		// Add pages around current page
		const startPage = Math.max(2, currentPage - 1);
		const endPage = Math.min(totalPages - 1, currentPage + 1);

		for (let i = startPage; i <= endPage; i++) {
			if (i !== 1 && i !== totalPages) {
				// Skip first and last page as they're always shown
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							onClick={() => handlePageChange(i)}
							isActive={currentPage === i}
							className={
								currentPage === i
									? "cursor-default"
									: "cursor-pointer"
							}
						>
							{i}
						</PaginationLink>
					</PaginationItem>
				);
			}
		}

		// Add ellipsis if needed
		if (currentPage < totalPages - 2) {
			items.push(
				<PaginationItem key="ellipsis-2">
					<PaginationEllipsis />
				</PaginationItem>
			);
		}

		// Always show last page if there's more than one page
		if (totalPages > 1) {
			items.push(
				<PaginationItem key="last">
					<PaginationLink
						onClick={() => handlePageChange(totalPages)}
						isActive={currentPage === totalPages}
						className={
							currentPage === totalPages
								? "cursor-default"
								: "cursor-pointer"
						}
					>
						{totalPages}
					</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
	};

	if (error) {
		return (
			<div className="p-4 text-red-500">
				Error: {(error as Error).message || "Failed to load roster history"}
			</div>
		);
	}

	return (
		<>
			<h2 className="text-2xl font-bold mb-4">Player Roster History</h2>
			{isLoading ? (
				<div>
					<Spinner />
				</div>
			) : rosterHistory.length > 0 ? (
				<div className="w-full">
					<div className="relative overflow-x-auto">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									<TableHead className="w-20">
										Season
									</TableHead>
									<TableHead className="w-40">
										Team Name
									</TableHead>
									<TableHead className="w-32">
										Division
									</TableHead>
									<TableHead className="w-32">
										Subdivision
									</TableHead>
									<TableHead className="w-24">
										Team Letter
									</TableHead>
									<TableHead className="w-20 text-right">
										Points
									</TableHead>
									<TableHead className="w-20 text-right">
										Place
									</TableHead>
									<TableHead className="w-28">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{getCurrentPageData().map((item, index) => (
									<TableRow
										key={`${item.seasonCode}-${index}`}
										className="group relative"
									>
										<TableCell className="font-medium">
											{item.seasonCode}
										</TableCell>
										<TableCell>{item.team_name}</TableCell>
										<TableCell>{item.division}</TableCell>
										<TableCell>
											{item.subdivision}
										</TableCell>
										<TableCell>
											{item.team_letter}
										</TableCell>
										<TableCell className="text-right">
											{item.totalPoints}
										</TableCell>
										<TableCell className="text-right">
											{item.place}
										</TableCell>
										<TableCell className="p-2">
											<div className="flex gap-2 justify-start">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button variant="outline"
																asChild
																size="icon"
																className="hover:bg-muted border-border text-foreground"
															>
																<Link
																	href={`/Portal/Management/Teams/${item.team_id}`}
																	prefetch
																	target="_blank"
																>
																	<Users className="h-4 w-4" />
																</Link>
															</Button>
														</TooltipTrigger>
															<TooltipContent className="bg-background text-foreground">
															<p>View Team</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>

												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button variant="outline"
																asChild
																size="icon"
																className="hover:bg-muted border-border text-foreground"
															>
																<Link
																	href={`/Portal/Activities/Rosters/${item.seasonCode}`}
																	prefetch
																	target="_blank"
																>
																	<ClipboardList className="h-4 w-4" />
																</Link>
															</Button>
														</TooltipTrigger>
															<TooltipContent className="bg-background text-foreground">
															<p>
																View Roster for{" "}
																{
																	item.seasonCode
																}
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>

												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button variant="outline"
																asChild
																size="icon"
																className="hover:bg-muted border-border text-foreground"
															>
																<Link
																	href={`/Portal/Activities/Weekly-Score/${item.seasonCode}`}
																	prefetch
																	target="_blank"
																>
																	<BarChart className="h-4 w-4" />
																</Link>
															</Button>
														</TooltipTrigger>
															<TooltipContent className="bg-background text-foreground">
															<p>
																View Weekly
																Scoresheet Data
																for{" "}
																{
																	item.seasonCode
																}
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<div className="flex items-center justify-between mt-4">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() =>
											currentPage > 1 &&
											handlePageChange(currentPage - 1)
										}
										className={
											currentPage === 1
												? "pointer-events-none opacity-50"
												: "cursor-pointer"
										}
									/>
								</PaginationItem>

								{renderPaginationItems()}

								<PaginationItem>
									<PaginationNext
										onClick={() =>
											currentPage < totalPages &&
											handlePageChange(currentPage + 1)
										}
										className={
											currentPage === totalPages
												? "pointer-events-none opacity-50"
												: "cursor-pointer"
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				</div>
			) : (
				<div className="text-center p-4 text-muted-foreground">
					No roster history found for this player
				</div>
			)}
		</>
	);
}