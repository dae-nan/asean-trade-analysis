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
  freeCash: number
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
            freeCash: 73400,
            mainMarkets: ["Taiwan", "China", "US"],
          },
          {
            name: "UMC",
            impact: -18.7,
            marketCap: 21.8,
            revenue: 8.1,
            freeCash: 19500,
            mainMarkets: ["Taiwan", "China", "Singapore"],
          },
          {
            name: "GlobalFoundries",
            impact: -16.2,
            marketCap: 32.5,
            revenue: 7.4,
            freeCash: 15000,
            mainMarkets: ["US", "Singapore", "Germany"],
          },
          {
            name: "Micron",
            impact: -14.8,
            marketCap: 78.3,
            revenue: 23.4,
            freeCash: 48000,
            mainMarkets: ["US", "Malaysia", "Singapore"],
          },
          {
            name: "Intel",
            impact: -12.5,
            marketCap: 156.7,
            revenue: 54.2,
            freeCash: 121100,
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
            freeCash: 267937,
            mainMarkets: ["South Korea", "Vietnam", "Indonesia"],
          },
          {
            name: "LG",
            impact: -9.8,
            marketCap: 21.3,
            revenue: 63.2,
            freeCash: 74000,
            mainMarkets: ["South Korea", "Vietnam", "Indonesia"],
          },
          {
            name: "Sony",
            impact: -8.7,
            marketCap: 124.5,
            revenue: 88.3,
            freeCash: 109700,
            mainMarkets: ["Japan", "Malaysia", "Thailand"],
          },
          {
            name: "Foxconn",
            impact: -10.2,
            marketCap: 48.7,
            revenue: 214.6,
            freeCash: 878429,
            mainMarkets: ["Taiwan", "China", "Vietnam"],
          },
          {
            name: "Acer",
            impact: -7.9,
            marketCap: 2.4,
            revenue: 8.1,
            freeCash: 7000,
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
            freeCash: 221000,
            mainMarkets: ["US", "Singapore", "India"],
          },
          {
            name: "Oracle",
            impact: -3.8,
            marketCap: 310.2,
            revenue: 49.9,
            freeCash: 143000,
            mainMarkets: ["US", "Singapore", "Malaysia"],
          },
          {
            name: "SAP",
            impact: -3.5,
            marketCap: 167.8,
            revenue: 33.2,
            freeCash: 107415,
            mainMarkets: ["Germany", "Singapore", "Malaysia"],
          },
          {
            name: "Salesforce",
            impact: -4.3,
            marketCap: 254.3,
            revenue: 31.4,
            freeCash: 73541,
            mainMarkets: ["US", "Singapore", "Philippines"],
          },
          {
            name: "Adobe",
            impact: -4.7,
            marketCap: 245.8,
            revenue: 17.6,
            freeCash: 29239,
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
    console.log("Attempting to load company data from server API");
    const response = await fetch('/api/load-company-data');
    if (!response.ok) {
      console.log("Server response not OK, status:", response.status);
      return null;
    }
    const data = await response.json();
    console.log("Loaded company data from server:", Object.keys(data).length > 0 ? "Data found" : "Empty object");
    return data;
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
        if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
          console.log(`Loaded company data from server with ${Object.keys(serverData).length} industries`);
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
              if (parsedData && typeof parsedData === 'object' && Object.keys(parsedData).length > 0) {
                console.log(`Loaded company data from localStorage with ${Object.keys(parsedData).length} industries`);
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
        console.log("No company data found, using default data with", Object.keys(defaultCompanyData).length, "industries");
        setCompanyData(defaultCompanyData);
        setLastUpdated(new Date().toISOString());
        
        // Try to save default data to server for future use
        try {
          await saveDataToServer(defaultCompanyData);
          console.log("Saved default company data to server");
        } catch (e) {
          console.warn("Could not save default company data to server:", e);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading initial company data:', error);
        setCompanyData(defaultCompanyData); // Fallback to default data on error
        setLastUpdated(new Date().toISOString());
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
            
            // Process valid rows - only require industryId and companyName
            const validRows = parsedData.filter(row => row.industryId && row.companyName);
            console.log(`Found ${validRows.length} valid rows out of ${parsedData.length} total rows`);
            
            if (validRows.length === 0) {
              reject(new Error("CSV must contain at least industryId and companyName columns"));
              return;
            }
            
            // Group by industry ID and sub-industry
            const newCompanyData: Record<string, IndustryCompanyData> = { ...companyData };
            
            // Create a set to track company names we've added to avoid duplicates
            const processedCompanies = new Set<string>();
            
            validRows.forEach((row: any) => {
              const industryId = row.industryId;
              const industryName = row.industryName || industryId.charAt(0).toUpperCase() + industryId.slice(1);
              // Use subIndustryName if provided, otherwise default to industry name
              const subIndustryName = row.subIndustryName || industryName;
              const companyName = row.companyName;
              
              // Skip if we've already processed this company
              const companyKey = companyName.toLowerCase();
              if (processedCompanies.has(companyKey)) {
                console.log(`Skipping duplicate company: ${companyName}`);
                return;
              }
              
              // Mark this company as processed
              processedCompanies.add(companyKey);
              
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
              
              // Check if company already exists in this sub-industry
              const existingCompanyIndex = subIndustry.companies.findIndex(
                company => company.name.toLowerCase() === companyName.toLowerCase()
              );
              
              // Create company data object with freeCash instead of employeeCount
              const companyData: Company = {
                name: companyName,
                impact: row.impact || 0,
                marketCap: row.marketCap || 0,
                revenue: row.revenue || 0,
                freeCash: row.freeCash || 0,
                mainMarkets: mainMarkets
              };
              
              if (existingCompanyIndex >= 0) {
                // Update existing company instead of adding a duplicate
                console.log(`Updating existing company: ${companyName} in ${industryName} - ${subIndustryName}`);
                subIndustry.companies[existingCompanyIndex] = companyData;
              } else {
                // Add new company
                subIndustry.companies.push(companyData);
              }
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
    // CSV header - removed subIndustryName which isn't used in display
    let content = "industryId,industryName,companyName,impact,marketCap,revenue,freeCash,mainMarkets\n";
    
    // Use existing company data if available, otherwise use minimal examples
    if (Object.keys(companyData).length > 0) {
      // Collect all companies from existing data
      const allCompanies: Array<{
        industryId: string;
        industryName: string;
        companyName: string;
        impact: number;
        marketCap: number;
        revenue: number;
        freeCash: number;
        mainMarkets: string[];
      }> = [];
      
      Object.entries(companyData).forEach(([industryId, industry]) => {
        industry.subIndustries.forEach(subIndustry => {
          subIndustry.companies.forEach(company => {
            allCompanies.push({
              industryId,
              industryName: industry.name,
              companyName: company.name,
              impact: company.impact,
              marketCap: company.marketCap,
              revenue: company.revenue,
              freeCash: company.freeCash,
              mainMarkets: company.mainMarkets
            });
          });
        });
      });
      
      // Deduplicate companies by name (case insensitive)
      const companyMap = new Map();
      allCompanies.forEach(company => {
        companyMap.set(company.companyName.toLowerCase(), company);
      });
      
      // Convert back to array and sort
      const dedupedCompanies = Array.from(companyMap.values());
      
      // Sort by industry and company name for readability
      dedupedCompanies.sort((a, b) => {
        if (a.industryName !== b.industryName) {
          return a.industryName.localeCompare(b.industryName);
        }
        return a.companyName.localeCompare(b.companyName);
      });
      
      // Add companies to CSV content
      dedupedCompanies.forEach(company => {
        const mainMarketsStr = company.mainMarkets.length > 0 
          ? `"${company.mainMarkets.join(', ')}"` 
          : "";
          
        content += `${company.industryId},${company.industryName},${company.companyName},${company.impact},${company.marketCap},${company.revenue},${company.freeCash},${mainMarketsStr}\n`;
      });
    } else {
      // Provide a minimal example if no data exists
      content += "tech,Technology,Sample Tech Company,-5.2,120.5,45.7,12000,\"US, Singapore, Taiwan\"\n";
      content += "consumer_discretionary,Consumer Discretionary,Sample Apparel Company,-4.8,0.9,0.7,35000,\"Indonesia, Japan, US\"\n";
    }
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Company_Impact_Template.csv";
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

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