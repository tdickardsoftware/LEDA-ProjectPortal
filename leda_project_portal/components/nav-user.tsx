"use client";

import {
	ChevronsUpDown,
	LogOut,
	Users,
	Undo,
	Moon,
	Sun,
	Monitor,
	Bug,
	Info,
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
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

export function NavUser() {
	const { isMobile } = useSidebar();
	const { user, emulateRole } = useUserAbilities();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [showIssueDialog, setShowIssueDialog] = useState(false);
	const [issueSubject, setIssueSubject] = useState("");
	const [issueDescription, setIssueDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleLogout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/login");
				},
			},
		});
	}

	async function handleSignOutAll() {
		try {
			await authClient.revokeSessions();
			// Clear session cookie in the browser as well
			await authClient.signOut();
			router.push("/login");
		} catch {
			// no-op; best-effort logout
			router.push("/login");
		}
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

	async function handleSubmitIssue() {
		if (!issueSubject.trim() || !issueDescription.trim()) {
			toast.error("Please provide both a subject and description.");
			return;
		}

		setIsSubmitting(true);
		try {
			// Get CSRF token from cookie
			const getCookie = (name: string) => {
				const value = `; ${document.cookie}`;
				const parts = value.split(`; ${name}=`);
				if (parts.length === 2) return parts.pop()?.split(';').shift();
			};
			const csrfToken = getCookie('csrfToken');

			const response = await fetch("/api/github/create-issue", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(csrfToken && { "x-csrf-token": csrfToken }),
				},
				credentials: "include",
				body: JSON.stringify({
					title: issueSubject,
					body: issueDescription,
					labels: ["bug"],
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.log(errorData)
				throw new Error(errorData.message);
			}

			toast.success("Issue submitted successfully!");
			setShowIssueDialog(false);
			setIssueSubject("");
			setIssueDescription("");
		} catch (error) {
			console.error("Error submitting issue:", error);
			toast.error(`Failed to submit issue: ${(error as Error).message}`);
		} finally {
			setIsSubmitting(false);
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
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
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
								<DropdownMenuLabel className="text-xs text-muted-foreground px-2">
									Role Emulation
								</DropdownMenuLabel>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<Users className="mr-2 size-4" />
										<span>Emulate Role</span>
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent className="bg-background">
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
						<DropdownMenuLabel className="text-xs text-muted-foreground px-2">
							Help
						</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => setShowIssueDialog(true)}>
							<Bug className="mr-2 size-4" />
							<span>Found an Issue?</span>
						</DropdownMenuItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<Info className="mr-2 size-4" />
								<span>Information</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="bg-background">
								<DropdownMenuItem className="flex flex-col items-start gap-1">
									<span>Version: 1.0.0</span>
									<span>Last Updated Date: {process.env.NEXT_PUBLIC_UPDATE_DATE}</span>
									<span>Developer: Tyler Dickard</span>
									<span>Repository: <a href="https://github.com/tdickardsoftware/LEDA-ProjectPortal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a></span>
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<DropdownMenuLabel className="text-xs text-muted-foreground px-2">
							Account Management
						</DropdownMenuLabel>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								{theme === "light" && <Sun className="mr-2 size-4" />}
								{theme === "dark" && <Moon className="mr-2 size-4" />}
								{theme === "system" && <Monitor className="mr-2 size-4" />}
								<span>Theme</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="bg-background">
								<DropdownMenuItem onClick={() => setTheme("light")}>
									<Sun className="mr-2 size-4" />
									Light
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<Moon className="mr-2 size-4" />
									Dark
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("system")}>
									<Monitor className="mr-2 size-4" />
									System
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
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

						<DropdownMenuItem asChild>
							<Button
								type="button"
								onClick={handleSignOutAll}
								className="flex items-center gap-2 text-blue-600 hover:underline bg-transparent border-none p-0 m-0 cursor-pointer w-full text-left"
							>
								<LogOut />
								Sign out of all devices
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

			<AlertDialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
				<AlertDialogContent className="max-w-lg">
					<AlertDialogHeader>
						<AlertDialogTitle>Report an Issue</AlertDialogTitle>
						<AlertDialogDescription>
							Describe the issue you encountered. This will create a bug report in our GitHub repository.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="issue-subject">Subject *</Label>
							<Input
								id="issue-subject"
								placeholder="Brief description of the issue"
								value={issueSubject}
								onChange={(e) => setIssueSubject(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="issue-description">Description *</Label>
							<Textarea
								id="issue-description"
								placeholder="Detailed description of the issue, steps to reproduce, etc."
								value={issueDescription}
								onChange={(e) => setIssueDescription(e.target.value)}
								className="min-h-[150px]"
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleSubmitIssue();
							}}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Submitting..." : "Submit Issue"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</SidebarMenu>
	);
}