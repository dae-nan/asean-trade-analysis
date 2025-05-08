"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Company {
  name: string
  impact: number
  marketCap: number
  revenue: number
  employeeCount: number
  mainMarkets: string[]
}

interface CompanyDetailTableProps {
  companies: Company[]
}

export function CompanyDetailTable({ companies }: CompanyDetailTableProps) {
  const getImpactClass = (impact: number) => {
    if (impact <= -15) return "text-red-600 font-semibold"
    if (impact <= -10) return "text-red-500"
    if (impact <= -5) return "text-amber-500"
    return "text-emerald-500"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Market Cap ($B)</TableHead>
            <TableHead className="text-right">Revenue ($B)</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">Tariff Impact (%)</TableHead>
            <TableHead>Main Markets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.name}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="text-right">{company.marketCap}</TableCell>
              <TableCell className="text-right">{company.revenue}</TableCell>
              <TableCell className="text-right">{company.employeeCount.toLocaleString()}</TableCell>
              <TableCell className={`text-right ${getImpactClass(company.impact)}`}>{company.impact}%</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {company.mainMarkets.map((market) => (
                    <Badge key={market} variant="outline">
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
  )
}
