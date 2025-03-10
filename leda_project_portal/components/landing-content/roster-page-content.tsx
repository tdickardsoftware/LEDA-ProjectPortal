"use client";

import { useState, useCallback } from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import DivisionAddForm from "../forms/activities/division-add-form";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import TeamAddForm from "../forms/activities/team-add-form";
import { X } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "../ui/alert-dialog";
import { Separator } from "../ui/separator";
import { rosterRoute } from "@/lib/apiRoutes";

export default function RostersContent() {
    // State variables
    const [seasonCode, setSeasonCode] = useState<string | null>(null);
    const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [disabled, setDisabled] = useState<boolean>(true);
    const [divisionsData, setDivisionsData] = useState<{ [key: string]: { subdivisions: { [key: string]: { [key: string]: { teamId: string, placeId: string, teamName: string } } } } }>({});
    const [teamOpen, setTeamOpen] = useState<{ [key: string]: boolean }>({});
    const [open, setOpen] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState<string | null>(null);
    const [subdivisionToDelete, setSubdivisionToDelete] = useState<{ division: string, subdivision: string } | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<{ division: string, subdivision: string, team: string, teamId: string } | null>(null);
    const [divisionAlertOpen, setDivisionAlertOpen] = useState(false);
    const [subdivisionAlertOpen, setSubdivisionAlertOpen] = useState(false);
    const [teamAlertOpen, setTeamAlertOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [initialData, setInitialData] = useState<{ [key: string]: { subdivisions: { [key: string]: { [key: string]: { teamId: string, placeId: string, teamName: string } } } } }>({});
    const [update, setUpdate] = useState(false);

    
    // Add a utility function to check for changes
    const checkForChanges = useCallback((currentData: typeof divisionsData) => {
        try {
            // Compare the stringified versions of the objects to detect any changes
            const dataChanged = JSON.stringify(currentData) !== JSON.stringify(initialData);
            console.log("Change detected:", dataChanged);
            setHasChanges(dataChanged);
        } catch (error) {
            console.error("Error comparing data:", error);
        }
    }, [initialData]);

    // Handle season code selection
    const handleSeasonCodeSelect = useCallback(async (value: string) => {
        setSeasonCode(value);

        const result = await fetch(`${rosterRoute}?seasonCode=${value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (result.status === 200) {
            const data = await result.json();
            if (data) {
                const roster = data;
                // Update state with the fetched data
                const fetchedData = JSON.parse(JSON.stringify(roster.teamInfomation));
                setDivisionsData(fetchedData);
                setInitialData(fetchedData);
                setUpdate(true);
                setHasChanges(false); // Reset hasChanges when loading new data
            }
        } else {
            setInitialData({});
            setUpdate(false);
            setDivisionsData({});
            setHasChanges(false); // Reset hasChanges when clearing data
        }

        setDisabled(false);
    }, []);
    
    // Handle updating the roster to the database
    const handleUpdateRoster = useCallback(async () => {
        try {
            const response = await fetch(rosterRoute, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ seasonCode: seasonCode, teamInformation: divisionsData })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            setInitialData(JSON.parse(JSON.stringify(divisionsData)));
            setHasChanges(false); // Reset hasChanges after successful update
        } catch (error) {
            console.error("Failed to update roster:", error);
        }
    }, [divisionsData, seasonCode]);

    // Handle saving the roster to the database
    const handleSaveRoster = useCallback(async () => {
        try {
            const response = await fetch(rosterRoute, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ seasonCode: seasonCode, teamInformation: divisionsData })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            setInitialData(JSON.parse(JSON.stringify(divisionsData)));
            setUpdate(false);
            setHasChanges(false); // Reset hasChanges after successful save
        } catch (error) {
            console.error("Failed to save roster:", error);
        }
    }, [seasonCode, divisionsData]);

    // Handle division selection
    const handleSelectDivision = useCallback((value: string) => {
        setSelectedDivisions([...selectedDivisions, value]);
        const updatedDivisionsData = {
            ...divisionsData,
            [value]: { subdivisions: {} }
        };
        setDivisionsData(updatedDivisionsData);
        setHasChanges(true); // Explicitly set hasChanges to true
    }, [selectedDivisions, divisionsData]);

    // Handle adding a new subdivision
    const handleAddSubdivision = useCallback((division: string) => {
        const newSubdivision = `Subdivision ${Object.keys(divisionsData[division].subdivisions).length + 1}`;
        const updatedDivisionsData = {
            ...divisionsData,
            [division]: {
                subdivisions: {
                    ...divisionsData[division].subdivisions,
                    [newSubdivision]: {}
                }
            }
        };
        setDivisionsData(updatedDivisionsData);
        setHasChanges(true); // Explicitly set hasChanges to true
    }, [divisionsData]);

    // Handle team selection
    const handleTeamSelect = useCallback((teamId: string, placeId: string, teamName: string, division: string, subdivision: string) => {
        setSelectedTeams([...selectedTeams, teamId]);
        const teamLetter = String.fromCharCode(65 + Object.keys(divisionsData[division].subdivisions[subdivision]).length);
        const updatedDivisionsData = {
            ...divisionsData,
            [division]: {
                ...divisionsData[division],
                subdivisions: {
                    ...divisionsData[division].subdivisions,
                    [subdivision]: {
                        ...divisionsData[division].subdivisions[subdivision],
                        [teamLetter]: { teamId, placeId, teamName }
                    }
                }
            }
        };
        setDivisionsData(updatedDivisionsData);
        setHasChanges(true); // Explicitly set hasChanges to true
    }, [selectedTeams, divisionsData]);

    // Render add team dialog
    const handleAddTeam = useCallback((division: string, subdivision: string) => (
        <Dialog open={teamOpen[`${division}-${subdivision}`] || false} onOpenChange={(isOpen) => setTeamOpen({ ...teamOpen, [`${division}-${subdivision}`]: isOpen })}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={disabled}>Add Team</Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-full w-fit max-h-full h-fit overflow-auto">
                <DialogHeader>
                    <DialogTitle>Add Team</DialogTitle>
                </DialogHeader>
                <TeamAddForm selectedTeams={selectedTeams} handleSelectTeam={handleTeamSelect} setOpen={(isOpen) => setTeamOpen({ ...teamOpen, [`${division}-${subdivision}`]: isOpen })} division={division} subdivision={subdivision} />
            </DialogContent>
        </Dialog>
    ), [teamOpen, disabled, selectedTeams, handleTeamSelect]);

    // Render add division dialog
    const handleAddDivision = useCallback(() => (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={disabled}>Add Division</Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-full w-fit max-h-full h-fit overflow-auto">
                <DialogHeader>
                    <DialogTitle>Add Division</DialogTitle>
                </DialogHeader>
                <DivisionAddForm selectedDivisions={selectedDivisions} handleSelectDivision={handleSelectDivision} setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    ), [open, disabled, selectedDivisions, handleSelectDivision]);

    // Handle removing a division
    const handleRemoveDivision = useCallback((division: string) => {
        const updatedDivisions = { ...divisionsData };
        const teamsToRemove = Object.values(updatedDivisions[division].subdivisions).flatMap(subdivision => 
            Object.values(subdivision).map(team => team.teamId)
        );
        delete updatedDivisions[division];
        setDivisionsData(updatedDivisions);
        setSelectedDivisions(selectedDivisions.filter(div => div !== division));
        setSelectedTeams(selectedTeams.filter(teamId => !teamsToRemove.includes(teamId)));
        setHasChanges(true); // Explicitly set hasChanges to true
    }, [divisionsData, selectedDivisions, selectedTeams]);

    // Update subdivision names after removal
    const updateSubdivisionNames = useCallback((division: string) => {
        const updatedSubdivisions = { ...divisionsData[division].subdivisions };
        const newSubdivisions: { [key: string]: typeof updatedSubdivisions[keyof typeof updatedSubdivisions] } = {};
        let index = 1;

        Object.keys(updatedSubdivisions).forEach(subdivision => {
            newSubdivisions[`Subdivision ${index}`] = updatedSubdivisions[subdivision];
            index++;
        });

        const updatedDivisionsData = {
            ...divisionsData,
            [division]: {
                ...divisionsData[division],
                subdivisions: newSubdivisions
            }
        };
        
        setDivisionsData(updatedDivisionsData);
        setHasChanges(true); // Explicitly set hasChanges to true
    }, [divisionsData]);

    // Handle removing a subdivision
    const handleRemoveSubdivision = useCallback((division: string, subdivision: string) => {
        const updatedDivisions = { ...divisionsData };
        const teamsToRemove = Object.values(updatedDivisions[division].subdivisions[subdivision]).map(team => team.teamId);
        delete updatedDivisions[division].subdivisions[subdivision];
        setDivisionsData(updatedDivisions);
        updateSubdivisionNames(division);
        setSelectedTeams(selectedTeams.filter(teamId => !teamsToRemove.includes(teamId)));
        setHasChanges(true); // Explicitly set hasChanges to true
    }, [divisionsData, selectedTeams, updateSubdivisionNames]);

    // Handle removing a team
    const handleRemoveTeam = useCallback(async (division: string, subdivision: string, team: string, teamId: string) => {
        console.log("Before removal:", JSON.stringify(divisionsData) === JSON.stringify(initialData));
        const updatedDivisions = { ...divisionsData };
        delete updatedDivisions[division].subdivisions[subdivision][team];
        setDivisionsData(updatedDivisions);
        setSelectedTeams(selectedTeams.filter(t => t !== teamId));
        console.log("After removal:", JSON.stringify(updatedDivisions) === JSON.stringify(initialData));
        setHasChanges(true); // Explicitly set hasChanges to true
    }, [divisionsData, selectedTeams, initialData]);

    // Confirm removal of a division
    const confirmRemoveDivision = useCallback((division: string) => {
        setDivisionToDelete(division);
    }, []);

    // Confirm removal of a subdivision
    const confirmRemoveSubdivision = useCallback((division: string, subdivision: string) => {
        setSubdivisionToDelete({ division, subdivision });
    }, []);

    // Confirm removal of a team
    const confirmRemoveTeam = useCallback((division: string, subdivision: string, team: string, teamId: string) => {
        setTeamToDelete({ division, subdivision, team, teamId });
    }, []);

    // Handle confirmed removal of a division
    const handleConfirmRemoveDivision = useCallback(() => {
        if (divisionToDelete) {
            handleRemoveDivision(divisionToDelete);
            setDivisionToDelete(null);
        }
    }, [divisionToDelete, handleRemoveDivision]);

    // Handle confirmed removal of a subdivision
    const handleConfirmRemoveSubdivision = useCallback(() => {
        if (subdivisionToDelete) {
            handleRemoveSubdivision(subdivisionToDelete.division, subdivisionToDelete.subdivision);
            setSubdivisionToDelete(null);
        }
    }, [subdivisionToDelete, handleRemoveSubdivision]);

    // Handle confirmed removal of a team
    const handleConfirmRemoveTeam = useCallback(() => {
        if (teamToDelete) {
            handleRemoveTeam(teamToDelete.division, teamToDelete.subdivision, teamToDelete.team, teamToDelete.teamId);
            setTeamToDelete(null);
        }
    }, [teamToDelete, handleRemoveTeam]);

    // Remove the useEffect for change detection since we're explicitly setting hasChanges now
    // TODO - Add the ability to copy a roster from a previous season

    return (
        <div className="flex flex-col max-w-[65vw]">
            <div className="flex justify-between">
                <SeasonCodeSelector disabled={false} handleSelect={handleSeasonCodeSelect} setDisabled={setDisabled} />
                {handleAddDivision()}
            </div>
            {Object.keys(divisionsData).length > 0 && (
                <Accordion type="single" collapsible className="w-full mt-4" defaultValue="divisions">
                    {Object.keys(divisionsData).map((division, index) => (
                        <AccordionItem key={index} value={`divisions`}>
                            <div className="flex justify-between items-center">
                                <AccordionTrigger>{division}</AccordionTrigger>
                                <AlertDialog open={divisionAlertOpen} onOpenChange={setDivisionAlertOpen}>
                                    <AlertDialogTrigger asChild>
                                        <div onClick={() => { confirmRemoveDivision(division); setDivisionAlertOpen(true); }} className="cursor-pointer"><X className="text-red-500" /></div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white text-black">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                            <AlertDialogDescription>Are you sure you want to delete this division?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <Button onClick={() => setDivisionAlertOpen(false)}>Cancel</Button>
                                            <Button onClick={() => { handleConfirmRemoveDivision(); setDivisionAlertOpen(false); }} variant="destructive">Delete</Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <AccordionContent>
                                <div className="flex justify-end">
                                    <Button onClick={() => handleAddSubdivision(division)} variant={"outline"}>Add Subdivision</Button>
                                </div>
                                <Separator orientation="horizontal" className="my-2 bg-gray-300" />
                                <Accordion type="single" collapsible className="w-full mt-2" defaultValue="subdivisions">
                                    {Object.keys(divisionsData[division].subdivisions).map((subdivision, subIndex) => (
                                        <AccordionItem key={subIndex} value={`subdivisions`} className="border-b border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <AccordionTrigger>{subdivision}</AccordionTrigger>
                                                <AlertDialog open={subdivisionAlertOpen} onOpenChange={setSubdivisionAlertOpen}>
                                                    <AlertDialogTrigger asChild>
                                                        <div onClick={() => { confirmRemoveSubdivision(division, subdivision); setSubdivisionAlertOpen(true); }} className="cursor-pointer"><X className="text-red-500" /></div>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-white text-black">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                            <AlertDialogDescription>Are you sure you want to delete this subdivision?</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <Button onClick={() => setSubdivisionAlertOpen(false)}>Cancel</Button>
                                                            <Button onClick={() => { handleConfirmRemoveSubdivision(); setSubdivisionAlertOpen(false); }} variant="destructive">Delete</Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                            <AccordionContent>
                                                <div className="flex justify-end">
                                                    {handleAddTeam(division, subdivision)}
                                                </div>
                                                <ul>
                                                    {Object.keys(divisionsData[division].subdivisions[subdivision]).map((team, teamIndex) => (
                                                        <li key={teamIndex}>
                                                            <div className="flex justify-start items-center">
                                                                {team} - {divisionsData[division].subdivisions[subdivision][team].teamName}
                                                                <AlertDialog open={teamAlertOpen} onOpenChange={setTeamAlertOpen}>
                                                                    <AlertDialogTrigger asChild>
                                                                        <div onClick={() => { confirmRemoveTeam(division, subdivision, team, divisionsData[division].subdivisions[subdivision][team].teamId); setTeamAlertOpen(true); }} className="cursor-pointer"><X className="text-red-500" /></div>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent className="bg-white text-black">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                                            <AlertDialogDescription>Are you sure you want to delete this team?</AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <Button onClick={() => setTeamAlertOpen(false)}>Cancel</Button>
                                                                            <Button onClick={() => { handleConfirmRemoveTeam(); setTeamAlertOpen(false); }} variant="destructive">Delete</Button>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
            {!update && ( 
                <div className="flex justify-center">
                    <Button className="mt-4" variant="outline" disabled={!hasChanges} onClick={() => handleSaveRoster()}>Save Roster</Button>
                </div>
            )}
            {update && (
                <div className="flex justify-center">
                    <Button className="mt-4" variant="outline" disabled={!hasChanges} onClick={() => handleUpdateRoster()}>Update Roster</Button>
                    <Button className="mt-4" variant="outline" disabled={!hasChanges} onClick={() => {
                        setDivisionsData(JSON.parse(JSON.stringify(initialData)));
                        setHasChanges(false); // Reset hasChanges when reverting changes
                    }}>Reset Changes</Button>
                </div>
            )}
        </div>
    )
}