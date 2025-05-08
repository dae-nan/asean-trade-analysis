"use client"

import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Line } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for trade balance trends with imports as negative values
const data = [
  { year: 2019, exports: 320, imports: -150, balance: 170 },
  { year: 2020, exports: 290, imports: -140, balance: 150 },
  { year: 2021, exports: 330, imports: -155, balance: 175 },
  { year: 2022, exports: 348, imports: -166, balance: 182 },
  { year: 2023, exports: 363, imports: -169, balance: 194 },
]

export function TradeBalanceChart() {
  return (
    <ChartContainer
      config={{
        exports: {
          label: "Exports to US (Billion USD)",
          color: "hsl(var(--chart-1))",
        },
        imports: {
          label: "Imports from US (Billion USD)",
          color: "hsl(var(--chart-2))",
        },
        balance: {
          label: "Trade Balance (Billion USD)",
          color: "hsl(var(--chart-3))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
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
            label={{
              value: "Billion USD",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  if (name === "imports") {
                    return [`${Math.abs(value)}`, "Imports from US (Billion USD)"]
                  }
                  return [value, name]
                }}
              />
            }
          />
          <Bar dataKey="exports" fill="var(--color-exports)" name="Exports to US" />
          <Bar dataKey="imports" fill="var(--color-imports)" name="Imports from US" />
          <Line type="monotone" dataKey="balance" stroke="var(--color-balance)" strokeWidth={2} name="Trade Balance" />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
