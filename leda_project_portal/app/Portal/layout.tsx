/**
 * Portal root layout — wraps all authenticated portal pages with the
 * collapsible sidebar, dynamic breadcrumb navigation, and main content area.
 */
import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { BreadcrumbDynamicItems } from "@/components/ui/breadcrumb-dynamic-items";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main>
			<SidebarProvider>
				<Suspense fallback={<Skeleton className="w-64 h-screen shrink-0" />}>
					<AppSidebar className="z-20" />
				</Suspense>
				<SidebarInset>
					<div className="flex-1 min-w-0 bg-background">
						<header className="flex h-16 shrink-0 items-center gap-2 px-4 w-full">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 h-4 bg-muted"
							/>
							<div className="flex-1">
								<Breadcrumb>
									<BreadcrumbList>
										<Suspense fallback={<Skeleton className="h-4 w-32" />}>
											<BreadcrumbDynamicItems />
										</Suspense>
									</BreadcrumbList>
								</Breadcrumb>
							</div>
						</header>
						<div className="p-4">{children}</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</main>
	);
}
