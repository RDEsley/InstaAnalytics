import axios from 'axios';
import { supabase } from './supabase';
import { ApifyClient } from 'apify-client';

const APIFY_API_TOKEN = 'apify_api_ZKJFjHDg2TwGteKs5vdRYXSQG75n8M4G9t4f';
const ACTOR_ID = 'apify/instagram-profile-scraper';

const apifyClient = new ApifyClient({
  token: APIFY_API_TOKEN,
});

export const validateInstagramHandle = (handle: string): boolean => {
  const regex = /^[a-zA-Z0-9_.]{1,30}$/;
  return regex.test(handle);
};

export const fetchInstagramData = async (username: string) => {
  try {
    // Check if we already have recent data for this profile
    const { data: existingProfile } = await supabase
      .from('instagram_profiles')
      .select('*')
      .eq('instagram_username', username)
      .order('search_date', { ascending: false })
      .limit(1);

    const recentData = existingProfile?.[0];
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    if (recentData && new Date(recentData.search_date) > oneDayAgo) {
      const { data: posts } = await supabase
        .from('posts')
        .select('*, comments(*)')
        .eq('profile_id', recentData.id);
      
      return { profile: recentData, posts };
    }

    // Start Apify run
    const input = {
      usernames: [username],
      resultsType: "posts",
      resultsLimit: 20,
      searchType: "user",
      searchLimit: 1,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    };

    const run = await apifyClient.actor(ACTOR_ID).call(input);
    const { items: results } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    if (!results || results.length === 0) {
      throw new Error('No results returned from Apify');
    }

    const profileData = results[0];

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    // Save profile to database
    const { data: profile, error: profileError } = await supabase
      .from('instagram_profiles')
      .insert({
        user_id: userData.user.id,
        instagram_username: username,
        search_date: new Date().toISOString(),
        followers_count: profileData.followersCount || 0,
        following_count: profileData.followingCount || 0,
        posts_count: profileData.postsCount || 0,
        is_private: profileData.private || false,
        is_verified: profileData.verified || false,
        profile_pic_url: profileData.profilePicUrl || '',
        biography: profileData.bio || ''
      })
      .select()
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to save Instagram profile');
    }

    // Process and save posts
    const posts = profileData.latestPosts || [];
    const savedPosts = [];
    
    for (const post of posts) {
      const { data: savedPost, error: postError } = await supabase
        .from('posts')
        .insert({
          profile_id: profile.id,
          caption: post.caption || '',
          post_url: post.url || '',
          instagram_post_id: post.id,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          post_date: post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString(),
          image_url: post.imageUrl || ''
        })
        .select()
        .single();

      if (postError || !savedPost) {
        console.error('Failed to save post:', postError);
        continue;
      }

      savedPosts.push(savedPost);

      // Save comments if they exist
      if (post.comments && post.comments.length > 0) {
        const comments = post.comments.map(comment => ({
          post_id: savedPost.id,
          comment_text: comment.text || '',
          author: comment.ownerUsername || '',
          likes: comment.likesCount || 0,
          comment_date: comment.timestamp ? new Date(comment.timestamp).toISOString() : new Date().toISOString(),
        }));

        const { error: commentsError } = await supabase
          .from('comments')
          .insert(comments);

        if (commentsError) {
          console.error('Failed to save comments:', commentsError);
        }
      }
    }

    return { profile, posts: savedPosts };
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    throw error;
  }
};

export const getSearchHistory = async () => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('instagram_profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('search_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching search history:', error);
    throw error;
  }
};

export const getProfileData = async (profileId: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('instagram_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileError) {
      throw profileError;
    }

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .eq('profile_id', profileId);

    if (postsError) {
      throw postsError;
    }

    return { profile, posts };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};

export const analyzeComments = (comments: any[]) => {
  const totalComments = comments.length;
  
  if (totalComments === 0) {
    return {
      totalComments: 0,
      averageLikes: 0,
      topAuthors: [],
      commentLengthDistribution: { short: 0, medium: 0, long: 0 },
    };
  }

  const totalLikes = comments.reduce((sum, comment) => sum + (comment.likes || 0), 0);
  const averageLikes = totalLikes / totalComments;

  const authorCount: Record<string, number> = {};
  comments.forEach(comment => {
    const author = comment.author || 'anonymous';
    authorCount[author] = (authorCount[author] || 0) + 1;
  });

  const topAuthors = Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([author, count]) => ({ author, count }));

  const commentLengthDistribution = {
    short: 0,
    medium: 0,
    long: 0,
  };

  comments.forEach(comment => {
    const length = (comment.comment_text || '').length;
    if (length <= 50) {
      commentLengthDistribution.short++;
    } else if (length <= 200) {
      commentLengthDistribution.medium++;
    } else {
      commentLengthDistribution.long++;
    }
  });

  return {
    totalComments,
    averageLikes,
    topAuthors,
    commentLengthDistribution,
  };
};