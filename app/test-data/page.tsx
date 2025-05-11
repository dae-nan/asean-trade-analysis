"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestDataPage() {
  const [serverStatus, setServerStatus] = useState<string>("Not checked")
  const [localStorageStatus, setLocalStorageStatus] = useState<string>("Not checked")
  
  useEffect(() => {
    // Check localStorage on mount
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('asean_trade_data')
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setLocalStorageStatus(
            `Found data for ${Object.keys(parsedData).length} countries: ${Object.keys(parsedData).join(', ')}`
          )
        } catch (e) {
          setLocalStorageStatus(`Error parsing data: ${e}`)
        }
      } else {
        setLocalStorageStatus("No data found in localStorage")
      }
    }
  }, [])

  const checkServerData = async () => {
    try {
      setServerStatus("Checking...")
      const response = await fetch('/api/load-data')
      if (!response.ok) {
        setServerStatus(`Error: HTTP ${response.status}`)
        return
      }
      
      const data = await response.json()
      if (data.gdpData) {
        setServerStatus(
          `Found data for ${Object.keys(data.gdpData).length} countries: ${Object.keys(data.gdpData).join(', ')}`
        )
      } else {
        setServerStatus("No GDP data found on server")
      }
    } catch (error) {
      setServerStatus(`Error: ${error}`)
    }
  }
  
  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('asean_trade_data')
      setLocalStorageStatus("Data cleared from localStorage")
    }
  }
  
  const generateTestData = async () => {
    // Generate sample data
    const testData = {
      gdpData: {
        indonesia: {
          gdpGrowth: [
            { year: 2020, consumption: 1.1, investment: 0.7, government: 0.9, netExports: 0.4, gdpGrowth: 3.1, tradeVolume: 410 },
            { year: 2021, consumption: 1.5, investment: 0.9, government: 0.7, netExports: 0.6, gdpGrowth: 3.7, tradeVolume: 450 },
            { year: 2022, consumption: 1.9, investment: 1.2, government: 0.6, netExports: 0.8, gdpGrowth: 4.5, tradeVolume: 480 }
          ],
          tradeBalance: [
            { year: 2020, exports: 290, imports: -140, balance: 150 },
            { year: 2021, exports: 330, imports: -155, balance: 175 },
            { year: 2022, exports: 348, imports: -166, balance: 182 }
          ]
        }
      }
    }
    
    // Save to server
    try {
      setServerStatus("Saving test data...")
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })
      
      if (response.ok) {
        setServerStatus("Test data saved to server successfully")
      } else {
        setServerStatus(`Error saving data: HTTP ${response.status}`)
      }
    } catch (error) {
      setServerStatus(`Error saving data: ${error}`)
    }
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Data Persistence Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Status</CardTitle>
            <CardDescription>Data stored in browser localStorage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{localStorageStatus}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={clearLocalStorage} variant="destructive">Clear LocalStorage</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
            <CardDescription>Data stored on the server</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{serverStatus}</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={checkServerData}>Check Server Data</Button>
            <Button onClick={generateTestData} variant="outline">Generate Test Data</Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">Return to Dashboard</a>
      </div>
    </div>
  )
} 