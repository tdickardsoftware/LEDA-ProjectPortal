"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type LeagueHistory = {
  seasonCode: string;
  ledaId: number;
  teamLabel: string;
  totalPoints: number;
};

export default function TeamLeagueHistory({ ledaId }: { ledaId: number }) {
  const [leagueHistory, setLeagueHistory] = useState<LeagueHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagueHistory = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/management/team/leagueHistory?ledaId=${ledaId}`);
        if (!res.ok) throw new Error("Failed to fetch league history");
        const data = await res.json();
        setLeagueHistory(data);
        setError(null);
      } catch (err) {
        setError("Failed to load league history data: " + err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeagueHistory();
  }, [ledaId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">Team League History</h1>
      {isLoading ? (
        <p className="text-gray-500 italic">Loading league history...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : leagueHistory.length === 0 ? (
        <p className="text-gray-500">No league history found for this team.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season Code</TableHead>
                <TableHead>Team Label</TableHead>
                <TableHead>Total Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagueHistory.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{entry.seasonCode}</TableCell>
                  <TableCell>{entry.teamLabel}</TableCell>
                  <TableCell>{entry.totalPoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
