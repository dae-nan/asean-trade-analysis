"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Papa from 'papaparse'
import { ParseResult } from 'papaparse'
import fs from 'fs'
import path from 'path'
import { useCallback } from 'react'

// Define data types for charts
export interface GdpGrowthData {
  year: number
  consumption: number
  investment: number
  government: number
  netExports: number
  gdpGrowth: number
  tradeVolume: number
  country?: string // Optional country field for multi-country data
}

export interface TradeBalanceData {
  year: number
  exports: number
  imports: number
  balance: number
  country?: string // Optional country field for multi-country data
}

interface CountryData {
  gdpGrowth: GdpGrowthData[]
  tradeBalance: TradeBalanceData[]
}

// Default data (will be used as fallback data)
const defaultGdpGrowthData: GdpGrowthData[] = [
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
  {
    year: 2024,
    consumption: 2.6,
    investment: 1.4,
    government: 0.5,
    netExports: 0.6,
    gdpGrowth: 5.1,
    tradeVolume: 550,
  },
]

const defaultTradeBalanceData: TradeBalanceData[] = [
  { year: 2020, exports: 290, imports: -140, balance: 150 },
  { year: 2021, exports: 330, imports: -155, balance: 175 },
  { year: 2022, exports: 348, imports: -166, balance: 182 },
  { year: 2023, exports: 363, imports: -169, balance: 194 },
  { year: 2024, exports: 375, imports: -175, balance: 200 },
]

// All valid country codes
const validCountryCodes = [
  'all', 'brunei', 'cambodia', 'indonesia', 'laos', 
  'malaysia', 'myanmar', 'philippines', 'singapore', 
  'thailand', 'vietnam'
]

// Country-specific data (mock for now, will be populated with uploaded data)
const countrySpecificData: Record<string, CountryData> = {
  all: {
    gdpGrowth: defaultGdpGrowthData,
    tradeBalance: defaultTradeBalanceData
  },
  // Other countries will be populated as data is uploaded
}

// File paths for persisted data
const DATA_DIR = path.join(process.cwd(), 'data')
const GDP_DATA_FILE = path.join(DATA_DIR, 'gdp-data.json')
const TRADE_DATA_FILE = path.join(DATA_DIR, 'trade-data.json')

// Simple API functions to save/load data from server
async function saveDataToServer(data: Record<string, CountryData>): Promise<boolean> {
  try {
    const response = await fetch('/api/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gdpData: data,
        tradeData: data,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to save data to server:', error);
    return false;
  }
}

async function loadDataFromServer(): Promise<Record<string, CountryData> | null> {
  try {
    const response = await fetch('/api/load-data');
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.gdpData) {
      console.log('Successfully loaded data from server');
      return data.gdpData;
    }
    return null;
  } catch (error) {
    console.error('Failed to load data from server:', error);
    return null;
  }
}

// Create context type
interface DataContextType {
  selectedCountry: string
  setSelectedCountry: (country: string) => void
  gdpGrowthData: GdpGrowthData[]
  tradeBalanceData: TradeBalanceData[]
  uploadGdpGrowthData: (file: File, isBulkUpload?: boolean) => Promise<void>
  uploadTradeBalanceData: (file: File, isBulkUpload?: boolean) => Promise<void>
  downloadTemplateCSV: (type: 'gdp' | 'trade') => void
  countriesWithData: string[]
  lastUpdated: Record<string, string>
}

