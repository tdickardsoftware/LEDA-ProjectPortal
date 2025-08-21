"use client";

import {
	ChevronsUpDown,
	LogOut,
	Users,
	Undo,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useUserAbilities } from "@/lib/use-user-abilities";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function NavUser() {
	const { isMobile } = useSidebar();
	const { user, emulateRole } = useUserAbilities();
	const router = useRouter();

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

	const canEmulate = user.role === "Developer" || user.role === "Office Admin";
	const availableRoles: { [key: string]: ("Office Admin" | "User")[] } = {
		Developer: ["Office Admin", "User"],
		"Office Admin": ["User"],
	};

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
								{user.emulatedRole && (
									<span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
										Emulating: {user.emulatedRole}
									</span>
								)}
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
									<span className="truncate text-xs">
										Role: {user.emulatedRole ? `${user.role} (emulating ${user.emulatedRole})` : user.role}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{canEmulate && (
							<>
								<DropdownMenuLabel className="text-xs text-gray-500 px-2">
									Role Emulation
								</DropdownMenuLabel>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<Users className="mr-2 size-4" />
										<span>Emulate Role</span>
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent className="bg-white">
										{user.emulatedRole && (
											<DropdownMenuItem onClick={() => emulateRole(null)}>
												<Undo className="mr-2 size-4" />
												Revert to {user.originalRole}
											</DropdownMenuItem>
										)}
										{availableRoles[user.role]?.map((role) => (
											<DropdownMenuItem
												key={role}
												onClick={() => emulateRole(role)}
												disabled={user.emulatedRole === role}
											>
												View as {role}
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuLabel className="text-xs text-gray-500 px-2">
							Account Management
						</DropdownMenuLabel>
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