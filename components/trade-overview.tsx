"use client"

import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, DollarSignIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TradeOverview() {
  // This would typically come from a context or prop
  const selectedCountry = "All ASEAN Countries"

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{selectedCountry} Exports to US</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$362.8B</div>
          <p className="text-xs text-muted-foreground">+4.2% from previous year</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{selectedCountry} Imports from US</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$169.4B</div>
          <p className="text-xs text-muted-foreground">+2.1% from previous year</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trade Balance</CardTitle>
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$193.4B</div>
          <div className="flex items-center pt-1">
            <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
            <span className="text-xs text-emerald-500">6.8%</span>
            <span className="text-xs text-muted-foreground ml-1">surplus growth</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{selectedCountry} GDP Growth</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4.7%</div>
          <div className="flex items-center pt-1">
            <ArrowDownIcon className="h-3 w-3 text-rose-500" />
            <span className="text-xs text-rose-500">0.3%</span>
            <span className="text-xs text-muted-foreground ml-1">from previous period</span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
