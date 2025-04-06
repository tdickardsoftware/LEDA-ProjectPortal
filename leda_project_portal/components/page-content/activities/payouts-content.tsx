"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import React, { useState, useCallback, useEffect } from "react";
import { rosterRoute, seasonRoute, weeklyScoresheetsRoute } from "@/lib/apiRoutes";
import { Spinner } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define types for roster data structure
type TeamInfo = {
    teamId: string;
    placeId: string;
    teamName: string;
};

type SubdivisionData = {
    [key: string]: TeamInfo;
};

type DivisionData = {
    subdivisions: {
        [key: string]: SubdivisionData;
    };
};

type RosterData = {
    [key: string]: DivisionData;
};

export default function PayoutsContent() {
    const [seasonCode, setSeasonCode] = useState<string | null>(null);
    const [currentSeason, setCurrentSeason] = useState(true);
    const [divisionsData, setDivisionsData] = useState<RosterData>({});
    const [loading, setLoading] = useState(false);
    const [weekCount , setWeekCount] = useState<number>(0);
    const [completedScoresheetCount, setCompletedScoresheetCount] = useState<number>(0);
    
    // State for accordion open/closed status
    const [openDivisions, setOpenDivisions] = useState<string[]>([]);
    const [openSubdivisions, setOpenSubdivisions] = useState<string[]>([]);
    const [openTeams, setOpenTeams] = useState<string[]>([]);

    // Initialize all accordions as open when data changes
    useEffect(() => {
        if (Object.keys(divisionsData).length > 0) {
            // Set all divisions as open
            setOpenDivisions(Object.keys(divisionsData).map(div => `div-${div}`));
            
            // Collect all subdivision IDs
            const subDivIds: string[] = [];
            
            Object.keys(divisionsData).forEach(division => {
                Object.keys(divisionsData[division]?.subdivisions || {}).forEach(subdivision => {
                    subDivIds.push(`subdiv-${division}-${subdivision}`);
                    
                    // Not collecting team IDs as we want them closed by default
                });
            });
            
            setOpenSubdivisions(subDivIds);
            // Initialize teams as closed - empty array
            setOpenTeams([]);
        }
    }, [divisionsData]);


    // Handle season code selection
    const handleSeasonCodeSelect = useCallback(
        async (value: string) => {
            if (value === seasonCode) return;
            setSeasonCode(value);

            try {
                setLoading(true);
                const result = await fetch(
                    `${rosterRoute}?seasonCode=${value}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (result.status === 200) {
                    const data = await result.json();
                    if (data) {
                        const roster = data;
                        // Update state with the fetched data
                        const fetchedData = JSON.parse(
                            JSON.stringify(roster.teamInfomation)
                        );
                        setDivisionsData(fetchedData);
                    }

                    const weeksResult = await fetch(`${seasonRoute}?seasonCode=${value}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    
                    if (weeksResult.status === 200) {
                        const weeksData = await weeksResult.json();
                        if (weeksData) {
                            setWeekCount(Object.keys(weeksData.dates).length)
                        }

                        const completedScoresheetCountResult = await fetch(`${weeklyScoresheetsRoute}?seasonCode=${value}&countOfFinishedWeeks=${true}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });

                        if (completedScoresheetCountResult.status === 200) {
                            const completedScoresheetData = await completedScoresheetCountResult.json();
                            if (completedScoresheetData){
                                setCompletedScoresheetCount(completedScoresheetData.count)
                            }
                        }
                        
                    }

                } else {
                    setDivisionsData({});
                    toast.error("No roster data found for this season");
                }
            } catch (error) {
                console.error("Failed to fetch roster data:", error);
                toast.error("Failed to load roster data");
            } finally {
                setLoading(false);
            }
        },
        [seasonCode]
    );

    return (
        <div className="flex flex-col max-w-[65vw]">
            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="flex flex-col mb-4 gap-2">
                        <div className="flex justify-end flex-col items-end gap-2">
                            {weekCount > 0 && (
                                <>
                                    <div className="text-sm font-medium">
                                        Scoresheets Progress: {completedScoresheetCount}/{weekCount} weeks
                                    </div>
                                    <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ 
                                                width: `${(completedScoresheetCount / weekCount) * 100}%`,
                                                minWidth: completedScoresheetCount > 0 ? '5%' : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <SeasonCodeSelector
                                    disabled={currentSeason}
                                    handleSelect={handleSeasonCodeSelect}
                                    useCurrentSeason={currentSeason}
                                    seasonCode={seasonCode || ""}
                                />
                                <div className="flex items-center gap-4">
                                    <Label>Current Season?</Label>
                                    <Checkbox
                                        checked={currentSeason}
                                        onCheckedChange={() =>
                                            setCurrentSeason(!currentSeason)
                                        }
                                    />
                                </div>
                            </div>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <div className="inline-block">
                                            <Button 
                                                variant="outline" 
                                                className="hover:bg-gray-100 border-gray-300 text-gray-700"
                                                onClick={() => {}}
                                                disabled={completedScoresheetCount !== weekCount}
                                            >
                                                <span className="font-semibold">Calculate Payouts</span>
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent 
                                        side="top" 
                                        className="bg-white text-black px-4 py-3 rounded-lg shadow-lg border-0"
                                    >
                                        <p className="text-sm font-medium">
                                            {completedScoresheetCount !== weekCount
                                                ? "Scoresheets are not yet complete"
                                                : "All scoresheets are complete, calculate placements"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Divisions Accordion */}
                    {Object.keys(divisionsData).length > 0 &&
                        Object.keys(divisionsData).map((division, index) => (
                            <Accordion
                                key={index}
                                type="multiple"
                                value={openDivisions}
                                onValueChange={setOpenDivisions}
                                className="w-full mt-4"
                            >
                                <AccordionItem value={`div-${division}`}>
                                    <AccordionTrigger>
                                        {division}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {/* Subdivisions Accordion */}
                                        <Accordion
                                            type="multiple"
                                            value={openSubdivisions}
                                            onValueChange={setOpenSubdivisions}
                                            className="w-full mt-2"
                                        >
                                            {Object.keys(
                                                divisionsData[division]
                                                    ?.subdivisions || {}
                                            ).map((subdivision, subIndex) => (
                                                <AccordionItem
                                                    key={subIndex}
                                                    value={`subdiv-${division}-${subdivision}`}
                                                    className="border-b border-gray-200"
                                                >
                                                    <AccordionTrigger>
                                                        {subdivision}
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        {/* Teams Accordion */}
                                                        <Accordion
                                                            type="multiple"
                                                            value={openTeams}
                                                            onValueChange={setOpenTeams}
                                                            className="w-full"
                                                        >
                                                            {Object.keys(
                                                                divisionsData[division]
                                                                    ?.subdivisions[subdivision] || {}
                                                            ).map((team, teamIndex) => (
                                                                <AccordionItem 
                                                                    key={teamIndex}
                                                                    value={`team-${division}-${subdivision}-${team}`}
                                                                    className="border-b border-gray-200"
                                                                >
                                                                    <AccordionTrigger>
                                                                        <div className="flex justify-start items-center">
                                                                            {team}{" "}
                                                                            -{" "}
                                                                            {
                                                                                divisionsData[division]
                                                                                    ?.subdivisions[subdivision][team]
                                                                                    ?.teamName
                                                                            }
                                                                        </div>
                                                                    </AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <p className="text-gray-500 italic">
                                                                            No adjustments found...
                                                                        </p>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            ))}
                                                        </Accordion>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                </>
            )}
        </div>
    );
}