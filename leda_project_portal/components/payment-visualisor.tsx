"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Button } from "./ui/button";

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
  
  // Capitalize first letter of type
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = payments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(payments.length / recordsPerPage);

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
            // Convert the field name from "date" to "paymentDate" to match the interface
            const dates = Array.isArray(data) 
                ? data.map(item => ({ paymentDate: item.date })) 
                : (data?.rows || []).map((item: { date: string }) => ({ paymentDate: item.date }));
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
      <div className="flex justify-between items-center mb-4">
        <Button className="hover:bg-gray-100 border-gray-300 text-gray-700">
          Add {capitalizedType} Payment
        </Button>
        <Select
          value={selectedDate}
          onValueChange={setSelectedDate}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent className="bg-white">
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
        <>
          <Accordion type="single" collapsible className="w-full">
            {currentRecords.map((payment) => (
              <AccordionItem key={payment.paymentNbr} value={`payment-${payment.paymentNbr}`}>
                <AccordionTrigger className="flex flex-row w-full text-left px-4 py-2 hover:bg-gray-50 gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Payment #</span>
                        <span>{payment.paymentNbr}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">LEDA ID</span>
                        <span>{payment.ledaId}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Name</span>
                        <span>{payment.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Amount</span>
                        <span>{payment.amount}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Date</span>
                        <span>
                            {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Type:</p>
                      <p>{payment.type}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Payment Type:</p>
                      <p>{payment.paymentType}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Season Code:</p>
                      <p>{payment.seasonCode}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Fiscal Year:</p>
                      <p>{payment.fiscalYear}</p>
                    </div>
                    {payment.notes && (
                      <div className="col-span-2">
                        <p className="font-semibold">Notes:</p>
                        <p>{payment.notes}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">Comp:</p>
                      <p>{payment.comp ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Paid Off:</p>
                      <p>{payment.paidOff ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastRecord, payments.length)}
              </span>{" "}
              of <span className="font-medium">{payments.length}</span> results
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 
                    ? 'hover:bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed' 
                    : 'hover:bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show current page and two pages on either side if possible
                const pageNum = Math.min(
                  Math.max(currentPage - 2 + i, 1),
                  totalPages
                );
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? ' bg-gray-300 hover:bg-gray-100 border-gray-300 text-gray-700'
                        : 'bg-gray-200 hover:bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'hover:bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                    : 'hover:bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-40">
          <p>No payment records found.</p>
        </div>
      )}
    </div>
  );
}
