"use client"

import { useState } from "react"
import { ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react'
import Link from "next/link"
import React from "react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { IndustryDataUploader } from "./industry-data-uploader"
import { IndustryExport } from "./industry-export"
import { useIndustryData, IndustryData, SubIndustry } from "@/lib/context/industry-data-context"

// Sample industry impact data
const industries = [
  {
    id: "tech",
    name: "Technology",
    exportValue: 78.4,
    importValue: 42.1,
    tariffImpact: -12.3,
    gdpImpact: -0.8,
    riskLevel: "High",
    subIndustries: [
      { name: "Semiconductors", impact: -18.5, companies: ["TSMC", "UMC", "GlobalFoundries", "Micron", "Intel"] },
      { name: "Consumer Electronics", impact: -9.2, companies: ["Samsung", "LG", "Sony", "Foxconn", "Acer"] },
      { name: "Software", impact: -4.1, companies: ["Microsoft", "Oracle", "SAP", "Salesforce", "Adobe"] },
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    exportValue: 92.6,
    importValue: 31.8,
    tariffImpact: -8.7,
    gdpImpact: -0.6,
    riskLevel: "Medium",
    subIndustries: [
      { name: "Automotive", impact: -7.2, companies: ["Toyota", "Honda", "Hyundai", "Proton", "Mitsubishi"] },
      {
        name: "Machinery",
        impact: -9.8,
        companies: ["Caterpillar", "Komatsu", "Hitachi", "Mitsubishi Heavy", "Doosan"],
      },
      { name: "Textiles", impact: -6.4, companies: ["Uniqlo", "H&M", "Zara", "Nike", "Adidas"] },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture",
    exportValue: 45.3,
    importValue: 18.7,
    tariffImpact: -5.2,
    gdpImpact: -0.4,
    riskLevel: "Medium",
    subIndustries: [
      { name: "Palm Oil", impact: -4.8, companies: ["Sime Darby", "IOI Corp", "Wilmar", "Golden Agri", "Felda"] },
      { name: "Rice", impact: -3.1, companies: ["CP Foods", "San Miguel", "Olam", "Wilmar", "Bernas"] },
      { name: "Rubber", impact: -6.5, companies: ["Sri Trang", "Top Glove", "Hartalega", "Kossan", "Supermax"] },
    ],
  },
  {
    id: "energy",
    name: "Energy",
    exportValue: 68.9,
    importValue: 29.4,
    tariffImpact: -3.8,
    gdpImpact: -0.3,
    riskLevel: "Low",
    subIndustries: [
      { name: "Oil & Gas", impact: -2.9, companies: ["Petronas", "PTT", "Pertamina", "PetroVietnam", "Shell"] },
      {
        name: "Renewable Energy",
        impact: -4.2,
        companies: ["Sunseap", "First Solar", "Risen Energy", "JinkoSolar", "Trina Solar"],
      },
      { name: "Coal", impact: -3.6, companies: ["Adaro", "Bumi Resources", "Banpu", "Indo Tambangraya", "Semirara"] },
    ],
  },
  {
    id: "services",
    name: "Services",
    exportValue: 77.6,
    importValue: 47.4,
    tariffImpact: -2.1,
    gdpImpact: -0.2,
    riskLevel: "Low",
    subIndustries: [
      { name: "Financial Services", impact: -1.8, companies: ["DBS", "OCBC", "UOB", "Maybank", "Bangkok Bank"] },
      {
        name: "Tourism",
        impact: -2.4,
        companies: ["AirAsia", "Singapore Airlines", "Thai Airways", "Minor Hotels", "Genting"],
      },
      {
        name: "Telecommunications",
        impact: -1.9,
        companies: ["Singtel", "Telkom Indonesia", "AIS", "Globe Telecom", "PLDT"],
      },
    ],
  },
]

export function IndustryImpactTable() {
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null)
  const { industryData } = useIndustryData()

  const toggleIndustry = (id: string) => {
    setExpandedIndustry(expandedIndustry === id ? null : id)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "text-red-500"
      case "Medium":
        return "text-amber-500"
      case "Low":
        return "text-green-500"
      default:
        return ""
    }
  }

  const getImpactColor = (impact: number) => {
    if (impact <= -10) return "bg-red-500"
    if (impact <= -5) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <IndustryDataUploader />
        <IndustryExport />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Industry</TableHead>
              <TableHead className="text-right">Export Value ($B)</TableHead>
              <TableHead className="text-right">Import Value ($B)</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  Tariff Impact (%)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">GDP Impact (%)</TableHead>
              <TableHead className="text-right">Risk Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {industryData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <p className="text-muted-foreground">No industry data available</p>
                    <p className="text-sm text-muted-foreground">Click "Upload Industry Data" to add data</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              industryData.map((industry: IndustryData) => (
                <React.Fragment key={industry.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleIndustry(industry.id)}
                      >
                        {expandedIndustry === industry.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{industry.name}</TableCell>
                    <TableCell className="text-right">{industry.exportValue}</TableCell>
                    <TableCell className="text-right">{industry.importValue}</TableCell>
                    <TableCell className="text-right text-red-500">{industry.tariffImpact}%</TableCell>
                    <TableCell className="text-right text-red-500">{industry.gdpImpact}%</TableCell>
                    <TableCell className={`text-right ${getRiskColor(industry.riskLevel)}`}>
                      {industry.riskLevel}
                    </TableCell>
                  </TableRow>
                  {expandedIndustry === industry.id && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-4">
                          <h4 className="mb-2 font-semibold">Key Export Products</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Impact (%)</TableHead>
                                <TableHead>Top Companies</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {industry.subIndustries.map((subIndustry: SubIndustry, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>{subIndustry.name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="text-red-500">{subIndustry.impact}%</span>
                                      <Progress
                                        value={Math.abs(subIndustry.impact) * 5}
                                        className={`h-2 w-[100px] ${getImpactColor(subIndustry.impact)}`}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell>{subIndustry.companies.join(", ")}</TableCell>
                                  <TableCell className="text-right">
                                    <Link href={`/company-impact?industry=${industry.id}&subIndustry=${index}`}>
                                      <Button variant="outline" size="sm">
                                        View Companies
                                      </Button>
                                    </Link>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
