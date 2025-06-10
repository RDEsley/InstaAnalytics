import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/auth';

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
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
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error during logout:', error);
      return res.status(400).json({
        success: false,
        error: 'Logout failed',
      });
    }

    // Log successful logout
    console.log(`Successful logout at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso',
    });

  } catch (error: any) {
    console.error('Error in logout API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
}