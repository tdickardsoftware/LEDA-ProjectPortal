import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Home, Atom, Wrench, FileText, BookUser, Award } from "lucide-react"
import Link from "next/link"
const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Portal",
        url: "/Portal",
        icon: Atom,
    },
    {
        title: "Management",
        url: "/Portal/Management",
        icon: BookUser,
    },
    {
        title: "Activites",
        url: "/Portal/Activities",
        icon: Award,
    },
    {
        title: "Reports",
        url: "/Portal/Reports",
        icon: FileText,
    },
    {
        title: "Maintenance",
        url: "/Portal/Maintenance",
        icon: Wrench,
    },
]


export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent> 
                <SidebarGroup>
                    <SidebarGroupLabel>LEDA Project Portal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}