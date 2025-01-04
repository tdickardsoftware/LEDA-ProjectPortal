"use client"

import React, { useEffect, useState } from "react"
import { Control, useFormContext } from "react-hook-form"
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
import { placeOwnerRoute } from "@/lib/apiRoutes"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

interface FormValues {
    contactId: string
}

interface PlaceOwnerSelectorProps {
    name: string
    control: Control<any>;
}

interface PlaceOwnerSelectorContentProps {
  name: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function PlaceOwnerSelector({ control, name }: PlaceOwnerSelectorProps) {
    return (
        <FormField control={control} name={name} render={({ field }) => (
            <FormItem>
                <FormLabel>Place Owner *</FormLabel>
                <FormControl>
                    <PlaceOwnerSelectorComponent 
                      name={name}
                      defaultValue={field.value}
                      onChange={field.onChange}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}/>
    )
}

const PlaceOwnerSelectorComponent: React.FC<PlaceOwnerSelectorContentProps> = ({
  name,
  defaultValue,
  onChange
}) => {
  // Try to use form context if available, otherwise fall back to props
  const formContext = useFormContext<FormValues>();
  const [value, setValue] = useState(defaultValue || '');

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (formContext) {
      formContext.setValue('contactId', newValue);
    }
    onChange?.(newValue);
  };

  const currentValue = formContext ? formContext.watch('contactId') : value;

  // State to manage the popover open/close status
  const [open, setOpen] = useState(false)
  // State to store the fetched place types
  const [memberTypes, setMemberTypes] = useState<{ value: string; label: string }[]>([])

  // Fetch place types from the API endpoint
  useEffect(() => {
    async function loadPlaceTypes() {
      try {
        const response = await fetch(placeOwnerRoute
        )
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
              {currentValue
                ? memberTypes.find((type) => type.value === currentValue)?.label
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
                        handleValueChange(type.value)
                        setOpen(false)
                      }}
                      className="hover:bg-gray-200"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          type.value === currentValue ? "opacity-100" : "opacity-0"
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
