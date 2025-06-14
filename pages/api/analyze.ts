// pages/api/analyze.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/lib/types';
import { apiRequestSchema, sanitizeUsername } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { storeAnalysisResults } from '@/lib/supabase';
import { startApifyRun, waitForApifyRun, processApifyData } from '@/lib/apify';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido',
      message: 'Apenas requisições POST são permitidas.',
    });
  }
  
  try {
    if (rateLimit(req, res)) {
      return;
    }
    
    const validationResult = apiRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        message: validationResult.error.errors[0]?.message || 'Nome de usuário inválido.',
      });
    }
    
    const username = sanitizeUsername(validationResult.data.username);
    
    const run = await startApifyRun(username);
    const apifyData = await waitForApifyRun(run.id);
    const analysisResult = processApifyData(apifyData);
    
    await storeAnalysisResults(analysisResult);
    
    return res.status(200).json({
      success: true,
      data: analysisResult,
      message: 'Análise do perfil concluída com sucesso.',
    });
  } catch (error: any) {
    console.error('→ Erro na API de análise:', error);
    
    let errorMessage = 'Ocorreu um erro inesperado durante a análise.';
    let statusCode = 500;
    const errorMsg = error.message.toLowerCase();

    if (errorMsg.includes('perfil não encontrado')) {
      errorMessage = 'Perfil não encontrado ou é privado. Por favor, verifique o nome de usuário.';
      statusCode = 404;
    } else if (errorMsg.includes('falhou no apify')) {
      errorMessage = 'A análise do perfil falhou. O perfil pode ser inválido ou o serviço do Instagram pode estar instável.';
      statusCode = 502;
    } else if (errorMsg.includes('expirou')) {
      errorMessage = 'A análise demorou mais que o esperado. Tente novamente em alguns minutos.';
      statusCode = 504;
    } else if (errorMsg.includes('rate limit')) {
        errorMessage = 'Muitas tentativas. Aguarde um momento antes de tentar novamente.';
        statusCode = 429;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: 'Erro na Análise',
      message: errorMessage,
    });
  }
}