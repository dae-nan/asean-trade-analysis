"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronDown, Globe, MapPin, Info, ZoomIn, ZoomOut, Maximize2, Minimize2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

// Types for our value chain data
interface ValueChainSubStage {
  id: string
  name: string
  regions: string
  description?: string
  companies?: string[]
}

interface ValueChainStage {
  stage: string
  description?: string
  subStages: ValueChainSubStage[]
}

interface Company {
  id: number
  name: string
  industry: string
  impact: number
  marketCap: number
  revenue: number
  employeeCount: number
  mainMarkets: string[]
  description?: string
  headquarters?: string
  founded?: number
  ceo?: string
}

interface CountryData {
  code: string
  name: string
  companies: string[]
  activities: string[]
  tradeVolume?: number
  tradeBalance?: number
  gdpImpact?: number
}

interface ValueChainVisualizationProps {
  company: Company | null
  valueChain: ValueChainStage[] | null
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCountry?: string | null
}

// Country data mapping
const countryData: Record<string, CountryData> = {
  US: {
    code: "US",
    name: "United States",
    companies: ["Intel", "GlobalFoundries", "Micron"],
    activities: ["Chip Architecture & IP", "EDA Tools & Simulation", "Front-end Processing"],
    tradeVolume: 124.5,
    tradeBalance: -18.7,
    gdpImpact: -0.3,
  },
  Taiwan: {
    code: "TW",
    name: "Taiwan",
    companies: ["TSMC", "UMC", "MediaTek"],
    activities: [
      "Chip Architecture & IP",
      "Silicon Ingot & Wafer Production",
      "Front-end Processing",
      "Packaging",
      "Testing & Quality Control",
    ],
    tradeVolume: 89.3,
    tradeBalance: 42.1,
    gdpImpact: -1.2,
  },
  "South Korea": {
    code: "KR",
    name: "South Korea",
    companies: ["Samsung", "SK Hynix"],
    activities: ["Chip Architecture & IP", "Front-end Processing"],
    tradeVolume: 76.2,
    tradeBalance: 31.5,
    gdpImpact: -0.8,
  },
  Japan: {
    code: "JP",
    name: "Japan",
    companies: ["Kioxia", "Renesas", "Sony Semiconductor"],
    activities: ["Silicon Ingot & Wafer Production"],
    tradeVolume: 52.8,
    tradeBalance: 24.3,
    gdpImpact: -0.5,
  },
  Germany: {
    code: "DE",
    name: "Germany",
    companies: ["Infineon", "Bosch"],
    activities: ["EDA Tools & Simulation", "Silicon Ingot & Wafer Production"],
    tradeVolume: 41.6,
    tradeBalance: 18.9,
    gdpImpact: -0.4,
  },
  Israel: {
    code: "IL",
    name: "Israel",
    companies: ["Tower Semiconductor", "Mellanox"],
    activities: ["EDA Tools & Simulation"],
    tradeVolume: 18.3,
    tradeBalance: 9.7,
    gdpImpact: -0.6,
  },
  China: {
    code: "CN",
    name: "China",
    companies: ["SMIC", "Hua Hong"],
    activities: ["Packaging"],
    tradeVolume: 112.7,
    tradeBalance: -45.3,
    gdpImpact: -0.7,
  },
  Malaysia: {
    code: "MY",
    name: "Malaysia",
    companies: ["Inari Amertron", "Unisem"],
    activities: ["Packaging", "Testing & Quality Control"],
    tradeVolume: 32.5,
    tradeBalance: 17.8,
    gdpImpact: -0.9,
  },
  Philippines: {
    code: "PH",
    name: "Philippines",
    companies: ["Integrated Micro-Electronics"],
    activities: ["Testing & Quality Control"],
    tradeVolume: 21.4,
    tradeBalance: 12.6,
    gdpImpact: -0.7,
  },
  Singapore: {
    code: "SG",
    name: "Singapore",
    companies: ["GlobalFoundries Singapore", "Siltronic"],
    activities: ["Logistics & Warehousing"],
    tradeVolume: 45.8,
    tradeBalance: 23.1,
    gdpImpact: -1.1,
  },
  "Hong Kong": {
    code: "HK",
    name: "Hong Kong",
    companies: ["ASM Pacific Technology"],
    activities: ["Logistics & Warehousing"],
    tradeVolume: 38.2,
    tradeBalance: 19.5,
    gdpImpact: -0.8,
  },
  Netherlands: {
    code: "NL",
    name: "Netherlands",
    companies: ["NXP", "ASML"],
    activities: ["Logistics & Warehousing"],
    tradeVolume: 29.7,
    tradeBalance: 14.3,
    gdpImpact: -0.3,
  },
  Vietnam: {
    code: "VN",
    name: "Vietnam",
    companies: ["Intel Vietnam", "Samsung Vietnam"],
    activities: ["OEM Integration"],
    tradeVolume: 27.3,
    tradeBalance: 15.8,
    gdpImpact: -1.2,
  },
  Mexico: {
    code: "MX",
    name: "Mexico",
    companies: ["Foxconn Mexico", "Jabil Circuit Mexico"],
    activities: ["OEM Integration"],
    tradeVolume: 19.8,
    tradeBalance: 10.2,
    gdpImpact: -0.5,
  },
}

