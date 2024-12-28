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
  memberType: string
}

const PlayerTypeSelector: React.FC = () => {
  // Use form context to get watch and setValue functions
  const { watch, setValue } = useFormContext<FormValues>()
  // Watch the memberType field value
  const memberType = watch("memberType")
  // State to manage the popover open/close status
  const [open, setOpen] = useState(false)
  // State to store the fetched member types
  const [memberTypes, setMemberTypes] = useState<{ value: string; label: string }[]>([])

  // Fetch member types from the API endpoint
  useEffect(() => {
    async function loadMemberTypes() {
      try {
        const response = await fetch('/api/maintenance/peopleType/peopleTypeGet')
        const data = await response.json()
        setMemberTypes(data.map((type: any) => ({ value: type.peopleTypeCode, label: type.peopleTypeCode + ' - ' + type.desc})))
      } catch (error) {
        console.error("Failed to fetch member types", error)
      }
    }
    loadMemberTypes()
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
              {memberType
                ? memberTypes.find((type) => type.value === memberType)?.label
                : "Select a member type..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 bg-white">
            <Command>
              <CommandInput placeholder="Search member type..." />
              <CommandEmpty>No member type found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {memberTypes.map((type) => (
                    <CommandItem
                      key={type.value}
                      value={type.value}
                      onSelect={() => {
                        setValue("memberType", type.value)
                        setOpen(false)
                      }}
                      className="hover:bg-gray-200"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          type.value === memberType ? "opacity-100" : "opacity-0"
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

export default PlayerTypeSelector
