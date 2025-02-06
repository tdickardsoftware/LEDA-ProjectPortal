"use client"

import { DataTable } from "../datatable"
import { columns } from "@/schemas/activities/trails_dates"
import { fetchTrailsDates } from "@/lib/getData"
import { trailsDateRoute } from "@/lib/apiRoutes"
import { format } from "date-fns"

import { useEffect, useState } from "react";
import { TrailsDate } from "@/lib/definitions"

export default function TrainsPageContent() {
    const [data, setData] = useState<TrailsDate[]>([]);

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

    return(
        <DataTable columns={columns} data={data} pageName="Trails Page" apiEndpoint={trailsDateRoute} />
    )
}