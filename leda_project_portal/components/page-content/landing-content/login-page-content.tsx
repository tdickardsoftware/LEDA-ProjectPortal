"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

// Accepts either a valid email or a username (alphanumeric, 3-32 chars)
const loginSchema = z.object({
  emailOrUsername: z.string()
    .min(3, { message: "Enter a valid email or username" })
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^[a-zA-Z0-9_]{3,32}$/.test(val),
      { message: "Enter a valid email or username" }
    ),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must include a number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must include a special character" }),
});

export default function LoginPageContent() {

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const { emailOrUsername, password } = values;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

    if (isEmail) {
      await authClient.signIn.email({
        email: emailOrUsername,
        password,
        callbackURL: `/Portal`
      }, {
        onSuccess: () => {
              window.location.href = "/Portal";
        }
      } );
    } else {
      await authClient.signIn.username({
        username: emailOrUsername,
        password,
        callbackURL: `/Portal`
      }, {
        onSuccess: () => {
              window.location.href = "/Portal";
        }
      });
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailOrUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email or username" {...field} />
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
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between mb-2">
              {Boolean(process.env.DISABLE_SIGN_UP) !== false && (
                <Link href="/sign-up" className="text-sm text-blue-600 hover:underline">
                  Create Account
                </Link>
              )}
              <Link href="/login/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
              </Link>
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}