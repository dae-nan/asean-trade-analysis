"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Company {
  name: string
  impact: number
  marketCap: number
  revenue: number
  employeeCount: number
  mainMarkets: string[]
}

interface CompanyImpactChartProps {
  companies: Company[]
}

export function CompanyImpactChart({ companies }: CompanyImpactChartProps) {
  // Transform data for the chart
  const chartData = companies.map((company) => ({
    name: company.name,
    impact: Math.abs(company.impact),
    actualImpact: company.impact,
  }))

  return (
    <ChartContainer
      config={{
        impact: {
          label: "Tariff Impact (%)",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[400px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: "Impact Severity (%)", angle: -90, position: "insideLeft" }} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const company = chartData.find((c) => c.name === props.payload.name)
                  return [`${company?.actualImpact}%`, "Tariff Impact"]
                }}
              />
            }
          />
          <Bar dataKey="impact" fill="var(--color-impact)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
