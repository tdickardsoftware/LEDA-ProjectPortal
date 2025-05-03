"use client";

import { useState, useEffect, ReactNode } from "react"; // Add ReactNode for buttonIcon
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaymentTypeSelector from "@/components/ui/payment-type-selector";
import SeasonCodeSelector from "@/components/ui/season-code-selector-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
// Import PlayerSelect instead of PlayerSelector
import PlayerSelect from "@/components/ui/single-player-select";
import { PaymentHistory } from "@/lib/definitions"; // Add this import for the type

// Define form schema with Zod
const formSchema = z.object({
  // Change player to ledaId to match the field name used by PlayerSelect
  ledaId: z.number({
    required_error: "Player is required",
  }),
  fullName: z.string().optional(),
  type: z.any(), // For PaymentTypeSelector
  paymentType: z.string({
    required_error: "Please select payment type",
  }),
  amount: z.string().min(1, "Amount is required"),
  seasonCode: z.string().min(1, "Season code is required"),
  comp: z.boolean().default(false),
  notes: z.string().optional(),
  paidOff: z.boolean().default(false),
  date: z.date({
    required_error: "Date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentHistoryFormDialogProps {
  buttonText?: string;
  buttonIcon?: ReactNode; // Add this prop for the pencil icon
  onSuccess?: () => void;
  initialLedaId?: string; // Add this prop to directly set a player
  route: string;
  paymentData?: PaymentHistory; // Add this prop for editing existing payment
  isEditing?: boolean; // Add this flag to indicate editing mode
}

export default function PaymentHistoryFormDialog({
  buttonText = "Add Payment",
  buttonIcon,
  onSuccess,
  initialLedaId,
  route,
  paymentData,
  isEditing = false,
}: PaymentHistoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ledaId: initialLedaId ? Number(initialLedaId) : undefined,
      fullName: "",
      comp: false,
      paidOff: true,
      paymentType: "Full",
      date: new Date(),
      notes: "",
    },
  });

  // Set initial form values if editing an existing payment
  useEffect(() => {
    if (paymentData && isEditing) {
      form.setValue("ledaId", Number(paymentData.ledaId));
      form.setValue("fullName", paymentData.fullName || "");
      form.setValue("paymentType", paymentData.paymentType || "Full");
      form.setValue("amount", paymentData.amount?.toString() || "");
      form.setValue("seasonCode", paymentData.seasonCode || "");
      form.setValue("comp", paymentData.comp || false);
      form.setValue("paidOff", paymentData.paidOff || false);
      form.setValue("notes", paymentData.notes || "");
      
      // Handle date conversion
      if (paymentData.date) {
        form.setValue("date", new Date(paymentData.date));
      }
      
      // Handle payment type
      if (paymentData.type) {
        form.setValue("type", { paymentType: paymentData.type });
      }
    } else if (initialLedaId) {
      form.setValue("ledaId", Number(initialLedaId));
    }
  }, [paymentData, isEditing, initialLedaId, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Form submission data:", data); // Add this for debugging
      
      // Extract payment type more reliably
      let paymentTypeValue = "Unknown";
      
      if (data.type) {
        // If data.type has paymentType property directly
        if (typeof data.type === 'object' && 'paymentType' in data.type) {
          paymentTypeValue = data.type.paymentType;
        } 
        // If data.type is a string
        else if (typeof data.type === 'string') {
          paymentTypeValue = data.type;
        }
        // Log the type value to help with debugging
        console.log("Payment type data structure:", JSON.stringify(data.type, null, 2));
      }
      
      const payload = {
        ledaId: data.ledaId.toString(), // Convert number to string for API
        type: paymentTypeValue, // Use the safely extracted value
        paymentType: data.paymentType,
        amount: data.amount,
        seasonCode: data.seasonCode,
        comp: data.comp,
        notes: data.notes,
        paidOff: data.paidOff,
        date: data.date,
        // Include payment number if editing
        ...(isEditing && paymentData?.paymentNbr && { paymentNbr: paymentData.paymentNbr }),
      };
      
      console.log("API payload:", payload); // Add this for debugging
      
      // Send data to your API - using POST for both create and update (upsert)
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update payment" : "Failed to add payment");
      }
      
      // Reset form and close dialog on success
      form.reset();
      setOpen(false);
      // Call success callback if provided, otherwise reload the page
      if (onSuccess) {
        onSuccess();
        window.location.reload(); // Reload the page after success
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error(isEditing ? "Error updating payment:" : "Error adding payment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {buttonIcon ? (
          <Button variant="ghost" size="sm">
            {buttonIcon}
          </Button>
        ) : (
          <Button variant="default">{buttonText}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Payment" : "Add Payment History"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update payment details below. Click save when done." 
              : "Enter payment details below. Click save when done."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Player Selector - using PlayerSelect instead of PlayerSelector */}
            <PlayerSelect
              control={form.control}
              name="ledaId"
              label="Player"
              trailsDateData={[]} // Empty array as we don't need to filter any players out
            />
            
            {/* Season Code Selector */}
            <SeasonCodeSelector
              control={form.control}
              name="seasonCode"
              label="Season"
            />
            
            {/* Payment Type Selector */}
            <PaymentTypeSelector
              control={form.control}
              name="type"
              label="Payment Category"
            />
            
            {/* Full/Partial Payment Type */}
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="Full">Full</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this payment..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Checkboxes */}
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="comp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Complimentary</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paidOff"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Paid Off</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">{isEditing ? "Update Payment" : "Save Payment"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
