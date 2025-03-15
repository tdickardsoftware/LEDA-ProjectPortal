"use client";

import { useState, useCallback } from "react";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "../ui/accordion";
import { rosterRoute } from "@/lib/apiRoutes";
import { Spinner } from "../ui/skeleton";

export default function ScheduleContent() {
	// State variables
	const [seasonCode, setSeasonCode] = useState<string | null>(null);
	const [divisionsData, setDivisionsData] = useState<{
		[key: string]: {
			subdivisions: {
				[key: string]: {
					[key: string]: {
						teamId: string;
						placeId: string;
						teamName: string;
					};
				};
			};
		};
	}>({});
	const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState<boolean>(true);

	// Handle season code selection
	const handleSeasonCodeSelect = useCallback(async (value: string) => {
		if (value === seasonCode) return;
		setSeasonCode(value);
		
		setLoading(true);
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
				const fetchedData = JSON.parse(
					JSON.stringify(roster.teamInfomation)
				);
				setDivisionsData(fetchedData);
			}
		} else {
			setDivisionsData({});
		}
		setLoading(false);
	}, [seasonCode]);

	return !loading ? (
        <div className="flex flex-col max-w-[65vw]">
            <div className="flex justify-between">
                <SeasonCodeSelector
                    disabled={disabled}
                    handleSelect={handleSeasonCodeSelect}
                    setDisabled={setDisabled}
                />
            </div>
            {Object.keys(divisionsData).length > 0 && (
                <div className="w-full mt-4">
                    {Object.keys(divisionsData).map((division, index) => (
                        <Accordion
                            key={index}
                            type="single"
                            collapsible
                            className="w-full mb-4"
                            defaultValue={`division-${index}`}
                        >
                            <AccordionItem value={`division-${index}`}>
                                <AccordionTrigger>{division}</AccordionTrigger>
                                <AccordionContent>
                                    {Object.keys(divisionsData[division].subdivisions).map((subdivision, subIndex) => (
                                        <Accordion
                                            key={subIndex}
                                            type="single"
                                            collapsible
                                            className="w-full mt-2"
                                            defaultValue={`subdivision-${subIndex}`}
                                        >
                                            <AccordionItem value={`subdivision-${subIndex}`} className="border-b-0">
                                                <AccordionTrigger className="underline">{subdivision}</AccordionTrigger>
                                                <AccordionContent>
                                                    <ul>
                                                        {Object.keys(divisionsData[division].subdivisions[subdivision]).map((team, teamIndex) => (
                                                            <li key={teamIndex}>
                                                                {team} - {divisionsData[division].subdivisions[subdivision][team].teamName}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ))}
                </div>
            )}
        </div>
	) : (
		<Spinner />
	);
}
