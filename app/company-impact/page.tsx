"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyImpactChart } from "@/components/company-impact-chart"
import { CompanyDetailTable } from "@/components/company-detail-table"
import { CompanyDataUploader } from "@/components/company-data-uploader"
import { useCompanyData } from "@/lib/context/company-data-context"

export default function CompanyImpactPage() {
  const searchParams = useSearchParams()
  const industry = searchParams.get("industry") || "tech"
  const subIndustryIndex = Number.parseInt(searchParams.get("subIndustry") || "0")
  
  const { companyData, downloadCompanyTemplateCSV } = useCompanyData()
  const industryInfo = companyData[industry]
  const subIndustry = industryInfo?.subIndustries[subIndustryIndex]
  const [showFallbackButton, setShowFallbackButton] = useState(false)

  useEffect(() => {
    console.log("Company Impact Page rendered")
    console.log("Industry:", industry)
    console.log("Sub-industry index:", subIndustryIndex)
    console.log("Industry info exists:", !!industryInfo)
    console.log("Sub-industry exists:", !!subIndustry)
    console.log("All company data:", companyData)
    
    // Show fallback button if CompanyDataUploader doesn't appear
    const timer = setTimeout(() => {
      setShowFallbackButton(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [industry, subIndustryIndex, industryInfo, subIndustry, companyData])

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
          <div className="mt-4">
            <CompanyDataUploader />
            {showFallbackButton && (
              <Button variant="outline" onClick={downloadCompanyTemplateCSV} className="mt-4 bg-green-100">
                <Upload className="mr-2 h-4 w-4" />
                Download Company Template
              </Button>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between border-b pb-4">
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
          <div className="bg-gray-50 p-2 rounded">
            <CompanyDataUploader />
            {showFallbackButton && (
              <Button variant="outline" onClick={downloadCompanyTemplateCSV} className="mt-4 bg-green-100">
                <Upload className="mr-2 h-4 w-4" />
                Download Company Template
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tariff Impact Comparison</CardTitle>
            <CardDescription>Projected impact of US tariffs on top companies in {subIndustry.name}</CardDescription>
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
