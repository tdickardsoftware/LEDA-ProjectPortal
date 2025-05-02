"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";

export default function PaymentsPageContent() {
    const [activeTab, setActiveTab] = useState("player");

    return (
        <div className="w-full max-w-full-4xl"> 
            <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full" 
                orientation="horizontal"
            >
                <TabsList className="flex w-full bg-white rounded-lg shadow-md p-1 gap-2">
                    <TabsTrigger
                        value="player"
                        className={`flex-1 py-2 px-4 rounded-md text-gray-700 font-semibold transition-colors duration-200 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white ${activeTab === "player" ? "border-b-2 border-blue-500" : ""}`}
                    >
                        Player
                    </TabsTrigger>
                    <TabsTrigger
                        value="team"
                        className={`flex-1 py-2 px-4 rounded-md text-gray-700 font-semibold transition-colors duration-200 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white ${activeTab === "team" ? "border-b-2 border-blue-500" : ""}`}
                    >
                        Team
                    </TabsTrigger>
                    <TabsTrigger
                        value="place"
                        className={`flex-1 py-2 px-4 rounded-md text-gray-700 font-semibold transition-colors duration-200 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white ${activeTab === "place" ? "border-b-2 border-blue-500" : ""}`}
                    >
                        Place
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="player" className="mt-4 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Player Payments</h2>
                    <p>Player payment content goes here.</p>
                </TabsContent>
                
                <TabsContent value="team" className="mt-4 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Team Payments</h2>
                    <p>Team payment content goes here.</p>
                </TabsContent>
                
                <TabsContent value="place" className="mt-4 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Place Payments</h2>
                    <p>Place payment content goes here.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}