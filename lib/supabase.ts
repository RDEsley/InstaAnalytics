import { createClient } from '@supabase/supabase-js';
import { AnalysisResult, InstagramProfile, InstagramPost, EngagementMetrics, SearchHistoryEntry, SearchHistoryFilters } from './types';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Check if analysis exists in cache
export const getAnalysisFromCache = async (username: string): Promise<AnalysisResult | null> => {
  try {
    // Find profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();
    
    if (profileError || !profileData) {
      return null;
    }
    
    // Get posts for this profile
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('likes_count', { ascending: false });
    
    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return null;
    }
    
    // Get engagement metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('engagement_metrics')
      .select('*')
      .eq('profile_id', profileData.id)
      .single();
    
    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return null;
    }
    
    // Format the data according to our types
    const profile: InstagramProfile = {
      username: profileData.username,
      fullName: profileData.full_name || '',
      biography: profileData.biography || '',
      followersCount: profileData.follower_count,
      followingCount: profileData.following_count,
      postsCount: profileData.posts_count,
      profilePicUrl: profileData.profile_pic_url || '',
      isPrivate: profileData.is_private || false,
      isVerified: profileData.is_verified || false,
    };
    
    const posts: InstagramPost[] = (postsData || []).map(post => ({
      id: post.post_id,
      caption: post.caption || '',
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      timestamp: post.timestamp || '',
      url: post.url || '',
      mediaType: post.media_type || '',
      mediaUrl: post.media_url || '',
      locationName: post.location_name || '',
    }));
    
    const engagementMetrics: EngagementMetrics = {
      engagementRate: metricsData.engagement_rate,
      postingFrequency: metricsData.posting_frequency,
      averageLikes: metricsData.average_likes,
      averageComments: metricsData.average_comments,
      bestPerformingPost: posts.length > 0 ? posts[0] : undefined,
    };
    
    return {
      profile,
      posts,
      engagementMetrics,
      timestamp: metricsData.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in getAnalysisFromCache:', error);
    return null;
  }
};

// Store analysis results in Supabase
export const storeAnalysisResults = async (analysis: AnalysisResult): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    // Start by inserting the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        username: analysis.profile.username.toLowerCase(),
        full_name: analysis.profile.fullName,
        biography: analysis.profile.biography,
        follower_count: analysis.profile.followersCount,
        following_count: analysis.profile.followingCount,
        posts_count: analysis.profile.postsCount,
        profile_pic_url: analysis.profile.profilePicUrl,
        is_private: analysis.profile.isPrivate,
        is_verified: analysis.profile.isVerified,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'username' })
      .select()
      .single();
    
    if (profileError || !profileData) {
      console.error('Error storing profile:', profileError);
      return false;
    }
    
    const profileId = profileData.id;
    
    // Insert posts
    if (analysis.posts.length > 0) {
      const formattedPosts = analysis.posts.map(post => ({
        profile_id: profileId,
        post_id: post.id,
        caption: post.caption,
        likes_count: post.likesCount,
        comments_count: post.commentsCount,
        timestamp: post.timestamp,
        url: post.url,
        media_type: post.mediaType,
        media_url: post.mediaUrl,
        location_name: post.locationName,
      }));
      
      const { error: postsError } = await supabase
        .from('posts')
        .upsert(formattedPosts, { onConflict: 'post_id' });
      
      if (postsError) {
        console.error('Error storing posts:', postsError);
        return false;
      }
    }
    
    // Insert engagement metrics
    const { error: metricsError } = await supabase
      .from('engagement_metrics')
      .upsert({
        profile_id: profileId,
        engagement_rate: analysis.engagementMetrics.engagementRate,
        posting_frequency: analysis.engagementMetrics.postingFrequency,
        average_likes: analysis.engagementMetrics.averageLikes,
        average_comments: analysis.engagementMetrics.averageComments,
        best_performing_post_id: analysis.engagementMetrics.bestPerformingPost?.id,
      }, { onConflict: 'profile_id' });
    
    if (metricsError) {
      console.error('Error storing metrics:', metricsError);
      return false;
    }

    // Store search history entry with user_id
    const { error: historyError } = await supabase
      .from('search_history')
      .insert({
        username: analysis.profile.username.toLowerCase(),
        result: analysis as any,
        status: 'success',
        user_id: user.id
      });

    if (historyError) {
      console.error('Error storing search history:', historyError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in storeAnalysisResults:', error);
    return false;
  }
};

// Get search history with filters and pagination
export const getSearchHistory = async (
  filters: SearchHistoryFilters
): Promise<{ entries: SearchHistoryEntry[]; total: number }> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { entries: [], total: 0 };
    }

    let query = supabase
      .from('search_history')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (filters.username) {
      query = query.ilike('username', `%${filters.username}%`);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply sorting
    query = query.order(filters.orderBy, {
      ascending: filters.orderDirection === 'asc'
    });

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching search history:', error);
      return { entries: [], total: 0 };
    }

    const entries: SearchHistoryEntry[] = (data || []).map(item => ({
      id: item.id,
      username: item.username,
      timestamp: item.timestamp || new Date().toISOString(),
      result: item.result as AnalysisResult,
      status: item.status as 'success' | 'error',
      error_message: item.error_message || undefined,
    }));

    return {
      entries,
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getSearchHistory:', error);
    return { entries: [], total: 0 };
  }
};