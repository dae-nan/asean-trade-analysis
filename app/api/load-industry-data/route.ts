import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data directory path
const DATA_DIR = path.join(process.cwd(), 'data');
const INDUSTRY_DATA_FILE = path.join(DATA_DIR, 'industry-data.json');

export async function GET() {
  try {
    console.log(`[API] Received request to load industry data from ${INDUSTRY_DATA_FILE}`);
    
    // Check if the data file exists
    try {
      await fs.access(INDUSTRY_DATA_FILE);
      console.log(`[API] Industry data file exists, reading...`);
    } catch (error) {
      // If the file doesn't exist, return an empty array
      console.log(`[API] Industry data file not found, returning empty array`);
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }
    
    // Read the data file
    const fileContents = await fs.readFile(INDUSTRY_DATA_FILE, 'utf-8');
    
    try {
      // Parse the JSON data
      const data = JSON.parse(fileContents);
      console.log(`[API] Successfully loaded ${Array.isArray(data) ? data.length : 0} industry records`);
      
      // Return the data with no-cache headers
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    } catch (parseError) {
      console.error(`[API] JSON parse error:`, parseError);
      // If there's a parsing error, return an empty array
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }
  } catch (error) {
    // Log the error and return an error response
    console.error('[API] Error loading industry data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load industry data',
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