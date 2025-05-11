"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Papa from 'papaparse'
import { ParseResult } from 'papaparse'

// Define data types for company impact
export interface Company {
  name: string
  impact: number
  marketCap: number
  revenue: number
  employeeCount: number
  mainMarkets: string[]
}

export interface SubIndustry {
  name: string
  companies: Company[]
}

export interface IndustryCompanyData {
  id: string
  name: string
  subIndustries: SubIndustry[]
}

// Sample data for company impact
const defaultCompanyData: Record<string, IndustryCompanyData> = {
  tech: {
    id: "tech",
    name: "Technology",
    subIndustries: [
      {
        name: "Semiconductors",
        companies: [
          {
            name: "TSMC",
            impact: -21.3,
            marketCap: 512.4,
            revenue: 73.6,
            employeeCount: 73400,
            mainMarkets: ["Taiwan", "China", "US"],
          },
          {
            name: "UMC",
            impact: -18.7,
            marketCap: 21.8,
            revenue: 8.1,
            employeeCount: 19500,
            mainMarkets: ["Taiwan", "China", "Singapore"],
          },
          {
            name: "GlobalFoundries",
            impact: -16.2,
            marketCap: 32.5,
            revenue: 7.4,
            employeeCount: 15000,
            mainMarkets: ["US", "Singapore", "Germany"],
          },
          {
            name: "Micron",
            impact: -14.8,
            marketCap: 78.3,
            revenue: 23.4,
            employeeCount: 48000,
            mainMarkets: ["US", "Malaysia", "Singapore"],
          },
          {
            name: "Intel",
            impact: -12.5,
            marketCap: 156.7,
            revenue: 54.2,
            employeeCount: 121100,
            mainMarkets: ["US", "Vietnam", "Malaysia"],
          },
        ],
      },
      {
        name: "Consumer Electronics",
        companies: [
          {
            name: "Samsung",
            impact: -11.4,
            marketCap: 342.1,
            revenue: 197.6,
            employeeCount: 267937,
            mainMarkets: ["South Korea", "Vietnam", "Indonesia"],
          },
          {
            name: "LG",
            impact: -9.8,
            marketCap: 21.3,
            revenue: 63.2,
            employeeCount: 74000,
            mainMarkets: ["South Korea", "Vietnam", "Indonesia"],
          },
          {
            name: "Sony",
            impact: -8.7,
            marketCap: 124.5,
            revenue: 88.3,
            employeeCount: 109700,
            mainMarkets: ["Japan", "Malaysia", "Thailand"],
          },
          {
            name: "Foxconn",
            impact: -10.2,
            marketCap: 48.7,
            revenue: 214.6,
            employeeCount: 878429,
            mainMarkets: ["Taiwan", "China", "Vietnam"],
          },
          {
            name: "Acer",
            impact: -7.9,
            marketCap: 2.4,
            revenue: 8.1,
            employeeCount: 7000,
            mainMarkets: ["Taiwan", "Malaysia", "Philippines"],
          },
        ],
      },
      {
        name: "Software",
        companies: [
          {
            name: "Microsoft",
            impact: -4.2,
            marketCap: 2340.5,
            revenue: 211.9,
            employeeCount: 221000,
            mainMarkets: ["US", "Singapore", "India"],
          },
          {
            name: "Oracle",
            impact: -3.8,
            marketCap: 310.2,
            revenue: 49.9,
            employeeCount: 143000,
            mainMarkets: ["US", "Singapore", "Malaysia"],
          },
          {
            name: "SAP",
            impact: -3.5,
            marketCap: 167.8,
            revenue: 33.2,
            employeeCount: 107415,
            mainMarkets: ["Germany", "Singapore", "Malaysia"],
          },
          {
            name: "Salesforce",
            impact: -4.3,
            marketCap: 254.3,
            revenue: 31.4,
            employeeCount: 73541,
            mainMarkets: ["US", "Singapore", "Philippines"],
          },
          {
            name: "Adobe",
            impact: -4.7,
            marketCap: 245.8,
            revenue: 17.6,
            employeeCount: 29239,
            mainMarkets: ["US", "India", "Singapore"],
          },
        ],
      },
    ],
  },
}

