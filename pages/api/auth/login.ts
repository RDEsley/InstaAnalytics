import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
});

interface LoginResponse {
  success: boolean;
  data?: {
    user: any;
    session: any;
  };
  error?: string;
  message?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
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
    // Apply rate limiting (5 attempts per minute per IP)
    if (rateLimit(req, res)) {
      return; // Response already sent in rateLimit function
    }

    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0]?.message || 'Dados inválidos',
      });
    }

    const { email, password, rememberMe } = validationResult.data;

    // Attempt to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      // Log failed login attempt
      console.log(`Failed login attempt for email: ${email} at ${new Date().toISOString()}`);
      
      // Return user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email ou senha incorretos',
        });
      } else if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({
          success: false,
          error: 'Email not confirmed',
          message: 'Por favor, confirme seu email antes de fazer login',
        });
      } else if (error.message.includes('Too many requests')) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'Falha na autenticação. Verifique suas credenciais.',
        });
      }
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Falha na autenticação',
      });
    }

    // Log successful login
    console.log(`Successful login for user: ${data.user.email} at ${new Date().toISOString()}`);

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
          created_at: data.user.created_at,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      },
      message: 'Login realizado com sucesso',
    });

  } catch (error: any) {
    console.error('Error in login API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Erro interno do servidor. Tente novamente.',
    });
  }
}