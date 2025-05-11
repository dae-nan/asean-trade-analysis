"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import Papa from 'papaparse'
import { ParseResult } from 'papaparse'

// Define data types for industry impact
export interface SubIndustry {
  name: string
  impact: number
  companies: string[]
}

export interface IndustryData {
  id: string
  name: string
  exportValue: number
  importValue: number
  tariffImpact: number
  gdpImpact: number
  riskLevel: string
  subIndustries: SubIndustry[]
  country?: string // Optional country field for multi-country data
}

// Default industry data (sample data)
const defaultIndustryData: IndustryData[] = [
  {
    id: "tech",
    name: "Technology",
    exportValue: 78.4,
    importValue: 42.1,
    tariffImpact: -12.3,
    gdpImpact: -0.8,
    riskLevel: "High",
    subIndustries: [
      { name: "Semiconductors", impact: -18.5, companies: ["TSMC", "UMC", "GlobalFoundries", "Micron", "Intel"] },
      { name: "Consumer Electronics", impact: -9.2, companies: ["Samsung", "LG", "Sony", "Foxconn", "Acer"] },
      { name: "Software", impact: -4.1, companies: ["Microsoft", "Oracle", "SAP", "Salesforce", "Adobe"] },
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    exportValue: 92.6,
    importValue: 31.8,
    tariffImpact: -8.7,
    gdpImpact: -0.6,
    riskLevel: "Medium",
    subIndustries: [
      { name: "Automotive", impact: -7.2, companies: ["Toyota", "Honda", "Hyundai", "Proton", "Mitsubishi"] },
      {
        name: "Machinery",
        impact: -9.8,
        companies: ["Caterpillar", "Komatsu", "Hitachi", "Mitsubishi Heavy", "Doosan"],
      },
      { name: "Textiles", impact: -6.4, companies: ["Uniqlo", "H&M", "Zara", "Nike", "Adidas"] },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture",
    exportValue: 45.3,
    importValue: 18.7,
    tariffImpact: -5.2,
    gdpImpact: -0.4,
    riskLevel: "Medium",
    subIndustries: [
      { name: "Palm Oil", impact: -4.8, companies: ["Sime Darby", "IOI Corp", "Wilmar", "Golden Agri", "Felda"] },
      { name: "Rice", impact: -3.1, companies: ["CP Foods", "San Miguel", "Olam", "Wilmar", "Bernas"] },
      { name: "Rubber", impact: -6.5, companies: ["Sri Trang", "Top Glove", "Hartalega", "Kossan", "Supermax"] },
    ],
  },
  {
    id: "energy",
    name: "Energy",
    exportValue: 68.9,
    importValue: 29.4,
    tariffImpact: -3.8,
    gdpImpact: -0.3,
    riskLevel: "Low",
    subIndustries: [
      { name: "Oil & Gas", impact: -2.9, companies: ["Petronas", "PTT", "Pertamina", "PetroVietnam", "Shell"] },
      {
        name: "Renewable Energy",
        impact: -4.2,
        companies: ["Sunseap", "First Solar", "Risen Energy", "JinkoSolar", "Trina Solar"],
      },
      { name: "Coal", impact: -3.6, companies: ["Adaro", "Bumi Resources", "Banpu", "Indo Tambangraya", "Semirara"] },
    ],
  },
  {
    id: "services",
    name: "Services",
    exportValue: 77.6,
    importValue: 47.4,
    tariffImpact: -2.1,
    gdpImpact: -0.2,
    riskLevel: "Low",
    subIndustries: [
      { name: "Financial Services", impact: -1.8, companies: ["DBS", "OCBC", "UOB", "Maybank", "Bangkok Bank"] },
      {
        name: "Tourism",
        impact: -2.4,
        companies: ["AirAsia", "Singapore Airlines", "Thai Airways", "Minor Hotels", "Genting"],
      },
      {
        name: "Telecommunications",
        impact: -1.9,
        companies: ["Singtel", "Telkom Indonesia", "AIS", "Globe Telecom", "PLDT"],
      },
    ],
  },
]

// All valid country codes
const validCountryCodes = [
  'all', 'brunei', 'cambodia', 'indonesia', 'laos', 
  'malaysia', 'myanmar', 'philippines', 'singapore', 
  'thailand', 'vietnam'
]

// Simple API functions to save/load data from server
async function saveDataToServer(data: IndustryData[]): Promise<boolean> {
  try {
    const response = await fetch('/api/save-industry-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to save data to server:', error);
    return false;
  }
}

async function loadDataFromServer(): Promise<IndustryData[] | null> {
  try {
    const response = await fetch('/api/load-industry-data');
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to load data from server:', error);
    return null;
  }
}

// Create context type
interface IndustryDataContextType {
  industryData: IndustryData[]
  selectedCountry: string
  setSelectedCountry: (country: string) => void
  uploadIndustryData: (file: File) => Promise<void>
  downloadIndustryTemplateCSV: () => void
  lastUpdated: string | null
}

// Create context with default values
const IndustryDataContext = createContext<IndustryDataContextType>({
  industryData: [], // Empty array instead of defaultIndustryData
  selectedCountry: 'all',
  setSelectedCountry: () => {},
  uploadIndustryData: async () => {},
  downloadIndustryTemplateCSV: () => {},
  lastUpdated: null
})

export function IndustryDataProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [industryData, setIndustryData] = useState<IndustryData[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Load data on initial mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        console.log("Attempting to load industry data...");
        setIsLoading(true);
        
        // First try server data (for persistence across server restarts)
        const serverData = await loadDataFromServer();
        if (serverData && Array.isArray(serverData) && serverData.length > 0) {
          console.log(`Loaded ${serverData.length} industries from server`);
          setIndustryData(serverData);
          setLastUpdated(new Date().toISOString());
          setIsLoading(false);
          return;
        }
        
        // If no server data, try localStorage
        if (typeof window !== 'undefined') {
          const savedData = localStorage.getItem('asean_industry_data');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log(`Loaded ${parsedData.length} industries from localStorage`);
                setIndustryData(parsedData);
                setLastUpdated(new Date().toISOString());
                
                // Also save to server for persistence
                await saveDataToServer(parsedData);
                
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.error('Error parsing localStorage data:', e);
            }
          }
        }
        
        // No data found, start with empty state
        console.log("No industry data found, starting with empty state");
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;
    
    if (industryData.length > 0) {
      console.log(`Saving ${industryData.length} industries to localStorage and server`);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('asean_industry_data', JSON.stringify(industryData));
      }
      
      // Save to server
      saveDataToServer(industryData).then(success => {
        if (success) {
          console.log("Successfully saved to server");
        } else {
          console.error("Failed to save to server");
        }
      });
    }
  }, [industryData, isLoading]);

  // Function to upload industry data
  const uploadIndustryData = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: async (results: ParseResult<any>) => {
          try {
            const parsedData = results.data;
            console.log("Parsed Industry data:", parsedData);
            
            // Check if we have valid data
            if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
              console.error("No valid data found in CSV file");
              reject(new Error("No valid data found in CSV file"));
              return;
            }
            
            // Process valid rows
            const validRows = parsedData.filter(row => row.id && row.name);
            console.log(`Found ${validRows.length} valid rows out of ${parsedData.length} total rows`);
            
            if (validRows.length === 0) {
              reject(new Error("CSV must contain at least id and name columns"));
              return;
            }
            
            // Group by industry ID
            const industriesByID: Record<string, IndustryData> = {};
            
            validRows.forEach((row: any) => {
              // If this industry doesn't exist yet, create it
              if (!industriesByID[row.id]) {
                industriesByID[row.id] = {
                  id: row.id,
                  name: row.name,
                  exportValue: row.exportValue || 0,
                  importValue: row.importValue || 0,
                  tariffImpact: row.tariffImpact || 0,
                  gdpImpact: row.gdpImpact || 0,
                  riskLevel: row.riskLevel || 'Medium',
                  subIndustries: [],
                  country: row.country
                }
              } else {
                // Accumulate export and import values for duplicate entries
                industriesByID[row.id].exportValue += row.exportValue || 0
                industriesByID[row.id].importValue += row.importValue || 0
              }

              // If this row has product data, add it
              const productName = row.productName || row.subIndustryName;
              const productImpact = row.productImpact || row.subIndustryImpact;
              
              if (productName) {
                const companies = row.companies ? row.companies.split(',').map((c: string) => c.trim()) : [];
                industriesByID[row.id].subIndustries.push({
                  name: productName,
                  impact: productImpact || 0,
                  companies: companies
                });
              }
            });
            
            const newIndustryData = Object.values(industriesByID);
            
            // Update state with the new data
            setIndustryData(newIndustryData);
            setLastUpdated(new Date().toISOString());
            
            // Force save to both localStorage and server
            if (typeof window !== 'undefined') {
              localStorage.setItem('asean_industry_data', JSON.stringify(newIndustryData));
            }
            
            await saveDataToServer(newIndustryData);
            console.log("Data saved to server after upload");
            
            resolve();
          } catch (error) {
            console.error("Error processing Industry data:", error);
            reject(error);
          }
        },
        error: (error: Error) => {
          console.error("Error parsing Industry CSV:", error);
          reject(error);
        }
      });
    });
  };

  // Function to download template CSV file
  const downloadIndustryTemplateCSV = () => {
    // CSV header
    let content = "id,name,exportValue,importValue,tariffImpact,gdpImpact,riskLevel,country,productName,productImpact,companies\n"
    
    // Energy sector
    content += "energy,Energy,68.9,29.4,-3.8,-0.3,Medium,indonesia,Oil & Gas,-2.9,\"Petronas, PTT, Pertamina, PetroVietnam, Shell\"\n"
    content += "energy,Energy,68.9,29.4,-3.8,-0.3,Medium,malaysia,Renewable Energy,-4.2,\"Sunseap, First Solar, Risen Energy, JinkoSolar\"\n"
    content += "energy,Energy,68.9,29.4,-3.8,-0.3,Low,thailand,Coal,-3.6,\"Adaro, Bumi Resources, Banpu, Indo Tambangraya\"\n"
    
    // Materials sector
    content += "materials,Materials,55.3,37.9,-4.1,-0.5,Medium,vietnam,Chemicals,-5.3,\"SCG Chemicals, Indorama, Lotte Chemical, PTT Global\"\n"
    content += "materials,Materials,55.3,37.9,-4.1,-0.5,Medium,indonesia,Metals & Mining,-6.2,\"Vale Indonesia, Antam, Krakatau Steel, Timah\"\n"
    content += "materials,Materials,55.3,37.9,-4.1,-0.5,Low,philippines,Construction Materials,-3.8,\"Holcim, Cemex, Eagle Cement, Republic Cement\"\n"
    
    // Industrials sector
    content += "industrials,Industrials,92.6,31.8,-8.7,-0.6,High,singapore,Aerospace & Defense,-7.2,\"ST Engineering, SIA Engineering, SATS Aerospace\"\n"
    content += "industrials,Industrials,92.6,31.8,-8.7,-0.6,Medium,thailand,Machinery,-9.8,\"Siam Kubota, Hino Motors, Mitsubishi Electric Thai\"\n"
    content += "industrials,Industrials,92.6,31.8,-8.7,-0.6,Medium,malaysia,Transportation,-6.4,\"AirAsia, Malaysia Airlines, MISC Berhad, Westports\"\n"
    
    // Consumer Discretionary sector
    content += "consumer_discretionary,Consumer Discretionary,67.4,58.2,-5.9,-0.7,Medium,thailand,Aerospace & Defense,-7.2,\"ST Engineering, SIA Engineering, SATS Aerospace\"\n"
    // Apparel products for Indonesia with updated top companies
    content += "consumer_discretionary,Consumer Discretionary,1.92,0,0,0,Medium,indonesia,Apparel,0,\"PT Sritex Tbk, PT Pan Brothers Tbk, PT Eratex Djaja Tbk\"\n"
    content += "consumer_discretionary,Consumer Discretionary,67.4,58.2,-5.9,-0.7,Medium,indonesia,Consumer Durables,-4.7,\"Panasonic Indonesia, Sharp Electronics, Polytron\"\n"
    content += "consumer_discretionary,Consumer Discretionary,67.4,58.2,-5.9,-0.7,Medium,vietnam,Textiles & Apparel,-7.2,\"TNG Investment, Vinatex, Century Synthetic Fiber\"\n"
    
    // Consumer Staples sector
    content += "consumer_staples,Consumer Staples,47.8,36.4,-3.2,-0.4,Low,vietnam,Food Products,-2.5,\"Vinamilk, Masan Consumer, TH Group, PAN Food\"\n"
    content += "consumer_staples,Consumer Staples,47.8,36.4,-3.2,-0.4,Low,thailand,Beverages,-1.9,\"Thai Beverage, Osotspa, Carabao Group, Ichitan\"\n"
    content += "consumer_staples,Consumer Staples,47.8,36.4,-3.2,-0.4,Low,philippines,Food Retail,-2.3,\"SM Retail, Puregold, Robinsons Retail, Metro Retail\"\n"
    
    // Health Care sector
    content += "healthcare,Health Care,36.5,42.8,-2.7,-0.3,Low,singapore,Health Care Equipment,-1.6,\"Raffles Medical, IHH Healthcare, Thomson Medical\"\n"
    content += "healthcare,Health Care,36.5,42.8,-2.7,-0.3,Low,thailand,Pharmaceuticals,-2.2,\"Mega Lifesciences, DKSH Thailand, Siam Pharmaceutical\"\n"
    content += "healthcare,Health Care,36.5,42.8,-2.7,-0.3,Low,malaysia,Health Care Services,-1.8,\"KPJ Healthcare, Columbia Asia, Sunway Medical\"\n"
    
    // Financials sector
    content += "financials,Financials,83.2,29.1,-2.5,-0.2,Low,singapore,Banks,-1.4,\"DBS, OCBC, UOB, Standard Chartered Singapore\"\n"
    content += "financials,Financials,83.2,29.1,-2.5,-0.2,Low,malaysia,Insurance,-1.8,\"AIA Malaysia, Prudential Malaysia, Great Eastern\"\n"
    content += "financials,Financials,83.2,29.1,-2.5,-0.2,Low,thailand,Capital Markets,-1.6,\"Bangkok Bank, Siam Commercial Bank, Kasikornbank\"\n"
    
    // Information Technology sector
    content += "tech,Technology,78.4,42.1,-12.3,-0.8,High,singapore,Semiconductors,-18.5,\"TSMC, UMC, GlobalFoundries, Micron, Intel\"\n"
    content += "tech,Technology,78.4,42.1,-12.3,-0.8,High,vietnam,Electronic Equipment,-9.2,\"Samsung Vietnam, LG Electronics, Intel Vietnam\"\n"
    content += "tech,Technology,78.4,42.1,-12.3,-0.8,High,malaysia,Software & IT Services,-6.5,\"NTT Data Malaysia, IBM Malaysia, Microsoft Malaysia\"\n"
    
    // Communication Services sector
    content += "communications,Communication Services,62.7,39.8,-3.5,-0.4,Medium,philippines,Telecommunication Services,-3.2,\"PLDT, Globe Telecom, Converge ICT, Dito Telecommunity\"\n"
    content += "communications,Communication Services,62.7,39.8,-3.5,-0.4,Medium,indonesia,Media & Entertainment,-3.7,\"MNC Group, Emtek, Media Nusantara Citra\"\n"
    content += "communications,Communication Services,62.7,39.8,-3.5,-0.4,Medium,singapore,Interactive Media,-2.9,\"Sea Limited, Grab, Carousell, PropertyGuru\"\n"
    
    // Utilities sector
    content += "utilities,Utilities,41.3,23.6,-1.7,-0.2,Low,thailand,Electric Utilities,-1.3,\"EGAT, Ratch Group, Gulf Energy, B.Grimm Power\"\n"
    content += "utilities,Utilities,41.3,23.6,-1.7,-0.2,Low,philippines,Gas Utilities,-1.5,\"Manila Electric, First Gen, Energy Development Corp\"\n"
    content += "utilities,Utilities,41.3,23.6,-1.7,-0.2,Low,malaysia,Water Utilities,-1.2,\"Air Selangor, Pengurusan Air, Ranhill, Salcon\"\n"
    
    // Real Estate sector
    content += "real_estate,Real Estate,46.8,18.4,-2.4,-0.3,Low,singapore,Real Estate Management,-2.1,\"CapitaLand, City Developments, Keppel Land, Frasers\"\n"
    content += "real_estate,Real Estate,46.8,18.4,-2.4,-0.3,Low,indonesia,REITs,-1.9,\"Lippo Karawaci, Ciputra Development, Pakuwon Jati\"\n"
    content += "real_estate,Real Estate,46.8,18.4,-2.4,-0.3,Low,vietnam,Real Estate Development,-2.6,\"Vingroup, Novaland, Dat Xanh Group, Nam Long\"\n"
    
    // Agriculture (specific to ASEAN)
    content += "agriculture,Agriculture,45.3,18.7,-5.2,-0.4,Medium,malaysia,Palm Oil,-4.8,\"Sime Darby, IOI Corp, Wilmar, Golden Agri, Felda\"\n"
    content += "agriculture,Agriculture,45.3,18.7,-5.2,-0.4,Medium,thailand,Rice,-3.1,\"CP Foods, Thai Rice Exporters, Asia Golden Rice\"\n"
    content += "agriculture,Agriculture,45.3,18.7,-5.2,-0.4,Medium,indonesia,Rubber,-6.5,\"Sri Trang, Top Glove, Halcyon Agri, Corrie MacColl\"\n"
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = "Industry_Impact_Template.csv"
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  return (
    <IndustryDataContext.Provider
      value={{
        industryData,
        selectedCountry,
        setSelectedCountry,
        uploadIndustryData,
        downloadIndustryTemplateCSV,
        lastUpdated
      }}
    >
      {children}
    </IndustryDataContext.Provider>
  )
}

// Custom hook to use the industry data context
export const useIndustryData = () => useContext(IndustryDataContext) 