"use client"

import React, { useEffect, useState } from "react"
import { Control, FormProvider, useFormContext, useForm} from "react-hook-form"
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

interface PlaceOwnerSelectProps {
    name: string
    control: Control<any>;
    label: string;
}

export default function PlaceOwnerSelect({ control, name, label }: PlaceOwnerSelectProps) {
    return (
      <FormProvider {...useForm<FormValues>()}>
        <FormField control={control} name={name} render={() => (
              <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                      <PlaceOwnerSelectContent />
                  </FormControl>
                  <FormMessage />
              </FormItem>
          )}/>
      </FormProvider>
    )
}

const PlaceOwnerSelectContent: React.FC = () => {
  const formContext = useFormContext<FormValues>();
  const currentValue = formContext ? formContext.watch('contactId') : '';

  const [open, setOpen] = useState(false);
  const [owners, setOwners] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function loadPlaceTypes() {
      try {
        const response = await fetch(placeOwnerRoute)
        const data = await response.json()
        setOwners(data.map((type: any) => ({ value: type.ledaId, label: type.ledaId + ' - ' + type.fullName})))
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
                ? owners.find((type) => type.value === currentValue)?.label
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
                  {owners.map((type) => (
                    <CommandItem
                      key={type.value}
                      value={type.value}
                      onSelect={() => {
                        formContext.setValue('contactId', type.value)
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