// Simple API functions to save/load data from server
async function saveDataToServer(data: Record<string, IndustryCompanyData>): Promise<boolean> {
  try {
    const response = await fetch('/api/save-company-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to save company data to server:', error);
    return false;
  }
}

async function loadDataFromServer(): Promise<Record<string, IndustryCompanyData> | null> {
  try {
    const response = await fetch('/api/load-company-data');
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to load company data from server:', error);
    return null;
  }
}

// Create context type
interface CompanyDataContextType {
  companyData: Record<string, IndustryCompanyData>
  uploadCompanyData: (file: File) => Promise<void>
  downloadCompanyTemplateCSV: () => void
  lastUpdated: string | null
}

// Create context with default values
const CompanyDataContext = createContext<CompanyDataContextType>({
  companyData: defaultCompanyData,
  uploadCompanyData: async () => {},
  downloadCompanyTemplateCSV: () => {},
  lastUpdated: null
})

export function CompanyDataProvider({ children }: { children: React.ReactNode }) {
  const [companyData, setCompanyData] = useState<Record<string, IndustryCompanyData>>(defaultCompanyData)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Load data on initial mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        console.log("Attempting to load company data...");
        setIsLoading(true);
        
        // First try server data (for persistence across server restarts)
        const serverData = await loadDataFromServer();
        if (serverData && typeof serverData === 'object') {
          console.log(`Loaded company data from server`);
          setCompanyData(serverData);
          setLastUpdated(new Date().toISOString());
          setIsLoading(false);
          return;
        }
        
        // If no server data, try localStorage
        if (typeof window !== 'undefined') {
          const savedData = localStorage.getItem('asean_company_data');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              if (parsedData && typeof parsedData === 'object') {
                console.log(`Loaded company data from localStorage`);
                setCompanyData(parsedData);
                setLastUpdated(new Date().toISOString());
                
                // Also save to server for persistence
                await saveDataToServer(parsedData);
                
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.error('Error parsing localStorage company data:', e);
            }
          }
        }
        
        // No data found, use default data
        console.log("No company data found, using default data");
        setCompanyData(defaultCompanyData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading initial company data:', error);
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;
    
    console.log(`Saving company data to localStorage and server`);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('asean_company_data', JSON.stringify(companyData));
    }
    
    // Save to server
    saveDataToServer(companyData).then(success => {
      if (success) {
        console.log("Successfully saved company data to server");
      } else {
        console.error("Failed to save company data to server");
      }
    });
  }, [companyData, isLoading]);

  // Function to upload company data
  const uploadCompanyData = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: async (results: ParseResult<any>) => {
          try {
            const parsedData = results.data;
            console.log("Parsed Company data:", parsedData);
            
            // Check if we have valid data
            if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
              console.error("No valid data found in CSV file");
              reject(new Error("No valid data found in CSV file"));
              return;
            }
            
            // Process valid rows
            const validRows = parsedData.filter(row => row.industryId && row.subIndustryName && row.companyName);
            console.log(`Found ${validRows.length} valid rows out of ${parsedData.length} total rows`);
            
            if (validRows.length === 0) {
              reject(new Error("CSV must contain at least industryId, subIndustryName, and companyName columns"));
              return;
            }
            
            // Group by industry ID and sub-industry
            const newCompanyData: Record<string, IndustryCompanyData> = { ...companyData };
            
            validRows.forEach((row: any) => {
              const industryId = row.industryId;
              const industryName = row.industryName || industryId.charAt(0).toUpperCase() + industryId.slice(1);
              const subIndustryName = row.subIndustryName;
              
              // Create industry if it doesn't exist
              if (!newCompanyData[industryId]) {
                newCompanyData[industryId] = {
                  id: industryId,
                  name: industryName,
                  subIndustries: []
                };
              }
              
              // Find sub-industry or create new
              let subIndustry = newCompanyData[industryId].subIndustries.find(
                si => si.name === subIndustryName
              );
              
              if (!subIndustry) {
                subIndustry = {
                  name: subIndustryName,
                  companies: []
                };
                newCompanyData[industryId].subIndustries.push(subIndustry);
              }
              
              // Parse mainMarkets as comma-separated string
              const mainMarkets = row.mainMarkets ? row.mainMarkets.split(',').map((m: string) => m.trim()) : [];
              
              // Add company to sub-industry
              subIndustry.companies.push({
                name: row.companyName,
                impact: row.impact || 0,
                marketCap: row.marketCap || 0,
                revenue: row.revenue || 0,
                employeeCount: row.employeeCount || 0,
                mainMarkets: mainMarkets
              });
            });
            
            // Update state with the new data
            setCompanyData(newCompanyData);
            setLastUpdated(new Date().toISOString());
            
            // Force save to both localStorage and server
            if (typeof window !== 'undefined') {
              localStorage.setItem('asean_company_data', JSON.stringify(newCompanyData));
            }
            
            await saveDataToServer(newCompanyData);
            console.log("Company data saved to server after upload");
            
            resolve();
          } catch (error) {
            console.error("Error processing company data:", error);
            reject(error);
          }
        },
        error: (error: Error) => {
          console.error("Error parsing company CSV:", error);
          reject(error);
        }
      });
    });
  };

  // Function to download template CSV file
  const downloadCompanyTemplateCSV = () => {
    // CSV header
    let content = "industryId,industryName,subIndustryName,companyName,impact,marketCap,revenue,employeeCount,mainMarkets\n"
    
    // Tech industry examples
    content += "tech,Technology,Semiconductors,TSMC,-21.3,512.4,73.6,73400,\"Taiwan, China, US\"\n"
    content += "tech,Technology,Semiconductors,UMC,-18.7,21.8,8.1,19500,\"Taiwan, China, Singapore\"\n"
    content += "tech,Technology,Semiconductors,GlobalFoundries,-16.2,32.5,7.4,15000,\"US, Singapore, Germany\"\n"
    content += "tech,Technology,Consumer Electronics,Samsung,-11.4,342.1,197.6,267937,\"South Korea, Vietnam, Indonesia\"\n"
    content += "tech,Technology,Consumer Electronics,Sony,-8.7,124.5,88.3,109700,\"Japan, Malaysia, Thailand\"\n"
    content += "tech,Technology,Software,Microsoft,-4.2,2340.5,211.9,221000,\"US, Singapore, India\"\n"
    content += "tech,Technology,Software,Oracle,-3.8,310.2,49.9,143000,\"US, Singapore, Malaysia\"\n"
    
    // Manufacturing industry examples
    content += "manufacturing,Manufacturing,Automotive,Toyota,-8.4,238.5,287.6,370870,\"Japan, Thailand, Indonesia\"\n"
    content += "manufacturing,Manufacturing,Automotive,Honda,-7.9,54.3,143.1,219722,\"Japan, Malaysia, Thailand\"\n"
    content += "manufacturing,Manufacturing,Machinery,Caterpillar,-9.3,127.8,54.7,107700,\"US, Singapore, Thailand\"\n"
    content += "manufacturing,Manufacturing,Textiles,Uniqlo,-7.1,86.2,21.3,56000,\"Japan, Vietnam, Indonesia\"\n"
    
    // Energy industry examples
    content += "energy,Energy,Oil & Gas,Petronas,-3.6,95.7,62.8,48000,\"Malaysia, Indonesia, Vietnam\"\n"
    content += "energy,Energy,Renewable Energy,First Solar,-4.8,19.5,3.1,6400,\"US, Malaysia, Vietnam\"\n"
    
    // Apparel examples with Indonesian companies
    content += "consumer_discretionary,Consumer Discretionary,Apparel,PT Sritex Tbk,-6.2,0.9,0.85,50000,\"Indonesia, USA, EU\"\n"
    content += "consumer_discretionary,Consumer Discretionary,Apparel,PT Pan Brothers Tbk,-5.8,0.7,0.65,37000,\"Indonesia, Japan, USA\"\n"
    content += "consumer_discretionary,Consumer Discretionary,Apparel,PT Eratex Djaja Tbk,-4.9,0.1,0.12,8000,\"Indonesia, USA, Europe\"\n"
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = "Company_Impact_Template.csv"
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  return (
    <CompanyDataContext.Provider
      value={{
        companyData,
        uploadCompanyData,
        downloadCompanyTemplateCSV,
        lastUpdated
      }}
    >
      {children}
    </CompanyDataContext.Provider>
  )
}

// Custom hook to use the company data context
export const useCompanyData = () => useContext(CompanyDataContext) 