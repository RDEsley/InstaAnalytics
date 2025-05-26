import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Check if user is already logged in
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        set({ user: userData.user || null });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: 'Failed to initialize authentication' });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      set({ user: data.user });
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message || 'Failed to sign in' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      set({ error: error.message || 'Failed to sign in with Google' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, name) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // In a real application, the user would need to verify their email
      // Here we're just returning the user
      set({ user: data.user });
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error: error.message || 'Failed to sign up' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      set({ user: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message || 'Failed to sign out' });
    } finally {
      set({ loading: false });
    }
  },
}));