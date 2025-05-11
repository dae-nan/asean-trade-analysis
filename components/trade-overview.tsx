"use client"

import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, DollarSignIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/lib/context/data-context"

export function TradeOverview() {
  const { selectedCountry, tradeBalanceData, gdpGrowthData } = useData()
  
  // Get the country display name from the value
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

  // Get latest year's data
  const latestTradeData = tradeBalanceData.length > 0 
    ? tradeBalanceData[tradeBalanceData.length - 1] 
    : { exports: 0, imports: 0, balance: 0, year: 0 }
  
  const previousTradeData = tradeBalanceData.length > 1 
    ? tradeBalanceData[tradeBalanceData.length - 2] 
    : { exports: 0, imports: 0, balance: 0, year: 0 }
    
  const latestGdpData = gdpGrowthData.length > 0 
    ? gdpGrowthData[gdpGrowthData.length - 1] 
    : { gdpGrowth: 0, consumption: 0, investment: 0, government: 0, netExports: 0, tradeVolume: 0, year: 0 }
    
  const previousGdpData = gdpGrowthData.length > 1 
    ? gdpGrowthData[gdpGrowthData.length - 2] 
    : { gdpGrowth: 0, consumption: 0, investment: 0, government: 0, netExports: 0, tradeVolume: 0, year: 0 }
  
  // Calculate % changes
  const exportsChange = previousTradeData.exports !== 0 
    ? ((latestTradeData.exports - previousTradeData.exports) / previousTradeData.exports) * 100 
    : 0
    
  const importsChange = previousTradeData.imports !== 0 
    ? ((Math.abs(latestTradeData.imports) - Math.abs(previousTradeData.imports)) / Math.abs(previousTradeData.imports)) * 100 
    : 0
    
  const balanceChange = previousTradeData.balance !== 0 
    ? ((latestTradeData.balance - previousTradeData.balance) / previousTradeData.balance) * 100 
    : 0
    
  const gdpChange = calculateGdpChange()
  
  function calculateGdpChange() {
    // If using percentage growth
    if (latestGdpData.gdpGrowth !== undefined && previousGdpData.gdpGrowth !== undefined) {
      return previousGdpData.gdpGrowth !== 0 
        ? (latestGdpData.gdpGrowth - previousGdpData.gdpGrowth) 
        : 0
    } 
    // If using absolute values
    else {
      const latestTotal = (
        (latestGdpData.consumption || 0) + 
        (latestGdpData.investment || 0) + 
        (latestGdpData.government || 0) + 
        (latestGdpData.netExports || 0)
      )
      
      const previousTotal = (
        (previousGdpData.consumption || 0) + 
        (previousGdpData.investment || 0) + 
        (previousGdpData.government || 0) + 
        (previousGdpData.netExports || 0)
      )
      
      return previousTotal !== 0 
        ? ((latestTotal - previousTotal) / previousTotal) * 100 
        : 0
    }
  }

  // Calculate total GDP if gdpGrowth is undefined (meaning we have absolute data)
  const getDisplayGdpValue = () => {
    if (latestGdpData.gdpGrowth !== undefined) {
      return { value: latestGdpData.gdpGrowth, isPercentage: true }
    } else {
      // Calculate the sum of components as the total GDP
      const totalGdp = (
        (latestGdpData.consumption || 0) + 
        (latestGdpData.investment || 0) + 
        (latestGdpData.government || 0) + 
        (latestGdpData.netExports || 0)
      )
      return { value: totalGdp, isPercentage: false }
    }
  }
  
  const gdpDisplayData = getDisplayGdpValue()

  const countryDisplayName = getCountryDisplayName(selectedCountry)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{countryDisplayName} Exports to US</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${latestTradeData.exports.toFixed(1)}B</div>
          <p className="text-xs text-muted-foreground">{exportsChange >= 0 ? '+' : ''}{exportsChange.toFixed(1)}% from previous year</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{countryDisplayName} Imports from US</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${Math.abs(latestTradeData.imports).toFixed(1)}B</div>
          <p className="text-xs text-muted-foreground">{importsChange >= 0 ? '+' : ''}{importsChange.toFixed(1)}% from previous year</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trade Balance</CardTitle>
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${latestTradeData.balance.toFixed(1)}B</div>
          <div className="flex items-center pt-1">
            {balanceChange >= 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-rose-500" />
            )}
            <span className={`text-xs ${balanceChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {Math.abs(balanceChange).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">surplus {balanceChange >= 0 ? 'growth' : 'decline'}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{countryDisplayName} GDP Growth</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {gdpDisplayData.value.toFixed(1)}
            {gdpDisplayData.isPercentage ? '%' : 'B'}
          </div>
          <div className="flex items-center pt-1">
            {gdpChange >= 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-rose-500" />
            )}
            <span className={`text-xs ${gdpChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {Math.abs(gdpChange).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from previous period</span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
