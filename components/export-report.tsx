"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/context/data-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ExportReport() {
  const { gdpGrowthData, tradeBalanceData, selectedCountry, downloadTemplateCSV } = useData()
  const [isExporting, setIsExporting] = useState(false)

  // Helper to get country display name from the value
  const getCountryDisplayName = (countryValue: string) => {
    const countryMap: Record<string, string> = {
      all: "All ASEAN Countries",
      brunei: "Brunei",
      cambodia: "Cambodia",
      indonesia: "Indonesia",
      laos: "Laos",
      malaysia: "Malaysia",
      myanmar: "Myanmar",
      philippines: "Philippines",
      singapore: "Singapore",
      thailand: "Thailand",
      vietnam: "Vietnam"
    }
    return countryMap[countryValue] || countryValue
  }

  // Generate GDP Growth Components CSV with country column
  const generateGdpCsvContent = () => {
    // CSV for absolute GDP component values
    const baseGDP = 100 // base GDP in billion USD
    const header = "country,year,consumption,investment,government,netExports,tradeVolume"
    const rows = gdpGrowthData.map(item => {
      const consumptionAbs = parseFloat((item.consumption * baseGDP / 100).toFixed(1))
      const investmentAbs = parseFloat((item.investment * baseGDP / 100).toFixed(1))
      const governmentAbs = parseFloat((item.government * baseGDP / 100).toFixed(1))
      const netExportsAbs = parseFloat((item.netExports * baseGDP / 100).toFixed(1))
      return `${selectedCountry},${item.year},${consumptionAbs},${investmentAbs},${governmentAbs},${netExportsAbs},${item.tradeVolume}`
    }).join('\n')
    return `${header}\n${rows}`
  }
  
  // Generate Trade Balance CSV with country column
  const generateTradeCsvContent = () => {
    // CSV header
    const header = "country,year,exports,imports,balance"
    
    // CSV rows with current selected country
    let rows = tradeBalanceData.map(item => 
      `${selectedCountry},${item.year},${item.exports},${item.imports},${item.balance}`
    ).join('\n')
    
    return `${header}\n${rows}`
  }

  const downloadCsv = (content: string, filename: string) => {
    try {
      setIsExporting(true)
      
      // Create a Blob with the content
      const blob = new Blob([content], { type: 'text/csv' })
      
      // Create a download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsExporting(false)
      }, 100)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      setIsExporting(false)
    }
  }

  const handleExportGdp = () => {
    const countryDisplayName = getCountryDisplayName(selectedCountry)
    const csvContent = generateGdpCsvContent()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
    const filename = `GDP_Growth_Components.csv`
    
    downloadCsv(csvContent, filename)
  }

  const handleExportTrade = () => {
    const countryDisplayName = getCountryDisplayName(selectedCountry)
    const csvContent = generateTradeCsvContent()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
    const filename = `Trade_Balance.csv`
    
    downloadCsv(csvContent, filename)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Download CSV"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportGdp}>
          GDP Growth
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportTrade}>
          Trade Balance
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 