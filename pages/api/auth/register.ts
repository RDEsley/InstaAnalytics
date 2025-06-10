import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

// Validation schema for registration
const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

interface RegisterResponse {
  success: boolean;
  data?: {
    user: any;
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
  res: NextApiResponse<RegisterResponse>
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
    // Apply rate limiting (3 registrations per minute per IP)
    if (rateLimit(req, res)) {
      return; // Response already sent in rateLimit function
    }

    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: validationResult.error.errors[0]?.message || 'Dados inválidos',
      });
    }

    const { fullName, email, password } = validationResult.data;

    // Attempt to sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      // Log failed registration attempt
      console.log(`Failed registration attempt for email: ${email} at ${new Date().toISOString()}`);
      
      // Return user-friendly error messages
      if (error.message.includes('User already registered')) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: 'Este email já está cadastrado',
        });
      } else if (error.message.includes('Password should be at least')) {
        return res.status(400).json({
          success: false,
          error: 'Weak password',
          message: 'A senha deve ter pelo menos 6 caracteres',
        });
      } else if (error.message.includes('Invalid email')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email',
          message: 'Email inválido',
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Registration failed',
          message: 'Falha no cadastro. Verifique os dados informados.',
        });
      }
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Registration failed',
        message: 'Falha no cadastro',
      });
    }

    // Log successful registration
    console.log(`Successful registration for user: ${data.user.email} at ${new Date().toISOString()}`);

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
          created_at: data.user.created_at,
        },
      },
      message: 'Cadastro realizado com sucesso',
    });

  } catch (error: any) {
    console.error('Error in register API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Erro interno do servidor. Tente novamente.',
    });
  }
}