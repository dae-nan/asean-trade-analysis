"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ValueChainVisualization } from "@/components/value-chain-visualization"
import { useMediaQuery } from "@/hooks/use-media-query"

// Sample company data
const companiesData = [
  {
    id: 1,
    name: "TSMC",
    industry: "Semiconductors",
    impact: -21.3,
    marketCap: 512.4,
    revenue: 73.6,
    employeeCount: 73400,
    mainMarkets: ["Taiwan", "China", "US"],
    headquarters: "Hsinchu, Taiwan",
    founded: 1987,
    ceo: "C.C. Wei",
  },
  {
    id: 2,
    name: "Samsung",
    industry: "Consumer Electronics",
    impact: -11.4,
    marketCap: 342.1,
    revenue: 197.6,
    employeeCount: 267937,
    mainMarkets: ["South Korea", "Vietnam", "Indonesia"],
    headquarters: "Seoul, South Korea",
    founded: 1969,
    ceo: "Kim Ki Nam",
  },
  {
    id: 3,
    name: "Petronas",
    industry: "Oil & Gas",
    impact: -8.7,
    marketCap: 97.3,
    revenue: 63.2,
    employeeCount: 48000,
    mainMarkets: ["Malaysia", "Indonesia", "Vietnam"],
    headquarters: "Kuala Lumpur, Malaysia",
    founded: 1974,
    ceo: "Tengku Muhammad Taufik",
  },
  {
    id: 4,
    name: "DBS",
    industry: "Financial Services",
    impact: -4.2,
    marketCap: 76.8,
    revenue: 14.5,
    employeeCount: 33000,
    mainMarkets: ["Singapore", "Indonesia", "Hong Kong"],
    headquarters: "Singapore",
    founded: 1968,
    ceo: "Piyush Gupta",
  },
  {
    id: 5,
    name: "Top Glove",
    industry: "Rubber",
    impact: -9.8,
    marketCap: 3.2,
    revenue: 1.8,
    employeeCount: 22000,
    mainMarkets: ["Malaysia", "Thailand", "US"],
    headquarters: "Klang, Malaysia",
    founded: 1991,
    ceo: "Lim Wee Chai",
  },
  {
    id: 6,
    name: "Sime Darby",
    industry: "Palm Oil",
    impact: -7.3,
    marketCap: 5.6,
    revenue: 9.3,
    employeeCount: 20000,
    mainMarkets: ["Malaysia", "Indonesia", "China"],
    headquarters: "Kuala Lumpur, Malaysia",
    founded: 1910,
    ceo: "Jeffri Salim Davidson",
  },
  {
    id: 7,
    name: "Toyota",
    industry: "Automotive",
    impact: -6.8,
    marketCap: 238.5,
    revenue: 280.5,
    employeeCount: 370000,
    mainMarkets: ["Japan", "Thailand", "Indonesia"],
    headquarters: "Toyota City, Japan",
    founded: 1937,
    ceo: "Akio Toyoda",
  },
  {
    id: 8,
    name: "Singapore Airlines",
    industry: "Tourism",
    impact: -5.4,
    marketCap: 12.7,
    revenue: 16.3,
    employeeCount: 26000,
    mainMarkets: ["Singapore", "ASEAN", "Global"],
    headquarters: "Singapore",
    founded: 1947,
    ceo: "Goh Choon Phong",
  },
]

// Mock value chain data by industry
const valueChainsByIndustry = {
  Semiconductors: [
    {
      stage: "A. Research & Design",
      description: "Development of chip architecture, intellectual property, and design tools",
      subStages: [
        {
          id: "A1",
          name: "Chip Architecture & IP",
          regions: "US, Taiwan, South Korea",
          description: "Development of processor architectures, memory designs, and specialized IP blocks",
        },
        {
          id: "A2",
          name: "EDA Tools & Simulation",
          regions: "US, Germany, Israel",
          description: "Electronic design automation software for chip design, verification and testing",
        },
      ],
    },
    {
      stage: "B. Wafer Fabrication",
      description: "Manufacturing of silicon wafers and front-end processing",
      subStages: [
        {
          id: "B1",
          name: "Silicon Ingot & Wafer Production",
          regions: "Japan, Germany, Taiwan",
          description: "Growing silicon crystals and slicing them into thin wafers",
        },
        {
          id: "B2",
          name: "Front-end Processing (TSMC)",
          regions: "Taiwan, South Korea, US",
          description: "Photolithography, etching, and other processes to create transistors and circuits on wafers",
        },
      ],
    },
    {
      stage: "C. Assembly & Testing",
      description: "Packaging of chips and quality control testing",
      subStages: [
        {
          id: "C1",
          name: "Packaging",
          regions: "Taiwan, China, Malaysia",
          description: "Cutting wafers into individual chips and packaging them for protection",
        },
        {
          id: "C2",
          name: "Testing & Quality Control",
          regions: "Taiwan, Malaysia, Philippines",
          description: "Electrical testing and quality assurance of finished chips",
        },
      ],
    },
    {
      stage: "D. Distribution",
      description: "Logistics, warehousing and integration into end products",
      subStages: [
        {
          id: "D1",
          name: "Logistics & Warehousing",
          regions: "Singapore, Hong Kong, Netherlands",
          description: "Storage and distribution of semiconductor products to global markets",
        },
        {
          id: "D2",
          name: "OEM Integration",
          regions: "China, Vietnam, Mexico",
          description: "Integration of chips into electronic devices and systems by manufacturers",
        },
      ],
    },
  ],
  "Consumer Electronics": [
    {
      stage: "A. Design & Engineering",
      description: "Product design, R&D, and software development",
      subStages: [
        {
          id: "A1",
          name: "Product Design & R&D",
          regions: "South Korea, US, Japan",
          description: "Development of new consumer electronics products and technologies",
        },
        {
          id: "A2",
          name: "Software Development",
          regions: "South Korea, India, US",
          description: "Creation of operating systems, applications, and firmware for devices",
        },
      ],
    },
    {
      stage: "B. Component Manufacturing",
      description: "Production of key electronic components",
      subStages: [
        {
          id: "B1",
          name: "Display Panels (Samsung)",
          regions: "South Korea, Vietnam, China",
          description: "Manufacturing of LCD, OLED, and other display technologies",
        },
        {
          id: "B2",
          name: "Processors & Memory",
          regions: "South Korea, Taiwan, China",
          description: "Production of CPUs, memory chips, and other core components",
        },
      ],
    },
    {
      stage: "C. Assembly",
      description: "Final product assembly and quality control",
      subStages: [
        {
          id: "C1",
          name: "Final Assembly",
          regions: "Vietnam, Indonesia, Brazil",
          description: "Assembly of components into finished consumer electronics products",
        },
        {
          id: "C2",
          name: "Quality Control",
          regions: "Vietnam, South Korea, Indonesia",
          description: "Testing and quality assurance of finished products",
        },
      ],
    },
    {
      stage: "D. Distribution & Retail",
      description: "Global distribution and retail sales",
      subStages: [
        {
          id: "D1",
          name: "Global Distribution",
          regions: "Singapore, Netherlands, UAE",
          description: "Worldwide logistics and supply chain management for finished products",
        },
        {
          id: "D2",
          name: "Retail & After-sales",
          regions: "Global",
          description: "Retail sales, customer support, and warranty services",
        },
      ],
    },
  ],
  "Oil & Gas": [
    {
      stage: "A. Upstream Exploration & Licensing",
      description: "Exploration for oil and gas reserves and acquisition of drilling rights",
      subStages: [
        {
          id: "A1",
          name: "Geological surveys, seismic data",
          regions: "UK, Norway, US",
          description: "Collection and analysis of geological data to identify potential reserves",
        },
        {
          id: "A2",
          name: "PSA / concession bidding",
          regions: "GCC, Brazil, Norway",
          description: "Negotiation and acquisition of production sharing agreements and concessions",
        },
      ],
    },
    {
      stage: "B. Upstream Production",
      description: "Extraction of oil and gas from reserves",
      subStages: [
        {
          id: "B1",
          name: "On-shore drilling",
          regions: "US (Permian), Russia, China, Saudi Arabia",
          description: "Drilling and extraction of oil and gas from land-based wells",
        },
        {
          id: "B2",
          name: "Offshore platforms (deep-water)",
          regions: "Brazil, Norway, US (GoM)",
          description: "Drilling and extraction from offshore platforms in deep water locations",
        },
      ],
    },
    {
      stage: "C. Midstream (Transport & Storage)",
      description: "Transportation and storage of oil and gas",
      subStages: [
        {
          id: "C1",
          name: "Crude / product pipelines",
          regions: "US, Russia, China",
          description: "Pipeline networks for transporting crude oil and refined products",
        },
        {
          id: "C2",
          name: "LNG liquefaction & shipping (Petronas)",
          regions: "Qatar, Australia, US, Malaysia",
          description: "Conversion of natural gas to liquid form for shipping and transportation",
        },
        {
          id: "C3",
          name: "Storage hubs (tank farms, caverns)",
          regions: "US, Netherlands, Singapore",
          description: "Facilities for storing crude oil and refined products",
        },
      ],
    },
    {
      stage: "D. Downstream Processing",
      description: "Refining and processing of oil and gas into products",
      subStages: [
        {
          id: "D1",
          name: "Refining",
          regions: "China, US, India, Saudi Arabia",
          description: "Conversion of crude oil into usable petroleum products",
        },
        {
          id: "D2",
          name: "Petrochemicals (ethylene, propylene)",
          regions: "China, US, Saudi Arabia",
          description: "Production of chemicals derived from petroleum for industrial use",
        },
      ],
    },
    {
      stage: "E. Marketing & Distribution",
      description: "Sales and distribution of refined products",
      subStages: [
        {
          id: "E1",
          name: "Wholesale product trading",
          regions: "Switzerland, Singapore, UK",
          description: "Trading of petroleum products in bulk on global markets",
        },
        {
          id: "E2",
          name: "Retail fuel stations",
          regions: "US, China, Japan",
          description: "Consumer-facing fuel stations for retail sales",
        },
        {
          id: "E3",
          name: "Lubricants & specialty products",
          regions: "US, Germany, Japan",
          description: "Production and distribution of specialized petroleum products",
        },
      ],
    },
  ],
  "Financial Services": [
    {
      stage: "A. Capital Markets",
      description: "Investment banking and asset management services",
      subStages: [
        {
          id: "A1",
          name: "Investment Banking",
          regions: "Singapore, Hong Kong, US",
          description: "Underwriting, mergers and acquisitions, and capital raising services",
        },
        {
          id: "A2",
          name: "Asset Management",
          regions: "Singapore, Hong Kong, UK",
          description: "Management of investment portfolios for institutional and retail clients",
        },
      ],
    },
    {
      stage: "B. Commercial Banking",
      description: "Banking services for businesses and corporations",
      subStages: [
        {
          id: "B1",
          name: "Corporate Banking (DBS)",
          regions: "Singapore, Hong Kong, Indonesia",
          description: "Financial services for large corporations and multinational companies",
        },
        {
          id: "B2",
          name: "SME Banking",
          regions: "Singapore, Malaysia, Indonesia",
          description: "Banking services tailored for small and medium enterprises",
        },
      ],
    },
    {
      stage: "C. Retail Banking",
      description: "Banking services for individual consumers",
      subStages: [
        {
          id: "C1",
          name: "Consumer Banking",
          regions: "Singapore, Indonesia, India",
          description: "Personal banking services including accounts, loans, and credit cards",
        },
        {
          id: "C2",
          name: "Digital Banking",
          regions: "Singapore, Indonesia, Taiwan",
          description: "Online and mobile banking platforms and services",
        },
      ],
    },
    {
      stage: "D. Insurance & Other Services",
      description: "Insurance products and wealth management",
      subStages: [
        {
          id: "D1",
          name: "Insurance Products",
          regions: "Singapore, Indonesia, Malaysia",
          description: "Life, health, property, and casualty insurance offerings",
        },
        {
          id: "D2",
          name: "Wealth Management",
          regions: "Singapore, Hong Kong, UAE",
          description: "Financial planning and investment services for high-net-worth individuals",
        },
      ],
    },
  ],
  Rubber: [
    {
      stage: "A. Raw Material Sourcing",
      description: "Sourcing of natural and synthetic rubber materials",
      subStages: [
        {
          id: "A1",
          name: "Natural Rubber Plantations",
          regions: "Thailand, Indonesia, Malaysia",
          description: "Cultivation and harvesting of rubber trees for natural latex",
        },
        {
          id: "A2",
          name: "Synthetic Rubber Production",
          regions: "US, Japan, Germany",
          description: "Manufacturing of synthetic rubber from petroleum derivatives",
        },
      ],
    },
    {
      stage: "B. Processing",
      description: "Processing of raw rubber into usable materials",
      subStages: [
        {
          id: "B1",
          name: "Latex Processing",
          regions: "Malaysia, Thailand, Indonesia",
          description: "Treatment and processing of raw latex into usable rubber",
        },
        {
          id: "B2",
          name: "Compounding & Mixing",
          regions: "Malaysia, Thailand, China",
          description: "Mixing rubber with additives to achieve desired properties",
        },
      ],
    },
    {
      stage: "C. Manufacturing",
      description: "Production of rubber products",
      subStages: [
        {
          id: "C1",
          name: "Glove Production (Top Glove)",
          regions: "Malaysia, Thailand, Vietnam",
          description: "Manufacturing of rubber gloves for medical and industrial use",
        },
        {
          id: "C2",
          name: "Quality Control & Testing",
          regions: "Malaysia, Thailand, China",
          description: "Testing and quality assurance of finished rubber products",
        },
      ],
    },
    {
      stage: "D. Distribution",
      description: "Packaging and global distribution",
      subStages: [
        {
          id: "D1",
          name: "Packaging & Warehousing",
          regions: "Malaysia, Singapore, China",
          description: "Packaging and storage of finished rubber products",
        },
        {
          id: "D2",
          name: "Global Distribution",
          regions: "US, EU, Japan",
          description: "Worldwide distribution and sales of rubber products",
        },
      ],
    },
  ],
  "Palm Oil": [
    {
      stage: "A. Plantation",
      description: "Cultivation of oil palm trees",
      subStages: [
        {
          id: "A1",
          name: "Seedling Nurseries",
          regions: "Malaysia, Indonesia, Thailand",
          description: "Growing and nurturing oil palm seedlings before plantation",
        },
        {
          id: "A2",
          name: "Palm Plantations (Sime Darby)",
          regions: "Malaysia, Indonesia, Papua New Guinea",
          description: "Large-scale cultivation of oil palm trees",
        },
      ],
    },
    {
      stage: "B. Harvesting & Extraction",
      description: "Harvesting of palm fruit and extraction of crude palm oil",
      subStages: [
        {
          id: "B1",
          name: "Fresh Fruit Bunch Harvesting",
          regions: "Malaysia, Indonesia, Thailand",
          description: "Collection of ripe palm fruit bunches from trees",
        },
        {
          id: "B2",
          name: "Crude Palm Oil Extraction",
          regions: "Malaysia, Indonesia, Thailand",
          description: "Processing of fruit bunches to extract crude palm oil",
        },
      ],
    },
    {
      stage: "C. Refining & Processing",
      description: "Refining of crude palm oil into various products",
      subStages: [
        {
          id: "C1",
          name: "Refining & Fractionation",
          regions: "Malaysia, Indonesia, Singapore",
          description: "Purification and separation of palm oil into different fractions",
        },
        {
          id: "C2",
          name: "Specialty Fats Production",
          regions: "Malaysia, Indonesia, Netherlands",
          description: "Production of specialized palm oil derivatives for specific applications",
        },
      ],
    },
    {
      stage: "D. End Products & Distribution",
      description: "Production of consumer goods and global distribution",
      subStages: [
        {
          id: "D1",
          name: "Food Applications",
          regions: "Global",
          description: "Use of palm oil in food products like cooking oil, margarine, and confectionery",
        },
        {
          id: "D2",
          name: "Oleochemicals & Biodiesel",
          regions: "Malaysia, Indonesia, EU",
          description: "Production of chemicals and biofuels from palm oil",
        },
      ],
    },
  ],
  Automotive: [
    {
      stage: "A. Design & Engineering",
      description: "Vehicle design and powertrain development",
      subStages: [
        {
          id: "A1",
          name: "Vehicle Design & R&D",
          regions: "Japan, US, Germany",
          description: "Development of vehicle designs, platforms, and technologies",
        },
        {
          id: "A2",
          name: "Powertrain Development",
          regions: "Japan, US, Germany",
          description: "Engineering of engines, transmissions, and propulsion systems",
        },
      ],
    },
    {
      stage: "B. Component Manufacturing",
      description: "Production of key vehicle components",
      subStages: [
        {
          id: "B1",
          name: "Engine & Transmission",
          regions: "Japan, Thailand, Indonesia",
          description: "Manufacturing of engines, transmissions, and drivetrain components",
        },
        {
          id: "B2",
          name: "Electronics & Sensors",
          regions: "Japan, China, Malaysia",
          description: "Production of electronic systems, sensors, and control units",
        },
      ],
    },
    {
      stage: "C. Assembly",
      description: "Vehicle assembly and quality control",
      subStages: [
        {
          id: "C1",
          name: "Vehicle Assembly (Toyota)",
          regions: "Japan, Thailand, Indonesia, Malaysia",
          description: "Final assembly of complete vehicles from components",
        },
        {
          id: "C2",
          name: "Quality Control",
          regions: "Japan, Thailand, Indonesia",
          description: "Testing and quality assurance of finished vehicles",
        },
      ],
    },
    {
      stage: "D. Distribution & Sales",
      description: "Global distribution and retail sales",
      subStages: [
        {
          id: "D1",
          name: "Logistics & Distribution",
          regions: "ASEAN, Global",
          description: "Transportation and distribution of vehicles to markets",
        },
        {
          id: "D2",
          name: "Dealerships & After-sales",
          regions: "Global",
          description: "Retail sales, service, and maintenance through dealership networks",
        },
      ],
    },
  ],
  Tourism: [
    {
      stage: "A. Infrastructure & Fleet",
      description: "Aircraft acquisition and airport infrastructure",
      subStages: [
        {
          id: "A1",
          name: "Aircraft Acquisition",
          regions: "US, EU",
          description: "Purchase or leasing of aircraft for airline operations",
        },
        {
          id: "A2",
          name: "Airport Infrastructure",
          regions: "Singapore, ASEAN, Global",
          description: "Development and maintenance of airport facilities and hubs",
        },
      ],
    },
    {
      stage: "B. Operations",
      description: "Flight operations and ground services",
      subStages: [
        {
          id: "B1",
          name: "Flight Operations (Singapore Airlines)",
          regions: "Singapore, ASEAN, Global",
          description: "Management of flight schedules, routes, and crew operations",
        },
        {
          id: "B2",
          name: "Ground Services",
          regions: "Singapore, ASEAN, Global",
          description: "Check-in, baggage handling, and other airport services",
        },
      ],
    },
    {
      stage: "C. Customer Experience",
      description: "In-flight services and loyalty programs",
      subStages: [
        {
          id: "C1",
          name: "In-flight Services",
          regions: "Singapore, Global",
          description: "Cabin services, meals, entertainment, and passenger comfort",
        },
        {
          id: "C2",
          name: "Loyalty Programs",
          regions: "Singapore, Global",
          description: "Frequent flyer programs and customer retention initiatives",
        },
      ],
    },
    {
      stage: "D. Distribution & Sales",
      description: "Booking platforms and travel partnerships",
      subStages: [
        {
          id: "D1",
          name: "Direct Booking Platforms",
          regions: "Global",
          description: "Online and mobile platforms for direct ticket sales",
        },
        {
          id: "D2",
          name: "Travel Agencies & Partnerships",
          regions: "Global",
          description: "Distribution through travel agencies and partner airlines",
        },
      ],
    },
  ],
}

