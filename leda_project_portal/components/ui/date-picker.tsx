// Import necessary modules and components
'use client'
import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { CalendarIcon } from 'lucide-react'
import 'react-day-picker/dist/style.css'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// DatePicker component definition
export function DatePicker({ onDateChange, initialMonth, dateSelected }: { onDateChange: (date: Date | undefined) => void, initialMonth?: Date, dateSelected: Date }) {
  // State to manage the selected date
  const [date, setDate] = React.useState<Date>(new Date(dateSelected.getTime() + dateSelected.getTimezoneOffset() * 60000))
  // State to manage the visibility of the popover
  const [isOpen, setIsOpen] = React.useState(false)

  // Handle date change
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Convert selected date to local time
      const localDate = new Date(selectedDate.getTime() + selectedDate.getTimezoneOffset() * 60000)
      setDate(localDate)
      onDateChange(localDate)
      setIsOpen(false)
      console.log(localDate)
    }
  }

  return (
    // Popover component to display the date picker
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          size="icon"
          className={cn(
            "h-8 w-8",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          initialFocus
          defaultMonth={initialMonth}
        />
      </PopoverContent>
    </Popover>
  )
}
