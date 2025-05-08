"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyImpactChart } from "@/components/company-impact-chart"
import { CompanyDetailTable } from "@/components/company-detail-table"

// Sample data for company impact
const industryData = {
  tech: {
    name: "Technology",
    subIndustries: [
      {
        name: "Semiconductors",
        companies: [
          {
            name: "TSMC",
            impact: -21.3,
            marketCap: 512.4,
            revenue: 73.6,
            employeeCount: 73400,
            mainMarkets: ["Taiwan", "China", "US"],
          },
          {
            name: "UMC",
            impact: -18.7,
            marketCap: 21.8,
            revenue: 8.1,
            employeeCount: 19500,
            mainMarkets: ["Taiwan", "China", "Singapore"],
          },
          {
            name: "GlobalFoundries",
            impact: -16.2,
            marketCap: 32.5,
            revenue: 7.4,
            employeeCount: 15000,
            mainMarkets: ["US", "Singapore", "Germany"],
          },
          {
            name: "Micron",
            impact: -14.8,
            marketCap: 78.3,
            revenue: 23.4,
            employeeCount: 48000,
            mainMarkets: ["US", "Malaysia", "Singapore"],
          },
          {
            name: "Intel",
            impact: -12.5,
            marketCap: 156.7,
            revenue: 54.2,
            employeeCount: 121100,
            mainMarkets: ["US", "Vietnam", "Malaysia"],
          },
        ],
      },
      {
        name: "Consumer Electronics",
        companies: [
          {
            name: "Samsung",
            impact: -11.4,
            marketCap: 342.1,
            revenue: 197.6,
            employeeCount: 267937,
            mainMarkets: ["South Korea", "Vietnam", "Indonesia"],
          },
          {
            name: "LG",
            impact: -9.8,
            marketCap: 21.3,
            revenue: 63.2,
            employeeCount: 74000,
            mainMarkets: ["South Korea", "Vietnam", "Indonesia"],
          },
          {
            name: "Sony",
            impact: -8.7,
            marketCap: 124.5,
            revenue: 88.3,
            employeeCount: 109700,
            mainMarkets: ["Japan", "Malaysia", "Thailand"],
          },
          {
            name: "Foxconn",
            impact: -10.2,
            marketCap: 48.7,
            revenue: 214.6,
            employeeCount: 878429,
            mainMarkets: ["Taiwan", "China", "Vietnam"],
          },
          {
            name: "Acer",
            impact: -7.9,
            marketCap: 2.4,
            revenue: 8.1,
            employeeCount: 7000,
            mainMarkets: ["Taiwan", "Malaysia", "Philippines"],
          },
        ],
      },
      {
        name: "Software",
        companies: [
          {
            name: "Microsoft",
            impact: -4.2,
            marketCap: 2340.5,
            revenue: 211.9,
            employeeCount: 221000,
            mainMarkets: ["US", "Singapore", "India"],
          },
          {
            name: "Oracle",
            impact: -3.8,
            marketCap: 310.2,
            revenue: 49.9,
            employeeCount: 143000,
            mainMarkets: ["US", "Singapore", "Malaysia"],
          },
          {
            name: "SAP",
            impact: -3.5,
            marketCap: 167.8,
            revenue: 33.2,
            employeeCount: 107415,
            mainMarkets: ["Germany", "Singapore", "Malaysia"],
          },
          {
            name: "Salesforce",
            impact: -4.3,
            marketCap: 254.3,
            revenue: 31.4,
            employeeCount: 73541,
            mainMarkets: ["US", "Singapore", "Philippines"],
          },
          {
            name: "Adobe",
            impact: -4.7,
            marketCap: 245.8,
            revenue: 17.6,
            employeeCount: 29239,
            mainMarkets: ["US", "India", "Singapore"],
          },
        ],
      },
    ],
  },
  // Add other industries as needed
}

export default function CompanyImpactPage() {
  const searchParams = useSearchParams()
  const industry = searchParams.get("industry") || "tech"
  const subIndustryIndex = Number.parseInt(searchParams.get("subIndustry") || "0")

  const industryInfo = industryData[industry as keyof typeof industryData]
  const subIndustry = industryInfo?.subIndustries[subIndustryIndex]

  if (!industryInfo || !subIndustry) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold ml-2">No Data Available</h1>
          </div>
          <p>The requested industry or sub-industry data could not be found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold ml-2">{subIndustry.name} Companies</h1>
            <p className="text-muted-foreground ml-2">
              Impact analysis for top companies in {industryInfo.name} - {subIndustry.name}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tariff Impact Comparison</CardTitle>
            <CardDescription>Projected impact of US tariffs on top 5 companies in {subIndustry.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyImpactChart companies={subIndustry.companies} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Financial and operational details of impacted companies</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyDetailTable companies={subIndustry.companies} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
