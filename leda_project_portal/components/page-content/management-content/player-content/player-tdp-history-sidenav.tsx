"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TopDarterTotals } from "@/lib/definitions";

interface PlayerTDPHistorySidenavProps {
  tdpData: TopDarterTotals[];
  weeklyScoresData: {
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
  };
  onSeasonSelect: (seasonCode: string) => void;
  onTeamSelect?: (seasonCode: string, teamName: string) => void;
  onGameSelect?: (seasonCode: string, teamName: string, weekNum: string) => void;
}

const PlayerTDPHistorySidenav = ({
  tdpData,
  weeklyScoresData,
  onSeasonSelect,
  onTeamSelect,
  onGameSelect,
}: PlayerTDPHistorySidenavProps) => {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});
  const [openSeasons, setOpenSeasons] = useState<Record<string, boolean>>({});
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});

  // Set initial open state for the first year and season
  useEffect(() => {
    if (tdpData && tdpData.length > 0) {
      // Get the first year
      const firstYear = tdpData[0].seasonCode.split("-")[0];
      // Open the first year by default
      setOpenYears(prev => ({
        ...prev,
        [firstYear]: true
      }));
      
      // Set the first season as selected and open
      setSelectedSeason(tdpData[0].seasonCode);
      setOpenSeasons(prev => ({
        ...prev,
        [tdpData[0].seasonCode]: true
      }));
      
      // Call the onSeasonSelect prop
      onSeasonSelect(tdpData[0].seasonCode);
    }
  }, [tdpData, onSeasonSelect]);

  // Group data by year to create hierarchical navigation
  const groupedByYear: Record<string, TopDarterTotals[]> = {};
  
  tdpData.forEach((tdp) => {
    // Assuming seasonCode format like "20XX-YY"
    const year = tdp.seasonCode.split("-")[0];
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(tdp);
  });

  const handleSeasonSelect = (seasonCode: string) => {
    setSelectedSeason(seasonCode);
    setSelectedTeam(null);
    setSelectedGame(null);
    onSeasonSelect(seasonCode);
  };
  
  const handleTeamSelect = (seasonCode: string, teamName: string) => {
    setSelectedTeam(teamName);
    setSelectedGame(null);
    if (onTeamSelect) {
      onTeamSelect(seasonCode, teamName);
    }
    
    // Toggle team dropdown state
    setOpenTeams(prev => ({
      ...prev,
      [`${seasonCode}-${teamName}`]: !prev[`${seasonCode}-${teamName}`]
    }));
  };
  
  const handleGameSelect = (seasonCode: string, teamName: string, weekNum: string) => {
    setSelectedGame(weekNum);
    if (onGameSelect) {
      onGameSelect(seasonCode, teamName, weekNum);
    }
  };

  const toggleYear = (year: string) => {
    setOpenYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };
  
  const toggleSeason = (seasonCode: string) => {
    setOpenSeasons((prev) => ({
      ...prev,
      [seasonCode]: !prev[seasonCode],
    }));
  };
  
  const toggleTeam = (seasonCode: string, teamName: string) => {
    const key = `${seasonCode}-${teamName}`;
    setOpenTeams((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate the total points from the last week for a team
  const calculateTeamTotalPoints = (seasonCode: string, teamName: string) => {
    if (!weeklyScoresData[seasonCode] || 
        !weeklyScoresData[seasonCode][teamName] || 
        !weeklyScoresData[seasonCode][teamName].weekData ||
        Object.keys(weeklyScoresData[seasonCode][teamName].weekData).length === 0) {
      return 0;
    }

    const teamData = weeklyScoresData[seasonCode][teamName];
    // Find the highest week number
    const lastWeekNum = Math.max(...Object.keys(teamData.weekData).map(w => parseInt(w, 10)));
    
    // Return the total points from the last week
    return teamData.weekData[lastWeekNum]?.totalPoints || 0;
  };

  if (!tdpData || tdpData.length === 0) {
    return (
      <div className="w-64 border-r h-full flex items-center justify-center p-4">
        <p className="text-gray-500 text-center">
          No TDP history data available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-64">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          {/* Sort years in descending order (newest first) */}
          {Object.keys(groupedByYear)
            .sort((a, b) => b.localeCompare(a))
            .map((year) => (
              <Collapsible
                key={year}
                open={openYears[year]}
                onOpenChange={() => toggleYear(year)}
                className="border-b border-gray-100 pb-2"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between font-medium text-lg p-2 h-auto"
                  >
                    {year}
                    {openYears[year] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-1 space-y-1">
                  {groupedByYear[year].map((tdp) => (
                    <div key={tdp.seasonCode} className="mb-2">
                      <Collapsible
                        open={openSeasons[tdp.seasonCode]}
                        onOpenChange={() => toggleSeason(tdp.seasonCode)}
                      >
                        <div className="flex items-center">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-10 h-auto p-1"
                            >
                              {openSeasons[tdp.seasonCode] ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <Button
                            variant="ghost"
                            className={`flex-1 justify-start text-sm p-1 h-auto ${
                              selectedSeason === tdp.seasonCode && !selectedTeam ? "bg-gray-200" : ""
                            } hover:bg-gray-100`}
                            onClick={() => handleSeasonSelect(tdp.seasonCode)}
                          >
                            <span>{tdp.seasonCode}</span>
                          </Button>
                        </div>
                        
                        <CollapsibleContent className="ml-6 mt-1 space-y-1">
                          {/* Show teams for this season if they exist in weeklyScoresData */}
                          {weeklyScoresData[tdp.seasonCode] && Object.keys(weeklyScoresData[tdp.seasonCode]).map((teamName) => {
                            // Get team ID for display purposes if teamName looks like a placeholder
                            const teamData = weeklyScoresData[tdp.seasonCode][teamName];
                            const displayName = teamName.startsWith("Team ") && teamData ? 
                              `Team ID: ${teamData.teamId}` : teamName;
                            const teamKey = `${tdp.seasonCode}-${teamName}`;
                            const teamTotalPoints = calculateTeamTotalPoints(tdp.seasonCode, teamName);
                            
                            return (
                            <Collapsible
                                key={teamKey}
                                open={openTeams[teamKey]}
                                onOpenChange={() => toggleTeam(tdp.seasonCode, teamName)}
                                className="mb-1"
                            >
                                <div className="flex items-center">
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-8 h-auto p-0.5"
                                        >
                                            {openTeams[teamKey] ? (
                                                <ChevronDown className="h-3 w-3" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <Button
                                        variant="ghost"
                                        className={`flex-1 justify-between items-center text-sm p-1 h-auto ${
                                            selectedSeason === tdp.seasonCode && selectedTeam === teamName && !selectedGame
                                                ? "bg-gray-200 font-medium" 
                                                : ""
                                        } hover:bg-gray-100 rounded-md`}
                                        onClick={() => handleTeamSelect(tdp.seasonCode, teamName)}
                                    >
                                        <span className="truncate text-left">{displayName}</span>
                                        <span className="text-right text-xs ml-2 px-1.5 py-0.5 bg-gray-100 rounded font-medium text-gray-700">{teamTotalPoints} pts</span>
                                    </Button>
                                </div>
                                
                                <CollapsibleContent className="ml-6 mt-0.5 border-l-2 border-gray-100 pl-2 space-y-0.5">
                                    {teamData && teamData.weekData && 
                                        Object.entries(teamData.weekData)
                                            .sort(([weekA], [weekB]) => Number(weekA) - Number(weekB))
                                            .map(([weekNum, gameData]) => (
                                                <Button
                                                    key={`${teamKey}-${weekNum}`}
                                                    variant="ghost"
                                                    className={`w-full text-xs justify-between p-1.5 h-auto ${
                                                        selectedSeason === tdp.seasonCode && 
                                                        selectedTeam === teamName &&
                                                        selectedGame === weekNum
                                                            ? "bg-gray-300 text-gray-800 font-medium" 
                                                            : "text-gray-600"
                                                    } hover:bg-gray-200 rounded`}
                                                    onClick={() => handleGameSelect(tdp.seasonCode, teamName, weekNum)}
                                                >
                                                    <span className="truncate text-left">{gameData.gameName || `Week ${weekNum}`}</span>
                                                    <span className={`ml-1 ${gameData.changeBy > 0 ? 'text-green-600' : gameData.changeBy < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                                        {gameData.changeBy > 0 ? '+' : ''}{gameData.changeBy} pts
                                                    </span>
                                                </Button>
                                            ))
                                    }
                                </CollapsibleContent>
                            </Collapsible>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlayerTDPHistorySidenav;
