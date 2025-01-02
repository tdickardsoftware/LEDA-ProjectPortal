'use client'

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Separator } from "@radix-ui/react-separator"
import { ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function PortalPageContent() {
    const [isManagementOpen, setIsManagementOpen] = React.useState(false)
    const [isMaintenanceOpen, setIsMaintenanceOpen] = React.useState(false)
    const [isReportsOpen, setIsReportsOpen] = React.useState(false)
    const [isActivitiesOpen, setIsActivitiesOpen] = React.useState(false)

    return (
        <div className="flex flex-row space-x-4">
            <div className="flex flex-col space-y-4">
                <Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
                    <Link href="/Portal/Management">
                        <CardHeader>
                            <CardTitle>Management</CardTitle>
                            <Separator className="my-4 bg-gray-500" />
                            <CardDescription>Manage Player, Place, or Team data</CardDescription>
                        </CardHeader>
                    </Link>
                    <CardContent>
                        <Collapsible open={isManagementOpen} onOpenChange={setIsManagementOpen}>
                            <CollapsibleTrigger className="flex items-center space-x-2">
                                <span>Links</span> <ChevronsUpDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <Separator className="my-4 bg-gray-500" />
                                <div className="flex flex-col space-y-2">
                                    <Link href="/Portal/Management/Players" className="border-b">Players</Link>
                                    <Link href="/Portal/Management/Places" className="border-b">Places</Link>
                                    <Link href="/Portal/Management/Teams" className="border-b">Teams</Link>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col space-y-4">
                <Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
                    <Link href="/Portal/Maintenance">
                        <CardHeader>
                            <CardTitle>Maintenance</CardTitle>
                            <Separator className="my-4 bg-gray-500" />
                            <CardDescription>Manage typically static data and seasons data</CardDescription>
                        </CardHeader>
                    </Link>
                    <CardContent>
                        <Collapsible open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
                            <CollapsibleTrigger className="flex items-center space-x-2">
                                <span>Links</span> <ChevronsUpDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <Separator className="my-4 bg-gray-500" />
                                <div className="flex flex-col space-y-2">
                                    <Link href="/Portal/Maintenance/Divisions" className="border-b">Divisions</Link>
                                    <Link href="/Portal/Maintenance/Mentions" className="border-b">Mentions</Link>
                                    <Link href="/Portal/Maintenance/Payment-Types" className="border-b">Payment Types</Link>
                                    <Link href="/Portal/Maintenance/Payout-Tiers" className="border-b">Payout Tiers</Link>
                                    <Link href="/Portal/Maintenance/Penalties" className="border-b">Penalties</Link>
                                    <Link href="/Portal/Maintenance/People-Types" className="border-b">People Types</Link>
                                    <Link href="/Portal/Maintenance/Place-Types" className="border-b">Place Types</Link>
                                    <Link href="/Portal/Maintenance/Seasons" className="border-b">Seasons</Link>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col space-y-4">     
                <Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
                    <Link href="/Portal/Reports">
                        <CardHeader>
                            <CardTitle>Reports *WORK IN PROGRESS*</CardTitle>
                            <Separator className="my-4 bg-gray-500" />
                            <CardDescription>Reports for different activities</CardDescription>
                        </CardHeader>
                    </Link>
                    <CardContent>
                        <Collapsible open={isReportsOpen} onOpenChange={setIsReportsOpen}>
                            <CollapsibleTrigger className="flex items-center space-x-2">
                                <span>Links</span> <ChevronsUpDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <Separator className="my-4 bg-gray-500" />
                                <div className="flex flex-col space-y-2">
                                    <Link href="/Portal/Reports/Captains-Meeting" className="border-b">Captains Meeting</Link>
                                    <Link href="/Portal/Reports/League-Play" className="border-b">League Play</Link>
                                    <Link href="/Portal/Reports/Lists" className="border-b">Lists</Link>
                                    <Link href="/Portal/Reports/Trails" className="border-b">Trails</Link>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col space-y-4">
                
                    <Card className="p-4 shadow-lg bg-white rounded-lg border border-gray-300 w-[350px]">
                        <Link href="/Portal/Activities">
                            <CardHeader>
                                <CardTitle>Activities *WORK IN PROGRESS*</CardTitle>
                                <Separator className="my-4 bg-gray-500" />
                                <CardDescription>Manage Payouts, Rosters, Schedules, Trails Events, and Weekly Scoresheets</CardDescription>
                            </CardHeader>
                        </Link>
                        <CardContent>
                            <Collapsible open={isActivitiesOpen} onOpenChange={setIsActivitiesOpen}>
                                <CollapsibleTrigger className="flex items-center space-x-2">
                                    <span>Links</span> <ChevronsUpDown className="h-4 w-4" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Separator className="my-4 bg-gray-500" />
                                    <div className="flex flex-col space-y-2">
                                        <Link href="/Portal/Activities/Payouts" className="border-b">Payouts</Link>
                                        <Link href="/Portal/Activities/Rosters" className="border-b">Rosters</Link>
                                        <Link href="/Portal/Activities/Scheduling" className="border-b">Scheduling</Link>
                                        <Link href="/Portal/Activities/Trails" className="border-b">Trails</Link>
                                        <Link href="/Portal/Activities/Weekly-Score" className="border-b">Weekly Score</Link>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </CardContent>
                    </Card>
            </div>
        </div>
    )
}
