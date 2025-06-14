import { Database } from './database.types';

export interface InstagramProfile {
  username: string;
  fullName?: string;
  biography?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  profilePicUrl?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
}

export interface InstagramPost {
  id: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  url: string;
  mediaType: string;
  mediaUrl?: string;
  locationName?: string;
}

export interface EngagementMetrics {
  engagementRate: number;
  postingFrequency: number;
  averageLikes: number;
  averageComments: number;
  bestPerformingPost?: InstagramPost;
}

export interface AnalysisResult {
  profile: InstagramProfile;
  posts: InstagramPost[];
  engagementMetrics: EngagementMetrics;
  timestamp: string;
}

export interface ApiResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  message?: string;
}

export interface FormData {
  username: string;
}

export interface SearchHistoryEntry {
  id: string;
  username: string;
  timestamp: string;
  result: AnalysisResult;
  status: 'success' | 'error';
  error_message?: string;
}

export interface SearchHistoryFilters {
  username?: string;
  status?: 'success' | 'error';
  page: number;
  limit: number;
  orderBy: 'timestamp' | 'username';
  orderDirection: 'asc' | 'desc';
}