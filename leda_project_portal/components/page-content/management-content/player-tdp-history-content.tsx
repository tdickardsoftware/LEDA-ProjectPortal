'use client';

import { weeklyScoresheetsRoute } from "@/lib/apiRoutes";
import { PlayerMemberInfo, TopDarterTotals, WeeklyTopDarterScores } from "@/lib/definitions";
import { useCallback, useEffect, useState } from "react";
import PlayerTDPHistorySidenav from "./player-tdp-history-sidenav";

export default function PlayerTDPHistoryContent( {
    playerData,
}: {
    playerData: PlayerMemberInfo;
}) {
    const [TDPSeasonCodeData, setTDPSeasonCodeData] = useState<TopDarterTotals[]>([]);
    const [TDPWeeklyScoresData, setTDPWeeklyScoresData] = useState<{
        [seasonCode: string]: {
            [teamName: string]: {
                teamId: number;
                weekData: {
                    [weekNum: number]: {
                        totalPoints: number;
                        gameName: string;
                        changeBy: number;
                        prevTotalPoints: number;
                        teamLedaId: number;
                    }
                }
            }
        }
    }>({});
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    
    const getTDPSeasonCodeData = useCallback(async () => {
        const results = await fetch(weeklyScoresheetsRoute +'/playerPoints?viewPlayerTopDarterPoints=true&ledaId=' + playerData.ledaId, {
            method: "GET"
        });
        if (!results.ok) {
            throw new Error("Failed to fetch TDP data");
        }
        const data = await results.json();
        return data;
    }, [playerData.ledaId]); 
    

    const getTDPWeeklyScoresData = useCallback(async (seasonCode: string) => {
        const results = await fetch(weeklyScoresheetsRoute + '/playerPoints?getSeasonWeekPoints=true&seasonCode=' + seasonCode + '&ledaId=' + playerData.ledaId, {
            method: "GET"
        });
        if (!results.ok) {
            throw new Error("Failed to fetch TDP data");
        }
        const data = await results.json();

        // Log the raw API response to verify `changeBy`
        console.log("Weekly scores API response:", data);

        return data;
    }, [playerData.ledaId]);

    useEffect(() => {
        const fetchTDPSeasonCodeData = async () => {
            try {
                const data = await getTDPSeasonCodeData();
                setTDPSeasonCodeData(data);

                // Only set selectedSeason on initial load if it's not already set
                if (data.length > 0 && !selectedSeason) {
                    setSelectedSeason(data[0].seasonCode);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchTDPSeasonCodeData();
    }, [getTDPSeasonCodeData, selectedSeason]);

    useEffect(() => {
        if (!selectedSeason) return; // Ensure a season is selected before fetching weekly scores

        const fetchTDPWeeklyScoresData = async () => {
            try {
                const structuredData: {
                    [seasonCode: string]: {
                        [teamName: string]: {
                            teamId: number;
                            weekData: {
                                [weekNum: number]: {
                                    totalPoints: number;
                                    gameName: string;
                                    changeBy: number;
                                    prevTotalPoints: number;
                                    teamLedaId: number;
                                }
                            }
                        }
                    }
                } = {};
                for (const seasonData of TDPSeasonCodeData) {
                    const seasonCode = seasonData.seasonCode;
                    if (!structuredData[seasonCode]) {
                        structuredData[seasonCode] = {};
                    }

                    const weeklyData = await getTDPWeeklyScoresData(seasonCode);

                    // Log the weekly data to verify `changeBy`
                    console.log(`Weekly data for season ${seasonCode}:`, weeklyData);

                    weeklyData.forEach((weeklyScore: WeeklyTopDarterScores) => {
                        const { teamName: rawTeamName, teamLedaId, weekNum, totalPoints, gameName, changeBy, prevTotalPoints } = weeklyScore;
                        const teamName = rawTeamName && rawTeamName !== "undefined" 
                            ? rawTeamName 
                            : `Team ${teamLedaId || "Unknown"}`;

                        if (!structuredData[seasonCode][teamName]) {
                            structuredData[seasonCode][teamName] = {
                                teamId: teamLedaId,
                                weekData: {}
                            };
                        }

                        structuredData[seasonCode][teamName].weekData[weekNum] = {
                            totalPoints,
                            gameName: gameName || `Game ${weekNum}`,
                            changeBy, // Ensure `changeBy` is mapped correctly
                            prevTotalPoints,
                            teamLedaId
                        };
                    });
                }

                console.log("Structured data:", structuredData);
                setTDPWeeklyScoresData(structuredData);
            } catch (err) {
                console.error("Failed to fetch weekly scores:", err);
                setTDPWeeklyScoresData({});
            }
        };

        fetchTDPWeeklyScoresData();
    }, [selectedSeason, getTDPWeeklyScoresData, TDPSeasonCodeData]);

    // Handle team selection
    const handleTeamSelect = (seasonCode: string, teamName: string) => {
        setSelectedSeason(seasonCode);
        setSelectedTeam(teamName);
        setSelectedGame(null); // Reset game selection when team changes
    };
    
    // Handle game selection
    const handleGameSelect = (seasonCode: string, teamName: string, weekNum: string) => {
        setSelectedSeason(seasonCode);
        setSelectedTeam(teamName);
        setSelectedGame(weekNum);
    };

    // Get the details of the selected season
    const selectedSeasonData = selectedSeason 
        ? TDPSeasonCodeData.find(tdp => tdp.seasonCode === selectedSeason) 
        : null;
    
    // Get the selected team data if available
    const selectedTeamData = selectedSeason && selectedTeam && TDPWeeklyScoresData[selectedSeason]
        ? TDPWeeklyScoresData[selectedSeason][selectedTeam]
        : null;
        
    // Get the selected game data if available
    const selectedGameData = selectedTeamData && selectedGame
        ? selectedTeamData.weekData[parseInt(selectedGame, 10)]
        : null;

    // Calculate the total points from the last week for the selected team
    const calculateTeamTotalPoints = (teamData: typeof selectedTeamData) => {
        if (!teamData || !teamData.weekData || Object.keys(teamData.weekData).length === 0) {
            return 0;
        }

        // Find the highest week number
        const lastWeekNum = Math.max(...Object.keys(teamData.weekData).map(w => parseInt(w, 10)));
        
        // Return the total points from the last week
        return teamData.weekData[lastWeekNum]?.totalPoints || 0;
    };

    const teamTotalPoints = selectedTeamData ? calculateTeamTotalPoints(selectedTeamData) : 0;

    return (
        <div className="flex h-full flex-col">
            {/* Sidenav Component */}
            <div className="flex flex-1 p-6">
                {/* Sidenav */}
                <div className="mr-8">
                    <PlayerTDPHistorySidenav 
                        tdpData={TDPSeasonCodeData}
                        weeklyScoresData={TDPWeeklyScoresData}
                        onSeasonSelect={setSelectedSeason}
                        onTeamSelect={handleTeamSelect}
                        onGameSelect={handleGameSelect}
                    />
                </div>
                {/* Main content area */}
                <div className="flex-1">
                    {selectedSeasonData && !selectedTeam ? (
                        <div className="p-6 border rounded-lg shadow-sm bg-white">
                            <h2 className="text-2xl font-semibold mb-4">Season: {selectedSeasonData.seasonCode}</h2>
                            {/* Add more details about the selected season here as needed */}
                        </div>
                    ) : selectedTeamData && !selectedGame ? (
                        <div className="p-6 border rounded-lg shadow-sm bg-white">
                            <h2 className="text-2xl font-semibold mb-4">
                                {selectedTeam} - {teamTotalPoints} pts
                            </h2>
                            <p className="text-gray-600">
                                Select a game from the sidebar to view detailed information.
                            </p>
                        </div>
                    ) : selectedGameData ? (
                        <div className="p-6 border rounded-lg shadow-sm bg-white">
                            <h2 className="text-2xl font-semibold mb-4">
                                {selectedTeam} - {selectedGameData.gameName}
                            </h2>
                            <div className="mt-4">
                                <div className="flex justify-between items-center p-4 border rounded-md bg-gray-50">
                                    <div>
                                        <h4 className="text-lg font-medium">{selectedGameData.gameName}</h4>
                                        <p className="text-gray-600">Season: {selectedSeason}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-bold ${selectedGameData.changeBy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedGameData.changeBy >= 0 ? '+' : ''}{selectedGameData.changeBy} pts
                                        </span>
                                        <p className="text-sm text-gray-600">
                                            Total: {selectedGameData.totalPoints} (Previous: {selectedGameData.prevTotalPoints})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Select a season, team, or game to view details</p>
                    )}
                </div>
            </div>
        </div>
    );
}