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
// Import all selector components
import PlayerSelect from "@/components/ui/single-player-select";
import TeamSelector from "@/components/ui/team-selector";
import PlaceSelector from "@/components/ui/place-selector";
import { PaymentHistory } from "@/lib/definitions";

// Define form schema with Zod
const formSchema = z.object({
  // Dynamic ID fields based on type
  ledaId: z.number().optional(),
  teamLedaId: z.string().optional(),
  placeId: z.string().optional(),
  fullName: z.string().optional(),
  teamName: z.string().optional(), // For team selector
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
  buttonIcon?: ReactNode;
  onSuccess?: () => void;
  initialLedaId?: string;
  route: string;
  paymentData?: PaymentHistory;
  isEditing?: boolean;
  type: "player" | "team" | "place"; // Add this to match PaymentVisualisor
}

export default function PaymentHistoryFormDialog({
  buttonText = "Add Payment",
  buttonIcon,
  onSuccess,
  initialLedaId,
  route,
  paymentData,
  isEditing = false,
  type = "player", // Default to player type
}: PaymentHistoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ledaId: initialLedaId && type === "player" ? Number(initialLedaId) : undefined,
      teamLedaId: initialLedaId && type === "team" ? initialLedaId : undefined,
      placeId: initialLedaId && type === "place" ? initialLedaId : undefined,
      fullName: "",
      comp: false,
      paidOff: true,
      paymentType: "Full",
      date: new Date(),
      notes: "",
      amount: "", // Initialize amount as an empty string instead of undefined
    },
  });

  // Set initial form values if editing an existing payment
  useEffect(() => {
    if (paymentData && isEditing) {
      // Set the appropriate ID based on type
      if (type === "player") {
        form.setValue("ledaId", Number(paymentData.ledaId));
      } else if (type === "team") {
        form.setValue("teamLedaId", paymentData.ledaId.toString());
      } else if (type === "place") {
        form.setValue("placeId", paymentData.ledaId.toString());
      }
      
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
      // Set the appropriate ID based on type for new payments
      if (type === "player") {
        form.setValue("ledaId", Number(initialLedaId));
      } else if (type === "team") {
        form.setValue("teamLedaId", initialLedaId);
      } else if (type === "place") {
        form.setValue("placeId", initialLedaId);
      }
    }
  }, [paymentData, isEditing, initialLedaId, form, type]);

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
      
      // Get the appropriate ID based on the type
      let ledaId: string;
      if (type === "player" && data.ledaId) {
        ledaId = data.ledaId.toString();
      } else if (type === "team" && data.teamLedaId) {
        ledaId = data.teamLedaId.toString();
      } else if (type === "place" && data.placeId) {
        ledaId = data.placeId.toString();
      } else {
        throw new Error("No valid ID found for the selected type");
      }
      
      const payload = {
        ledaId: ledaId,
        type: paymentTypeValue,
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
          <Button variant="default" className="border-gray-400 text-gray-700">{buttonText}</Button>
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
            {/* Conditionally render the appropriate selector based on type */}
            {type === "player" ? (
              <PlayerSelect
                control={form.control}
                name="ledaId"
                label="Player"
                trailsDateData={[]} // Empty array as we don't need to filter any players out
              />
            ) : type === "team" ? (
              <TeamSelector
                control={form.control}
                name="teamLedaId"
                label="Team"
                selectedTeams={[]} // Empty array as we don't want to exclude any teams
              />
            ) : (
              <PlaceSelector
                control={form.control}
                name="placeId"
                label="Place"
              />
            )}
            
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
                    <Input 
                      placeholder="0.00" 
                      {...field} 
                      value={field.value || ""} // Ensure value is never undefined
                    />
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
