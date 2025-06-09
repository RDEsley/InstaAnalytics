// lib/apify.ts
import { ApifyClient } from 'apify-client';
import { AnalysisResult, InstagramPost, EngagementMetrics } from './types';
import { validateApifyResponse } from './validation';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const ACTOR_ID = 'apify/instagram-post-scraper';
const MAX_WAIT_TIME = 30000; // 30 segundos
const POLLING_INTERVAL = 2000; // 2 segundos

export const startApifyRun = async (username: string) => {
  const inputPayload = {
    username: [username],
    resultsLimit: 10,
    skipPinnedPosts: false,
  };
  console.log('→ payload JSON que vai para Apify:', JSON.stringify(inputPayload, null, 2));
  try {
    // Usa .call() para executar o actor imediatamente
    const run = await apifyClient.actor(ACTOR_ID).call(inputPayload);
    return run;
  } catch (error) {
    console.error('Error starting Apify run:', error);
    throw new Error('Failed to start profile analysis');
  }
};

export const waitForApifyRun = async (runId: string): Promise<any> => {
  const startTime = Date.now();
  let isFinished = false;

  while (!isFinished && Date.now() - startTime < MAX_WAIT_TIME) {
    const runInfo = await apifyClient.run(runId).get();
    if (!runInfo) throw new Error('Failed to retrieve run info from Apify');

    if (runInfo.status === 'SUCCEEDED') {
      isFinished = true;

      // Pega todos os itens do dataset
      const { items } = await apifyClient.dataset(runInfo.defaultDatasetId).listItems();

      // Logar para conferir o que veio
      console.log('→ Conteúdo de items vindos do Apify:', JSON.stringify(items, null, 2));

      // CHAMA A VALIDAÇÃO QUE AGORA ESTÁ CORRIGIDA
      if (!validateApifyResponse(items)) {
        throw new Error('Invalid response format from Apify');
      }

      return items;
    }

    // Caso ainda não terminou, aguarda e repete
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  if (!isFinished) {
    throw new Error('Analysis timed out. Please try again.');
  }
};

// A função de transformação dos dados pode permanecer igual, pois ela
// assume que o array "data" veio no formato esperado após a validação.
export const processApifyData = (data: any[]): AnalysisResult => {
  // Se seu "perfil" está vindo como último elemento, podemos usar find() de novo:
  const profileData = data.find((item) => typeof item.ownerUsername === 'string') || data[0];
  
  // "profileData" agora tem as chaves ownerUsername, ownerFullName, etc.
  const userInfo = {
    username: profileData.ownerUsername,
    fullName: profileData.ownerFullName,
    biography: profileData.biography || '',        // depende se o actor devolve "biography"
    followersCount: parseInt(profileData.followersCount || profileData.followers_count || '0', 10),
    followingCount: parseInt(profileData.followingCount || profileData.following_count || '0', 10),
    postsCount: parseInt(profileData.postsCount || profileData.posts_count || '0', 10),
    profilePicUrl: profileData.profilePicUrl || profileData.profile_pic_url,
    isPrivate: Boolean(profileData.isPrivate),
    isVerified: Boolean(profileData.isVerified ?? profileData.is_verified),
  };

  // Agora pega todos os itens que são posts (filtrando para ter "id" e "displayUrl")
  const posts: InstagramPost[] = data
    .filter((item) => typeof item.id === 'string' && typeof item.displayUrl === 'string')
    .map((item) => ({
      id: item.id,
      caption: item.caption || '',
      likesCount: item.likesCount !== null ? parseInt(item.likesCount, 10) : 0,
      commentsCount: item.commentsCount !== null ? item.commentsCount : 0,
      timestamp: item.timestamp || '',
      url: item.url || '',
      mediaType: item.type || item.mediaType || '',
      mediaUrl: item.displayUrl,
      locationName: item.locationName || item.location_name || null,
    }));

  // Calculate engagement metrics
  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
  const averageLikes = posts.length > 0 ? totalLikes / posts.length : 0;
  const averageComments = posts.length > 0 ? totalComments / posts.length : 0;
  
  // Calculate engagement rate (simplified formula)
  const engagementRate = userInfo.followersCount > 0 
    ? ((averageLikes + averageComments) / userInfo.followersCount) * 100 
    : 0;

  // Estimate posting frequency (posts per month)
  const postingFrequency = posts.length > 0 ? (posts.length / 30) * 30 : 0; // Simplified

  // Find best performing post
  const bestPerformingPost = posts.length > 0 
    ? posts.reduce((best, current) => 
        (current.likesCount + current.commentsCount) > (best.likesCount + best.commentsCount) 
          ? current 
          : best
      )
    : undefined;

  return {
    profile: userInfo,
    posts,
    engagementMetrics: {
      engagementRate: Math.round(engagementRate * 100) / 100,
      postingFrequency: Math.round(postingFrequency * 100) / 100,
      averageLikes: Math.round(averageLikes),
      averageComments: Math.round(averageComments),
      bestPerformingPost,
    },
    timestamp: new Date().toISOString(),
  };
};