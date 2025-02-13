"use client"

import { DataTable } from "../datatable"
import { columns } from "@/schemas/activities/trails_dates"
import { fetchTrailsDateData, fetchTrailsDates } from "@/lib/getData"
import { trailsDateRoute } from "@/lib/apiRoutes"
import { format } from "date-fns"

import { useEffect, useState } from "react";
import { TrailsDate, TrailsDateData } from "@/lib/definitions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Pencil } from "lucide-react"
import { Button } from "../ui/button"
import TrailsDateEditForm from "../forms/activities/trails-date-edit-form"

export default function TrainsPageContent() {
    const [data, setData] = useState<TrailsDate[]>([]);
    const [trailsDate, setTrailsDate] = useState<string | null>(null);
    const [trailsDateData, setTrailsDateData] = useState<TrailsDateData[]>([]); // Ensure this is an array
    const [editStates, setEditStates] = useState<{ [key: string]: boolean }>({});

    const handleSetTrailsDate = async (value: string) => {
        const parsedValue = JSON.parse(value)[0];
        if (!parsedValue) {
            if (trailsDate !== null) {
                setTrailsDate(null); // Set to null if no row is selected
                setTrailsDateData([]); // Clear trailsDateData if no row is selected
            }
            return;
        }
        if (parsedValue.trailsDate !== trailsDate) {
            setTrailsDate(parsedValue.trailsDate);
            const fetchData = await fetchTrailsDateData(parsedValue.trailsDate);
            setTrailsDateData(fetchData);
        }
    }
    const handleRefresh = async (index:string) => {
        if (trailsDate) {
            const fetchData = await fetchTrailsDateData(trailsDate);
            setTrailsDateData(fetchData);
        }
        handleEditToggle(index);
    }
    const handleEditToggle = (index: string) => {
        setEditStates(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    useEffect(() => {
        async function fetchData() {
            const result = await fetchTrailsDates();
            const formattedResult = result.map(item => ({
                ...item,
                trailsDate: format(new Date(item.trailsDate), "MM-dd-yyyy")
            }));
            setData(formattedResult);
        }
        fetchData();
    }, []);
    // TODO Render each row as ledaId - fullName
    // TODO then have it render as a accordian and inside there is more information (notes, points, singles place, doublesplace)
    // TODO have a button to collapse all accordians and expand all accordians
    return(
        <div className="flex gap-20">
            
            <DataTable columns={columns} data={data} pageName="Prior Trails Dates" apiEndpoint={trailsDateRoute} singleRowSelection={true} passValueToParent={handleSetTrailsDate}/>

            <Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px] max-h-[80vh] overflow-y-auto">
                {trailsDate && (
                    <>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Data for a Selected Trails Date</CardTitle>
                            <h1 className="font-semibold">{trailsDate}</h1>
                        </CardHeader>
                        <CardContent>
                            {trailsDateData.length != 0 && (
                                <div className="flex flex-col gap-2">
                                    {trailsDateData.map((item, index) => (
                                        <Accordion type="single" collapsible key={index}>
                                            <AccordionItem value={index.toString()}>
                                                <AccordionTrigger>
                                                    <div className="flex justify-between w-full">
                                                        <span>
                                                            {item.ledaId} - {item.fullName}
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="flex justify-between">
                                                        {!editStates[index.toString()] && (
                                                            <div className="flex flex-col gap-2">
                                                                {item.notes && <p>Notes: {item.notes}</p>}
                                                                <p>Trails Points: {item.trailsPoints}</p>
                                                                <p>Singles Place: {item.singlesPlace}</p>
                                                                <p>Doubles Place: {item.doublesPlace}</p>
                                                            </div>
                                                        )}
                                                        {editStates[index.toString()] && (
                                                            <TrailsDateEditForm rowData={item} handleRefresh={() => handleRefresh(index.toString())} index={index.toString()}/>
                                                        )}
                                                        <div>
                                                            <Button variant={"ghost"} size="icon" onClick={() => handleEditToggle(index.toString())}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </>
                )}
                {!trailsDate && (
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Add a Trails Date</CardTitle>
                    </CardHeader>
                )}
            </Card>
        </div>
    )
}