import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradeOverview } from "@/components/trade-overview"
import { GdpGrowthChart } from "@/components/gdp-growth-chart"
import { TradeBalanceChart } from "@/components/trade-balance-chart"
import { IndustryImpactTable } from "@/components/industry-impact-table"
import { ScenarioSelector } from "@/components/scenario-selector"
import { CountrySelector } from "@/components/country-selector"
import { CompanyGridView } from "@/components/company-grid-view"

export const metadata: Metadata = {
  title: "ASEAN-US Trade Analysis Dashboard",
  description: "Analyze trade export and import flows between ASEAN economies and the US in relation to GDP growth",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">ASEAN-US Trade Analysis Dashboard</h1>
          <div className="flex items-center gap-4">
            <CountrySelector />
            <ScenarioSelector />
            <Button>Export Report</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="industry-impact">Industry Impact</TabsTrigger>
            <TabsTrigger value="company-impact">Company Impact</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <TradeOverview />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>GDP Growth Components</CardTitle>
                  <CardDescription>Breakdown by C, I, G & (X-M), last 5 years</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <GdpGrowthChart />
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Trade Balance Trends</CardTitle>
                  <CardDescription>Exports (+) and Imports (-), last 5 years</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <TradeBalanceChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="industry-impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Industry Impact Analysis</CardTitle>
                <CardDescription>Impact of US tariff scenarios on S&P sectors in ASEAN economies</CardDescription>
              </CardHeader>
              <CardContent>
                <IndustryImpactTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="company-impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Impact Analysis</CardTitle>
                <CardDescription>Click on a company to view its value chain position</CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyGridView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
