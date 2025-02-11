"use client"

import { DataTable } from "../datatable"
import { columns } from "@/schemas/activities/trails_dates"
import { fetchTrailsDateData, fetchTrailsDates } from "@/lib/getData"
import { trailsDateRoute } from "@/lib/apiRoutes"
import { format } from "date-fns"

import { useEffect, useState } from "react";
import { TrailsDate, TrailsDateData } from "@/lib/definitions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TrainsPageContent() {
    const [data, setData] = useState<TrailsDate[]>([]);
    const [trailsDate, setTrailsDate] = useState<string | null>(null);
    const [trailsDateData, setTrailsDateData] = useState<TrailsDateData[]>([]); // Ensure this is an array

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
    // TODO define a datatable in the card to show all players for a selected trails date, sort by points by default
    return(
        <div className="flex gap-20">
            
            <DataTable columns={columns} data={data} pageName="Prior Trails Dates" apiEndpoint={trailsDateRoute} singleRowSelection={true} passValueToParent={handleSetTrailsDate}/>

            <Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
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
                                        <div key={index} className="flex justify-between">
                                            <span>{item.ledaId}</span>
                                            <span>{item.singlesPlace}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    )
}