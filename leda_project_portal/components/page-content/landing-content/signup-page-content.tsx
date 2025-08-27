"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { authClient } from "@/lib/auth-client";
import { Check, X } from "lucide-react";

// Password requirements: min 8 chars, 1 special char, 1 number, 1 uppercase
const signupSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(32, { message: "Username must be at most 32 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must include a number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must include a special character" }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  middleInitial: z.string().max(1, { message: "Middle initial must be one character" }).optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignupPageContent() {

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      middleInitial: "",
    },
  });

  const [signupError, setSignupError] = React.useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Live password requirement checks
  const pw = form.watch("password");
  const cpw = form.watch("confirmPassword");
  const reqHasMin = (pw?.length ?? 0) >= 8;
  const reqHasUpper = /[A-Z]/.test(pw || "");
  const reqHasNumber = /[0-9]/.test(pw || "");
  const reqHasSpecial = /[^A-Za-z0-9]/.test(pw || "");
  const reqMatches = !!pw && pw === cpw;

  const Requirement = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center text-xs gap-2">
      {ok ? (
        <Check className="h-3.5 w-3.5 text-green-600" aria-hidden />
      ) : (
        <X className="h-3.5 w-3.5 text-gray-400" aria-hidden />
      )}
      <span className={ok ? "text-green-700" : "text-gray-600"}>{label}</span>
    </div>
  );

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setSignupError(null);
    setIsSubmitting(true);
    try {
      await authClient.signUp.email({
        username: values.username,
        email: values.email,
        password: values.password,
        name: values.middleInitial
          ? `${values.firstName} ${values.middleInitial} ${values.lastName}`
          : `${values.firstName} ${values.lastName}`,
        // Additional fields required by inferred client types
        role: "User",
        mustResetPassword: false,
        callbackURL: `/Portal`
      });
      setSignupSuccess(true); // Show success message
    } catch (err: unknown) {
      // If error response has status 422, show the error
      if (typeof err === "object" && err !== null && "status" in err && (err as { status?: number }).status === 422) {
        setSignupError("Username or email already exists.");
      } else {
        setSignupError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (signupSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-6">Sign Up Successful</h2>
          <p className="mb-4 text-gray-700">
            Please check your email for a verification link to complete your registration.
          </p>
          <p className="text-sm text-gray-500">
            If you don&apos;t see the email, check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {signupError && (
          <div className="mb-4 text-red-600 text-center text-sm font-medium">
            {signupError}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middleInitial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Initial</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter you middle initial" maxLength={1} {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                  <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-4">
                    <Requirement ok={reqHasMin} label="At least 8 characters" />
                    <Requirement ok={reqHasUpper} label="Uppercase letter" />
                    <Requirement ok={reqHasNumber} label="Number" />
                    <Requirement ok={reqHasSpecial} label="Special character" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Re-enter your password" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                  <div className="mt-2">
                    <Requirement ok={reqMatches} label="Passwords match" />
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing Up...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}