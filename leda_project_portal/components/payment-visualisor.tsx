"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentHistory } from "@/lib/definitions";
import { 
  playerPaymentHistoryRoute, 
  teamPaymentHistoryRoute, 
  placePaymentHistoryRoute 
} from "@/lib/apiRoutes";

interface PaymentVisualisorProps {
  type: "player" | "team" | "place";
  ledaId?: string;
}

interface PaymentDate {
  paymentDate: string;
}

export function PaymentVisualisor({ type, ledaId }: PaymentVisualisorProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [uniqueDates, setUniqueDates] = useState<PaymentDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// Fetch all unique payment dates
useEffect(() => {
    async function fetchUniqueDates() {
        try {
            let baseRoute = '';
            if (type === 'player') baseRoute = playerPaymentHistoryRoute;
            else if (type === 'team') baseRoute = teamPaymentHistoryRoute;
            else if (type === 'place') baseRoute = placePaymentHistoryRoute;
            else return setUniqueDates([]);

            const url = ledaId ? `${baseRoute}/uniqueDates?ledaId=${ledaId}` : `${baseRoute}/uniqueDates`;
            const response = await fetch(url);
            
            if (!response.ok) return setUniqueDates([]);
            
            const data = await response.json();
            const dates = Array.isArray(data) ? data : (data?.rows || []);
            setUniqueDates(dates);
        } catch {
            setUniqueDates([]);
        }
    }

    fetchUniqueDates();
}, [type, ledaId]);

// Fetch payment information
useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    
    async function fetchPayments() {
        setLoading(true);
        setError(null);

        try {
            let baseUrl = '';
            if (type === 'player') baseUrl = playerPaymentHistoryRoute;
            else if (type === 'team') baseUrl = teamPaymentHistoryRoute;
            else if (type === 'place') baseUrl = placePaymentHistoryRoute;
            else {
                if (isMounted) {
                    setPayments([]);
                    setLoading(false);
                }
                return;
            }
            
            const url = ledaId ? `${baseUrl}?ledaId=${ledaId}` : baseUrl;
            const response = await fetch(url, { signal: controller.signal });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }

            let data = await response.json();
            data = Array.isArray(data) ? data : (data?.payments || []);
            
            // Map paymentDate to date for consistency
            data = data.map((payment: PaymentHistory) => ({
                ...payment,
                date: payment.date || payment.date
            }));
            
            // Filter by selected date if not "all"
            if (selectedDate !== "all") {
                data = data.filter((payment: PaymentHistory) => {
                    const paymentDate = payment.date || '';
                    return paymentDate && new Date(paymentDate).toDateString() === new Date(selectedDate).toDateString();
                });
            }

            if (isMounted) {
                setPayments(data);
            }
        } catch (error) {
            console.error("Payment fetch error:", error);
            if (isMounted) {
                setPayments([]);
                setError(error instanceof Error ? error.message : "Failed to load payment data");
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    }

    fetchPayments();

    return () => {
        isMounted = false;
        controller.abort();
    };
}, [type, ledaId, selectedDate]);

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-4">
        <Select
          value={selectedDate}
          onValueChange={setSelectedDate}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {Array.isArray(uniqueDates) && uniqueDates.map((date, index) => (
              <SelectItem key={`${date.paymentDate}-${index}`} value={date.paymentDate}>
                {date.paymentDate ? new Date(date.paymentDate).toLocaleDateString() : 'Unknown date'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading payments...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40 text-red-500">
          <p>{error}</p>
        </div>
      ) : payments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment #</TableHead>
              <TableHead>LEDA ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Season Code</TableHead>
              <TableHead>Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.paymentNbr}>
                <TableCell>{payment.paymentNbr}</TableCell>
                <TableCell>{payment.ledaId}</TableCell>
                <TableCell>{payment.type}</TableCell>
                <TableCell>{payment.paymentType}</TableCell>
                <TableCell>${payment.amount ? payment.amount.toFixed(2) : '0.00'}</TableCell>
                <TableCell>{payment.seasonCode}</TableCell>
                <TableCell>
                  {payment.date || payment.date ? 
                    new Date(payment.date || payment.date).toLocaleDateString() : 
                    'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex justify-center items-center h-40">
          <p>No payment records found.</p>
        </div>
      )}
    </div>
  );
}
