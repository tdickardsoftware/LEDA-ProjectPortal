"use client"

import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
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

// Define the form values interface
interface FormValues {
    contactId: string
}

const PlaceOwnerSelector: React.FC = () => {
  // Use form context to get watch and setValue functions
  const { watch, setValue } = useFormContext<FormValues>()
  // Watch the placeType field value
  const contactId = watch("contactId")
  // State to manage the popover open/close status
  const [open, setOpen] = useState(false)
  // State to store the fetched place types
  const [memberTypes, setMemberTypes] = useState<{ value: string; label: string }[]>([])

  // Fetch place types from the API endpoint
  useEffect(() => {
    async function loadPlaceTypes() {
      try {
        const response = await fetch('/api/place/placeOwnerGet')
        const data = await response.json()
        setMemberTypes(data.map((type: any) => ({ value: type.ledaId, label: type.ledaId + ' - ' + type.fullName})))
      } catch (error) {
        console.error("Failed to fetch place owners", error)
      }
    }
    loadPlaceTypes()
  }, [])

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
              {contactId
                ? memberTypes.find((type) => type.value === contactId)?.label
                : "Select a place owner..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 bg-white">
            <Command>
              <CommandInput placeholder="Search place type..." />
              <CommandEmpty>No place owner found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {memberTypes.map((type) => (
                    <CommandItem
                      key={type.value}
                      value={type.value}
                      onSelect={() => {
                        setValue("contactId", type.value)
                        setOpen(false)
                      }}
                      className="hover:bg-gray-200"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          type.value === contactId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {type.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default PlaceOwnerSelector
