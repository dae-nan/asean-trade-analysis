"use client"

import * as React from "react"
import { useData } from "@/lib/context/data-context"
import { Button } from "@/components/ui/button"

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useData()
  React.useEffect(() => {
    if (selectedCountry !== "indonesia") {
      setSelectedCountry("indonesia")
    }
  }, [selectedCountry, setSelectedCountry])

  return (
    <Button variant="outline" className="w-[200px] justify-center" disabled>
      Indonesia
    </Button>
  )
}
