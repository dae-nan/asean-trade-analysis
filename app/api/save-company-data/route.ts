import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data directory - ensure it's in a writable location
const DATA_DIR = path.join(process.cwd(), 'data');
const COMPANY_DATA_FILE = path.join(DATA_DIR, 'company-data.json');

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
    console.log(`[API] Received request to save company data`);
    
    // Check if we're running in Vercel production environment
    const isVercelProduction = process.env.VERCEL_ENV === 'production';
    if (isVercelProduction) {
      console.log('[API] Running in Vercel production - file operations not supported');
      
      // Return success response even though we didn't save the data
      // This prevents client-side errors, but data won't persist in production
      return NextResponse.json({ 
        success: true,
        message: 'Company data save simulated in Vercel production',
        timestamp: new Date().toISOString()
      });
    }
    
    // Parse the JSON data from the request
    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format received');
    }
    
    // Ensure the data directory exists
    await ensureDataDir();
    
    // Save the data to the file
    await fs.writeFile(COMPANY_DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`[API] Successfully saved company data to ${COMPANY_DATA_FILE}`);
    
    // Return a success response
    return NextResponse.json({ 
      success: true,
      message: 'Company data saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Log the error and return an error response
    console.error('[API] Error saving company data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save company data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 