/*
  # Instagram Analyzer Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `full_name` (text)
      - `biography` (text)
      - `follower_count` (integer)
      - `following_count` (integer)
      - `posts_count` (integer)
      - `profile_pic_url` (text)
      - `is_private` (boolean)
      - `is_verified` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `posts`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key)
      - `post_id` (text, unique)
      - `caption` (text)
      - `likes_count` (integer)
      - `comments_count` (integer)
      - `timestamp` (timestamptz)
      - `url` (text)
      - `media_type` (text)
      - `media_url` (text)
      - `location_name` (text)
      - `created_at` (timestamptz)
    
    - `engagement_metrics`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key)
      - `engagement_rate` (decimal)
      - `posting_frequency` (decimal)
      - `average_likes` (decimal)
      - `average_comments` (decimal)
      - `best_performing_post_id` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  full_name text,
  biography text,
  follower_count integer NOT NULL DEFAULT 0,
  following_count integer NOT NULL DEFAULT 0,
  posts_count integer NOT NULL DEFAULT 0,
  profile_pic_url text,
  is_private boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id text UNIQUE NOT NULL,
  caption text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  timestamp timestamptz,
  url text,
  media_type text,
  media_url text,
  location_name text,
  created_at timestamptz DEFAULT now()
);

-- Create engagement_metrics table
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  engagement_rate decimal NOT NULL DEFAULT 0,
  posting_frequency decimal NOT NULL DEFAULT 0,
  average_likes decimal NOT NULL DEFAULT 0,
  average_comments decimal NOT NULL DEFAULT 0,
  best_performing_post_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow read access to all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert and update to profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for posts
CREATE POLICY "Allow read access to all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert and update to posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for engagement_metrics
CREATE POLICY "Allow read access to all engagement metrics"
  ON engagement_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert and update to engagement metrics"
  ON engagement_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_profile_id ON engagement_metrics(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);