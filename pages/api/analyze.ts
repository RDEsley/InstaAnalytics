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
      error: 'Método não permitido',
      message: 'Apenas requisições POST são permitidas para este endpoint',
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
    console.log('→ Corpo da requisição:', req.body);
    console.log('→ Resultado da validação:', validationResult);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        message: validationResult.error.errors[0]?.message || 'Nome de usuário do Instagram inválido',
      });
    }
    
    // Get sanitized username
    const username = sanitizeUsername(validationResult.data.username);
    console.log('→ Username sanitizado:', username);
    
    // Step 1: Check if analysis exists in Supabase cache (opcional - pode comentar para sempre buscar dados frescos)
    // const cachedAnalysis = await getAnalysisFromCache(username);
    // if (cachedAnalysis) {
    //   console.log('→ Análise encontrada no cache');
    //   return res.status(200).json({
    //     success: true,
    //     data: cachedAnalysis,
    //     message: 'Análise recuperada do cache',
    //   });
    // }
    
    // Step 2: Start Apify actor run
    console.log('→ Iniciando análise com Apify...');
    const run = await startApifyRun(username);
    
    // Step 3: Poll for completion
    console.log('→ Aguardando conclusão da análise...');
    const apifyData = await waitForApifyRun(run.id);
    
    // Step 4: Process and transform scraped data
    console.log('→ Processando dados coletados...');
    const analysisResult = processApifyData(apifyData);
    
    // Step 5: Store results in Supabase
    console.log('→ Armazenando resultados...');
    await storeAnalysisResults(analysisResult);
    
    // Return analysis results
    console.log('→ Análise concluída com sucesso');
    return res.status(200).json({
      success: true,
      data: analysisResult,
      message: 'Análise do perfil concluída com sucesso',
    });
  } catch (error: any) {
    console.error('→ Erro na API de análise:', error);
    
    // Mensagens de erro mais amigáveis em português
    let errorMessage = 'Ocorreu um erro inesperado durante a análise';
    
    if (error.message.includes('Falha ao iniciar')) {
      errorMessage = 'Não foi possível iniciar a análise. Tente novamente.';
    } else if (error.message.includes('expirou')) {
      errorMessage = 'A análise demorou mais que o esperado. Tente novamente.';
    } else if (error.message.includes('não encontrados')) {
      errorMessage = 'Perfil não encontrado ou privado. Verifique o nome de usuário.';
    } else if (error.message.includes('Rate limit')) {
      errorMessage = 'Muitas tentativas. Aguarde um momento antes de tentar novamente.';
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erro do servidor',
      message: errorMessage,
    });
  }
}