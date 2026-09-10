/**
 * Portal root layout — wraps all authenticated portal pages with the
 * collapsible sidebar, dynamic breadcrumb navigation, and main content area.
 */
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { BreadcrumbDynamicItems } from "@/components/ui/breadcrumb-dynamic-items";
import { SidebarTrigger } from "@/components/ui/sidebar";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main>
			<SidebarProvider>
				<AppSidebar className="z-20" />
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
										<BreadcrumbDynamicItems />
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
