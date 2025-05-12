"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState, useEffect } from "react";
import { PaymentVisualisor } from "@/components/payment-visualisor";

export default function PaymentsPageContent() {
    const TAB_KEY = "payments-active-tab";
    const [activeTab, setActiveTab] = useState("player");

    // Load tab from localStorage on mount
    useEffect(() => {
        const storedTab = typeof window !== "undefined" ? localStorage.getItem(TAB_KEY) : null;
        if (storedTab) setActiveTab(storedTab);
    }, []);

    // Store tab in localStorage on change
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (typeof window !== "undefined") {
            localStorage.setItem(TAB_KEY, tab);
        }
    };

    return (
        <div className="w-full max-w-full-4xl"> 
            <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange} 
                className="w-full" 
                orientation="horizontal"
            >
                <TabsList className="flex w-full bg-white rounded-lg shadow-md p-1 gap-2">
                    <TabsTrigger
                        value="player"
                        className={`flex-1 py-2 px-4 rounded-md text-gray-700 font-semibold transition-colors duration-200 hover:bg-blue-50  ${activeTab === "player" ? "border-b-2 border-blue-500" : ""}`}
                    >
                        Player
                    </TabsTrigger>
                    <TabsTrigger
                        value="team"
                        className={`flex-1 py-2 px-4 rounded-md text-gray-700 font-semibold transition-colors duration-200 hover:bg-blue-50  ${activeTab === "team" ? "border-b-2 border-blue-500" : ""}`}
                    >
                        Team
                    </TabsTrigger>
                    <TabsTrigger
                        value="place"
                        className={`flex-1 py-2 px-4 rounded-md text-gray-700 font-semibold transition-colors duration-200 hover:bg-blue-50  ${activeTab === "place" ? "border-b-2 border-blue-500" : ""}`}
                    >
                        Place
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="player" className="mt-4 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Player Payments</h2>
                    <PaymentVisualisor type="player" />
                </TabsContent>
                
                <TabsContent value="team" className="mt-4 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Team Payments</h2>
                    <PaymentVisualisor type="team" />
                </TabsContent>
                
                <TabsContent value="place" className="mt-4 bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Place Payments</h2>
                    <PaymentVisualisor type="place" />
                </TabsContent>
            </Tabs>
        </div>
    )
}