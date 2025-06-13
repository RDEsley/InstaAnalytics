// lib/apify.ts
import { ApifyClient } from 'apify-client';
import { AnalysisResult, InstagramPost, EngagementMetrics } from './types';
import { validateApifyResponse } from './validation';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const ACTOR_ID = 'apify/instagram-profile-scraper';
const MAX_WAIT_TIME = 45000; // 45 segundos
const POLLING_INTERVAL = 3000; // 3 segundos

export const startApifyRun = async (username: string) => {
  const inputPayload = {
    usernames: [username],
    resultsLimit: 50, // Aumentado para obter mais posts
    addParentData: true,
  };
  
  console.log('→ Payload JSON enviado para Apify:', JSON.stringify(inputPayload, null, 2));
  
  try {
    const run = await apifyClient.actor(ACTOR_ID).call(inputPayload);
    console.log('→ Run iniciado com ID:', run.id);
    return run;
  } catch (error) {
    console.error('Erro ao iniciar run do Apify:', error);
    throw new Error('Falha ao iniciar análise do perfil');
  }
};

export const waitForApifyRun = async (runId: string): Promise<any> => {
  const startTime = Date.now();
  let isFinished = false;

  while (!isFinished && Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      const runInfo = await apifyClient.run(runId).get();
      if (!runInfo) throw new Error('Falha ao recuperar informações do run do Apify');

      console.log('→ Status do run:', runInfo.status);

      if (runInfo.status === 'SUCCEEDED') {
        isFinished = true;

        // Pega todos os itens do dataset
        const { items } = await apifyClient.dataset(runInfo.defaultDatasetId).listItems();

        console.log('→ Número de itens retornados:', items.length);
        console.log('→ Primeiro item (amostra):', JSON.stringify(items[0], null, 2));

        // Valida a resposta
        if (!validateApifyProfileResponse(items)) {
          throw new Error('Formato de resposta inválido do Apify');
        }

        return items;
      }

      if (runInfo.status === 'FAILED') {
        throw new Error('Análise falhou no Apify');
      }

      // Aguarda antes de verificar novamente
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    } catch (error) {
      console.error('Erro ao verificar status do run:', error);
      throw error;
    }
  }

  if (!isFinished) {
    throw new Error('Análise expirou. Tente novamente.');
  }
};

// Validação específica para o Instagram Profile Scraper
const validateApifyProfileResponse = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Dados vazios ou inválidos do Apify');
    return false;
  }

  // Procura por dados do perfil
  const profileData = data.find((item) => 
    item.username && 
    typeof item.followersCount !== 'undefined' &&
    typeof item.followingCount !== 'undefined'
  );

  if (!profileData) {
    console.error('Dados do perfil não encontrados');
    return false;
  }

  console.log('→ Dados do perfil encontrados:', {
    username: profileData.username,
    followers: profileData.followersCount,
    following: profileData.followingCount,
    posts: profileData.postsCount
  });

  return true;
};

export const processApifyData = (data: any[]): AnalysisResult => {
  console.log('→ Processando dados do Apify...');
  
  // Encontra os dados do perfil
  const profileData = data.find((item) => 
    item.username && 
    typeof item.followersCount !== 'undefined'
  ) || data[0];

  if (!profileData) {
    throw new Error('Dados do perfil não encontrados');
  }

  // Extrai informações do perfil
  const userInfo = {
    username: profileData.username || '',
    fullName: profileData.fullName || profileData.name || '',
    biography: profileData.biography || profileData.bio || '',
    followersCount: parseInt(String(profileData.followersCount || 0), 10),
    followingCount: parseInt(String(profileData.followingCount || 0), 10),
    postsCount: parseInt(String(profileData.postsCount || 0), 10),
    profilePicUrl: profileData.profilePicUrl || profileData.profilePic || '',
    isPrivate: Boolean(profileData.isPrivate),
    isVerified: Boolean(profileData.isVerified || profileData.verified),
  };

  console.log('→ Informações do perfil processadas:', userInfo);

  // Processa posts - podem estar em latestPosts ou como itens separados
  let posts: InstagramPost[] = [];
  
  if (profileData.latestPosts && Array.isArray(profileData.latestPosts)) {
    posts = profileData.latestPosts.map((post: any) => ({
      id: post.id || post.shortcode || '',
      caption: post.caption || '',
      likesCount: parseInt(String(post.likesCount || post.likes || 0), 10),
      commentsCount: parseInt(String(post.commentsCount || post.comments || 0), 10),
      timestamp: post.timestamp || post.takenAt || new Date().toISOString(),
      url: post.url || `https://instagram.com/p/${post.shortcode || post.id}/`,
      mediaType: post.type || post.mediaType || 'image',
      mediaUrl: post.displayUrl || post.imageUrl || '',
      locationName: post.locationName || null,
    }));
  } else {
    // Procura posts como itens separados no array
    posts = data
      .filter((item) => item.shortcode || (item.id && item.displayUrl))
      .map((item) => ({
        id: item.id || item.shortcode || '',
        caption: item.caption || '',
        likesCount: parseInt(String(item.likesCount || item.likes || 0), 10),
        commentsCount: parseInt(String(item.commentsCount || item.comments || 0), 10),
        timestamp: item.timestamp || item.takenAt || new Date().toISOString(),
        url: item.url || `https://instagram.com/p/${item.shortcode || item.id}/`,
        mediaType: item.type || item.mediaType || 'image',
        mediaUrl: item.displayUrl || item.imageUrl || '',
        locationName: item.locationName || null,
      }));
  }

  console.log('→ Número de posts processados:', posts.length);

  // Calcula métricas de engajamento
  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
  const averageLikes = posts.length > 0 ? totalLikes / posts.length : 0;
  const averageComments = posts.length > 0 ? totalComments / posts.length : 0;
  
  // Calcula taxa de engajamento
  const engagementRate = userInfo.followersCount > 0 
    ? ((averageLikes + averageComments) / userInfo.followersCount) * 100 
    : 0;

  // Estima frequência de postagem (posts por mês)
  const postingFrequency = posts.length > 0 ? (posts.length / 30) * 30 : 0;

  // Encontra o post com melhor performance (mais likes)
  const bestPerformingPost = posts.length > 0 
    ? posts.reduce((best, current) => 
        current.likesCount > best.likesCount ? current : best
      )
    : undefined;

  const engagementMetrics: EngagementMetrics = {
    engagementRate: Math.round(engagementRate * 100) / 100,
    postingFrequency: Math.round(postingFrequency * 100) / 100,
    averageLikes: Math.round(averageLikes),
    averageComments: Math.round(averageComments),
    bestPerformingPost,
  };

  console.log('→ Métricas de engajamento calculadas:', engagementMetrics);

  return {
    profile: userInfo,
    posts,
    engagementMetrics,
    timestamp: new Date().toISOString(),
  };
};