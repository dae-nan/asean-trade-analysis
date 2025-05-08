"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const scenarios = [
  {
    value: "baseline",
    label: "Baseline (Current Tariffs)",
  },
  {
    value: "scenario1",
    label: "Scenario 1: 10% Additional Tariffs",
  },
  {
    value: "scenario2",
    label: "Scenario 2: 25% Additional Tariffs",
  },
  {
    value: "scenario3",
    label: "Scenario 3: Targeted Tech Tariffs",
  },
  {
    value: "scenario4",
    label: "Scenario 4: Trade War Escalation",
  },
]

export function ScenarioSelector() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("baseline")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[300px] justify-between">
          {value ? scenarios.find((scenario) => scenario.value === value)?.label : "Select scenario..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search scenario..." />
          <CommandList>
            <CommandEmpty>No scenario found.</CommandEmpty>
            <CommandGroup>
              {scenarios.map((scenario) => (
                <CommandItem
                  key={scenario.value}
                  value={scenario.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === scenario.value ? "opacity-100" : "opacity-0")} />
                  {scenario.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
