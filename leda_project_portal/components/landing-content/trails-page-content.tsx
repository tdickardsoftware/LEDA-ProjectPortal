// Use Client
"use client"
// Imports
import { DataTable } from "@/components/datatable"
import { columns } from "@/schemas/activities/trails_dates"
import { fetchTrailsDateData, fetchTrailsDates } from "@/lib/getData"
import { trailsDateRoute } from "@/lib/apiRoutes"
import { format } from "date-fns"
import { useEffect, useState } from "react";
import { TrailsDate, TrailsDateData } from "@/lib/definitions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import TrailsDateEditForm from "@/components/forms/activities/trails-date-edit-form"
import { Spinner } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TrailsDateAddForm from "@/components/forms/activities/trails-date-add-form"
import { Separator } from "@/components/ui/separator"
//
// Component export
//
export default function TrainsPageContent() {
    //
    // States
    //
    // set trails date data (i.e. all of the trails dates in the table)
    const [data, setData] = useState<TrailsDate[]>([]);
    // Set the selected trails dates
    const [trailsDate, setTrailsDate] = useState<string | null>("");
    // Set the data pertaining to that trails date
    const [trailsDateData, setTrailsDateData] = useState<TrailsDateData[]>([]);
    // Boolean to determine if you are editing the data
    const [editStates, setEditStates] = useState<{ [key: string]: boolean }>({});
    // Boolean to determine if you need to load
    const [loadingTrailsDateData, setLoadingTrailsDateData] = useState<boolean>(false);
    // Boolean to determine if you are adding a player
    const [addPlayer, setAddPlayer] = useState<boolean>(false);
    // The trails date for when you are adding an entry
    const [addTrailsDate, setAddTrailsDate] = useState<string | null>("");
    //
    // Function Name: handleAddPlayer
    // Description: this function handles adding a player to a trails date (DOES NOT ADD TO DB)
    //
    const handleAddPlayer = (values: TrailsDateData) => {
        setAddPlayer(false);
        setTrailsDateData(prevData => [...prevData, values]);
        console.log(trailsDateData)
        console.log(values);
    }
    //
    //
    //
    const handleEditAddPlayer = (values: TrailsDateData, index?: number) => {
        setTrailsDateData(prevData => {
            if (index !== undefined) {
                handleEditToggle(index.toString());
            }
            const updatedData = [...prevData];
            if (index !== undefined) {
            updatedData[index] = values;
            } else {
            updatedData.push(values);
            }
            return updatedData;
        });
    }
    //
    // Function Name: goBack
    // Description: this function handles displaying the add/edit form for a player
    //
    const goBack= (value: boolean) => {
        setAddPlayer(value);
    }
    //
    // Function Name: handleDateSelect
    // Description: this function handles selecting a date for the trails date
    //
    const handleDateSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = new Date(new Date(event.target.value).toLocaleString("en-US", { timeZone: "America/New_York" }));
        console.log(selectedDate);
        const formattedDate = format(selectedDate, "MM-dd-yyyy");
        setAddTrailsDate(formattedDate);
    }
    //
    // Function Name: handleSetTrailsDate
    // Description: this function handles setting the trails date and loading the data for that date
    //
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
            setTrailsDateData([]); // Clear trailsDateData when a new row is selected
            setLoadingTrailsDateData(true);
            const fetchData = await fetchTrailsDateData(parsedValue.trailsDate);
            setLoadingTrailsDateData(false);
            setTrailsDateData(fetchData);
        }
    }
    //
    // Function Name: handleRefresh
    // Description: this function handles refreshing the data for a selected trails date
    //
    const handleRefresh = async (index:string) => {
        if (trailsDate) {
            const fetchData = await fetchTrailsDateData(trailsDate);
            setTrailsDateData(fetchData);
        }
        handleEditToggle(index);
    }
    //
    // Function Name: handleEditToggle
    // Description: this function handles toggling the edit state for a selected row
    //
    const handleEditToggle = (index: string) => {
        setEditStates(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };
    //
    //Function name: handleAddDelete
    // Description: this function handles deleting a player from the trails date data locally, before it is saved to the database
    //
    const handleAddDelete = (index: number) => {
        const updatedTrailsDateData = [...trailsDateData];
        updatedTrailsDateData.splice(index, 1);
        setTrailsDateData(updatedTrailsDateData);
    }
    //
    // UseEffect
    // Description: this useEffect fetches the data for the trails dates
    //
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
    // TODO
    // [X] * - Add the ability to add a new trails date, this will be the default.
    // [-] * - Implement the logic to handle trails points history, i.e. when a record is added, add a points history to the audit table, if a record is updated update the audit record for later calculation
    // [-] * - Implement the ability to remove a player/trails date and update the audit table accordingly
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
                            {loadingTrailsDateData && (<Spinner />)}
                            {(trailsDateData.length != 0 && !loadingTrailsDateData)&& (
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
                    <>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Add a Trails Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label>Trails Date</Label>
                            <Input type="date" onChange={handleDateSelect} defaultValue={format(new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })), "yyyy-MM-dd")}/>
                            {!addPlayer && (
                                <div className="flex justify-end pt-4">
                                    <Button variant={"outline"} onClick={() => setAddPlayer(!addPlayer)}>Add Player</Button>
                                </div>
                            )}
                            {addPlayer && (
                                <>
                                    <TrailsDateAddForm handleFormSubmit={handleAddPlayer} trailsDate={addTrailsDate} goBack={goBack} trailsDateData={trailsDateData}/>
                                </>
                            )}
                            <Separator orientation="horizontal" className="my-2 bg-gray-300"/>
                            {trailsDateData.length != 0 && (
                                <div className="flex flex-col gap-2">
                                    {trailsDateData.map((item, index) => (
                                        <Accordion type="single" collapsible key={index}>
                                            <AccordionItem value={index.toString()}>
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-left">
                                                        {item.ledaId} - {item.fullName}
                                                    </span>
                                                    <div className="flex items-center">
                                                        <AccordionTrigger />
                                                        <Button variant={"ghost"} size="icon" onClick={() => handleAddDelete(index)}>
                                                            <X className="text-red-500"/>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <AccordionContent>
                                                    <div className="flex justify-between">
                                                        {!editStates[index.toString()] && (
                                                        <div>
                                                            <div className="flex flex-col gap-2">
                                                                {item.notes && <p>Notes: {item.notes}</p>}
                                                                <p>Trails Points: {item.trailsPoints}</p>
                                                                <p>Singles Place: {item.singlesPlace}</p>
                                                                <p>Doubles Place: {item.doublesPlace}</p>
                                                            </div>
                                                        </div>
                                                        )}
                                                        {editStates[index.toString()] && (
                                                            <TrailsDateAddForm handleFormSubmit={handleEditAddPlayer} trailsDate={addTrailsDate} goBack={goBack} trailsDateData={trailsDateData} editData={item} index={index}/>
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
                            <div className="flex items-center justify-center py-2">
                                <Button variant={"outline"}>Add Trails Date</Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    )
}