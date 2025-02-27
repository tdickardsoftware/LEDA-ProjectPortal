import "@/app/ui/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { BreadcrumbDynamicItems } from "@/components/ui/breadcrumb-dynamic-items";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main>
			<SidebarProvider>
				<div className="flex">
					<AppSidebar className="z-20" />
					<div className="flex-1 min-w-0 bg-background">
						<header className="flex h-16 shrink-0 items-center gap-2 px-4 w-full">
							<SidebarTrigger className="-ml-1"/>
							<Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
							<div className="flex-1">
								<Breadcrumb>
									<BreadcrumbList>
										<BreadcrumbDynamicItems />
									</BreadcrumbList>
								</Breadcrumb>
							</div>
						</header>
						<div className="p-4">
							{children}
						</div>
					</div>
				</div>
			</SidebarProvider>
		</main>
	);
}
