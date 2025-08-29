"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { authClient } from "@/lib/auth-client";

// Accepts only a valid email address
const forgotSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
});

export default function ForgotPasswordPageContent() {
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(values: z.infer<typeof forgotSchema>) {
    setError(null);
    setIsSubmitting(true);
    try {
  await authClient.requestPasswordReset({ email: values.email, redirectTo: `${window.location.origin}/login/reset-password?email=${encodeURIComponent(values.email)}` });
      setSubmitted(true);
    } catch {
      setError("Unable to process request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-6">Check Your Email</h2>
          <p className="mb-4 text-gray-700">
            If an account exists for the entered email, you will receive instructions to reset your password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {error && (
          <div className="mb-4 text-red-600 text-center text-sm font-medium">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}