interface CompanyGridViewProps {
  className?: string
}

export function CompanyGridView({ className }: CompanyGridViewProps) {
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [showValueChain, setShowValueChain] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const getImpactClass = (impact: number) => {
    if (impact <= -15) return "text-red-600 font-semibold"
    if (impact <= -10) return "text-red-500"
    if (impact <= -5) return "text-amber-500"
    return "text-emerald-500"
  }

  const handleCompanyClick = (company: any) => {
    setSelectedCompany(company)
    setSelectedCountry(null)
    setShowValueChain(true)
  }

  const handleCountryClick = (event: React.MouseEvent, company: any, country: string) => {
    event.stopPropagation()
    setSelectedCompany(company)
    setSelectedCountry(country)
    setShowValueChain(true)
  }

  const valueChain = selectedCompany
    ? valueChainsByIndustry[selectedCompany.industry as keyof typeof valueChainsByIndustry]
    : null

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead className="text-right">Market Cap ($B)</TableHead>
              <TableHead className="text-right">Revenue ($B)</TableHead>
              <TableHead className="text-right">Employees</TableHead>
              <TableHead className="text-right">Tariff Impact (%)</TableHead>
              <TableHead>Main Markets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companiesData.map((company) => (
              <TableRow
                key={company.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleCompanyClick(company)}
              >
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell className="text-right">{company.marketCap}</TableCell>
                <TableCell className="text-right">{company.revenue}</TableCell>
                <TableCell className="text-right">{company.employeeCount.toLocaleString()}</TableCell>
                <TableCell className={`text-right ${getImpactClass(company.impact)}`}>{company.impact}%</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {company.mainMarkets.map((market) => (
                      <Badge
                        key={market}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors"
                        onClick={(e) => handleCountryClick(e, company, market)}
                      >
                        {market}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ValueChainVisualization
        company={selectedCompany}
        valueChain={valueChain}
        open={showValueChain}
        onOpenChange={setShowValueChain}
        selectedCountry={selectedCountry}
      />
    </div>
  )
}
