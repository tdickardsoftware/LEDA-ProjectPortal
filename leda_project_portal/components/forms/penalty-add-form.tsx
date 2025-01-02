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
import { toast } from 'sonner';
import React from 'react';
import { InputDefault } from '@/components/ui/form-input-default';
import { Textarea } from '../ui/textarea';
import { penaltyRoute } from '@/lib/apiRoutes';

const penaltyFormSchema = z.object({ 
    penaltyCode: z.string().min(1, { message: 'Penalty Code is required.' }),
    desc: z.string().optional(),
});

const formContainerStyle = 'p-4 shadow-lg bg-white rounded-lg border border-gray-300';

export default function PenaltyAddForm({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void })  {
    const form = useForm<z.infer<typeof penaltyFormSchema>>({ 
            resolver: zodResolver(penaltyFormSchema),
            defaultValues: {
                penaltyCode: '',
            }
    });

    async function onSubmit(values: z.infer<typeof penaltyFormSchema>) {
                try {
                    const response = await fetch(penaltyRoute, {
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
                        <InputDefault control={form.control} name="penaltyCode" label="Penalty Code *" />
                        <FormField
                            control={form.control}
                            name='desc'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional Data Here..." {...field} />
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