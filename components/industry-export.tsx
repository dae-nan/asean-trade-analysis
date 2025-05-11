"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIndustryData, IndustryData, SubIndustry } from "@/lib/context/industry-data-context"

export function IndustryExport() {
  const { industryData } = useIndustryData()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    try {
      setIsExporting(true)
      
      // Convert industryData to a flattened CSV format for export
      const rows: string[] = []
      
      // Add header
      rows.push("id,name,exportValue,importValue,tariffImpact,gdpImpact,riskLevel,productName,productImpact,companies")
      
      // Add data rows
      industryData.forEach((industry: IndustryData) => {
        // For each subindustry, create a row
        industry.subIndustries.forEach((subIndustry: SubIndustry) => {
          const companies = subIndustry.companies.join(', ')
          rows.push(`${industry.id},${industry.name},${industry.exportValue},${industry.importValue},${industry.tariffImpact},${industry.gdpImpact},${industry.riskLevel},${subIndustry.name},${subIndustry.impact},"${companies}"`)
        })
      })
      
      // Create and download the CSV
      const csvContent = rows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = "Industry_Impact_Data.csv"
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting || industryData.length === 0} className="ml-2">
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export Data"}
    </Button>
  )
} 