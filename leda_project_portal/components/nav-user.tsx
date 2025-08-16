"use client";

import {
	ChevronsUpDown,
	LogOut,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function NavUser() {
	const { isMobile } = useSidebar();
	const [user, setUser] = useState<
		{ name: string; email: string, username: string } | null
	>(null);
	const router = useRouter();

	useEffect(() => {
		async function fetchUser() {
			try {
				const session = await authClient.getSession();
				const user = session?.data?.user;
				if (user) {
					setUser({
						name: user.name || "",
						email: user.email || "",
						username: user.username || "",
					});
				}
			} catch {
				setUser(null);
			}
		}
		fetchUser();
	}, []);

	async function handleLogout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
				},
			},
		});
	}

	// Add: delete handler that prompts the user then calls authClient.deleteUser
	async function handleDelete() {
		const confirmed = typeof window !== "undefined" && window.confirm(
			"Are you sure you want to permanently delete your account? This action cannot be undone."
		);
		if (!confirmed) return;

		try {
			await authClient.deleteUser({
				callbackURL: "/login"
			});
			// authClient.deleteUser should redirect via callbackURL, but push as fallback:
			router.push("/login");
		} catch (err) {
			console.error("Error deleting user account:", err);
			// optionally show UI feedback here
		}
	}

	if (!user) return null;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-fit"
						>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{user.name}
								</span>
								<span className="truncate text-sm">
									{user.username}
								</span>
								<span className="truncate text-xs">
									{user.email}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-white"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user.name}
									</span>
									<span className="truncate text-sm">
									{user.username}
								</span>
									<span className="truncate text-xs">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Button
								type="button"
								onClick={handleLogout}
								className="flex items-center gap-2 text-blue-600 hover:underline bg-transparent border-none p-0 m-0 cursor-pointer w-full text-left"
							>
								<LogOut />
								Log out
							</Button>
						</DropdownMenuItem>

						{/* New delete user item */}
						<DropdownMenuItem asChild>
							<Button
								type="button"
								onClick={handleDelete}
								className="flex items-center gap-2 text-red-600 hover:underline bg-transparent border-none p-0 m-0 cursor-pointer w-full text-left"
							>
								{/* no icon to keep change minimal */}
								Delete account
							</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
