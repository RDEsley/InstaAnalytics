import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/lib/types';
import { apiRequestSchema, sanitizeUsername } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { getAnalysisFromCache, storeAnalysisResults } from '@/lib/supabase';
import { startApifyRun, waitForApifyRun, processApifyData } from '@/lib/apify';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only POST requests are allowed for this endpoint',
    });
  }
  
  try {
    // Apply rate limiting
    if (rateLimit(req, res)) {
      // Response already sent in rateLimit function
      return;
    }
    
    // Validate request body
    const validationResult = apiRequestSchema.safeParse(req.body);
    console.log('REQ.BODY:', req.body);
    console.log('Validation result:', validationResult);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0]?.message || 'Invalid Instagram handle',
      });
    }
    
    // Get sanitized username
    const username = sanitizeUsername(validationResult.data.username);
    
    // Step 1: Check if analysis exists in Supabase cache
    const cachedAnalysis = await getAnalysisFromCache(username);
    
    if (cachedAnalysis) {
      return res.status(200).json({
        success: true,
        data: cachedAnalysis,
        message: 'Analysis retrieved from cache',
      });
    }
    
    // Step 2: Start Apify actor run
    const run = await startApifyRun(username);
    
    // Step 3: Poll for completion
    const apifyData = await waitForApifyRun(run.id);
    
    // Step 4: Process and transform scraped data
    const analysisResult = processApifyData(apifyData);
    
    // Step 5: Store results in Supabase
    await storeAnalysisResults(analysisResult);
    
    // Return analysis results
    return res.status(200).json({
      success: true,
      data: analysisResult,
      message: 'Profile analysis completed successfully',
    });
  } catch (error: any) {
    console.error('Error in analyze API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message || 'An unexpected error occurred during analysis',
    });
  }
}