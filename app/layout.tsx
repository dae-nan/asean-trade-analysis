import type { Metadata } from 'next'
import { DataProvider } from '@/lib/context/data-context'
import { IndustryDataProvider } from '@/lib/context/industry-data-context'
import { CompanyDataProvider } from '@/lib/context/company-data-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASEAN-US Trade Analysis Dashboard',
  description: 'Analyze trade export and import flows between ASEAN economies and the US',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <DataProvider>
          <IndustryDataProvider>
            <CompanyDataProvider>
              {children}
            </CompanyDataProvider>
          </IndustryDataProvider>
        </DataProvider>
      </body>
    </html>
  )
}
