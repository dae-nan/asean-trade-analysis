"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const countries = [
  {
    value: "all",
    label: "All ASEAN Countries",
  },
  {
    value: "brunei",
    label: "Brunei",
  },
  {
    value: "cambodia",
    label: "Cambodia",
  },
  {
    value: "indonesia",
    label: "Indonesia",
  },
  {
    value: "laos",
    label: "Laos",
  },
  {
    value: "malaysia",
    label: "Malaysia",
  },
  {
    value: "myanmar",
    label: "Myanmar",
  },
  {
    value: "philippines",
    label: "Philippines",
  },
  {
    value: "singapore",
    label: "Singapore",
  },
  {
    value: "thailand",
    label: "Thailand",
  },
  {
    value: "vietnam",
    label: "Vietnam",
  },
]

export function CountrySelector() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("all")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[220px] justify-between">
          {value ? countries.find((country) => country.value === value)?.label : "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === country.value ? "opacity-100" : "opacity-0")} />
                  {country.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
