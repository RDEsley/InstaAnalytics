// lib/apify.ts
import { ApifyClient } from 'apify-client';
import { AnalysisResult, InstagramPost, EngagementMetrics } from './types';
// A importação de 'validation' não é mais necessária aqui

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const ACTOR_ID = 'apify/instagram-profile-scraper';
const MAX_WAIT_TIME = 45000; // 45 segundos
const POLLING_INTERVAL = 3000; // 3 segundos

export const startApifyRun = async (username: string) => {
  const inputPayload = {
    usernames: [username],
    resultsLimit: 50,
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

export const waitForApifyRun = async (runId: string): Promise<any[]> => {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    const runInfo = await apifyClient.run(runId).get();
    if (!runInfo) {
      throw new Error('Falha ao recuperar informações do run do Apify');
    }

    console.log('→ Status do run:', runInfo.status);

    switch (runInfo.status) {
      case 'SUCCEEDED':
        const { items } = await apifyClient.dataset(runInfo.defaultDatasetId).listItems();
        console.log('→ Run concluído. Itens retornados:', items.length);
        return items;
      
      case 'FAILED':
        throw new Error('Análise falhou no Apify. O perfil pode ser inválido ou o serviço pode estar instável.');
      
      case 'TIMED-OUT':
        throw new Error('Análise no Apify expirou (timed out).');
      
      case 'ABORTED':
        throw new Error('Análise no Apify foi abortada.');
    }
    
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error('Análise expirou por tempo de espera. Tente novamente.');
};

export const processApifyData = (data: any[]): AnalysisResult => {
  console.log('→ Processando dados do Apify...');
  
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Dados do perfil não encontrados. O perfil pode não existir ou ser privado.');
  }

  const profileData = data.find((item) => 
    item.username && 
    typeof item.followersCount !== 'undefined'
  );

  if (!profileData) {
    console.error('Não foi possível encontrar o objeto de perfil nos dados retornados pelo Apify.');
    throw new Error('Dados do perfil não encontrados. Verifique o nome de usuário.');
  }

  const userInfo = {
    username: profileData.username || '',
    fullName: profileData.fullName || profileData.name || '',
    biography: profileData.biography || profileData.bio || '',
    followersCount: parseInt(String(profileData.followersCount || 0), 10),
    followingCount: parseInt(String(profileData.followsCount || 0), 10),
    postsCount: parseInt(String(profileData.postsCount || 0), 10),
    profilePicUrl: profileData.profilePicUrl || profileData.profilePic || '',
    isPrivate: Boolean(profileData.isPrivate),
    isVerified: Boolean(profileData.isVerified || profileData.verified),
  };

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

  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
  const averageLikes = posts.length > 0 ? totalLikes / posts.length : 0;
  const averageComments = posts.length > 0 ? totalComments / posts.length : 0;
  
  const engagementRate = userInfo.followersCount > 0 
    ? ((averageLikes + averageComments) / userInfo.followersCount) * 100 
    : 0;

  const postingFrequency = posts.length > 0 ? (posts.length / 30) * 30 : 0;

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

  return {
    profile: userInfo,
    posts,
    engagementMetrics,
    timestamp: new Date().toISOString(),
  };
};