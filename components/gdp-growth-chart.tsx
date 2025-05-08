"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for GDP components breakdown
const data = [
  {
    year: 2019,
    consumption: 2.8,
    investment: 1.2,
    government: 0.6,
    netExports: 0.2,
    gdpGrowth: 4.8,
    tradeVolume: 480,
  },
  {
    year: 2020,
    consumption: 0.5,
    investment: 0.3,
    government: 1.1,
    netExports: 0.2,
    gdpGrowth: 2.1,
    tradeVolume: 410,
  },
  {
    year: 2021,
    consumption: 1.8,
    investment: 1.0,
    government: 0.7,
    netExports: 0.4,
    gdpGrowth: 3.9,
    tradeVolume: 450,
  },
  {
    year: 2022,
    consumption: 2.7,
    investment: 1.5,
    government: 0.5,
    netExports: 0.5,
    gdpGrowth: 5.2,
    tradeVolume: 510,
  },
  {
    year: 2023,
    consumption: 2.5,
    investment: 1.3,
    government: 0.4,
    netExports: 0.5,
    gdpGrowth: 4.7,
    tradeVolume: 532,
  },
]

export function GdpGrowthChart() {
  return (
    <ChartContainer
      config={{
        consumption: {
          label: "Consumption (C)",
          color: "hsl(var(--chart-1))",
        },
        investment: {
          label: "Investment (I)",
          color: "hsl(var(--chart-2))",
        },
        government: {
          label: "Government Spending (G)",
          color: "hsl(var(--chart-3))",
        },
        netExports: {
          label: "Net Exports (X-M)",
          color: "hsl(var(--chart-4))",
        },
        tradeVolume: {
          label: "Trade Volume (Billion USD)",
          color: "hsl(var(--chart-5))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            yAxisId="left"
            orientation="left"
            label={{ value: "GDP Growth Components (%)", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 600]}
            label={{ value: "Trade Volume (Billion USD)", angle: 90, position: "insideRight" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar yAxisId="left" dataKey="consumption" stackId="a" fill="var(--color-consumption)" />
          <Bar yAxisId="left" dataKey="investment" stackId="a" fill="var(--color-investment)" />
          <Bar yAxisId="left" dataKey="government" stackId="a" fill="var(--color-government)" />
          <Bar yAxisId="left" dataKey="netExports" stackId="a" fill="var(--color-netExports)" />
          <Bar yAxisId="right" dataKey="tradeVolume" fill="var(--color-tradeVolume)" />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
