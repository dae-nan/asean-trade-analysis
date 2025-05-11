"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Line } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useData } from "@/lib/context/data-context"

export function GdpGrowthChart() {
  const { gdpGrowthData } = useData()
  
  // Convert percentage values to absolute values based on a base GDP value
  // Assuming Indonesia has 100 billion $ GDP in 2019 as per requirements
  const baseGDP = 100 // billion USD
  
  const absoluteGdpData = gdpGrowthData.map(item => {
    // Calculate absolute values by multiplying percentages with base GDP
    const consumptionAbs = parseFloat((item.consumption * baseGDP / 100).toFixed(1))
    const investmentAbs = parseFloat((item.investment * baseGDP / 100).toFixed(1))
    const governmentAbs = parseFloat((item.government * baseGDP / 100).toFixed(1))
    const netExportsAbs = parseFloat((item.netExports * baseGDP / 100).toFixed(1))
    const totalGDP = consumptionAbs + investmentAbs + governmentAbs + netExportsAbs
    return {
      ...item,
      consumption: consumptionAbs,
      investment: investmentAbs,
      government: governmentAbs,
      netExports: netExportsAbs,
      totalGDP,
    }
  })

  return (
    <ChartContainer
      config={{
        consumption: {
          label: "Consumption (C)",
          color: "hsl(var(--chart-1))",
        },
        investment: {
          label: "Investment (I)",
          color: "#ef476f",
        },
        government: {
          label: "Government Spending (G)",
          color: "#ffd166",
        },
        netExports: {
          label: "Net Exports (X-M)",
          color: "hsl(var(--chart-4))",
        },
        tradeVolume: {
          label: "Trade Volume (Billion USD)",
          color: "hsl(var(--chart-5))",
        },
        totalGDP: {
          label: "Total GDP",
          color: "#000000",
        },
      }}
      className="h-[300px] p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={absoluteGdpData}
          margin={{
            top: 20,
            right: 30,
            left: 50,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            yAxisId="left"
            orientation="left"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar yAxisId="left" dataKey="consumption" stackId="a" fill="var(--color-consumption)" />
          <Bar yAxisId="left" dataKey="investment" stackId="a" fill="var(--color-investment)" />
          <Bar yAxisId="left" dataKey="government" stackId="a" fill="var(--color-government)" />
          <Bar yAxisId="left" dataKey="netExports" stackId="a" fill="var(--color-netExports)" />
          <Bar yAxisId="left" dataKey="tradeVolume" fill="var(--color-tradeVolume)" />
          <Line yAxisId="left" type="monotone" dataKey="totalGDP" stroke="#000" strokeWidth={2} dot={true} name="Total GDP" />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
