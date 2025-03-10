"use client";

import { useState, useEffect } from "react";
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

    // Update hasChanges state when selectedDivisions, selectedTeams, or divisionsData change
    useEffect(() => {
        setHasChanges(
            selectedDivisions.length > 0 ||
            selectedTeams.length > 0 ||
            Object.keys(divisionsData).length > 0
        );
    }, [selectedDivisions, selectedTeams, divisionsData]);

    // Set initial season code when the component mounts
    useEffect(() => {
        const defaultSeasonCode = "defaultSeasonCode"; // Replace with the actual default value
        setSeasonCode(defaultSeasonCode);
        setDisabled(false);
    }, []);

    // Handle season code selection
    const handleSeasonCodeSelect = (value: string) => {
        setSeasonCode(value);
        setDisabled(false);
    }

    // Handle saving the roster to the database
    const handleSaveRoster = async () => {
        console.log(seasonCode)
        console.log("handleSaveRoster called"); // Add this line
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

            const result = await response.json();
            console.log("Save successful:", result); // Add this line
        } catch (error) {
            console.error("Failed to save roster:", error);
        }
    }

    // Handle division selection
    const handleSelectDivision = (value: string) => {
        setSelectedDivisions([...selectedDivisions, value]);
        setDivisionsData({
            ...divisionsData,
            [value]: { subdivisions: {} }
        });
    }

    // Handle adding a new subdivision
    const handleAddSubdivision = (division: string) => {
        const newSubdivision = `Subdivision ${Object.keys(divisionsData[division].subdivisions).length + 1}`;
        setDivisionsData({
            ...divisionsData,
            [division]: {
                subdivisions: {
                    ...divisionsData[division].subdivisions,
                    [newSubdivision]: {}
                }
            }
        });
    }

    // Handle team selection
    const handleTeamSelect = (teamId: string, placeId: string, teamName: string, division: string, subdivision: string) => {
        setSelectedTeams([...selectedTeams, teamId]);
        const teamLetter = String.fromCharCode(65 + Object.keys(divisionsData[division].subdivisions[subdivision]).length); // Convert index to letter (A, B, C, etc.)
        setDivisionsData({
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
        });
    }

    // Render add team dialog
    const handleAddTeam = (division: string, subdivision: string) => (
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
    )

    // Render add division dialog
    const handleAddDivision = () => (
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
    )

    // Handle removing a division
    const handleRemoveDivision = (division: string) => {
        const updatedDivisions = { ...divisionsData };
        const teamsToRemove = Object.values(updatedDivisions[division].subdivisions).flatMap(subdivision => Object.values(subdivision).map(team => team.teamId));
        delete updatedDivisions[division];
        setDivisionsData(updatedDivisions);
        setSelectedDivisions(selectedDivisions.filter(div => div !== division));
        setSelectedTeams(selectedTeams.filter(teamId => !teamsToRemove.includes(teamId)));
    }

    // Handle removing a subdivision
    const handleRemoveSubdivision = (division: string, subdivision: string) => {
        const updatedDivisions = { ...divisionsData };
        const teamsToRemove = Object.values(updatedDivisions[division].subdivisions[subdivision]).map(team => team.teamId);
        delete updatedDivisions[division].subdivisions[subdivision];
        setDivisionsData(updatedDivisions);
        updateSubdivisionNames(division);
        setSelectedTeams(selectedTeams.filter(teamId => !teamsToRemove.includes(teamId)));
    }

    // Handle removing a team
    const handleRemoveTeam = (division: string, subdivision: string, team: string, teamId: string) => {
        const updatedDivisions = { ...divisionsData };
        delete updatedDivisions[division].subdivisions[subdivision][team];
        setDivisionsData(updatedDivisions);
        setSelectedTeams(selectedTeams.filter(t => t !== teamId));
    }

    // Confirm removal of a division
    const confirmRemoveDivision = (division: string) => {
        setDivisionToDelete(division);
    }

    // Confirm removal of a subdivision
    const confirmRemoveSubdivision = (division: string, subdivision: string) => {
        setSubdivisionToDelete({ division, subdivision });
    }

    // Confirm removal of a team
    const confirmRemoveTeam = (division: string, subdivision: string, team: string, teamId: string) => {
        setTeamToDelete({ division, subdivision, team, teamId });
    }

    // Handle confirmed removal of a division
    const handleConfirmRemoveDivision = () => {
        if (divisionToDelete) {
            handleRemoveDivision(divisionToDelete);
            setDivisionToDelete(null);
        }
    }

    // Handle confirmed removal of a subdivision
    const handleConfirmRemoveSubdivision = () => {
        if (subdivisionToDelete) {
            handleRemoveSubdivision(subdivisionToDelete.division, subdivisionToDelete.subdivision);
            setSubdivisionToDelete(null);
        }
    }

    // Handle confirmed removal of a team
    const handleConfirmRemoveTeam = () => {
        if (teamToDelete) {
            handleRemoveTeam(teamToDelete.division, teamToDelete.subdivision, teamToDelete.team, teamToDelete.teamId);
            setTeamToDelete(null);
        }
    }

    // Update subdivision names after removal
    const updateSubdivisionNames = (division: string) => {
        const updatedSubdivisions = { ...divisionsData[division].subdivisions };
        const newSubdivisions: { [key: string]: typeof updatedSubdivisions[keyof typeof updatedSubdivisions] } = {};
        let index = 1;

        Object.keys(updatedSubdivisions).forEach(subdivision => {
            newSubdivisions[`Subdivision ${index}`] = updatedSubdivisions[subdivision];
            index++;
        });

        setDivisionsData({
            ...divisionsData,
            [division]: {
                ...divisionsData[division],
                subdivisions: newSubdivisions
            }
        });
    }

    // TODO - Add the ability to copy a roster from a previous season
    // TODO - Add the ability to save the roster to the database once completed
    // TODO - If a seasonCode is selected, load the roster from the database and display it in the UI

    return (
        <div className="flex flex-col max-w-[65vw]">
            <div className="flex justify-between">
                <SeasonCodeSelector disabled={false} handleSelect={handleSeasonCodeSelect} setDisabled={setDisabled} />
                {handleAddDivision()}
            </div>
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
            <div className="flex justify-center">
                <Button className="mt-4" variant="outline" disabled={!hasChanges} onClick={() => handleSaveRoster()}>Save Roster</Button>
            </div>
        </div>
    )
}