"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ValueChainVisualization } from "@/components/value-chain-visualization"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CompanyDataUploader } from "@/components/company-data-uploader"
import { useCompanyData } from "@/lib/context/company-data-context"
import { useIndustryData } from "@/lib/context/industry-data-context"

// Remove all mock data

interface CompanyGridViewProps {
  className?: string
}

export function CompanyGridView({ className }: CompanyGridViewProps) {
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [showValueChain, setShowValueChain] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { companyData, lastUpdated } = useCompanyData()
  const { industryData } = useIndustryData()

  // Get industries and companies from the Industry Impact data
  const industryCompanies = new Map<string, Set<string>>();
  
  // Populate map with companies from industry data
  industryData.forEach(industry => {
    industry.subIndustries.forEach(subIndustry => {
      const key = `${industry.name}-${subIndustry.name}`.toLowerCase();
      if (!industryCompanies.has(key)) {
        industryCompanies.set(key, new Set());
      }
      subIndustry.companies.forEach(company => {
        industryCompanies.get(key)?.add(company.toLowerCase());
      });
    });
  });

  // Transform the company data from context for display
  // and filter to only include companies from industry data
  const companiesForDisplay = Object.values(companyData).flatMap(industry => 
    industry.subIndustries.flatMap(subIndustry => {
      // Create a key to check against industryCompanies map
      const key = `${industry.name}-${subIndustry.name}`.toLowerCase();
      
      return subIndustry.companies
        .filter(company => {
          // Only include this company if we have corresponding industry data
          // or if the industryCompanies map is empty (no industry data uploaded yet)
          return industryCompanies.size === 0 || 
                 (industryCompanies.has(key) && 
                  industryCompanies.get(key)?.has(company.name.toLowerCase()));
        })
        .map(company => ({
          id: `${industry.id}-${subIndustry.name}-${company.name}`,
          name: company.name,
          industry: subIndustry.name, 
          industryGroup: industry.name,
          impact: company.impact,
          marketCap: company.marketCap,
          revenue: company.revenue,
          employeeCount: company.employeeCount,
          mainMarkets: company.mainMarkets,
        }));
    })
  );

  // No more fallback to mock data
  const displayData = companiesForDisplay;

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

  // Simplified value chain data - will be populated from API when selected
  const valueChain = selectedCompany ? [] : null;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        {lastUpdated && (
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
        <div className="bg-gray-50 p-2 rounded">
          <CompanyDataUploader />
        </div>
      </div>

      {displayData.length > 0 ? (
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
              {displayData.map((company) => (
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
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Company Data Available</h3>
          <p className="text-muted-foreground mb-4">
            {industryData.length === 0 ? (
              <>
                No industry data found. Please first upload industry data in the Industry Impact tab,
                then upload matching company data here.
              </>
            ) : Object.keys(companyData).length === 0 ? (
              <>
                Please upload company data using the button above. Your upload should include companies that match
                those in the Industry Impact tab.
              </>
            ) : (
              <>
                No matching companies found. The uploaded company data doesn't match any companies listed in the 
                Industry Impact tab. Please ensure company names match exactly.
              </>
            )}
          </p>
        </div>
      )}

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
