import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data directory path
const DATA_DIR = path.join(process.cwd(), 'data');
const GDP_DATA_FILE = path.join(DATA_DIR, 'gdp-data.json');
const TRADE_DATA_FILE = path.join(DATA_DIR, 'trade-data.json');

export async function GET() {
  try {
    console.log(`[API] Received request to load GDP and trade data`);
    
    // Initialize the response object
    const response: { gdpData?: any; tradeData?: any } = {};
    
    // Try to load GDP data
    try {
      await fs.access(GDP_DATA_FILE);
      console.log(`[API] GDP data file exists, reading...`);
      const gdpFileContents = await fs.readFile(GDP_DATA_FILE, 'utf-8');
      response.gdpData = JSON.parse(gdpFileContents);
      console.log(`[API] Successfully loaded GDP data`);
    } catch (error) {
      console.log(`[API] GDP data file not found or could not be parsed`);
      response.gdpData = null;
    }
    
    // Try to load trade data
    try {
      await fs.access(TRADE_DATA_FILE);
      console.log(`[API] Trade data file exists, reading...`);
      const tradeFileContents = await fs.readFile(TRADE_DATA_FILE, 'utf-8');
      response.tradeData = JSON.parse(tradeFileContents);
      console.log(`[API] Successfully loaded trade data`);
    } catch (error) {
      console.log(`[API] Trade data file not found or could not be parsed`);
      response.tradeData = null;
    }
    
    // Return the data with no-cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    // Log the error and return an error response
    console.error('[API] Error loading GDP and trade data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load GDP and trade data',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
} 