// Create context with default values
const DataContext = createContext<DataContextType>({
  selectedCountry: "all",
  setSelectedCountry: () => {},
  gdpGrowthData: defaultGdpGrowthData,
  tradeBalanceData: defaultTradeBalanceData,
  uploadGdpGrowthData: async () => {},
  uploadTradeBalanceData: async () => {},
  downloadTemplateCSV: () => {},
  countriesWithData: ['all'],
  lastUpdated: { all: new Date().toISOString() }
})

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [countryDataMap, setCountryDataMap] = useState<Record<string, CountryData>>(() => {
    // Initial state is empty - will be populated in useEffect
    return countrySpecificData
  })
  const [countriesWithData, setCountriesWithData] = useState<string[]>(['all'])
  const [lastUpdated, setLastUpdated] = useState<Record<string, string>>({ all: new Date().toISOString() })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  // Get current data based on selected country
  const gdpGrowthData = countryDataMap[selectedCountry]?.gdpGrowth || defaultGdpGrowthData
  const tradeBalanceData = countryDataMap[selectedCountry]?.tradeBalance || defaultTradeBalanceData

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        console.log("Attempting to load GDP and trade data...");
        setIsLoading(true);
        
        // First try server data (for persistence across server restarts)
        const serverData = await loadDataFromServer();
        if (serverData && typeof serverData === 'object') {
          console.log(`Loaded data from server with ${Object.keys(serverData).length} countries`);
          setCountryDataMap(serverData);
          setLastUpdated(prev => ({...prev, server: new Date().toISOString()}));
          setCountriesWithData(Object.keys(serverData));
          setIsLoading(false);
          return;
        }
        
        // If no server data, try localStorage
        if (typeof window !== 'undefined') {
          const savedData = localStorage.getItem('asean_trade_data');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              if (parsedData && typeof parsedData === 'object') {
                console.log(`Loaded data from localStorage with ${Object.keys(parsedData).length} countries`);
                setCountryDataMap(parsedData);
                setLastUpdated(prev => ({...prev, localStorage: new Date().toISOString()}));
                setCountriesWithData(Object.keys(parsedData));
                
                // Also save to server for future persistence
                await saveDataToServer(parsedData);
                
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.error('Error parsing localStorage data:', e);
            }
          }
        }
        
        // No data found, use default data
        console.log("No saved data found, using default data");
        setCountryDataMap(countrySpecificData);
        setCountriesWithData(['all']);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  // Save data to localStorage and server when it changes
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        console.log("Saving data to localStorage");
        // Create a deep copy of the data to avoid potential circular references
        const dataToSave = JSON.parse(JSON.stringify(countryDataMap));
        localStorage.setItem('asean_trade_data', JSON.stringify(dataToSave));
        
        // Verify that data was saved
        setTimeout(() => {
          const savedData = localStorage.getItem('asean_trade_data');
          if (savedData) {
            console.log("Verified data was saved to localStorage");
          } else {
            console.error("Failed to verify data in localStorage");
          }
        }, 100);
      } catch (e) {
        console.error("Failed to persist data to localStorage:", e);
      }
    }
    
    // Save to server
    saveDataToServer(countryDataMap).then(success => {
      if (success) {
        console.log("Successfully saved data to server");
        setLastUpdated(prev => ({...prev, server: new Date().toISOString()}));
      } else {
        console.error("Failed to save data to server");
      }
    });
  }, [countryDataMap, isLoading]);

  // Update countries with data
  useEffect(() => {
    const countries = Object.keys(countryDataMap);
    setCountriesWithData(countries);
  }, [countryDataMap]);

  // Function to upload GDP growth data
  const uploadGdpGrowthData = async (file: File, isBulkUpload = false): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<GdpGrowthData>) => {
          try {
            const parsedData = results.data;
            console.log("Parsed GDP data:", parsedData);
            const timestamp = new Date().toISOString();
            const updatedLastUpdated = {...lastUpdated};
            
            if (isBulkUpload) {
              // For bulk upload, group data by country
              const dataByCountry: Record<string, GdpGrowthData[]> = {};
              
              // Initialize each country with empty array
              validCountryCodes.forEach(code => {
                dataByCountry[code] = [];
              });
              
              // Group data by country
              parsedData.forEach(item => {
                if (item.country && validCountryCodes.includes(item.country)) {
                  dataByCountry[item.country].push(item);
                  // Update timestamp for this country
                  updatedLastUpdated[item.country] = timestamp;
                } else if (!item.country) {
                  // If no country specified, add to 'all'
                  dataByCountry['all'].push(item);
                  updatedLastUpdated['all'] = timestamp;
                }
              });
              
              // Update data for each country
              const newCountryDataMap = {...countryDataMap};
              
              Object.entries(dataByCountry).forEach(([country, data]) => {
                if (data.length > 0) {
                  newCountryDataMap[country] = {
                    ...newCountryDataMap[country] || { gdpGrowth: [], tradeBalance: [] },
                    gdpGrowth: data
                  };
                }
              });
              
              console.log("Updating country data map for bulk upload:", newCountryDataMap);
              setCountryDataMap(newCountryDataMap);
              setLastUpdated(updatedLastUpdated);
            } else {
              // For single country upload (previous behavior)
              console.log(`Updating data for single country: ${selectedCountry}`);
              
              // Sort data by year
              const sortedData = [...parsedData].sort((a, b) => a.year - b.year);
              
              setCountryDataMap(prev => ({
                ...prev,
                [selectedCountry]: {
                  gdpGrowth: sortedData,
                  tradeBalance: prev[selectedCountry]?.tradeBalance || []
                }
              }));
              
              // Update timestamp
              setLastUpdated(prev => ({
                ...prev,
                [selectedCountry]: timestamp
              }));
            }
            
            resolve();
          } catch (error) {
            console.error("Error processing GDP data:", error);
            reject(error);
          }
        },
        error: (error: Error) => {
          console.error("Error parsing GDP CSV:", error);
          reject(error);
        }
      });
    });
  };

  // Function to upload trade balance data
  const uploadTradeBalanceData = async (file: File, isBulkUpload = false): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<TradeBalanceData>) => {
          try {
            const parsedData = results.data;
            console.log("Parsed Trade data:", parsedData);
            const timestamp = new Date().toISOString();
            const updatedLastUpdated = {...lastUpdated};
            
            if (isBulkUpload) {
              // For bulk upload, group data by country
              const dataByCountry: Record<string, TradeBalanceData[]> = {};
              
              // Initialize each country with empty array
              validCountryCodes.forEach(code => {
                dataByCountry[code] = [];
              });
              
              // Group data by country
              parsedData.forEach(item => {
                if (item.country && validCountryCodes.includes(item.country)) {
                  dataByCountry[item.country].push(item);
                  // Update timestamp for this country
                  updatedLastUpdated[item.country] = timestamp;
                } else if (!item.country) {
                  // If no country specified, add to 'all'
                  dataByCountry['all'].push(item);
                  updatedLastUpdated['all'] = timestamp;
                }
              });
              
              // Update data for each country
              const newCountryDataMap = {...countryDataMap};
              
              Object.entries(dataByCountry).forEach(([country, data]) => {
                if (data.length > 0) {
                  newCountryDataMap[country] = {
                    ...newCountryDataMap[country] || { gdpGrowth: [], tradeBalance: [] },
                    tradeBalance: data
                  };
                }
              });
              
              console.log("Updating country data map for bulk upload:", newCountryDataMap);
              setCountryDataMap(newCountryDataMap);
              setLastUpdated(updatedLastUpdated);
            } else {
              // For single country upload (previous behavior)
              console.log(`Updating data for single country: ${selectedCountry}`);
              
              // Calculate balance if not provided
              const processedData = parsedData.map(item => ({
                ...item,
                balance: item.balance || (item.exports + item.imports)
              }));
              
              // Sort data by year
              const sortedData = [...processedData].sort((a, b) => a.year - b.year);
              
              setCountryDataMap(prev => ({
                ...prev,
                [selectedCountry]: {
                  gdpGrowth: prev[selectedCountry]?.gdpGrowth || [],
                  tradeBalance: sortedData
                }
              }));
              
              // Update timestamp
              setLastUpdated(prev => ({
                ...prev,
                [selectedCountry]: timestamp
              }));
            }
            
            resolve();
          } catch (error) {
            console.error("Error processing Trade data:", error);
            reject(error);
          }
        },
        error: (error: Error) => {
          console.error("Error parsing Trade CSV:", error);
          reject(error);
        }
      });
    });
  };

  // Function to download template CSV file
  const downloadTemplateCSV = (type: 'gdp' | 'trade') => {
    let header = ''
    let content = ''
    
    // Create file content based on type
    if (type === 'gdp') {
      header = 'year,consumption,investment,government,netExports,gdpGrowth,tradeVolume,country\n'
      content = '2020,0.5,0.3,1.1,0.2,2.1,410,indonesia\n'
      content += '2021,1.8,1.0,0.7,0.4,3.9,450,indonesia\n'
      content += '2022,2.7,1.5,0.5,0.5,5.2,510,indonesia\n'
      content += '2023,2.5,1.3,0.4,0.5,4.7,532,indonesia\n'
      content += '2024,2.6,1.4,0.5,0.6,5.1,550,indonesia\n'
    } else {
      header = 'year,exports,imports,balance,country\n'
      content = '2020,290,-140,150,indonesia\n'
      content += '2021,330,-155,175,indonesia\n'
      content += '2022,348,-166,182,indonesia\n'
      content += '2023,363,-169,194,indonesia\n'
      content += '2024,375,-175,200,indonesia\n'
    }
    
    // Create blob and trigger download
    const blob = new Blob([header + content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = type === 'gdp' ? "GDP_Growth_Components.csv" : "Trade_Balance_Trends.csv"
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  return (
    <DataContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        gdpGrowthData,
        tradeBalanceData,
        uploadGdpGrowthData,
        uploadTradeBalanceData,
        downloadTemplateCSV,
        countriesWithData,
        lastUpdated
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// Custom hook to use the data context
export const useData = () => useContext(DataContext) 