"use client"

import React from "react"
import { useFormContext, Controller } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define the form values interface
interface FormValues {
  gender: string
  customGender?: string
}

// List of gender options
const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
]

const GenderSelector: React.FC = () => {
  // Use form context to get control, watch, setValue, and register functions
  const { control, watch, setValue, register } = useFormContext<FormValues>()
  // Watch the gender field value
  const gender = watch("gender")
  // State to manage the popover open/close status
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="w-auto">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {gender
                ? genders.find((g) => g.value === gender)?.label
                : "Select a gender..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 bg-white">
            <Command>
              <CommandInput placeholder="Search gender..." />
              <CommandEmpty>No gender found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {genders.map((g) => (
                    <CommandItem
                      key={g.value}
                      value={g.value}
                      onSelect={() => {
                        setValue("gender", g.value)
                        if (g.value !== "Other") setValue("customGender", "")
                        setOpen(false)
                      }}
                      className="hover:bg-gray-200"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          g.value === gender ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {g.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {gender === "Other" && (
        <div className="flex items-center gap-2">
          <Label htmlFor="customGender" className="shrink-0">Custom Gender</Label>
          <Input
            id="customGender"
            type="text"
            placeholder="Enter gender"
            {...register("customGender")}
            className="w-[200px]"
          />
        </div>
      )}
    </div>
  )
}

export default GenderSelector
