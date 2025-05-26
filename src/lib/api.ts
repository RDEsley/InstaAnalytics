import axios from 'axios';
import { supabase } from './supabase';

const APIFY_API_KEY = 'apify_api_ZKJFjHDg2TwGteKs5vdRYXSQG75n8M4G9t4f';
const APIFY_ACTOR_ID = 'nH2AHrwxeTRJoN5hX';

type InstagramPost = {
  caption: string;
  url: string;
  id: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  ownerUsername: string;
  comments?: InstagramComment[];
};

type InstagramComment = {
  text: string;
  ownerUsername: string;
  likesCount: number;
  timestamp: string;
};

export const validateInstagramHandle = (handle: string): boolean => {
  // Instagram handle validation: letters, numbers, periods, and underscores
  // Between 1-30 characters as per Instagram rules
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

    // If we have data from the last 24 hours, use that instead of making a new API call
    if (recentData && new Date(recentData.search_date) > oneDayAgo) {
      const { data: posts } = await supabase
        .from('posts')
        .select('*, comments(*)')
        .eq('profile_id', recentData.id);
      
      return { profile: recentData, posts };
    }

    // Make API call to Apify
    const response = await axios.post(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs`,
      {
        username,
        resultsLimit: 20, // Limit to 20 most recent posts
        resultsType: 'posts',
        scrapeComments: true,
        commentsLimit: 50, // Limit to 50 comments per post
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    // Get the run ID
    const runId = response.data.data.id;
    
    // Poll for results (in a real app, you might want to use webhooks instead)
    let status = 'RUNNING';
    let result = null;
    
    while (status === 'RUNNING' || status === 'CREATED') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_API_KEY}`,
          },
        }
      );
      
      status = statusResponse.data.data.status;
      
      if (status === 'SUCCEEDED') {
        const resultResponse = await axios.get(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
          {
            headers: {
              'Authorization': `Bearer ${APIFY_API_KEY}`,
            },
          }
        );
        
        result = resultResponse.data;
        break;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED_OUT') {
        throw new Error(`Apify run failed with status: ${status}`);
      }
    }
    
    if (!result || result.length === 0) {
      throw new Error('No results returned from Apify');
    }

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
      })
      .select()
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to save Instagram profile');
    }

    // Process and save posts
    const posts: InstagramPost[] = result;
    
    for (const post of posts) {
      // Save post to database
      const { data: savedPost, error: postError } = await supabase
        .from('posts')
        .insert({
          profile_id: profile.id,
          caption: post.caption || '',
          post_url: post.url,
          instagram_post_id: post.id,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          post_date: post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString(),
        })
        .select()
        .single();

      if (postError || !savedPost) {
        console.error('Failed to save post:', postError);
        continue;
      }

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

    // Return the saved data
    const { data: savedPosts, error: fetchError } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .eq('profile_id', profile.id);

    if (fetchError) {
      throw new Error('Failed to fetch saved data');
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
  // This is a simple analysis function
  // In a production app, you might want to use sentiment analysis libraries
  // or machine learning models for more sophisticated analysis
  const totalComments = comments.length;
  
  if (totalComments === 0) {
    return {
      totalComments: 0,
      averageLikes: 0,
      topAuthors: [],
      commentLengthDistribution: { short: 0, medium: 0, long: 0 },
    };
  }

  // Calculate average likes
  const totalLikes = comments.reduce((sum, comment) => sum + (comment.likes || 0), 0);
  const averageLikes = totalLikes / totalComments;

  // Get top commenters
  const authorCount: Record<string, number> = {};
  comments.forEach(comment => {
    const author = comment.author || 'anonymous';
    authorCount[author] = (authorCount[author] || 0) + 1;
  });

  const topAuthors = Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([author, count]) => ({ author, count }));

  // Analyze comment lengths
  const commentLengthDistribution = {
    short: 0, // 0-50 characters
    medium: 0, // 51-200 characters
    long: 0, // 201+ characters
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