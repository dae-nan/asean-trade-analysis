"use client"

import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Line } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useData } from "@/lib/context/data-context"

export function TradeBalanceChart() {
  const { tradeBalanceData } = useData()

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
      className="h-[300px] p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={tradeBalanceData}
          margin={{
            top: 20,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            label={{
              value: "Billion USD",
              angle: -90,
              position: "outside",
              offset: 80,
              style: { fontSize: '12px', fontWeight: 500 }
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  if (name === "imports") {
                    return [`${Math.abs(Number(value))}`, "Imports from US (Billion USD)"]
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
