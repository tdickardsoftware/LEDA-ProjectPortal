"use client";

import { useState } from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import DivisionAddForm from "../forms/activities/division-add-form";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";

export default function RostersContent() {

    const [seasonCode, setSeasonCode] = useState<string | null>(null);
    const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    const handleSeasonCodeSelect = (value: string) => {
        console.log(value);
        setSeasonCode(value);
        console.log(seasonCode)
    }

    const handleSelectDivision = (value: string) => {
        setSelectedDivisions([...selectedDivisions, value]);
    }
    
    const handleAddDivision = () => {
        

        return (
            <>
                <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                    >
                        Add Division
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-full w-fit max-h-full h-fit overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Add Division</DialogTitle>
                    </DialogHeader>
                    {<DivisionAddForm selectedDivisions={selectedDivisions} handleSelectDivision={handleSelectDivision} setOpen={setOpen}/>}
                </DialogContent>
            </Dialog>
        </>
        )
    }
    // TODO - Add the ability to create a subdivision (Name them Subdivision 1, Subdivision 2, etc.)
    // TODO - Add the ability to add a team to a subdivision (Teams can only be added to one division and one subdivision within that division)
    // TODO - Add the ability to delete a division, subdivision, or team
    // TODO - Add the ability to copy a roster from a previous season (i.e. only select data that has a seasonCode present in the roster history table)
    // TODO - Add the ability to save the roster to the database once completed(i.e. seasonCode, and a json object of all of the divisions, subdivisions, and teams)
    // TODO - If a seasonCode is selected, load the roster from the database and display it in the UI
    return(
        <div className="flex flex-col max-w-[65vw]">
            <div className="flex justify-between">
                <SeasonCodeSelector disabled={false} handleSelect={handleSeasonCodeSelect} label="Select Season Code" />
                {handleAddDivision()}
            </div>
            <Accordion type="single" collapsible className="w-full mt-4">
                {selectedDivisions.map((division, index) => (
                    <AccordionItem key={index} value={`division-${index}`}>
                        <AccordionTrigger>{division}</AccordionTrigger>
                        <AccordionContent>
                            {/* Render subdivision and team management components here */}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}