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
export function DatePicker({ onDateChange, initialMonth }: { onDateChange: (date: Date | undefined) => void, initialMonth?: Date }) {
  const [date, setDate] = React.useState<Date>()

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onDateChange(selectedDate)
  }

  return (
    <Popover>
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
          modifiersClassNames={{
            selected: 'bg-blue-500 text-white'
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