// Helper function to check if a company is involved in a sub-stage
const isCompanyInSubStage = (subStage: ValueChainSubStage, companyName: string): boolean => {
  return subStage.name.includes(companyName)
}

// Helper function to check if a country is involved in a sub-stage
const isCountryInSubStage = (subStage: ValueChainSubStage, countryName: string): boolean => {
  return subStage.regions.includes(countryName)
}

export function ValueChainVisualization({
  company,
  valueChain,
  open,
  onOpenChange,
  selectedCountry,
}: ValueChainVisualizationProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [expandedStages, setExpandedStages] = useState<string[]>([])
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [countryInfo, setCountryInfo] = useState<CountryData | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Reset state when company changes
  useEffect(() => {
    if (company) {
      setZoomLevel(1)
      setExpandedStages(valueChain?.map((stage) => stage.stage) || [])
      setSelectedStage(null)

      // If a country is selected, find its data
      if (selectedCountry && countryData[selectedCountry]) {
        setCountryInfo(countryData[selectedCountry])
      } else {
        setCountryInfo(null)
      }
    }
  }, [company, valueChain, selectedCountry])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  // Toggle stage expansion
  const toggleStage = (stage: string) => {
    setExpandedStages((prev) => (prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]))
  }

  // Select a stage for focus
  const handleStageSelect = (stage: string) => {
    setSelectedStage((prev) => (prev === stage ? null : stage))
  }

  // Adjust zoom level
  const handleZoom = (increment: boolean) => {
    setZoomLevel((prev) => {
      const newZoom = increment ? prev + 0.1 : prev - 0.1
      return Math.max(0.5, Math.min(1.5, newZoom))
    })
  }

  // Render country information panel
  const renderCountryInfo = () => {
    if (!countryInfo) return null

    return (
      <div className="bg-muted/30 p-4 rounded-lg mb-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            {countryInfo.name}
          </h3>
          <Badge variant="outline" className="ml-2">
            {countryInfo.code}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background rounded p-3 border border-border">
            <div className="text-sm text-muted-foreground mb-1">Trade Volume</div>
            <div className="text-lg font-medium">${countryInfo.tradeVolume}B</div>
          </div>
          <div className="bg-background rounded p-3 border border-border">
            <div className="text-sm text-muted-foreground mb-1">Trade Balance</div>
            <div className="text-lg font-medium">${countryInfo.tradeBalance}B</div>
          </div>
          <div className="bg-background rounded p-3 border border-border">
            <div className="text-sm text-muted-foreground mb-1">GDP Impact</div>
            <div className="text-lg font-medium text-red-500">{countryInfo.gdpImpact}%</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Companies in {countryInfo.name}</h4>
            <div className="flex flex-wrap gap-1">
              {countryInfo.companies.map((companyName) => (
                <Badge key={companyName} variant={companyName === company?.name ? "default" : "outline"}>
                  {companyName}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Value Chain Activities</h4>
            <div className="flex flex-wrap gap-1">
              {countryInfo.activities.map((activity) => (
                <Badge key={activity} variant="secondary">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render the content based on device type
  const renderContent = () => {
    if (!company || !valueChain) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No value chain data available</p>
        </div>
      )
    }

    const content = (
      <div ref={containerRef} className="relative overflow-auto" style={{ maxHeight: isFullscreen ? "100vh" : "70vh" }}>
        {/* Controls */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-2 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleZoom(false)} disabled={zoomLevel <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleZoom(true)} disabled={zoomLevel >= 1.5}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">{Math.round(zoomLevel * 100)}%</span>
          </div>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Country information panel */}
        {renderCountryInfo()}

        {/* Value Chain Visualization */}
        <div
          className="space-y-6 p-4 transition-all duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
        >
          {valueChain.map((stage, stageIndex) => {
            const isExpanded = expandedStages.includes(stage.stage)
            const isFocused = selectedStage === stage.stage || selectedStage === null

            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isFocused ? 1 : 0.5,
                  y: 0,
                  scale: isFocused ? 1 : 0.95,
                }}
                transition={{ duration: 0.3, delay: stageIndex * 0.1 }}
                className={`rounded-lg border ${isFocused ? "border-primary/50" : "border-border"} overflow-hidden`}
              >
                <div
                  className={`flex items-center justify-between p-4 cursor-pointer ${isFocused ? "bg-primary/5" : "bg-background"}`}
                  onClick={() => toggleStage(stage.stage)}
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStageSelect(stage.stage)
                      }}
                    >
                      {selectedStage === stage.stage ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <h3 className="text-lg font-semibold">{stage.stage}</h3>
                  </div>
                  <div className="flex items-center">
                    {stage.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stage.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3 bg-background">
                    {stage.subStages.map((subStage) => {
                      const isCompanyStage = isCompanyInSubStage(subStage, company.name)
                      const isCountryStage = selectedCountry ? isCountryInSubStage(subStage, selectedCountry) : false

                      return (
                        <motion.div
                          key={subStage.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`grid grid-cols-12 gap-2 p-3 rounded-md border ${
                            isCompanyStage && isCountryStage
                              ? "border-primary bg-primary/10"
                              : isCompanyStage
                                ? "border-primary/50 bg-primary/5"
                                : isCountryStage
                                  ? "border-secondary bg-secondary/10"
                                  : "border-border"
                          }`}
                        >
                          <div className="col-span-1 font-medium flex items-center">{subStage.id}</div>
                          <div className="col-span-7 md:col-span-6">
                            <div className="font-medium">
                              {subStage.name}
                              {isCompanyStage && (
                                <Badge className="ml-2" variant="default">
                                  {company.name}
                                </Badge>
                              )}
                            </div>
                            {subStage.description && (
                              <p className="text-sm text-muted-foreground mt-1">{subStage.description}</p>
                            )}
                          </div>
                          <div className="col-span-4 md:col-span-5 flex flex-wrap items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {subStage.regions.split(", ").map((region) => {
                              const isHighlighted = region === selectedCountry
                              const isCompanyRegion = company.mainMarkets.includes(region)

                              return (
                                <Badge
                                  key={region}
                                  variant={isHighlighted ? "default" : isCompanyRegion ? "secondary" : "outline"}
                                  className="text-xs"
                                >
                                  {region}
                                </Badge>
                              )
                            })}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )

    return content
  }

  // Render dialog for desktop or drawer for mobile
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Value Chain: {company?.name}</DialogTitle>
            <DialogDescription>
              Industry: {company?.industry} | Impact:{" "}
              <span className={company && company.impact <= -10 ? "text-red-500" : "text-amber-500"}>
                {company?.impact}%
              </span>
            </DialogDescription>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Value Chain: {company?.name}</DrawerTitle>
          <DrawerDescription>
            Industry: {company?.industry} | Impact:{" "}
            <span className={company && company.impact <= -10 ? "text-red-500" : "text-amber-500"}>
              {company?.impact}%
            </span>
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{renderContent()}</div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
