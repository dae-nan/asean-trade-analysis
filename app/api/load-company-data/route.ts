import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data directory path
const DATA_DIR = path.join(process.cwd(), 'data');
const COMPANY_DATA_FILE = path.join(DATA_DIR, 'company-data.json');

export async function GET() {
  try {
    console.log(`[API] Received request to load company data from ${COMPANY_DATA_FILE}`);
    
    // Check if the data file exists
    try {
      await fs.access(COMPANY_DATA_FILE);
      console.log(`[API] Company data file exists, reading...`);
    } catch (error) {
      // If the file doesn't exist, return an empty object
      console.log(`[API] Company data file not found, returning empty object`);
      return NextResponse.json({}, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }
    
    // Read the data file
    const fileContents = await fs.readFile(COMPANY_DATA_FILE, 'utf-8');
    
    try {
      // Parse the JSON data
      const data = JSON.parse(fileContents);
      console.log(`[API] Successfully loaded company data`);
      
      // Return the data with no-cache headers
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    } catch (parseError) {
      console.error(`[API] JSON parse error:`, parseError);
      // If there's a parsing error, return an empty object
      return NextResponse.json({}, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }
  } catch (error) {
    // Log the error and return an error response
    console.error('[API] Error loading company data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load company data',
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