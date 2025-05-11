import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data directory - ensure it's in a writable location
const DATA_DIR = path.join(process.cwd(), 'data');
const GDP_DATA_FILE = path.join(DATA_DIR, 'gdp-data.json');
const TRADE_DATA_FILE = path.join(DATA_DIR, 'trade-data.json');

// Function to ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`Ensured data directory exists at: ${DATA_DIR}`);
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(`[API] Received request to save GDP and trade data`);
    
    // Ensure the data directory exists
    await ensureDataDir();
    
    // Parse the JSON data from the request
    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format received');
    }
    
    // Extract GDP and trade data
    const { gdpData, tradeData } = data;
    
    // Save GDP data
    if (gdpData && typeof gdpData === 'object') {
      await fs.writeFile(GDP_DATA_FILE, JSON.stringify(gdpData, null, 2));
      console.log(`[API] Successfully saved GDP data to ${GDP_DATA_FILE}`);
    }
    
    // Save trade data
    if (tradeData && typeof tradeData === 'object') {
      await fs.writeFile(TRADE_DATA_FILE, JSON.stringify(tradeData, null, 2));
      console.log(`[API] Successfully saved trade data to ${TRADE_DATA_FILE}`);
    }
    
    // Return a success response
    return NextResponse.json({ 
      success: true,
      message: 'GDP and trade data saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Log the error and return an error response
    console.error('[API] Error saving GDP and trade data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save GDP and trade data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 