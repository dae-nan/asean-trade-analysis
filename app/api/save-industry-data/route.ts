import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data directory - ensure it's in a writable location
const DATA_DIR = path.join(process.cwd(), 'data');
const INDUSTRY_DATA_FILE = path.join(DATA_DIR, 'industry-data.json');

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
    console.log(`[API] Received request to save industry data`);
    
    // Ensure the data directory exists
    await ensureDataDir();
    
    // Parse the JSON data from the request
    const data = await request.json();
    console.log(`[API] Parsed data: ${data.length} industry records`);
    
    // Save the data to the file
    await fs.writeFile(INDUSTRY_DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`[API] Successfully saved industry data to ${INDUSTRY_DATA_FILE}`);
    
    // Return a success response
    return NextResponse.json({ 
      success: true,
      message: 'Industry data saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Log the error and return an error response
    console.error('[API] Error saving industry data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save industry data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 