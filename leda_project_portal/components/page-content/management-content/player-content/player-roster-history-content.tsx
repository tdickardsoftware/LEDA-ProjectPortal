"use client";

import { rosterRoute } from "@/lib/apiRoutes";
import { PlayerMemberInfo, PlayerRosterHistory } from "@/lib/definitions";
import { useCallback, useEffect, useState } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function PlayerRosterHistoryContent({
    playerData,
}: {
    playerData: PlayerMemberInfo;
}) {
    const [rosterHistory, setRosterHistory] = useState<PlayerRosterHistory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const getPlayerRosterHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(rosterRoute + `/rosterHistory?ledaId=${playerData.ledaId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            setRosterHistory(data);
            return data;
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [playerData.ledaId]);

    useEffect(() => {
        getPlayerRosterHistory();
    }, [getPlayerRosterHistory]);
    
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
                    className={currentPage === 1 ? "cursor-default" : "cursor-pointer"}
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
            if (i !== 1 && i !== totalPages) {  // Skip first and last page as they're always shown
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink 
                            onClick={() => handlePageChange(i)} 
                            isActive={currentPage === i}
                            className={currentPage === i ? "cursor-default" : "cursor-pointer"}
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
                        className={currentPage === totalPages ? "cursor-default" : "cursor-pointer"}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        
        return items;
    };

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-4">Player Roster History</h2>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : rosterHistory.length > 0 ? (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Season</TableHead>
                                <TableHead>Team Name</TableHead>
                                <TableHead>Division</TableHead>
                                <TableHead>Subdivision</TableHead>
                                <TableHead>Team Letter</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                                <TableHead className="text-right">Place</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {getCurrentPageData().map((item, index) => (
                                <TableRow key={`${item.seasonCode}-${index}`}>
                                    <TableCell className="font-medium">{item.seasonCode}</TableCell>
                                    <TableCell>{item.team_name}</TableCell>
                                    <TableCell>{item.division}</TableCell>
                                    <TableCell>{item.subdivision}</TableCell>
                                    <TableCell>{item.team_letter}</TableCell>
                                    <TableCell className="text-right">{item.totalPoints}</TableCell>
                                    <TableCell className="text-right">{item.place}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    <div className="flex items-center justify-between mt-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                                    />
                                </PaginationItem>
                                
                                {renderPaginationItems()}
                                
                                <PaginationItem>
                                    <PaginationNext 
                                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </>
            ) : (
                <div className="text-center p-4 text-gray-500">
                    No roster history found for this player
                </div>
            )}
        </>
    );
}