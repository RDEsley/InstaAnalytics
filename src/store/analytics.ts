import { create } from 'zustand';
import { 
  fetchInstagramData, 
  getSearchHistory, 
  getProfileData, 
  analyzeComments 
} from '../lib/api';

interface AnalyticsState {
  currentProfile: any | null;
  posts: any[];
  comments: any[];
  searchHistory: any[];
  analysisResults: any | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (username: string) => Promise<void>;
  fetchSearchHistory: () => Promise<void>;
  fetchProfileData: (profileId: string) => Promise<void>;
  clearCurrentProfile: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  currentProfile: null,
  posts: [],
  comments: [],
  searchHistory: [],
  analysisResults: null,
  loading: false,
  error: null,

  fetchProfile: async (username) => {
    try {
      set({ loading: true, error: null });
      
      const { profile, posts } = await fetchInstagramData(username);
      
      // Extract all comments from posts
      const allComments = posts.flatMap(post => post.comments || []);
      
      // Generate analysis results
      const analysis = analyzeComments(allComments);
      
      set({ 
        currentProfile: profile, 
        posts, 
        comments: allComments,
        analysisResults: analysis,
      });
      
      // Update search history
      await get().fetchSearchHistory();
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      set({ error: error.message || 'Failed to fetch Instagram profile' });
    } finally {
      set({ loading: false });
    }
  },

  fetchSearchHistory: async () => {
    try {
      set({ loading: true, error: null });
      
      const history = await getSearchHistory();
      
      set({ searchHistory: history });
    } catch (error: any) {
      console.error('Error fetching search history:', error);
      set({ error: error.message || 'Failed to fetch search history' });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfileData: async (profileId) => {
    try {
      set({ loading: true, error: null });
      
      const { profile, posts } = await getProfileData(profileId);
      
      // Extract all comments from posts
      const allComments = posts.flatMap(post => post.comments || []);
      
      // Generate analysis results
      const analysis = analyzeComments(allComments);
      
      set({ 
        currentProfile: profile, 
        posts, 
        comments: allComments,
        analysisResults: analysis,
      });
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      set({ error: error.message || 'Failed to fetch profile data' });
    } finally {
      set({ loading: false });
    }
  },

  clearCurrentProfile: () => {
    set({ 
      currentProfile: null, 
      posts: [], 
      comments: [],
      analysisResults: null,
    });
  },
}));