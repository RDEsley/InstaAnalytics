/*
  # Initial Schema for Instagram Analytics System

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `created_at` (timestamptz)
    - `instagram_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `instagram_username` (text)
      - `search_date` (timestamptz)
    - `posts`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to instagram_profiles.id)
      - `caption` (text)
      - `post_url` (text)
      - `instagram_post_id` (text)
      - `likes_count` (integer)
      - `comments_count` (integer)
      - `post_date` (timestamptz)
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts.id)
      - `comment_text` (text)
      - `author` (text)
      - `likes` (integer)
      - `comment_date` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create instagram_profiles table
CREATE TABLE IF NOT EXISTS instagram_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_username TEXT NOT NULL,
  search_date TIMESTAMPTZ DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES instagram_profiles(id) ON DELETE CASCADE,
  caption TEXT NOT NULL DEFAULT '',
  post_url TEXT NOT NULL,
  instagram_post_id TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  post_date TIMESTAMPTZ DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  author TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  comment_date TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view own data" 
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for instagram_profiles
CREATE POLICY "Users can view own profiles" 
  ON instagram_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" 
  ON instagram_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for posts
CREATE POLICY "Users can view own posts" 
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM instagram_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own posts" 
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM instagram_profiles WHERE user_id = auth.uid()
    )
  );

-- Create policies for comments
CREATE POLICY "Users can view own comments" 
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT p.id FROM posts p
      JOIN instagram_profiles ip ON p.profile_id = ip.id
      WHERE ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own comments" 
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    post_id IN (
      SELECT p.id FROM posts p
      JOIN instagram_profiles ip ON p.profile_id = ip.id
      WHERE ip.user_id = auth.uid()
    )
  );