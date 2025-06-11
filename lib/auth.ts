import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client with fallback values to prevent initialization errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export interface AuthUser extends User {
  user_metadata?: {
    full_name?: string;
  };
}

// Sign up with email and password
export const signUp = async (email: string, password: string, fullName: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { 
      data: null, 
      error: { message: 'Supabase is not properly configured. Please check your environment variables.' } 
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return { data, error };
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { 
      data: null, 
      error: { message: 'Supabase is not properly configured. Please check your environment variables.' } 
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

// Sign out
export const signOut = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: { message: 'Supabase is not properly configured. Please check your environment variables.' } };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user as AuthUser;
};

// Get current session
export const getCurrentSession = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session;
};