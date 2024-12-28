'use client'

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import React from 'react';
import { InputDefault } from '@/components/ui/form-input-default';
import { Textarea } from '@/components/ui/textarea';

const paymentTypeFormSchema = z.object({ 
    place: z.string().min(1, { message: 'Place is required.' }),
    amount: z.number().min(0, { message: 'Amount must be a positive number.' }),
});

const formContainerStyle = 'p-4 shadow-lg bg-white rounded-lg border border-gray-300';
const inputWidth = 'w-24';
const checkboxWidth = 'h-5 w-5';

export default function PayoutTierAddForm({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void })  {
    const form = useForm<z.infer<typeof paymentTypeFormSchema>>({ 
            resolver: zodResolver(paymentTypeFormSchema),
            defaultValues: {
                place: '',
            }
    });

    async function onSubmit(values: z.infer<typeof paymentTypeFormSchema>) {
                try {
                    const response = await fetch("/api/maintenance/payoutTier/payoutTierPut", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(values),
                    });
        
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
                    }
        
                    const results = await response.json();
                    toast.success("Successfully submitted the form!");
                    
                    // Reset form and state
                    form.reset();
                    
                    console.log("Form submitted successfully!", results);
                    onClose(); // Close the form
                    onRefresh(); // Refresh the datatable with the place API route
                } catch (error: any) {
                    console.error("Form submission error", error);
                    toast.error(`Failed to submit the form: ${error.message || "Please try again."}`);
                }
    }
    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mx-auto'>
                <div className='flex space-x-4'>
                    <div className={formContainerStyle}>
                        <FormField
                            control={form.control}
                            name='place'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Place *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='0'
                                            {...field}
                                            className={inputWidth}
                                            type='number'
                                            onChange={(e) => {
                                                field.onChange(
                                                    e.target.value ? Number(e.target.value) : undefined
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amount'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Points *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='0.00'
                                            {...field}
                                            className={inputWidth}
                                            type='number'
                                            step='0.01'
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value) {
                                                    const numberValue = Number(value);
                                                    const formattedValue = numberValue.toFixed(2);
                                                    field.onChange(formattedValue);
                                                } else {
                                                    field.onChange('');
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className='flex justify-center'>
                    <Button type='submit'>Add</Button>
                </div>
            </form>
        </Form>
    );
}