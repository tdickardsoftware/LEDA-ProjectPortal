"use client";

import { MentionPlayerHistory, PlayerMemberInfo } from "@/lib/definitions";
import { mentionPlayerHistoryRoute } from "@/lib/apiRoutes";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function PlayerMentionsHistoryContent({
    playerData,
}: {
    playerData: PlayerMemberInfo;
}) {
    const [mentionsData, setMentionsData] = useState<MentionPlayerHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getTrailsData = async () => {
            const results = await fetch(
                `${mentionPlayerHistoryRoute}?ledaId=${playerData.ledaId}`,
                {
                    method: "GET",
                }
            );
            if (!results.ok) {
                throw new Error("Failed to fetch trails data");
            }
            const data = await results.json();
            return data;
        }
        
        const fetchTrailsData = async () => {
            try {
                setIsLoading(true);
                const data = await getTrailsData();
                setMentionsData(data);
                setError(null);
            } catch (err) {
                setError("Failed to load trails history data");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrailsData();
    }, [playerData.ledaId]);
    
    return (
        <div className="container mx-auto p-6">
            <div>
                <h1 className="text-4xl font-bold mb-4">Player Mentions History</h1>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold mb-6">
                        Player:  #{playerData.ledaId} - {playerData.fullName}
                    </h2>
                </div>
                
                {isLoading ? (
                    <p className="text-gray-500 italic">Loading trails history...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : mentionsData.length === 0 ? (
                    <p className="text-gray-500">No trails history found for this player.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Season Code</TableHead>
                                    <TableHead>Week Number</TableHead>
                                    <TableHead>Mention Code</TableHead>
                                    <TableHead>Mention Description</TableHead>
                                    <TableHead>Top Darter Points</TableHead>
                                    <TableHead>Number of Darts / Count</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Creation Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="max-h-[400px] overflow-y-auto">
                                {mentionsData.map((record, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{record.seasonCode}</TableCell>
                                        <TableCell>{record.weekNum}</TableCell>
                                        <TableCell>{record.mentionCode}</TableCell>
                                        <TableCell>{record.mentionDesc}</TableCell>
                                        <TableCell>{record.mentionPoints}</TableCell>
                                        <TableCell>{record.count}</TableCell>
                                        <TableCell>{record.notes}</TableCell>
                                        <TableCell>
                                            {record.creationDate ? new Date(record.creationDate).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}