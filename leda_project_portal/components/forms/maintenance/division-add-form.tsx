'use client'

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import React from 'react';
import { InputDefault } from '@/components/ui/form-input-default';
import { divisionRoute } from '@/lib/apiRoutes';

const divisionFormSchema = z.object({ 
    divisionName: z.string().min(1, { message: 'Division Name is required.' }),
});

const formContainerStyle = 'p-4 shadow-lg bg-white rounded-lg border border-gray-300';

export default function DivisionAddForm({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void })  {
    const form = useForm<z.infer<typeof divisionFormSchema>>({ 
            resolver: zodResolver(divisionFormSchema),
            defaultValues: {
                divisionName: '',
            }
    });

    async function onSubmit(values: z.infer<typeof divisionFormSchema>) {
                try {
                    const response = await fetch(divisionRoute, {
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
                        <InputDefault control={form.control} name="divisionName" label="Division Name *" />
                    </div>
                </div>
                <div className='flex justify-center'>
                    <Button type='submit'>Add</Button>
                </div>
            </form>
        </Form>
    );
}